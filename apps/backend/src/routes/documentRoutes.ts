import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { documentController } from '../controllers/documentController';
import { config } from '../config';

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

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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

// Routes
router.post('/upload', upload.single('document'), documentController.uploadDocument);
router.get('/', documentController.getDocuments);
router.get('/:id', documentController.getDocument);
router.delete('/:id', documentController.deleteDocument);
router.get('/:id/status', documentController.getProcessingStatus);
router.post('/:id/process', documentController.processDocument);

export { router as documentRoutes };