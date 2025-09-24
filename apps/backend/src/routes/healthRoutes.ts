import { Router } from 'express';
import { healthLimiter } from '../middleware/rateLimiter';
import { customSecurityHeaders } from '../middleware/security';
import { loggers } from '../utils/logger';
import { ollamaManager } from '../services/ollamaManager';

const router = Router();

// Apply middleware
router.use(customSecurityHeaders);

router.get('/', healthLimiter, async (req, res) => {
  try {
    // Check Ollama status
    const ollamaStatus = await ollamaManager.getStatus();

    const health = {
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
      },
      nodeVersion: process.version,
      services: {
        ollama: ollamaStatus
      }
    };

    // Log health check
    loggers.healthCheck('main-server', 'healthy', {
      uptime: process.uptime(),
      memory: health.memory,
      ollama: ollamaStatus.running
    });

    res.json(health);
  } catch (error) {
    loggers.healthCheck('main-server', 'unhealthy', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Server health check failed',
      error: error.message,
    });
  }
});

// Ollama-specific health check and management
router.get('/ollama', healthLimiter, async (req, res) => {
  try {
    const status = await ollamaManager.getStatus();

    res.json({
      success: status.running,
      message: status.running ? 'Ollama is running' : 'Ollama is not running',
      ...status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check Ollama status',
      error: error.message
    });
  }
});

// Force start Ollama
router.post('/ollama/start', healthLimiter, async (req, res) => {
  try {
    const success = await ollamaManager.ensureOllamaRunning();

    if (success) {
      const status = await ollamaManager.getStatus();
      res.json({
        success: true,
        message: 'Ollama started successfully',
        ...status
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Failed to start Ollama',
        error: 'Ollama could not be started after multiple attempts'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error starting Ollama',
      error: error.message
    });
  }
});

export { router as healthRoutes };