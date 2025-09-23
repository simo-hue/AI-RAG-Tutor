import { Router } from 'express';
import { evaluationController } from '../controllers/evaluationController';
import { evaluationLimiter, generalLimiter, batchLimiter } from '../middleware/rateLimiter';
import {
  validateEvaluation,
  validateDetailedFeedback,
  validateComparePresentations,
  validateBatchEvaluation,
  validateTestEndpoint,
  validateTestSimilaritySearch
} from '../middleware/validation';
import { customSecurityHeaders } from '../middleware/security';

const router = Router();

// Apply security headers to all routes
router.use(customSecurityHeaders);

// Main evaluation routes
router.post('/evaluate',
  evaluationLimiter,
  validateEvaluation,
  evaluationController.evaluatePresentation
);

router.post('/quick',
  evaluationLimiter,
  validateEvaluation,
  evaluationController.quickEvaluation
);

router.post('/detailed-feedback',
  evaluationLimiter,
  validateDetailedFeedback,
  evaluationController.generateDetailedFeedback
);

router.post('/compare',
  evaluationLimiter,
  validateComparePresentations,
  evaluationController.comparePresentations
);

router.post('/full-analysis',
  evaluationLimiter,
  validateEvaluation,
  evaluationController.evaluateWithFullAnalysis
);

router.post('/batch',
  batchLimiter,
  validateBatchEvaluation,
  evaluationController.evaluateBatch
);

// Information routes
router.get('/criteria',
  generalLimiter,
  evaluationController.getCriteriaExplanation
);

router.get('/health',
  generalLimiter,
  evaluationController.getEvaluationHealth
);

// Test routes (development only)
router.post('/test',
  validateTestEndpoint,
  evaluationController.testEvaluation
);

export { router as evaluationRoutes };