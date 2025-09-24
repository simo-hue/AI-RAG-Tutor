import { Router, Request } from 'express';
import multer from 'multer';
import path from 'path';
import { documentController } from '../controllers/documentController';
import { config } from '../config';
import { uploadLimiter, generalLimiter } from '../middleware/rateLimiter';
import {
  validateDocumentUpload,
  validateDocumentId,
  validateDocumentSearch,
  validateRelevantContext,
  validateFileUpload,
  validatePagination,
  validateSorting
} from '../middleware/validation';
import { customSecurityHeaders } from '../middleware/security';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.storage.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `document-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Please upload PDF, DOCX, or TXT files.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: config.storage.maxFileSize,
  },
  fileFilter,
});

// Apply security headers to all routes
router.use(customSecurityHeaders);

// Routes with comprehensive middleware
router.post('/upload',
  uploadLimiter,
  upload.single('document'),
  validateFileUpload,
  validateDocumentUpload,
  documentController.uploadDocument
);

router.get('/',
  generalLimiter,
  validatePagination,
  validateSorting,
  documentController.getDocuments
);

router.get('/:id',
  generalLimiter,
  validateDocumentId,
  documentController.getDocument
);

router.delete('/:id',
  generalLimiter,
  validateDocumentId,
  documentController.deleteDocument
);

router.get('/:id/status',
  generalLimiter,
  validateDocumentId,
  documentController.getProcessingStatus
);

router.post('/:documentId/process',
  generalLimiter,
  validateDocumentId,
  documentController.processDocument
);

router.post('/:documentId/search',
  generalLimiter,
  validateDocumentSearch,
  documentController.searchDocument
);

router.post('/:documentId/relevant-context',
  generalLimiter,
  validateRelevantContext,
  documentController.getRelevantContext
);

router.get('/:id/chunks',
  generalLimiter,
  validateDocumentId,
  validatePagination,
  documentController.getDocumentChunks
);

router.get('/:id/metadata',
  generalLimiter,
  validateDocumentId,
  documentController.getDocumentMetadata
);

export { router as documentRoutes };