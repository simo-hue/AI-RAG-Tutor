import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import { platform } from 'os';
import logger from './logger';

const execAsync = promisify(exec);

export interface OllamaModel {
  name: string;
  size: string;
  modified: string;
  digest: string;
}

export interface OllamaStatus {
  installed: boolean;
  running: boolean;
  version?: string;
  executablePath?: string;
  apiReachable: boolean;
  error?: string;
}

export interface OllamaHealthCheck {
  healthy: boolean;
  services: {
    api: boolean;
    models: boolean;
  };
  details: {
    apiUrl: string;
    responseTime?: number;
    modelsCount?: number;
    error?: string;
  };
}

export class OllamaManager {
  private ollamaProcess: ChildProcess | null = null;
  private isStarting = false;
  private startPromise: Promise<boolean> | null = null;
  private readonly OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
  private readonly STARTUP_TIMEOUT = 30000; // 30 seconds
  private readonly HEALTH_CHECK_INTERVAL = 500; // 500ms
  private readonly MAX_HEALTH_CHECKS = 60; // 30 seconds total

  /**
   * Get comprehensive Ollama status
   */
  async getStatus(): Promise<OllamaStatus> {
    const status: OllamaStatus = {
      installed: false,
      running: false,
      apiReachable: false
    };

    try {
      // Check installation
      const installCheck = await this.isInstalled();
      status.installed = installCheck.installed;
      status.executablePath = installCheck.path;
      status.version = installCheck.version;

      if (!status.installed) {
        status.error = 'Ollama not found. Please install from https://ollama.ai';
        return status;
      }

      // Check if service is running
      const runningCheck = await this.isRunning();
      status.running = runningCheck.running;
      status.apiReachable = runningCheck.apiReachable;

      if (!status.running && runningCheck.processRunning) {
        status.error = 'Ollama process running but API not reachable. Check port 11434.';
      } else if (!status.running) {
        status.error = 'Ollama service not running. Starting automatically...';
      }

      return status;
    } catch (error) {
      logger.error('Error getting Ollama status:', error);
      status.error = error instanceof Error ? error.message : 'Unknown error';
      return status;
    }
  }

  /**
   * Check if Ollama is installed with detailed info
   */
  async isInstalled(): Promise<{ installed: boolean; path?: string; version?: string }> {
    try {
      // Try multiple common paths based on OS
      const possiblePaths = this.getOllamaPaths();

      for (const path of possiblePaths) {
        try {
          const { stdout } = await execAsync(`${path} --version`, { timeout: 5000 });
          const version = stdout.trim();
          logger.info('Ollama found', { path, version });
          return { installed: true, path, version };
        } catch {
          continue;
        }
      }

      // Try which/where command as fallback
      const whichCommand = platform() === 'win32' ? 'where' : 'which';
      try {
        const { stdout } = await execAsync(`${whichCommand} ollama`, { timeout: 5000 });
        const path = stdout.trim().split('\n')[0];

        // Get version
        try {
          const { stdout: versionOut } = await execAsync(`${path} --version`, { timeout: 5000 });
          return { installed: true, path, version: versionOut.trim() };
        } catch {
          return { installed: true, path };
        }
      } catch {
        logger.warn('Ollama not found in PATH');
        return { installed: false };
      }
    } catch (error) {
      logger.error('Error checking Ollama installation:', error);
      return { installed: false };
    }
  }

  /**
   * Check if Ollama service is running with detailed diagnostics
   */
  async isRunning(): Promise<{ running: boolean; apiReachable: boolean; processRunning: boolean }> {
    const result = {
      running: false,
      apiReachable: false,
      processRunning: false
    };

    try {
      // Check if API is reachable
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(`${this.OLLAMA_HOST}/api/tags`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        clearTimeout(timeout);

        if (response.ok) {
          result.apiReachable = true;
          result.running = true;
          result.processRunning = true;
          logger.debug('Ollama API is reachable and healthy');
          return result;
        }
      } catch (fetchError: any) {
        clearTimeout(timeout);
        if (fetchError.name === 'AbortError') {
          logger.warn('Ollama API request timed out');
        } else {
          logger.debug('Ollama API not reachable:', fetchError.message);
        }
      }

      // Check if process is running (even if API is not reachable)
      try {
        const psCommand = platform() === 'win32'
          ? 'tasklist /FI "IMAGENAME eq ollama.exe"'
          : 'pgrep -f "ollama serve"';

        const { stdout } = await execAsync(psCommand, { timeout: 3000 });

        if (platform() === 'win32') {
          result.processRunning = stdout.toLowerCase().includes('ollama.exe');
        } else {
          result.processRunning = stdout.trim().length > 0;
        }

        if (result.processRunning && !result.apiReachable) {
          logger.warn('Ollama process is running but API is not reachable');
        }
      } catch (psError) {
        logger.debug('Could not check if Ollama process is running');
      }

      return result;
    } catch (error) {
      logger.error('Error checking if Ollama is running:', error);
      return result;
    }
  }

