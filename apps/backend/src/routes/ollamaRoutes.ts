import { Router, Request, Response } from 'express';
import { ollamaManager } from '../utils/ollamaManager';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /api/ollama/status
 * Check Ollama service status with detailed diagnostics
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = await ollamaManager.getStatus();

    // Return appropriate status code based on Ollama state
    const statusCode = status.running ? 200 : status.installed ? 503 : 424;

    res.status(statusCode).json({
      success: status.running,
      data: status,
      message: status.running
        ? 'Ollama is ready'
        : status.error || 'Ollama is not available'
    });
  } catch (error) {
    logger.error('Error checking Ollama status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check Ollama status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ollama/health
 * Comprehensive health check
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await ollamaManager.healthCheck();

    const statusCode = health.healthy ? 200 : 503;

    res.status(statusCode).json({
      success: health.healthy,
      data: health,
    });
  } catch (error) {
    logger.error('Error performing Ollama health check:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ollama/start
 * Start Ollama service with detailed status
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    logger.info('Received request to start Ollama');

    // First check status
    const status = await ollamaManager.getStatus();

    if (!status.installed) {
      return res.status(424).json({
        success: false,
        error: 'Ollama is not installed',
        message: 'Please install Ollama from https://ollama.ai',
        data: status
      });
    }

    if (status.running) {
      return res.json({
        success: true,
        message: 'Ollama is already running',
        data: status
      });
    }

    // Try to start
    logger.info('Attempting to start Ollama...');
    const started = await ollamaManager.start();

    if (started) {
      const newStatus = await ollamaManager.getStatus();
      res.json({
        success: true,
        message: 'Ollama started successfully',
        data: newStatus
      });
    } else {
      const failedStatus = await ollamaManager.getStatus();
      res.status(503).json({
        success: false,
        error: 'Failed to start Ollama',
        message: 'Ollama did not start within the timeout period. Try starting manually: ollama serve',
        data: failedStatus
      });
    }
  } catch (error) {
    logger.error('Error starting Ollama:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start Ollama service',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ollama/restart
 * Restart Ollama service
 */
router.post('/restart', async (req: Request, res: Response) => {
  try {
    logger.info('Received request to restart Ollama');

    const restarted = await ollamaManager.restart();

    if (restarted) {
      const status = await ollamaManager.getStatus();
      res.json({
        success: true,
        message: 'Ollama restarted successfully',
        data: status
      });
    } else {
      res.status(503).json({
        success: false,
        error: 'Failed to restart Ollama',
        message: 'Ollama restart failed. Try manually: ollama serve'
      });
    }
  } catch (error) {
    logger.error('Error restarting Ollama:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restart Ollama service',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ollama/models
 * List available models with error handling
 */
router.get('/models', async (req: Request, res: Response) => {
  try {
    // First check if Ollama is running
    const status = await ollamaManager.getStatus();

    if (!status.running) {
      return res.status(503).json({
        success: false,
        error: 'Ollama is not running',
        message: status.error || 'Start Ollama first',
        data: { models: [], count: 0 }
      });
    }

    const models = await ollamaManager.listModels();

    res.json({
      success: true,
      data: {
        models,
        count: models.length,
      },
    });
  } catch (error: any) {
    logger.error('Error listing Ollama models:', error);

    const errorMessage = error.message || 'Failed to list models';

    res.status(500).json({
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ollama/models/pull
 * Pull a model from Ollama registry with SSE progress
 */
router.post('/models/pull', async (req: Request, res: Response) => {
  try {
    const { modelName } = req.body;

    if (!modelName) {
      return res.status(400).json({
        success: false,
        error: 'Model name is required',
      });
    }

    // Check if Ollama is running
    const status = await ollamaManager.getStatus();
    if (!status.running) {
      return res.status(503).json({
        success: false,
        error: 'Ollama is not running',
        message: 'Start Ollama before pulling models'
      });
    }

    // Set up SSE for progress updates
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const success = await ollamaManager.pullModel(
        modelName,
        (progress: number, status: string) => {
          res.write(`data: ${JSON.stringify({ progress, status })}\n\n`);
        }
      );

      if (success) {
        res.write(`data: ${JSON.stringify({ progress: 100, status: 'completed' })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify({ progress: 0, status: 'error', error: 'Failed to pull model' })}\n\n`);
      }
    } catch (pullError: any) {
      res.write(`data: ${JSON.stringify({ progress: 0, status: 'error', error: pullError.message })}\n\n`);
    }

    res.end();
  } catch (error: any) {
    logger.error('Error pulling model:', error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to pull model',
        details: error.message
      });
    } else {
      res.write(`data: ${JSON.stringify({ progress: 0, status: 'error', error: error.message })}\n\n`);
      res.end();
    }
  }
});

/**
 * POST /api/ollama/models/ensure
 * Ensure a model is available (pull if necessary)
 */
router.post('/models/ensure', async (req: Request, res: Response) => {
  try {
    const { modelName } = req.body;

    if (!modelName) {
      return res.status(400).json({
        success: false,
        error: 'Model name is required',
      });
    }

    // Check if Ollama is running
    const status = await ollamaManager.getStatus();
    if (!status.running) {
      return res.status(503).json({
        success: false,
        error: 'Ollama is not running',
        message: 'Start Ollama first'
      });
    }

    const hasModel = await ollamaManager.hasModel(modelName);

    if (hasModel) {
      return res.json({
        success: true,
        data: {
          message: 'Model is already available',
          modelName,
          alreadyAvailable: true,
        },
      });
    }

    // Model not available, need to pull
    res.json({
      success: true,
      data: {
        message: 'Model not available, needs to be pulled',
        modelName,
        alreadyAvailable: false,
      },
    });
  } catch (error: any) {
    logger.error('Error ensuring model:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check model availability',
      details: error.message
    });
  }
});

export default router;
