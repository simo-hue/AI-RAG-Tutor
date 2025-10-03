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
  // Log incoming file details for debugging
  console.log('🔍 Audio upload attempt:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  // Expanded list of audio MIME types to support more formats
  const allowedTypes = [
    // WAV formats
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    // MP3 formats
    'audio/mp3',
    'audio/mpeg',
    'audio/mpeg3',
    'audio/x-mpeg-3',
    // OGG formats
    'audio/ogg',
    'audio/vorbis',
    'audio/opus',
    // WebM
    'audio/webm',
    // M4A/AAC formats (most common issue)
    'audio/m4a',
    'audio/x-m4a',
    'audio/mp4',
    'audio/aac',
    'audio/aacp',
    'audio/x-aac',
    // FLAC
    'audio/flac',
    'audio/x-flac',
    // Other common formats
    'audio/amr',
    'audio/3gpp',
    'audio/3gpp2',
    'application/octet-stream', // Generic binary - check extension
  ];

  // Get file extension
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = [
    '.wav', '.mp3', '.ogg', '.opus', '.webm',
    '.m4a', '.aac', '.flac', '.amr', '.3gp'
  ];

  // Check MIME type
  const mimeTypeValid = allowedTypes.includes(file.mimetype);
  console.log('✓ MIME type check:', { mimetype: file.mimetype, valid: mimeTypeValid });

  if (mimeTypeValid) {
    console.log('✅ File accepted by MIME type');
    cb(null, true);
    return;
  }

  // If MIME type is generic or unknown, check file extension
  const extensionValid = allowedExtensions.includes(ext);
  console.log('✓ Extension check:', { extension: ext, valid: extensionValid });

  if (extensionValid) {
    console.log('✅ File accepted by extension');
    cb(null, true);
    return;
  }

  // Reject file
  const errorMsg = `File type not allowed: ${file.originalname}. MIME type: ${file.mimetype}, Extension: ${ext}`;
  console.log('❌ File rejected:', errorMsg);
  cb(new Error(errorMsg));
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