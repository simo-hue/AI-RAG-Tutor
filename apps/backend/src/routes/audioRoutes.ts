import { Router, Request } from 'express';
import multer from 'multer';
import path from 'path';
import { audioController } from '../controllers/audioController';
import { config } from '../config';
import { transcriptionLimiter, uploadLimiter, generalLimiter } from '../middleware/rateLimiter';
import {
  validateAudioId,
  validateAudioUpload,
  validateDocumentId,
  validateFileUpload,
  validatePagination
} from '../middleware/validation';
import { customSecurityHeaders } from '../middleware/security';

const router = Router();

// Configure multer for audio file uploads
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const audioDir = path.join(config.storage.uploadDir, 'audio');
    cb(null, audioDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `audio-${uniqueSuffix}${ext}`);
  },
});

const audioFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'audio/wav',
    'audio/mp3',
    'audio/ogg',
    'audio/webm',
    'audio/m4a',
    'audio/aac'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Please upload audio files only.'));
  }
};

const uploadAudio = multer({
  storage: audioStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: audioFileFilter,
});

// Apply security headers to all routes
router.use(customSecurityHeaders);

// Routes with comprehensive middleware
router.post('/upload',
  uploadLimiter,
  uploadAudio.single('audio'),
  validateFileUpload,
  validateAudioUpload,
  audioController.uploadAudio
);

router.post('/:id/transcribe',
  transcriptionLimiter,
  validateAudioId,
  audioController.transcribeAudio
);

router.get('/:id',
  generalLimiter,
  validateAudioId,
  audioController.getAudioRecording
);

router.delete('/:id',
  generalLimiter,
  validateAudioId,
  audioController.deleteAudioRecording
);

router.get('/document/:documentId',
  generalLimiter,
  validateDocumentId,
  validatePagination,
  audioController.getAudioRecordingsForDocument
);

router.get('/:id/status',
  generalLimiter,
  validateAudioId,
  audioController.getProcessingStatus
);

export { router as audioRoutes };