import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { audioController } from '../controllers/audioController';
import { config } from '../config';

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

const audioFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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

// Routes
router.post('/upload', uploadAudio.single('audio'), audioController.uploadAudio);
router.post('/:id/transcribe', audioController.transcribeAudio);
router.get('/:id', audioController.getAudioRecording);
router.delete('/:id', audioController.deleteAudioRecording);
router.get('/document/:documentId', audioController.getAudioRecordingsForDocument);
router.get('/:id/status', audioController.getProcessingStatus);

export { router as audioRoutes };