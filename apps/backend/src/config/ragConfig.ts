import { config } from './index';

// Local RAG configuration using Ollama
export const ragConfig = {
  llm: {
    provider: 'ollama' as const,
    host: config.ollama.host,
    model: config.ollama.model,
    embeddingModel: config.ollama.embeddingModel,
    timeout: config.ollama.timeout,
  },
  vectorDB: {
    type: config.vectorDb.type as 'memory' | 'pinecone',
    pinecone: config.vectorDb.pinecone,
    dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '768'), // nomic-embed-text dimensions
  },
  chunking: {
    chunkSize: parseInt(process.env.CHUNK_SIZE || '1000'),
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '200'),
    preserveSentences: process.env.PRESERVE_SENTENCES !== 'false',
    preserveParagraphs: process.env.PRESERVE_PARAGRAPHS === 'true',
  },
  embedding: {
    model: config.ollama.embeddingModel,
    dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '768'),
    batchSize: parseInt(process.env.EMBEDDING_BATCH_SIZE || '5'), // Smaller batches for local processing
  },
};

export const evaluationConfig = {
  provider: 'ollama' as const,
  host: config.ollama.host,
  model: config.ollama.model,
  temperature: parseFloat(process.env.EVALUATION_TEMPERATURE || '0.3'),
  maxTokens: parseInt(process.env.EVALUATION_MAX_TOKENS || '2000'),
  timeout: config.ollama.timeout,
  language: process.env.EVALUATION_LANGUAGE as 'italian' | 'english' || 'italian',
};

export const transcriptionConfig = {
  provider: 'whisper-local' as const,
  modelPath: config.whisper.modelPath,
  modelName: config.whisper.modelName,
  language: config.whisper.language,
};