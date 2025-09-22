import { Router } from 'express';

const router = Router();

// Placeholder routes for audio functionality
router.post('/upload', (req, res) => {
  res.json({
    success: true,
    message: 'Audio upload endpoint - Coming soon',
  });
});

router.post('/transcribe', (req, res) => {
  res.json({
    success: true,
    message: 'Audio transcription endpoint - Coming soon',
  });
});

export { router as audioRoutes };