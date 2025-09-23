import helmet from 'helmet';
import compression from 'compression';
import { Request, Response, NextFunction } from 'express';

// Configurazione sicurezza con Helmet
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disabilitato per compatibilità
});

// Middleware di compressione
export const compressionMiddleware = compression({
  level: 6,
  threshold: 1024,
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
});

// Middleware per CORS personalizzato
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://localhost:3000',
    'https://localhost:3001',
  ];

  // In produzione, aggiungi i domini specifici
  if (process.env.NODE_ENV === 'production') {
    // allowedOrigins.push('https://yourdomain.com');
  }

  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control'
  );

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 ore

  // Gestione richieste preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
};

// Middleware per protezione CSRF base
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Per richieste che modificano dati, verifica header personalizzato
  const modifyingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

  if (modifyingMethods.includes(req.method)) {
    const csrfHeader = req.headers['x-requested-with'];

    if (!csrfHeader || csrfHeader !== 'XMLHttpRequest') {
      // Accetta anche richieste con Content-Type multipart (file upload)
      const contentType = req.headers['content-type'];
      if (!contentType || !contentType.startsWith('multipart/form-data')) {
        return res.status(403).json({
          success: false,
          error: 'CSRF protection: Missing required header',
        });
      }
    }
  }

  next();
};

// Middleware per sanitizzazione headers
export const sanitizeHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Rimuovi headers potenzialmente pericolosi
  delete req.headers['x-forwarded-host'];
  delete req.headers['x-host'];
  delete req.headers['x-forwarded-server'];

  // Limita lunghezza headers
  Object.keys(req.headers).forEach(key => {
    if (typeof req.headers[key] === 'string') {
      const value = req.headers[key] as string;
      if (value.length > 1000) {
        delete req.headers[key];
      }
    }
  });

  next();
};

// Middleware per protezione contro path traversal
export const pathTraversalProtection = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /\.\./,
    /\.\/\//,
    /\\\.\\\./,
    /%2e%2e/i,
    /%252e%252e/i,
  ];

  const urlPath = decodeURIComponent(req.path);

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(urlPath)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid path detected',
      });
    }
  }

  next();
};

// Middleware per limitare dimensione body
export const bodyLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');

  // Limite generale: 100MB per upload file, 1MB per JSON
  const isFileUpload = req.headers['content-type']?.startsWith('multipart/form-data');
  const maxSize = isFileUpload ? 100 * 1024 * 1024 : 1024 * 1024;

  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      error: `Request body too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`,
    });
  }

  next();
};

// Middleware per logging delle richieste sospette
export const suspiciousActivityLogger = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousIndicators = [
    // SQL Injection patterns
    /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bDROP\b)/i,
    // XSS patterns
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    // Command injection
    /[;&|`$(){}[\]]/,
    // Path traversal
    /\.\.[\/\\]/,
  ];

  const requestData = JSON.stringify({
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  for (const pattern of suspiciousIndicators) {
    if (pattern.test(requestData)) {
      console.warn('Suspicious activity detected:', {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
      });
      break;
    }
  }

  next();
};

// Middleware per headers di sicurezza personalizzati
export const customSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Nasconde tecnologia server
  res.removeHeader('X-Powered-By');

  // Headers aggiuntivi per sicurezza
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Cache control per risposte API
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};