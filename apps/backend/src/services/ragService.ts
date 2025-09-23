import { LocalRAGService } from './localRagService';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs/promises';

export class RAGServiceManager {
  private static instance: LocalRAGService | null = null;
  private static initialized = false;

  static async getInstance(): Promise<LocalRAGService> {
    if (!this.instance) {
      this.instance = await LocalRAGService.getInstance();
      this.initialized = true;
      logger.info('Local RAG Service initialized successfully');
    }

    return this.instance;
  }

  static async shutdown(): Promise<void> {
    if (this.instance) {
      try {
        // Local RAG service doesn't need explicit shutdown
        this.instance = null;
        this.initialized = false;
        logger.info('Local RAG Service shut down successfully');
      } catch (error) {
        logger.error('Error shutting down Local RAG Service:', error);
      }
    }
  }

  static async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    vectorDB: {
      connected: boolean;
      totalVectors: number;
      dimensions: number;
    };
    llm?: {
      connected: boolean;
      model: string;
    };
    error?: string;
  }> {
    try {
      const ragService = await this.getInstance();
      return await ragService.healthCheck();
    } catch (error) {
      return {
        status: 'unhealthy',
        vectorDB: {
          connected: false,
          totalVectors: 0,
          dimensions: 0,
        },
        error: error.message,
      };
    }
  }
}

export class DocumentService {
  private ragService: LocalRAGService;

  constructor(ragService: LocalRAGService) {
    this.ragService = ragService;
  }

  async processDocument(filePath: string, documentId: string): Promise<{
    documentId: string;
    filename: string;
    wordCount: number;
    chunkCount: number;
    processingTime: number;
  }> {
    const startTime = Date.now();

    try {
      // Valida il file prima del processamento
      const validation = await this.ragService.validateDocumentFile(filePath);
      if (!validation.isValid) {
        throw new AppError(`Invalid document: ${validation.error}`, 400);
      }

      // Processa il documento
      const result = await this.ragService.processDocument(filePath, documentId);

      const processingTime = Date.now() - startTime;

      return {
        documentId: result.document.id,
        filename: result.document.filename,
        wordCount: result.document.metadata.wordCount,
        chunkCount: result.chunks.length,
        processingTime,
      };

    } catch (error) {
      console.error(`Error processing document ${documentId}:`, error);

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(`Failed to process document: ${error.message}`, 500);
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    try {
      await this.ragService.deleteDocument(documentId);
      console.log(`Document ${documentId} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting document ${documentId}:`, error);
      throw new AppError(`Failed to delete document: ${error.message}`, 500);
    }
  }

  async getDocumentStats(documentId: string): Promise<{
    documentId: string;
    chunkCount: number;
    totalWords: number;
    averageChunkSize: number;
    sections: string[];
  }> {
    try {
      const stats = await this.ragService.getDocumentStats(documentId);
      return {
        documentId,
        ...stats,
      };
    } catch (error) {
      console.error(`Error getting stats for document ${documentId}:`, error);
      throw new AppError(`Failed to get document stats: ${error.message}`, 500);
    }
  }

  async searchSimilarContent(
    query: string,
    documentId?: string,
    topK: number = 5
  ): Promise<Array<{
    content: string;
    score: number;
    metadata: {
      documentId: string;
      chunkId: string;
      chunkIndex: number;
      section?: string;
      heading?: string;
    };
  }>> {
    try {
      return await this.ragService.searchSimilarContent(query, topK, documentId);
    } catch (error) {
      console.error('Error searching similar content:', error);
      throw new AppError(`Search failed: ${error.message}`, 500);
    }
  }

  async getRelevantContext(
    transcription: string,
    documentId: string,
    maxChunks: number = 3
  ): Promise<{
    relevantChunks: Array<{
      content: string;
      score: number;
      metadata: any;
    }>;
    combinedContext: string;
    totalScore: number;
  }> {
    try {
      if (!transcription?.trim()) {
        throw new AppError('Transcription cannot be empty', 400);
      }

      if (!documentId?.trim()) {
        throw new AppError('Document ID is required', 400);
      }

      return await this.ragService.getRelevantContext(transcription, documentId, maxChunks);
    } catch (error) {
      console.error('Error getting relevant context:', error);

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(`Failed to get relevant context: ${error.message}`, 500);
    }
  }

  async reprocessDocument(documentId: string, filePath: string): Promise<{
    documentId: string;
    filename: string;
    wordCount: number;
    chunkCount: number;
    processingTime: number;
  }> {
    try {
      // Verifica che il file esista
      await fs.access(filePath);

      // Riprocessa il documento
      await this.ragService.reprocessDocument(documentId, filePath);

      // Ottieni le nuove statistiche
      const stats = await this.getDocumentStats(documentId);

      return {
        documentId,
        filename: path.basename(filePath),
        wordCount: stats.totalWords,
        chunkCount: stats.chunkCount,
        processingTime: 0, // Il reprocessing non traccia il tempo
      };

    } catch (error) {
      console.error(`Error reprocessing document ${documentId}:`, error);
      throw new AppError(`Failed to reprocess document: ${error.message}`, 500);
    }
  }

  async batchProcessDocuments(
    documents: Array<{ filePath: string; documentId: string }>
  ): Promise<{
    successful: Array<{
      documentId: string;
      filename: string;
      wordCount: number;
      chunkCount: number;
    }>;
    failed: Array<{
      documentId: string;
      error: string;
    }>;
  }> {
    const successful: Array<any> = [];
    const failed: Array<any> = [];

    for (const { filePath, documentId } of documents) {
      try {
        const result = await this.processDocument(filePath, documentId);
        successful.push(result);
      } catch (error) {
        failed.push({
          documentId,
          error: error.message || 'Unknown error',
        });
      }
    }

    return { successful, failed };
  }

  // Metodi di utilità per debugging e testing

  async testSimilaritySearch(
    query: string,
    documentId?: string
  ): Promise<{
    query: string;
    results: Array<any>;
    queryEmbedding: number[];
  }> {
    try {
      return await this.ragService.testSimilaritySearch(query, documentId);
    } catch (error) {
      console.error('Error in test similarity search:', error);
      throw new AppError(`Test search failed: ${error.message}`, 500);
    }
  }

  async validateFile(filePath: string): Promise<{
    isValid: boolean;
    error?: string;
    fileInfo?: {
      size: number;
      extension: string;
      mimeType?: string;
    };
  }> {
    try {
      const validation = await this.ragService.validateDocumentFile(filePath);

      if (validation.isValid) {
        const stats = await fs.stat(filePath);
        const extension = path.extname(filePath);

        return {
          isValid: true,
          fileInfo: {
            size: stats.size,
            extension,
          },
        };
      }

      return validation;
    } catch (error) {
      return {
        isValid: false,
        error: error.message,
      };
    }
  }
}