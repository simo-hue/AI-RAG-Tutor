import { Router, Request, Response } from 'express';
import LanguageDetector, { SUPPORTED_LANGUAGES } from '../utils/languageDetector';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /api/languages
 * Get list of supported languages
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      languages: SUPPORTED_LANGUAGES,
      default: 'it'
    }
  });
});

/**
 * POST /api/languages/detect
 * Detect language from text
 */
router.post('/detect', async (req: Request, res: Response) => {
  try {
    const { text, method } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    let languageInfo;

    if (method === 'ollama') {
      languageInfo = await LanguageDetector.detectWithOllama(text);
    } else {
      languageInfo = LanguageDetector.detectFromText(text);
    }

    res.json({
      success: true,
      data: languageInfo
    });
  } catch (error) {
    logger.error('Language detection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect language'
    });
  }
});

/**
 * POST /api/languages/validate
 * Validate language compatibility between document and transcription
 */
router.post('/validate', (req: Request, res: Response) => {
  try {
    const {
      documentLanguage,
      transcriptionLanguage,
      documentConfidence,
      transcriptionConfidence
    } = req.body;

    if (!documentLanguage || !transcriptionLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Both documentLanguage and transcriptionLanguage are required'
      });
    }

    const validation = LanguageDetector.validateLanguageMatch(
      documentLanguage,
      transcriptionLanguage,
      documentConfidence || 1,
      transcriptionConfidence || 1
    );

    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    logger.error('Language validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate language compatibility'
    });
  }
});

export default router;
