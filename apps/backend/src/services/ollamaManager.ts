import { spawn, exec, ChildProcess } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import { logger } from '../utils/logger';
import { config } from '../config';

const execAsync = promisify(exec);

export class OllamaManager {
  private static instance: OllamaManager;
  private ollamaProcess: ChildProcess | null = null;
  private isStarting = false;
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  private constructor() {}

  static getInstance(): OllamaManager {
    if (!OllamaManager.instance) {
      OllamaManager.instance = new OllamaManager();
    }
    return OllamaManager.instance;
  }

  /**
   * Check if Ollama is running
   */
  async isOllamaRunning(): Promise<boolean> {
    try {
      const response = await axios.get(`${config.ollama.host}/api/version`, {
        timeout: 3000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if required models are available
   */
  async areModelsAvailable(): Promise<{ available: boolean; missing: string[] }> {
    try {
      const response = await axios.get(`${config.ollama.host}/api/tags`, {
        timeout: 5000
      });

      interface OllamaModel { name: string; }
      const installedModels = response.data.models?.map((model: OllamaModel) => model.name) || [];
      const requiredModels = [config.ollama.model, config.ollama.embeddingModel];
      const missing = requiredModels.filter(model =>
        !installedModels.some((installed: string) => installed.startsWith(model))
      );

      return {
        available: missing.length === 0,
        missing
      };
    } catch (error) {
      logger.warn('Failed to check available models', { error: error.message });
      return { available: false, missing: [config.ollama.model, config.ollama.embeddingModel] };
    }
  }

  /**
   * Start Ollama service
   */
  async startOllama(): Promise<boolean> {
    if (this.isStarting) {
      logger.info('Ollama is already starting, waiting...');
      return this.waitForOllama();
    }

    this.isStarting = true;
    logger.info('Starting Ollama service...');

    try {
      // Check if ollama command exists
      await this.checkOllamaInstallation();

      // Try different start methods based on the platform
      const success = await this.tryStartMethods();

      if (success) {
        logger.info('Ollama started successfully');
        await this.ensureModelsInstalled();
        return true;
      } else {
        logger.error('Failed to start Ollama after all attempts');
        return false;
      }
    } catch (error) {
      logger.error('Error starting Ollama', { error: error.message });
      return false;
    } finally {
      this.isStarting = false;
    }
  }

  /**
   * Check if Ollama is installed
   */
  private async checkOllamaInstallation(): Promise<void> {
    try {
      await execAsync('which ollama');
      logger.debug('Ollama binary found');
    } catch (error) {
      throw new Error('Ollama is not installed. Please install Ollama from https://ollama.ai');
    }
  }

  /**
   * Try different methods to start Ollama
   */
  private async tryStartMethods(): Promise<boolean> {
    const methods = [
      () => this.startOllamaServe(),
      () => this.startOllamaDetached(),
      () => this.startOllamaPlatformSpecific()
    ];

    for (const method of methods) {
      try {
        logger.debug('Trying Ollama start method...');
        await method();

        // Wait for Ollama to be ready
        const isReady = await this.waitForOllama();
        if (isReady) {
          return true;
        }
      } catch (error) {
        logger.debug('Start method failed', { error: error.message });
        continue;
      }
    }

    return false;
  }

  /**
   * Start Ollama with 'ollama serve' command
   */
  private async startOllamaServe(): Promise<void> {
    return new Promise((resolve, reject) => {
      logger.debug('Starting Ollama with "ollama serve"');

      this.ollamaProcess = spawn('ollama', ['serve'], {
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      this.ollamaProcess.stdout.on('data', (data: Buffer) => {
        logger.debug('Ollama stdout:', data.toString());
      });

      this.ollamaProcess.stderr.on('data', (data: Buffer) => {
        logger.debug('Ollama stderr:', data.toString());
      });

      this.ollamaProcess.on('error', (error: Error) => {
        logger.error('Ollama process error', { error: error.message });
        reject(error);
      });

      this.ollamaProcess.on('spawn', () => {
        logger.debug('Ollama process spawned');
        this.ollamaProcess.unref(); // Don't keep the parent process alive
        resolve();
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!this.ollamaProcess.killed) {
          resolve(); // Process started, let's check if it's working
        }
      }, 2000);
    });
  }

  /**
   * Start Ollama detached
   */
  private async startOllamaDetached(): Promise<void> {
    logger.debug('Starting Ollama detached');
    await execAsync('nohup ollama serve > /dev/null 2>&1 &');
  }

  /**
   * Start Ollama using platform-specific commands
   */
  private async startOllamaPlatformSpecific(): Promise<void> {
    const platform = process.platform;

    if (platform === 'darwin') {
      // macOS - try with open command or launchctl
      logger.debug('Trying to start Ollama on macOS');
      try {
        // Try to open Ollama app if installed via GUI
        await execAsync('open -a Ollama');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for app to start
      } catch (error) {
        // If GUI app not available, try with homebrew service or direct command
        logger.debug('GUI app not found, trying alternative methods');
        try {
          await execAsync('brew services start ollama');
        } catch (brewError) {
          // Last resort: try launching ollama serve in background
          logger.debug('Homebrew service not available, falling back to direct launch');
          throw new Error('Platform-specific start methods exhausted');
        }
      }
    } else if (platform === 'linux') {
      // Linux - use systemd
      logger.debug('Trying to start Ollama via systemd');
      await execAsync('systemctl --user start ollama || sudo systemctl start ollama');
    } else if (platform === 'win32') {
      // Windows - try with sc command
      logger.debug('Trying to start Ollama on Windows');
      await execAsync('sc start ollama');
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Wait for Ollama to be ready
   */
  private async waitForOllama(maxWaitTime = 30000): Promise<boolean> {
    const startTime = Date.now();
    const checkInterval = 1000; // Check every second

    while (Date.now() - startTime < maxWaitTime) {
      if (await this.isOllamaRunning()) {
        logger.info('Ollama is ready');
        return true;
      }

      logger.debug('Waiting for Ollama to be ready...');
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    logger.warn('Timeout waiting for Ollama to be ready');
    return false;
  }

  /**
   * Ensure required models are installed
   */
  private async ensureModelsInstalled(): Promise<void> {
    const { available, missing } = await this.areModelsAvailable();

    if (!available && missing.length > 0) {
      logger.info('Installing missing Ollama models', { missing });

      for (const model of missing) {
        try {
          logger.info(`Installing model: ${model}`);
          await this.pullModel(model);
          logger.info(`Model installed successfully: ${model}`);
        } catch (error) {
          logger.error(`Failed to install model: ${model}`, { error: error.message });
          throw new Error(`Failed to install required model: ${model}`);
        }
      }
    }
  }

  /**
   * Pull a model from Ollama
   */
  private async pullModel(modelName: string): Promise<void> {
    try {
      await execAsync(`ollama pull ${modelName}`, {
        timeout: 300000 // 5 minutes timeout for model download
      });
    } catch (error) {
      throw new Error(`Failed to pull model ${modelName}: ${error.message}`);
    }
  }

  /**
   * Stop Ollama service
   */
  async stopOllama(): Promise<void> {
    if (this.ollamaProcess) {
      logger.info('Stopping Ollama process');
      this.ollamaProcess.kill();
      this.ollamaProcess = null;
    }

    try {
      // Try to stop via system methods
      await execAsync('pkill -f "ollama serve" || true');
      logger.info('Ollama service stopped');
    } catch (error) {
      logger.warn('Error stopping Ollama', { error: error.message });
    }
  }

  /**
   * Ensure Ollama is running with retries
   */
  async ensureOllamaRunning(): Promise<boolean> {
    let retries = 0;

    while (retries < this.maxRetries) {
      // Check if already running
      if (await this.isOllamaRunning()) {
        logger.debug('Ollama is already running');

        // Check if models are available
        const { available } = await this.areModelsAvailable();
        if (available) {
          return true;
        } else {
          logger.info('Ollama is running but models are missing, installing...');
          try {
            await this.ensureModelsInstalled();
            return true;
          } catch (error) {
            logger.error('Failed to install models', { error: error.message });
          }
        }
      }

      logger.info(`Attempting to start Ollama (attempt ${retries + 1}/${this.maxRetries})`);

      const success = await this.startOllama();
      if (success) {
        return true;
      }

      retries++;
      if (retries < this.maxRetries) {
        logger.info(`Retrying in ${this.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }

    logger.error('Failed to start Ollama after maximum retries');
    return false;
  }

  /**
   * Get Ollama status and info
   */
  async getStatus(): Promise<{
    running: boolean;
    modelsAvailable: boolean;
    version?: string;
    models?: string[];
    error?: string;
  }> {
    try {
      const running = await this.isOllamaRunning();

      if (!running) {
        return { running: false, modelsAvailable: false };
      }

      const [versionResponse, { available, missing }] = await Promise.all([
        axios.get(`${config.ollama.host}/api/version`, { timeout: 3000 }),
        this.areModelsAvailable()
      ]);

      const tagsResponse = await axios.get(`${config.ollama.host}/api/tags`, { timeout: 3000 });
      const models = tagsResponse.data.models?.map((model: OllamaModel) => model.name) || [];

      return {
        running: true,
        modelsAvailable: available,
        version: versionResponse.data?.version,
        models,
        ...(missing.length > 0 && { error: `Missing models: ${missing.join(', ')}` })
      };
    } catch (error) {
      return {
        running: false,
        modelsAvailable: false,
        error: error.message
      };
    }
  }
}

export const ollamaManager = OllamaManager.getInstance();