import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // Ollama (Local LLM)
  ollama: {
    host: process.env.OLLAMA_HOST || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
    embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',
    timeout: parseInt(process.env.OLLAMA_TIMEOUT || '120000'), // 2 minutes
  },

  // Vector Database (can be local or Pinecone)
  vectorDb: {
    type: process.env.VECTOR_DB_TYPE || 'memory', // 'memory' | 'pinecone'
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY || '',
      environment: process.env.PINECONE_ENVIRONMENT || '',
      indexName: process.env.PINECONE_INDEX_NAME || 'ai-speech-evaluator',
    },
  },

  // Local Whisper for transcription
  whisper: {
    modelPath: process.env.WHISPER_MODEL_PATH || './models/whisper',
    modelName: process.env.WHISPER_MODEL || 'base',
    language: process.env.WHISPER_LANGUAGE || 'auto',
  },

  // File Storage
  storage: {
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '50') * 1024 * 1024, // MB to bytes
    allowedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  },

  // Audio
  audio: {
    maxDuration: parseInt(process.env.MAX_AUDIO_DURATION || '600'), // seconds
    sampleRate: parseInt(process.env.AUDIO_SAMPLE_RATE || '16000'),
    allowedFormats: ['audio/wav', 'audio/mp3', 'audio/ogg', 'audio/webm'],
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },

  // CORS
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
  },

  // AI Evaluation
  evaluation: {
    maxRetries: 3,
    timeoutMs: 30000,
    chunkSize: 1000,
    overlapSize: 200,
  },
} as const;

export function validateConfig() {
  // Basic validation - only check Ollama connectivity
  const ollamaHost = config.ollama.host;

  if (!ollamaHost || !ollamaHost.startsWith('http')) {
    throw new Error('OLLAMA_HOST must be a valid HTTP URL (e.g., http://localhost:11434)');
  }

  // For production, ensure we have a database if using persistent storage
  if (config.nodeEnv === 'production') {
    const required = ['DATABASE_URL'];

    // Only require Pinecone if using it as vector DB
    if (config.vectorDb.type === 'pinecone') {
      required.push('PINECONE_API_KEY', 'PINECONE_ENVIRONMENT');
    }

    const missing = required.filter(key => !process.env[key] || process.env[key] === 'test-key-placeholder');

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}