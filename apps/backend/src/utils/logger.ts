import winston from 'winston';
import path from 'path';

// Configurazione formati per i log
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Configurazione per console (sviluppo)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    if (stack) {
      log += `\n${stack}`;
    }

    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return log;
  })
);

// Configurazione transports
const transports: winston.transport[] = [];

// Console transport (sempre attivo in sviluppo)
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug',
    })
  );
}

// File transports per produzione
if (process.env.NODE_ENV === 'production') {
  const logDir = process.env.LOG_DIR || './logs';

  // Log degli errori
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Log combinato
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Console anche in produzione per container logs
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      level: 'info',
    })
  );
}

// Creazione logger principale
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  transports,
  exitOnError: false,
});

// Logger specifici per diverse aree dell'applicazione
export const ragLogger = logger.child({ service: 'rag' });
export const evaluationLogger = logger.child({ service: 'evaluation' });
export const audioLogger = logger.child({ service: 'audio' });
export const documentLogger = logger.child({ service: 'document' });
export const securityLogger = logger.child({ service: 'security' });

// Funzioni helper per logging strutturato
export const loggers = {
  // Log per operazioni RAG
  ragOperation: (operation: string, data: any, duration?: number) => {
    ragLogger.info('RAG operation completed', {
      operation,
      duration: duration ? `${duration}ms` : undefined,
      ...data,
    });
  },

  // Log per valutazioni
  evaluationCompleted: (documentId: string, transcriptionLength: number, score: number, duration: number) => {
    evaluationLogger.info('Evaluation completed', {
      documentId,
      transcriptionLength,
      overallScore: score,
      duration: `${duration}ms`,
    });
  },

  // Log per upload file
  fileUploaded: (filename: string, size: number, mimetype: string, processingTime?: number) => {
    documentLogger.info('File uploaded and processed', {
      filename,
      size: `${Math.round(size / 1024)}KB`,
      mimetype,
      processingTime: processingTime ? `${processingTime}ms` : undefined,
    });
  },

  // Log per trascrizioni audio
  audioTranscribed: (audioId: string, duration: number, transcriptionLength: number, processingTime: number) => {
    audioLogger.info('Audio transcribed', {
      audioId,
      audioDuration: `${duration}s`,
      transcriptionLength,
      processingTime: `${processingTime}ms`,
    });
  },

  // Log per attività sospette
  suspiciousActivity: (ip: string, userAgent: string, activity: string, details: any) => {
    securityLogger.warn('Suspicious activity detected', {
      ip,
      userAgent,
      activity,
      timestamp: new Date().toISOString(),
      ...details,
    });
  },

  // Log per errori di sistema
  systemError: (error: Error, context: any = {}) => {
    logger.error('System error occurred', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      timestamp: new Date().toISOString(),
    });
  },

  // Log per performance monitoring
  performanceMetric: (operation: string, duration: number, metadata: any = {}) => {
    logger.info('Performance metric', {
      operation,
      duration: `${duration}ms`,
      performance: duration > 5000 ? 'slow' : duration > 1000 ? 'medium' : 'fast',
      ...metadata,
    });
  },

  // Log per API requests
  apiRequest: (method: string, url: string, statusCode: number, duration: number, userAgent?: string) => {
    logger.info('API request completed', {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  },

  // Log per health checks
  healthCheck: (service: string, status: 'healthy' | 'unhealthy', details: any = {}) => {
    const logLevel = status === 'healthy' ? 'info' : 'warn';
    logger.log(logLevel, 'Health check completed', {
      service,
      status,
      ...details,
      timestamp: new Date().toISOString(),
    });
  },
};

// Middleware per logging delle richieste HTTP
export const requestLogger = (req: any, res: any, next: any) => {
  const startTime = Date.now();

  // Log della richiesta in arrivo
  logger.debug('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Intercetta la risposta
  const originalSend = res.send;
  res.send = function (data: any) {
    const duration = Date.now() - startTime;

    loggers.apiRequest(
      req.method,
      req.url,
      res.statusCode,
      duration,
      req.headers['user-agent']
    );

    // Log errori 4xx e 5xx
    if (res.statusCode >= 400) {
      logger.warn('HTTP error response', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        ip: req.ip,
        duration: `${duration}ms`,
        response: data ? JSON.stringify(data).substring(0, 500) : undefined,
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

// Gestione degli errori non catturati
process.on('uncaughtException', (error: Error) => {
  loggers.systemError(error, { type: 'uncaughtException' });
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  loggers.systemError(new Error(`Unhandled rejection: ${reason}`), {
    type: 'unhandledRejection',
    promise: promise.toString(),
  });
});

// Graceful shutdown logging
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, starting graceful shutdown');
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, starting graceful shutdown');
});

export default logger;