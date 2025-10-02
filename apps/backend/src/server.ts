import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { config, validateConfig } from './config';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import {
  securityMiddleware,
  compressionMiddleware,
  corsMiddleware,
  csrfProtection,
  sanitizeHeaders,
  pathTraversalProtection,
  bodyLimitMiddleware,
  suspiciousActivityLogger,
  customSecurityHeaders
} from './middleware/security';
import { requestLogger, logger } from './utils/logger';
import { documentRoutes } from './routes/documentRoutes';
import { audioRoutes } from './routes/audioRoutes';
import { evaluationRoutes } from './routes/evaluationRoutes';
import { healthRoutes } from './routes/healthRoutes';
import { testRoutes } from './routes/testRoutes';
import ollamaRoutes from './routes/ollamaRoutes';
import languageRoutes from './routes/languageRoutes';
import { ollamaManager } from './utils/ollamaManager';

// Function to cleanup port before starting
async function cleanupPort(port: number): Promise<void> {
  return new Promise((resolve) => {
    const cleanup = spawn('lsof', ['-ti', `:${port}`]);
    let pids = '';

    cleanup.stdout.on('data', (data) => {
      pids += data.toString();
    });

    cleanup.on('close', (code) => {
      if (pids.trim() && code === 0) {
        const pidList = pids.trim().split('\n');
        logger.info(`Found ${pidList.length} process(es) on port ${port}, cleaning up...`);

        const kill = spawn('kill', ['-9', ...pidList]);
        kill.on('close', () => {
          logger.info(`Port ${port} cleaned up successfully`);
          resolve();
        });
      } else {
        logger.info(`Port ${port} is available`);
        resolve();
      }
    });

    cleanup.on('error', () => {
      // If lsof fails, just continue
      resolve();
    });
  });
}

// Validate configuration
validateConfig();

const app = express();

// Log server startup
logger.info('Starting AI Speech Evaluator Backend', {
  nodeEnv: config.nodeEnv,
  port: config.port,
  timestamp: new Date().toISOString()
});

// Trust proxy for rate limiting and security
app.set('trust proxy', 1);

// Core security middleware stack (order matters!)
app.use(sanitizeHeaders);
app.use(pathTraversalProtection);
app.use(bodyLimitMiddleware);
app.use(securityMiddleware);
app.use(corsMiddleware);
app.use(compressionMiddleware);
app.use(customSecurityHeaders);

// Request logging
app.use(requestLogger);

// Body parsing with limits
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    // Log potentially large requests
    if (buf.length > 1024 * 1024) { // 1MB
      logger.info('Large request body detected', {
        size: `${Math.round(buf.length / 1024)}KB`,
        path: req.path,
        method: req.method
      });
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security monitoring
app.use(suspiciousActivityLogger);
app.use(csrfProtection);

// Rate limiting
app.use('/api', generalLimiter);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/test', testRoutes);
app.use('/api/ollama', ollamaRoutes);
app.use('/api/languages', languageRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Error handling
app.use(errorHandler);

// Start server with port cleanup
const startServer = async () => {
  try {
    // Clean up port before starting
    await cleanupPort(config.port);

    // Ensure upload directories exist
    const uploadsDir = path.resolve(config.storage.uploadDir);
    const audioDir = path.join(uploadsDir, 'audio');

    [uploadsDir, audioDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`Created directory: ${dir}`);
      }
    });

    // Start Ollama automatically
    logger.info('Checking Ollama service...');
    const ollamaStarted = await ollamaManager.start();
    if (ollamaStarted) {
      logger.info('✅ Ollama service is running');
      console.log('✅ Ollama service is running');

      // Ensure default model is available
      const defaultModel = 'llama3.2:3b';
      logger.info(`Checking for default model: ${defaultModel}`);
      const hasModel = await ollamaManager.hasModel(defaultModel);
      if (!hasModel) {
        logger.warn(`Default model ${defaultModel} not found. Please pull it using: ollama pull ${defaultModel}`);
        console.log(`⚠️  Default model ${defaultModel} not found`);
        console.log(`   You can pull it by visiting the Ollama settings in the app`);
      } else {
        logger.info(`✅ Default model ${defaultModel} is available`);
        console.log(`✅ Default model ${defaultModel} is available`);
      }
    } else {
      logger.warn('⚠️  Ollama service failed to start. Some features may not work.');
      console.log('⚠️  Ollama service failed to start. Please start it manually.');
      console.log('   Visit https://ollama.ai to install Ollama if not installed');
    }

    const server = app.listen(config.port, () => {
      logger.info('AI Speech Evaluator Backend started successfully', {
        port: config.port,
        environment: config.nodeEnv,
        healthEndpoint: `http://localhost:${config.port}/api/health`,
        timestamp: new Date().toISOString()
      });

      console.log(`🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`);
      console.log(`📍 Health check: http://localhost:${config.port}/api/health`);
      console.log(`🤖 Ollama API: http://localhost:${config.port}/api/ollama`);
      console.log(`🔒 Security middleware active`);
      console.log(`📊 Comprehensive logging enabled`);
      console.log(`🛡️  Rate limiting configured`);
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

startServer().then(server => {
  // Store server reference for graceful shutdown
  globalThis.server = server;
}).catch(error => {
  logger.error('Server startup failed', { error: error.message });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, starting graceful shutdown');
  await ollamaManager.stop();
  const server = globalThis.server;
  if (server) {
    server.close(() => {
      logger.info('Server closed successfully');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, starting graceful shutdown');
  await ollamaManager.stop();
  const server = globalThis.server;
  if (server) {
    server.close(() => {
      logger.info('Server closed successfully');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

export default app;