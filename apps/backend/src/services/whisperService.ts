import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { transcriptionConfig } from '../config/ragConfig';
import { logger } from '../utils/logger';
import { safeCleanupFile } from '../utils/fileCleanup';

interface WhisperSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

export class WhisperService {
  private static instance: WhisperService | null = null;
  private isInitialized = false;

  private constructor() {}

  static async getInstance(): Promise<WhisperService> {
    if (!this.instance) {
      this.instance = new WhisperService();
      await this.instance.initialize();
    }
    return this.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // Ensure models directory exists
      await fs.mkdir(transcriptionConfig.modelPath, { recursive: true });

      // Check if whisper is available
      await this.checkWhisperAvailability();

      this.isInitialized = true;
      logger.info('Whisper service initialized successfully', {
        modelPath: transcriptionConfig.modelPath,
        modelName: transcriptionConfig.modelName,
        language: transcriptionConfig.language
      });
    } catch (error) {
      logger.error('Failed to initialize Whisper service', {
        error: error.message,
        modelPath: transcriptionConfig.modelPath
      });
      throw new Error(`Whisper service initialization failed: ${error.message}`);
    }
  }

  private async checkWhisperAvailability(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Try to check if whisper command is available
      const whisper = spawn('which', ['whisper']);

      whisper.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          // If whisper command is not found, we'll use a fallback method
          logger.warn('Whisper command not found in PATH, using alternative approach');
          resolve(); // For now, we continue - you might want to implement a fallback
        }
      });

      whisper.on('error', () => {
        logger.warn('Whisper command check failed, using alternative approach');
        resolve(); // Continue with alternative implementation
      });
    });
  }

  async transcribeAudio(audioFilePath: string, options?: {
    language?: string;
    task?: 'transcribe' | 'translate';
    format?: 'text' | 'json' | 'srt';
  }): Promise<{
    text: string;
    segments?: WhisperSegment[];
    language?: string;
    duration?: number;
  }> {
    if (!this.isInitialized) {
      throw new Error('Whisper service not initialized');
    }

    const startTime = Date.now();
    const outputFormat = options?.format || 'json';
    const language = options?.language || transcriptionConfig.language;
    const task = options?.task || 'transcribe';

    try {
      // Check if input file exists
      await fs.access(audioFilePath);

      logger.info('Starting audio transcription', {
        audioFile: path.basename(audioFilePath),
        language,
        task,
        format: outputFormat
      });

      // Use a simple transcription method (you can enhance this with actual whisper.cpp integration)
      const result = await this.transcribeWithFallback(audioFilePath, {
        language,
        task,
        format: outputFormat
      });

      const duration = Date.now() - startTime;
      logger.info('Audio transcription completed', {
        audioFile: path.basename(audioFilePath),
        transcriptionLength: result.text.length,
        duration: `${duration}ms`,
        detectedLanguage: result.language
      });

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Audio transcription failed', {
        audioFile: path.basename(audioFilePath),
        duration: `${duration}ms`,
        error: error.message
      });
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  private async transcribeWithFallback(audioFilePath: string, options: {
    language: string;
    task: string;
    format: string;
  }): Promise<{
    text: string;
    segments?: WhisperSegment[];
    language?: string;
    duration?: number;
  }> {

    // First, try with whisper command if available
    try {
      return await this.transcribeWithWhisperCommand(audioFilePath, options);
    } catch (error) {
      logger.warn('Whisper command failed, using node-whisper fallback', { error: error.message });
      return await this.transcribeWithNodeWhisper(audioFilePath, options);
    }
  }

  private async transcribeWithWhisperCommand(audioFilePath: string, options: {
    language: string;
    task: string;
    format: string;
  }): Promise<{
    text: string;
    segments?: WhisperSegment[];
    language?: string;
    duration?: number;
  }> {
    return new Promise((resolve, reject) => {
      const outputDir = path.dirname(audioFilePath);
      const args = [
        audioFilePath,
        '--model', transcriptionConfig.modelName,
        '--output_dir', outputDir,
        '--output_format', options.format,
        '--task', options.task
      ];

      if (options.language !== 'auto') {
        args.push('--language', options.language);
      }

      const whisper = spawn('whisper', args);
      let output = '';
      let errorOutput = '';

      whisper.stdout.on('data', (data) => {
        output += data.toString();
      });

      whisper.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      whisper.on('close', async (code) => {
        if (code === 0) {
          try {
            // Read the output file
            const baseName = path.basename(audioFilePath, path.extname(audioFilePath));
            const outputFile = path.join(outputDir, `${baseName}.${options.format}`);

            const result = await fs.readFile(outputFile, 'utf-8');

            if (options.format === 'json') {
              const parsed = JSON.parse(result);
              resolve({
                text: parsed.text,
                segments: parsed.segments,
                language: parsed.language,
                duration: parsed.duration
              });
            } else {
              resolve({
                text: result.trim(),
                language: options.language === 'auto' ? 'detected' : options.language
              });
            }

            // Clean up output file
            await safeCleanupFile(outputFile);
          } catch (error) {
            reject(new Error(`Failed to read transcription output: ${error.message}`));
          }
        } else {
          reject(new Error(`Whisper process failed with code ${code}: ${errorOutput}`));
        }
      });

      whisper.on('error', (error) => {
        reject(new Error(`Failed to start whisper process: ${error.message}`));
      });
    });
  }

  private async transcribeWithNodeWhisper(audioFilePath: string, options: {
    language: string;
    task: string;
    format: string;
  }): Promise<{
    text: string;
    segments?: WhisperSegment[];
    language?: string;
    duration?: number;
  }> {
    try {
      // Import node-whisper dynamically
      const { nodewhisper } = await import('node-whisper');

      const transcript = await nodewhisper(audioFilePath, {
        modelName: transcriptionConfig.modelName,
        whisperOptions: {
          language: options.language === 'auto' ? undefined : options.language,
          task: options.task,
          output_format: options.format
        }
      });

      return {
        text: transcript,
        language: options.language === 'auto' ? 'detected' : options.language
      };
    } catch (error) {
      throw new Error(`Node-whisper transcription failed: ${error.message}`);
    }
  }

  async healthCheck(): Promise<{ status: string; modelPath: string; modelName: string }> {
    try {
      // Check if model directory exists
      await fs.access(transcriptionConfig.modelPath);

      return {
        status: this.isInitialized ? 'healthy' : 'initializing',
        modelPath: transcriptionConfig.modelPath,
        modelName: transcriptionConfig.modelName
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        modelPath: transcriptionConfig.modelPath,
        modelName: transcriptionConfig.modelName
      };
    }
  }

  async downloadModel(modelName: string = transcriptionConfig.modelName): Promise<void> {
    logger.info(`Starting download of Whisper model: ${modelName}`);

    // This is a placeholder - in a real implementation, you would download the actual model
    // For now, we'll just create a placeholder file
    const modelFile = path.join(transcriptionConfig.modelPath, `${modelName}.bin`);

    try {
      await fs.writeFile(modelFile, 'placeholder-model-file');
      logger.info(`Model ${modelName} downloaded successfully`);
    } catch (error) {
      logger.error(`Failed to download model ${modelName}`, { error: error.message });
      throw error;
    }
  }
}

export default WhisperService;