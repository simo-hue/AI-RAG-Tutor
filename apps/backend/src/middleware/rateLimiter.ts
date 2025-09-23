import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// Rate limiter generale per tutte le API
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // massimo 100 richieste per IP
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter per upload documenti
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ora
  max: 10, // massimo 10 upload per ora
  message: {
    success: false,
    error: 'Too many file uploads, please try again later.',
    retryAfter: '1 hour',
  },
  skip: (req: Request) => {
    // Salta rate limiting per file di validazione
    return req.path.includes('/validate');
  },
});

// Rate limiter per valutazioni AI (più restrittivo)
export const evaluationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ora
  max: 20, // massimo 20 valutazioni per ora
  message: {
    success: false,
    error: 'Too many evaluation requests, please try again later.',
    retryAfter: '1 hour',
  },
});

// Rate limiter per trascrizioni audio
export const transcriptionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ora
  max: 30, // massimo 30 trascrizioni per ora
  message: {
    success: false,
    error: 'Too many transcription requests, please try again later.',
    retryAfter: '1 hour',
  },
});

// Rate limiter per ricerche (meno restrittivo)
export const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 50, // massimo 50 ricerche per 15 minuti
  message: {
    success: false,
    error: 'Too many search requests, please try again later.',
    retryAfter: '15 minutes',
  },
});

// Rate limiter per batch operations (molto restrittivo)
export const batchLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 ore
  max: 5, // massimo 5 operazioni batch per giorno
  message: {
    success: false,
    error: 'Too many batch operations, please try again tomorrow.',
    retryAfter: '24 hours',
  },
});

// Rate limiter per health checks (molto permissivo)
export const healthLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 60, // massimo 60 health checks per minuto
  message: {
    success: false,
    error: 'Too many health check requests.',
    retryAfter: '1 minute',
  },
});