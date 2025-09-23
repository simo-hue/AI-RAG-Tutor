import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
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

// Start server
const server = app.listen(config.port, () => {
  logger.info('AI Speech Evaluator Backend started successfully', {
    port: config.port,
    environment: config.nodeEnv,
    healthEndpoint: `http://localhost:${config.port}/api/health`,
    timestamp: new Date().toISOString()
  });

  console.log(`🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`);
  console.log(`📍 Health check: http://localhost:${config.port}/api/health`);
  console.log(`🔒 Security middleware active`);
  console.log(`📊 Comprehensive logging enabled`);
  console.log(`🛡️  Rate limiting configured`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, starting graceful shutdown');
  server.close(() => {
    logger.info('Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, starting graceful shutdown');
  server.close(() => {
    logger.info('Server closed successfully');
    process.exit(0);
  });
});

export default app;