import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
  },

  // Pinecone
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || '',
    indexName: process.env.PINECONE_INDEX_NAME || 'ai-speech-evaluator',
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
  if (config.nodeEnv === 'production') {
    const required = [
      'DATABASE_URL',
      'OPENAI_API_KEY',
      'PINECONE_API_KEY',
      'PINECONE_ENVIRONMENT',
    ];

    const missing = required.filter(key => !process.env[key] || process.env[key] === 'test-key-placeholder');

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}