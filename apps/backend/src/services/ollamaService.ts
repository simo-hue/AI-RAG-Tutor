import { Ollama } from 'ollama';
import { ragConfig, evaluationConfig } from '../config/ragConfig';
import { logger } from '../utils/logger';

export class OllamaService {
  private client: Ollama;
  private static instance: OllamaService | null = null;

  private constructor() {
    this.client = new Ollama({
      host: ragConfig.llm.host,
    });
  }

  static async getInstance(): Promise<OllamaService> {
    if (!this.instance) {
      this.instance = new OllamaService();
      await this.instance.initialize();
    }
    return this.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // Test connectivity
      await this.client.list();
      logger.info('Ollama service initialized successfully', {
        host: ragConfig.llm.host,
        model: ragConfig.llm.model,
        embeddingModel: ragConfig.llm.embeddingModel
      });

      // Ensure required models are available
      await this.ensureModelsAvailable();
    } catch (error) {
      logger.error('Failed to initialize Ollama service', {
        error: error.message,
        host: ragConfig.llm.host
      });
      throw new Error(`Ollama service initialization failed: ${error.message}`);
    }
  }

  private async ensureModelsAvailable(): Promise<void> {
    try {
      const models = await this.client.list();
      const availableModels = models.models.map(m => m.name);

      const requiredModels = [ragConfig.llm.model, ragConfig.llm.embeddingModel];
      const missingModels = requiredModels.filter(model =>
        !availableModels.some(available => available.includes(model))
      );

      if (missingModels.length > 0) {
        logger.warn('Some required models are not available', {
          missing: missingModels,
          available: availableModels
        });

        // Auto-pull missing models
        for (const model of missingModels) {
          logger.info(`Pulling missing model: ${model}`);
          await this.client.pull({ model });
          logger.info(`Successfully pulled model: ${model}`);
        }
      }
    } catch (error) {
      logger.error('Error checking/pulling models', { error: error.message });
      throw error;
    }
  }

  async generateChat(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const startTime = Date.now();

      const messages: any[] = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await this.client.chat({
        model: evaluationConfig.model,
        messages,
        options: {
          temperature: evaluationConfig.temperature,
          num_predict: evaluationConfig.maxTokens,
        },
        stream: false,
      });

      const duration = Date.now() - startTime;
      logger.info('Ollama chat generation completed', {
        model: evaluationConfig.model,
        duration: `${duration}ms`,
        promptLength: prompt.length,
        responseLength: response.message.content.length
      });

      return response.message.content;
    } catch (error) {
      logger.error('Ollama chat generation failed', {
        error: error.message,
        model: evaluationConfig.model,
        promptLength: prompt.length
      });
      throw new Error(`Chat generation failed: ${error.message}`);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const startTime = Date.now();

      const response = await this.client.embeddings({
        model: ragConfig.llm.embeddingModel,
        prompt: text,
      });

      const duration = Date.now() - startTime;
      logger.debug('Ollama embedding generation completed', {
        model: ragConfig.llm.embeddingModel,
        duration: `${duration}ms`,
        textLength: text.length,
        embeddingDimensions: response.embedding.length
      });

      return response.embedding;
    } catch (error) {
      logger.error('Ollama embedding generation failed', {
        error: error.message,
        model: ragConfig.llm.embeddingModel,
        textLength: text.length
      });
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const embeddings: number[][] = [];

      // Process in smaller batches to avoid overwhelming the local server
      const batchSize = ragConfig.embedding.batchSize;

      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const batchPromises = batch.map(text => this.generateEmbedding(text));
        const batchEmbeddings = await Promise.all(batchPromises);
        embeddings.push(...batchEmbeddings);

        // Small delay between batches to prevent overloading
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      logger.info('Batch embedding generation completed', {
        totalTexts: texts.length,
        batchSize,
        totalBatches: Math.ceil(texts.length / batchSize)
      });

      return embeddings;
    } catch (error) {
      logger.error('Batch embedding generation failed', {
        error: error.message,
        totalTexts: texts.length
      });
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; models: any; version?: string }> {
    try {
      const [models, version] = await Promise.allSettled([
        this.client.list(),
        this.client.show({ model: ragConfig.llm.model }).catch(() => null)
      ]);

      return {
        status: 'healthy',
        models: models.status === 'fulfilled' ? models.value : { error: models.reason },
        version: version.status === 'fulfilled' && version.value ? version.value : undefined
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        models: { error: error.message }
      };
    }
  }

  async isModelAvailable(modelName: string): Promise<boolean> {
    try {
      const models = await this.client.list();
      return models.models.some(m => m.name.includes(modelName));
    } catch (error) {
      logger.error('Error checking model availability', { error: error.message, model: modelName });
      return false;
    }
  }
}

export default OllamaService;