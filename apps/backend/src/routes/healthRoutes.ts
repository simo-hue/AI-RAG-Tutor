import { Router } from 'express';
import { healthLimiter } from '../middleware/rateLimiter';
import { customSecurityHeaders } from '../middleware/security';
import { loggers } from '../utils/logger';

const router = Router();

// Apply middleware
router.use(customSecurityHeaders);

router.get('/', healthLimiter, async (req, res) => {
  try {
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
    };

    // Log health check
    loggers.healthCheck('main-server', 'healthy', {
      uptime: process.uptime(),
      memory: health.memory,
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

export { router as healthRoutes };