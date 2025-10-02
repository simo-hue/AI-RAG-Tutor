import { Request, Response, NextFunction } from 'express';
import { DocumentService, RAGServiceManager } from '../services/ragService';
import { documentService } from '../services/documentService';
import { AppError } from '../middleware/errorHandler';
import path from 'path';
import fs from 'fs/promises';
import { config } from '../config';
import { cleanupMulterFiles, safeCleanupFile } from '../utils/fileCleanup';

// Funzione helper per generare ID univoci
function generateDocumentId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `doc_${timestamp}_${random}`;
}

export const documentController = {
  async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('🔍 Upload request received:', {
        hasFile: !!req.file,
        originalname: req.file?.originalname,
        mimetype: req.file?.mimetype,
        size: req.file?.size
      });

      if (!req.file) {
        throw new AppError('No document file uploaded', 400);
      }

      const documentId = generateDocumentId();
      console.log('🔍 Generated document ID:', documentId);

      // Validazioni robuste del file
      const allowedExtensions = ['.pdf', '.docx', '.txt'];
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      const maxFileSize = config.storage.maxFileSize; // 50MB

      // Verifica estensione
      if (!allowedExtensions.includes(fileExtension)) {
        await safeCleanupFile(req.file.path);
        throw new AppError(
          `File type not supported. Allowed types: ${allowedExtensions.join(', ')}`,
          415
        );
      }

      // Verifica dimensione file
      if (req.file.size > maxFileSize) {
        await safeCleanupFile(req.file.path);
        throw new AppError(
          `File too large. Maximum size allowed: ${Math.round(maxFileSize / (1024 * 1024))}MB`,
          413
        );
      }

      // Verifica che il file esista e sia leggibile
      try {
        await fs.access(req.file.path);
      } catch (accessError) {
        throw new AppError('Uploaded file is not accessible', 400);
      }

      console.log('🔍 Starting document upload and RAG processing...');

      // Prima processalo con il servizio RAG (mentre il file è ancora disponibile)
      const ragService = await RAGServiceManager.getInstance();
      const ragDocumentService = new DocumentService(ragService);

      try {
        // Usa il file caricato per processamento RAG prima che venga spostato
        const processingResult = await ragDocumentService.processDocument(req.file.path, documentId);
        console.log('🔍 RAG processing completed:', {
          documentId: processingResult.documentId,
          chunkCount: processingResult.chunkCount,
          wordCount: processingResult.wordCount
        });

        // Poi carica il documento normalmente CON LO STESSO ID
        const uploadResult = await documentService.uploadDocument(req.file, documentId);
        console.log('🔍 Document uploaded:', uploadResult.document.id);

        // Estrai le informazioni necessarie
        const document = uploadResult.document;
        const uploadProgress = uploadResult.uploadProgress;

        // Rileva la lingua del documento
        let detectedLanguage = null;
        try {
          const LanguageDetector = (await import('../utils/languageDetector')).default;
          const languageInfo = LanguageDetector.detectFromText(document.content);
          detectedLanguage = {
            code: languageInfo.code,
            name: languageInfo.name,
            confidence: languageInfo.confidence,
            detectionMethod: 'automatic' as const
          };
          console.log('🔍 Language detected:', detectedLanguage);
        } catch (langError) {
          console.warn('🔍 Language detection failed:', langError);
        }

        // Risposta di successo con formato standardizzato
        res.status(201).json({
          success: true,
          data: {
            document: {
              id: document.id,
              name: document.name,
              content: document.content, // Includi il contenuto per il rilevamento lingua nel frontend
              type: document.type,
              uploadedAt: document.uploadedAt,
              wordCount: document.content.split(/\s+/).length,
              chunkCount: processingResult.chunkCount,
              detectedLanguage: detectedLanguage
            },
            uploadProgress: {
              documentId: document.id,
              stage: 'complete' as const,
              progress: 100,
              message: 'Document uploaded and processed successfully'
            }
          },
          message: 'Document uploaded and processed successfully',
        });

      } catch (ragError) {
        console.error('🔍 RAG processing failed:', ragError);

        // Prova comunque a caricare il documento
        try {
          const uploadResult = await documentService.uploadDocument(req.file, documentId);
          const document = uploadResult.document;

          res.status(201).json({
            success: true,
            data: {
              document: {
                id: document.id,
                name: document.name,
                content: document.content,
                type: document.type,
                uploadedAt: document.uploadedAt,
                wordCount: document.content.split(/\s+/).length,
                chunkCount: 0,
                detectedLanguage: null
              },
              uploadProgress: {
                documentId: document.id,
                stage: 'complete' as const,
                progress: 100,
                message: 'Document uploaded successfully (RAG processing failed)'
              }
            },
            message: 'Document uploaded successfully (RAG processing will be retried)',
          });
        } catch (uploadError) {
          console.error('🔍 Both RAG and upload failed:', uploadError);
          throw new AppError('Failed to upload and process document', 500);
        }
      }

    } catch (error) {
      // Cleanup file in caso di errore
      await cleanupMulterFiles(req.file);

      // Log dell'errore per debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Document upload failed:', error);
      }

      // Passa l'errore al middleware di gestione errori
      next(error);
    }
  },

  async getDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.params;

      if (!documentId) {
        throw new AppError('Document ID is required', 400);
      }

      const ragService = await RAGServiceManager.getInstance();
      const documentService = new DocumentService(ragService);

      const stats = await documentService.getDocumentStats(documentId);

      res.json({
        success: true,
        data: stats,
      });

    } catch (error) {
      next(error);
    }
  },

  async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.params;

      if (!documentId) {
        throw new AppError('Document ID is required', 400);
      }

      const ragService = await RAGServiceManager.getInstance();
      const documentService = new DocumentService(ragService);

      await documentService.deleteDocument(documentId);

      res.json({
        success: true,
        message: 'Document deleted successfully',
      });

    } catch (error) {
      next(error);
    }
  },

  async searchDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.params;
      const { query, topK = 5 } = req.body;

      if (!documentId) {
        throw new AppError('Document ID is required', 400);
      }

      if (!query?.trim()) {
        throw new AppError('Search query is required', 400);
      }

      const ragService = await RAGServiceManager.getInstance();
      const documentService = new DocumentService(ragService);

      const results = await documentService.searchSimilarContent(
        query,
        documentId,
        Math.min(parseInt(topK), 20) // Limite massimo 20 risultati
      );

      res.json({
        success: true,
        data: {
          query,
          results,
          resultCount: results.length,
        },
      });

    } catch (error) {
      next(error);
    }
  },

  async reprocessDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.params;

      if (!documentId) {
        throw new AppError('Document ID is required', 400);
      }

      if (!req.file) {
        throw new AppError('No document file provided for reprocessing', 400);
      }

      const ragService = await RAGServiceManager.getInstance();
      const documentService = new DocumentService(ragService);

      const result = await documentService.reprocessDocument(documentId, req.file.path);

      // Cleanup uploaded file
      await fs.unlink(req.file.path).catch(() => {});

      res.json({
        success: true,
        data: result,
        message: 'Document reprocessed successfully',
      });

    } catch (error) {
      await cleanupMulterFiles(req.file);
      next(error);
    }
  },

  async batchUpload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new AppError('No documents provided for batch upload', 400);
      }

      const ragService = await RAGServiceManager.getInstance();
      const documentService = new DocumentService(ragService);

      const documents = req.files.map(file => ({
        filePath: file.path,
        documentId: generateDocumentId(),
      }));

      const result = await documentService.batchProcessDocuments(documents);

      // Cleanup all uploaded files
      await cleanupMulterFiles(req.files as Express.Multer.File[]);

      res.status(201).json({
        success: true,
        data: {
          successful: result.successful,
          failed: result.failed,
          totalProcessed: req.files.length,
          successCount: result.successful.length,
          failureCount: result.failed.length,
        },
        message: `Batch upload completed: ${result.successful.length}/${req.files.length} documents processed successfully`,
      });

    } catch (error) {
      // Cleanup all files in caso di errore
      await cleanupMulterFiles(req.files as Express.Multer.File[]);
      next(error);
    }
  },

  async getRelevantContext(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.params;
      const { transcription, maxChunks = 3 } = req.body;

      if (!documentId) {
        throw new AppError('Document ID is required', 400);
      }

      if (!transcription?.trim()) {
        throw new AppError('Transcription is required', 400);
      }

      const ragService = await RAGServiceManager.getInstance();
      const documentService = new DocumentService(ragService);

      const result = await documentService.getRelevantContext(
        transcription,
        documentId,
        Math.min(parseInt(maxChunks), 10) // Limite massimo 10 chunks
      );

      res.json({
        success: true,
        data: {
          relevantChunks: result.relevantChunks,
          combinedContext: result.combinedContext,
          totalScore: result.totalScore,
          chunkCount: result.relevantChunks.length,
          contextLength: result.combinedContext.length,
        },
      });

    } catch (error) {
      next(error);
    }
  },

  async validateDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No document file provided for validation', 400);
      }

      const ragService = await RAGServiceManager.getInstance();
      const documentService = new DocumentService(ragService);

      const validation = await documentService.validateFile(req.file.path);

      // Cleanup uploaded file
      await fs.unlink(req.file.path).catch(() => {});

      res.json({
        success: true,
        data: {
          isValid: validation.isValid,
          error: validation.error,
          fileInfo: validation.fileInfo,
          filename: req.file.originalname,
        },
      });

    } catch (error) {
      await cleanupMulterFiles(req.file);
      next(error);
    }
  },

  async getDocumentHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const health = await RAGServiceManager.healthCheck();

      res.json({
        success: true,
        data: health,
      });

    } catch (error) {
      next(error);
    }
  },

  // Test endpoints (solo per sviluppo)
  async testSimilaritySearch(req: Request, res: Response, next: NextFunction) {
    try {
      if (process.env.NODE_ENV === 'production') {
        throw new AppError('Test endpoints not available in production', 403);
      }

      const { query, documentId } = req.body;

      if (!query?.trim()) {
        throw new AppError('Search query is required', 400);
      }

      const ragService = await RAGServiceManager.getInstance();
      const documentService = new DocumentService(ragService);

      const result = await documentService.testSimilaritySearch(query, documentId);

      res.json({
        success: true,
        data: {
          query: result.query,
          results: result.results,
          queryEmbedding: result.queryEmbedding.slice(0, 10), // Solo primi 10 valori per debug
          embeddingDimensions: result.queryEmbedding.length,
        },
      });

    } catch (error) {
      next(error);
    }
  },

  // Metodi aggiunti per completare l'API
  async getDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      // Implementazione placeholder - in produzione recupererebbe dalla database
      res.json({
        success: true,
        data: {
          documents: [],
          total: 0,
          page: 1,
          limit: 10
        },
        message: 'Documents retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async getProcessingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Placeholder implementation
      res.json({
        success: true,
        data: {
          documentId: id,
          status: 'completed',
          progress: 100,
          processedAt: new Date()
        },
        message: 'Processing status retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async processDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.params;

      if (!documentId) {
        throw new AppError('Document ID is required', 400);
      }

      // Per ora simuliamo il processing senza RAG
      // In futuro qui andrà la logica di chunking ed embedding
      await documentService.processDocument(documentId);

      res.json({
        success: true,
        data: {
          documentId: documentId,
          stage: 'complete',
          progress: 100,
          message: 'Document processed successfully'
        },
        message: 'Document processing completed',
      });
    } catch (error) {
      next(error);
    }
  },

  async getDocumentChunks(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Placeholder implementation
      res.json({
        success: true,
        data: {
          documentId: id,
          chunks: [],
          total: 0
        },
        message: 'Document chunks retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async getDocumentMetadata(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Placeholder implementation
      res.json({
        success: true,
        data: {
          documentId: id,
          filename: 'document.pdf',
          size: 1024,
          wordCount: 1000,
          chunkCount: 10,
          processedAt: new Date(),
          metadata: {}
        },
        message: 'Document metadata retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};