  /**
   * Perform comprehensive health check
   */
  async healthCheck(): Promise<OllamaHealthCheck> {
    const health: OllamaHealthCheck = {
      healthy: false,
      services: {
        api: false,
        models: false
      },
      details: {
        apiUrl: this.OLLAMA_HOST
      }
    };

    try {
      const startTime = Date.now();

      // Check API
      const response = await fetch(`${this.OLLAMA_HOST}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      health.details.responseTime = Date.now() - startTime;
      health.services.api = response.ok;

      if (response.ok) {
        const data = await response.json();
        health.services.models = Array.isArray(data.models);
        health.details.modelsCount = data.models?.length || 0;
        health.healthy = true;
      }
    } catch (error: any) {
      health.details.error = error.message;
      logger.error('Ollama health check failed:', error);
    }

    return health;
  }

  /**
   * Start Ollama service with robust error handling
   */
  async start(): Promise<boolean> {
    // If already starting, wait for that promise
    if (this.isStarting && this.startPromise) {
      logger.info('Ollama start already in progress, waiting...');
      return this.startPromise;
    }

    // Check if already running
    const runningCheck = await this.isRunning();
    if (runningCheck.running) {
      logger.info('Ollama is already running');
      return true;
    }

    // Check installation
    const installCheck = await this.isInstalled();
    if (!installCheck.installed) {
      logger.error('Ollama is not installed. Cannot start service.');
      logger.error('Please install Ollama from https://ollama.ai');
      return false;
    }

    this.isStarting = true;
    this.startPromise = this._startOllama(installCheck.path!);

    try {
      const result = await this.startPromise;
      return result;
    } finally {
      this.isStarting = false;
      this.startPromise = null;
    }
  }

  /**
   * Internal method to start Ollama
   */
  private async _startOllama(ollamaPath: string): Promise<boolean> {
    try {
      logger.info('Starting Ollama service...', { path: ollamaPath });

      // Different start approach based on OS
      const isWindows = platform() === 'win32';

      if (isWindows) {
        // Windows: Use start command
        this.ollamaProcess = spawn('cmd', ['/c', 'start', '/B', ollamaPath, 'serve'], {
          detached: true,
          stdio: 'ignore',
          shell: true
        });
      } else {
        // Unix-like: Use nohup for background execution
        this.ollamaProcess = spawn('nohup', [ollamaPath, 'serve'], {
          detached: true,
          stdio: 'ignore',
          env: { ...process.env, OLLAMA_HOST: '0.0.0.0:11434' }
        });
      }

      // Unref so it doesn't prevent the process from exiting
      this.ollamaProcess.unref();

      logger.info('Ollama process spawned, waiting for API to be ready...');

      // Wait for service to be ready with progressive backoff
      const maxChecks = this.MAX_HEALTH_CHECKS;
      let checkInterval = this.HEALTH_CHECK_INTERVAL;

      for (let i = 0; i < maxChecks; i++) {
        await new Promise(resolve => setTimeout(resolve, checkInterval));

        const runningCheck = await this.isRunning();
        if (runningCheck.running) {
          logger.info(`Ollama service started successfully after ${(i * checkInterval / 1000).toFixed(1)}s`);
          return true;
        }

        // Progressive backoff: increase interval after first few attempts
        if (i > 5 && checkInterval < 1000) {
          checkInterval = 1000;
        }

        if (i % 10 === 0 && i > 0) {
          logger.info(`Still waiting for Ollama to start... (${i}/${maxChecks} checks)`);
        }
      }

      logger.warn(`Ollama service did not start within ${this.STARTUP_TIMEOUT / 1000}s`);
      logger.warn('You may need to start Ollama manually: ollama serve');
      return false;
    } catch (error) {
      logger.error('Failed to start Ollama service:', error);
      return false;
    }
  }

  /**
   * Get platform-specific Ollama paths
   */
  private getOllamaPaths(): string[] {
    const osPlatform = platform();

    switch (osPlatform) {
      case 'darwin': // macOS
        return [
          '/usr/local/bin/ollama',
          '/opt/homebrew/bin/ollama',
          '/Users/' + process.env.USER + '/.ollama/bin/ollama',
          'ollama' // PATH fallback
        ];

      case 'linux':
        return [
          '/usr/local/bin/ollama',
          '/usr/bin/ollama',
          '/home/' + process.env.USER + '/.local/bin/ollama',
          'ollama' // PATH fallback
        ];

      case 'win32': // Windows
        return [
          'C:\\Program Files\\Ollama\\ollama.exe',
          'C:\\Program Files (x86)\\Ollama\\ollama.exe',
          process.env.LOCALAPPDATA + '\\Programs\\Ollama\\ollama.exe',
          'ollama.exe' // PATH fallback
        ];

      default:
        return ['ollama'];
    }
  }

  /**
   * Get list of available models with error handling
   */
  async listModels(): Promise<OllamaModel[]> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.OLLAMA_HOST}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const models = data.models || [];

      logger.info(`Found ${models.length} Ollama models`);
      return models;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        logger.error('Timeout while fetching Ollama models');
        throw new Error('Request timed out. Ollama may be starting up.');
      }

      logger.error('Failed to list Ollama models:', error);
      throw new Error(`Could not list models: ${error.message}`);
    }
  }

  /**
   * Pull a model from Ollama registry with progress tracking
   */
  async pullModel(modelName: string, onProgress?: (progress: number, status: string) => void): Promise<boolean> {
    try {
      logger.info(`Pulling model: ${modelName}`);

      const response = await fetch(`${this.OLLAMA_HOST}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body from Ollama');
      }

      let totalSize = 0;
      let downloadedSize = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const json = JSON.parse(line);

            if (json.total) {
              totalSize = json.total;
            }

            if (json.completed) {
              downloadedSize = json.completed;
            }

            if (json.status && onProgress) {
              const progress = totalSize > 0
                ? Math.round((downloadedSize / totalSize) * 100)
                : 0;
              onProgress(progress, json.status);
            }

            if (json.error) {
              throw new Error(json.error);
            }
          } catch (parseError) {
            // Ignore JSON parse errors for partial chunks
          }
        }
      }

      logger.info(`Model ${modelName} pulled successfully`);
      return true;
    } catch (error: any) {
      logger.error(`Failed to pull model ${modelName}:`, error);
      throw new Error(`Failed to pull model: ${error.message}`);
    }
  }

  /**
   * Check if a specific model is available
   */
  async hasModel(modelName: string): Promise<boolean> {
    try {
      const models = await this.listModels();
      const hasModel = models.some(model =>
        model.name === modelName ||
        model.name.startsWith(modelName.split(':')[0])
      );

      logger.debug(`Model ${modelName} ${hasModel ? 'found' : 'not found'}`);
      return hasModel;
    } catch (error) {
      logger.error(`Error checking for model ${modelName}:`, error);
      return false;
    }
  }

  /**
   * Ensure a model is available, pull if necessary
   */
  async ensureModel(modelName: string, onProgress?: (progress: number, status: string) => void): Promise<boolean> {
    try {
      const hasModel = await this.hasModel(modelName);

      if (hasModel) {
        logger.info(`Model ${modelName} is already available`);
        return true;
      }

      logger.info(`Model ${modelName} not found, pulling...`);
      return await this.pullModel(modelName, onProgress);
    } catch (error) {
      logger.error(`Failed to ensure model ${modelName}:`, error);
      return false;
    }
  }

  /**
   * Stop Ollama service (cleanup)
   */
  async stop(): Promise<void> {
    if (this.ollamaProcess) {
      try {
        this.ollamaProcess.kill();
        this.ollamaProcess = null;
        logger.info('Ollama process stopped');
      } catch (error) {
        logger.error('Failed to stop Ollama process:', error);
      }
    }
  }

  /**
   * Restart Ollama service
   */
  async restart(): Promise<boolean> {
    logger.info('Restarting Ollama service...');
    await this.stop();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
    return this.start();
  }
}

// Export singleton instance
export const ollamaManager = new OllamaManager();
