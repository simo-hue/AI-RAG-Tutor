import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// Middleware per gestire i risultati delle validazioni
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value,
    }));

    throw new AppError(
      `Validation failed: ${errorMessages.map(e => e.message).join(', ')}`,
      400,
      errorMessages
    );
  }
  next();
};

// Validazioni per documenti
export const validateDocumentUpload = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  handleValidationErrors,
];

export const validateDocumentId = [
  param('documentId')
    .notEmpty()
    .withMessage('Document ID is required')
    .matches(/^doc_\d+_[a-z0-9]+$/)
    .withMessage('Invalid document ID format'),
  handleValidationErrors,
];

export const validateDocumentSearch = [
  param('documentId')
    .notEmpty()
    .withMessage('Document ID is required')
    .matches(/^doc_\d+_[a-z0-9]+$/)
    .withMessage('Invalid document ID format'),
  body('query')
    .notEmpty()
    .withMessage('Search query is required')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Query must be between 3 and 500 characters'),
  body('topK')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('topK must be between 1 and 20'),
  handleValidationErrors,
];

export const validateRelevantContext = [
  param('documentId')
    .notEmpty()
    .withMessage('Document ID is required')
    .matches(/^doc_\d+_[a-z0-9]+$/)
    .withMessage('Invalid document ID format'),
  body('transcription')
    .notEmpty()
    .withMessage('Transcription is required')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Transcription must be between 10 and 10000 characters'),
  body('maxChunks')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('maxChunks must be between 1 and 10'),
  handleValidationErrors,
];

// Validazioni per valutazioni
export const validateEvaluation = [
  body('transcription')
    .notEmpty()
    .withMessage('Transcription is required')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Transcription must be between 10 and 10000 characters')
    .custom((value) => {
      // Verifica che non contenga solo caratteri speciali
      const cleanText = value.replace(/[\s\p{P}]/gu, '');
      if (cleanText.length === 0) {
        throw new Error('Transcription cannot contain only special characters');
      }
      return true;
    }),
  body('documentId')
    .notEmpty()
    .withMessage('Document ID is required')
    .matches(/^doc_\d+_[a-z0-9]+$/)
    .withMessage('Invalid document ID format'),
  body('options')
    .optional()
    .isObject()
    .withMessage('Options must be an object'),
  body('options.maxRelevantChunks')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('maxRelevantChunks must be between 1 and 10'),
  body('options.minSimilarityScore')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('minSimilarityScore must be between 0 and 1'),
  handleValidationErrors,
];

export const validateDetailedFeedback = [
  body('transcription')
    .notEmpty()
    .withMessage('Transcription is required')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Transcription must be between 10 and 10000 characters'),
  body('documentId')
    .notEmpty()
    .withMessage('Document ID is required')
    .matches(/^doc_\d+_[a-z0-9]+$/)
    .withMessage('Invalid document ID format'),
  body('focusArea')
    .optional()
    .isIn(['accuracy', 'clarity', 'completeness', 'coherence', 'fluency'])
    .withMessage('Invalid focus area'),
  handleValidationErrors,
];

export const validateComparePresentations = [
  body('evaluationIds')
    .isArray({ min: 2, max: 10 })
    .withMessage('evaluationIds must be an array with 2-10 elements')
    .custom((ids) => {
      const validPattern = /^eval_\d+_[a-z0-9]+$/;
      for (const id of ids) {
        if (!validPattern.test(id)) {
          throw new Error(`Invalid evaluation ID format: ${id}`);
        }
      }
      return true;
    }),
  handleValidationErrors,
];

export const validateBatchEvaluation = [
  body('evaluations')
    .isArray({ min: 1, max: 5 })
    .withMessage('evaluations must be an array with 1-5 elements'),
  body('evaluations.*.transcription')
    .notEmpty()
    .withMessage('Each evaluation must have a transcription')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Each transcription must be between 10 and 10000 characters'),
  body('evaluations.*.documentId')
    .notEmpty()
    .withMessage('Each evaluation must have a documentId')
    .matches(/^doc_\d+_[a-z0-9]+$/)
    .withMessage('Invalid document ID format'),
  handleValidationErrors,
];

// Validazioni per audio
export const validateAudioId = [
  param('id')
    .notEmpty()
    .withMessage('Audio ID is required')
    .matches(/^[a-z0-9]+$/)
    .withMessage('Invalid audio ID format'),
  handleValidationErrors,
];

export const validateAudioUpload = [
  body('documentId')
    .optional()
    .matches(/^doc_\d+_[a-z0-9]+$/)
    .withMessage('Invalid document ID format'),
  body('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .isFloat({ min: 0.1, max: 3600 })
    .withMessage('Duration must be between 0.1 and 3600 seconds'),
  handleValidationErrors,
];

// Validazioni per test endpoints
export const validateTestEndpoint = [
  (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'production') {
      throw new AppError('Test endpoints not available in production', 403);
    }
    next();
  },
];

export const validateTestSimilaritySearch = [
  ...validateTestEndpoint,
  body('query')
    .notEmpty()
    .withMessage('Search query is required')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Query must be between 3 and 500 characters'),
  body('documentId')
    .optional()
    .matches(/^doc_\d+_[a-z0-9]+$/)
    .withMessage('Invalid document ID format'),
  handleValidationErrors,
];

// Validazioni per query parameters
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];

export const validateSorting = [
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'name', 'size'])
    .withMessage('Invalid sort field'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  handleValidationErrors,
];

// Validazioni per file uploads
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file && !req.files) {
    throw new AppError('No file uploaded', 400);
  }

  // Validazione singolo file
  if (req.file) {
    validateSingleFile(req.file);
  }

  // Validazione multiple files
  if (req.files && Array.isArray(req.files)) {
    if (req.files.length > 10) {
      throw new AppError('Maximum 10 files allowed', 400);
    }
    req.files.forEach(validateSingleFile);
  }

  next();
};

function validateSingleFile(file: Express.Multer.File) {
  // Dimensione massima: 50MB
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new AppError(`File size too large: ${file.originalname}. Maximum size: 50MB`, 400);
  }

  // Tipi di file consentiti
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'audio/wav',
    'audio/mp3',
    'audio/ogg',
    'audio/webm',
    'audio/m4a',
    'audio/aac',
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new AppError(`File type not allowed: ${file.originalname}`, 400);
  }

  // Validazione nome file
  if (file.originalname.length > 255) {
    throw new AppError(`Filename too long: ${file.originalname}`, 400);
  }

  // Caratteri non consentiti nel nome file
  const forbiddenChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (forbiddenChars.test(file.originalname)) {
    throw new AppError(`Invalid characters in filename: ${file.originalname}`, 400);
  }
}

// Middleware di sanitizzazione
export const sanitizeInput = [
  body('*').trim().escape(),
];

// Validazione personalizzata per contenuti sicuri
export const validateSafeContent = [
  body(['transcription', 'query', 'title', 'description'])
    .optional()
    .custom((value) => {
      // Pattern per rilevare possibili attacchi XSS o injection
      const dangerousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /data:text\/html/gi,
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          throw new Error('Content contains potentially dangerous patterns');
        }
      }
      return true;
    }),
  handleValidationErrors,
];