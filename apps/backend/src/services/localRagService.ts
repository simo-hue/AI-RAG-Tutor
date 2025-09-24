import fs from 'fs/promises';
import path from 'path';
import { OllamaService } from './ollamaService';
import { ollamaManager } from './ollamaManager';
import { ragConfig } from '../config/ragConfig';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { DocumentChunk } from '@ai-speech-evaluator/shared';

// Simple in-memory vector store
interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    documentId: string;
    chunkId: string;
    chunkIndex: number;
    section?: string;
    heading?: string;
  };
}

interface ProcessedDocument {
  id: string;
  filename: string;
  content: string;
  chunks: string[];
  metadata: {
    wordCount: number;
    characterCount: number;
    processedAt: Date;
  };
}

export class LocalRAGService {
  private static instance: LocalRAGService | null = null;
  private ollamaService: OllamaService | null = null;
  private vectorStore: Map<string, VectorDocument> = new Map();
  private documents: Map<string, ProcessedDocument> = new Map();
  private initialized = false;

  private constructor() {}

  static async getInstance(): Promise<LocalRAGService> {
    if (!this.instance) {
      this.instance = new LocalRAGService();
      await this.instance.initialize();
    }
    return this.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // Ensure Ollama is running with auto-start fallback
      logger.info('Checking Ollama service status...');
      const ollamaReady = await ollamaManager.ensureOllamaRunning();

      if (!ollamaReady) {
        const status = await ollamaManager.getStatus();
        logger.error('Ollama service is not available', { status });
        throw new AppError('Ollama service is not available. Please check the installation and configuration.', 503);
      }

      logger.info('Ollama service is ready, initializing RAG service...');
      this.ollamaService = await OllamaService.getInstance();
      this.initialized = true;

      logger.info('Local RAG Service initialized successfully', {
        vectorStore: 'memory',
        llmProvider: 'ollama',
        embeddingModel: ragConfig.llm.embeddingModel
      });
    } catch (error) {
      logger.error('Failed to initialize Local RAG Service', { error: error.message });

      // If the error is related to Ollama connectivity, provide more helpful message
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        throw new AppError('Cannot connect to Ollama service. Please ensure Ollama is installed and running.', 503);
      }

      throw new AppError('Failed to initialize Local RAG Service', 500);
    }
  }

  async processDocument(filePath: string, documentId: string): Promise<{
    document: ProcessedDocument;
    chunks: VectorDocument[];
  }> {
    if (!this.initialized) {
      // Fallback mode: process document without embeddings for development
      logger.warn('RAG Service not initialized, using fallback mode without embeddings');
      return await this.processDocumentFallback(filePath, documentId);
    }

    const startTime = Date.now();

    try {
      // Read and parse document
      const content = await this.parseDocument(filePath);
      const chunks = this.chunkDocument(content);

      // Generate embeddings for all chunks
      const embeddings = await this.ollamaService!.generateEmbeddings(chunks);

      // Create vector documents
      const vectorDocuments: VectorDocument[] = chunks.map((chunk, index) => ({
        id: `${documentId}_chunk_${index}`,
        content: chunk,
        embedding: embeddings[index],
        metadata: {
          documentId,
          chunkId: `chunk_${index}`,
          chunkIndex: index,
        }
      }));

      // Store in memory
      vectorDocuments.forEach(doc => {
        this.vectorStore.set(doc.id, doc);
      });

      const processedDocument: ProcessedDocument = {
        id: documentId,
        filename: path.basename(filePath),
        content,
        chunks,
        metadata: {
          wordCount: content.split(/\s+/).length,
          characterCount: content.length,
          processedAt: new Date(),
        }
      };

      this.documents.set(documentId, processedDocument);

      const processingTime = Date.now() - startTime;
      logger.info('Document processed successfully', {
        documentId,
        filename: processedDocument.filename,
        chunkCount: chunks.length,
        wordCount: processedDocument.metadata.wordCount,
        processingTime: `${processingTime}ms`
      });

      return {
        document: processedDocument,
        chunks: vectorDocuments
      };

    } catch (error) {
      logger.error('Document processing failed', {
        documentId,
        filePath: path.basename(filePath),
        error: error.message
      });
      throw new AppError(`Failed to process document: ${error.message}`, 500);
    }
  }

  private async parseDocument(filePath: string): Promise<string> {
    const extension = path.extname(filePath).toLowerCase();

    try {
      switch (extension) {
        case '.txt':
          return await fs.readFile(filePath, 'utf-8');

        case '.pdf':
          // You would need to implement PDF parsing here
          // For now, return placeholder
          return "PDF content parsing not implemented yet";

        case '.docx':
          // You would need to implement DOCX parsing here
          // For now, return placeholder
          return "DOCX content parsing not implemented yet";

        default:
          throw new Error(`Unsupported file type: ${extension}`);
      }
    } catch (error) {
      throw new Error(`Failed to parse document: ${error.message}`);
    }
  }

  private chunkDocument(content: string): string[] {
    const chunkSize = ragConfig.chunking.chunkSize;
    const overlap = ragConfig.chunking.chunkOverlap;

    // Simple chunking by characters with overlap
    const chunks: string[] = [];
    let start = 0;

    while (start < content.length) {
      const end = Math.min(start + chunkSize, content.length);
      let chunk = content.slice(start, end);

      // Try to break at word boundaries
      if (ragConfig.chunking.preserveSentences && end < content.length) {
        const lastSentence = chunk.lastIndexOf('.');
        if (lastSentence > chunkSize * 0.5) {
          chunk = content.slice(start, start + lastSentence + 1);
        }
      }

      chunks.push(chunk.trim());
      start = Math.max(start + chunkSize - overlap, start + 1);
    }

    return chunks.filter(chunk => chunk.length > 0);
  }

  async searchSimilarContent(
    query: string,
    topK: number = 5,
    documentId?: string
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
    if (!this.initialized) {
      throw new AppError('RAG Service not initialized', 500);
    }

    try {
      // Generate embedding for query
      const queryEmbedding = await this.ollamaService!.generateEmbedding(query);

      // Filter documents by documentId if specified
      const relevantDocs = Array.from(this.vectorStore.values()).filter(doc =>
        !documentId || doc.metadata.documentId === documentId
      );

      // Calculate similarities
      const similarities = relevantDocs.map(doc => ({
        ...doc,
        score: this.cosineSimilarity(queryEmbedding, doc.embedding)
      }));

      // Sort by similarity and take top K
      const results = similarities
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(doc => ({
          content: doc.content,
          score: doc.score,
          metadata: doc.metadata
        }));

      logger.debug('Similarity search completed', {
        query: query.substring(0, 100),
        totalDocs: relevantDocs.length,
        topK,
        documentId,
        resultsFound: results.length
      });

      return results;

    } catch (error) {
      logger.error('Similarity search failed', {
        query: query.substring(0, 100),
        topK,
        documentId,
        error: error.message
      });
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
      metadata: DocumentChunk['metadata'];
    }>;
    combinedContext: string;
    totalScore: number;
  }> {
    try {
      const results = await this.searchSimilarContent(transcription, maxChunks, documentId);

      const relevantChunks = results.map(result => ({
        content: result.content,
        score: result.score,
        metadata: result.metadata
      }));

      const combinedContext = relevantChunks
        .map(chunk => chunk.content)
        .join('\n\n');

      const totalScore = relevantChunks.reduce((sum, chunk) => sum + chunk.score, 0);

      logger.info('Relevant context retrieved', {
        documentId,
        transcriptionLength: transcription.length,
        chunksFound: relevantChunks.length,
        averageScore: totalScore / relevantChunks.length,
        contextLength: combinedContext.length
      });

      return {
        relevantChunks,
        combinedContext,
        totalScore
      };

    } catch (error) {
      logger.error('Failed to get relevant context', {
        documentId,
        transcriptionLength: transcription.length,
        error: error.message
      });
      throw error;
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async deleteDocument(documentId: string): Promise<void> {
    try {
      // Remove document
      this.documents.delete(documentId);

      // Remove all vectors for this document
      const vectorsToDelete = Array.from(this.vectorStore.keys()).filter(key =>
        this.vectorStore.get(key)?.metadata.documentId === documentId
      );

      vectorsToDelete.forEach(key => {
        this.vectorStore.delete(key);
      });

      logger.info('Document deleted successfully', {
        documentId,
        vectorsRemoved: vectorsToDelete.length
      });

    } catch (error) {
      logger.error('Failed to delete document', {
        documentId,
        error: error.message
      });
      throw new AppError(`Failed to delete document: ${error.message}`, 500);
    }
  }

  async getDocumentStats(documentId: string): Promise<{
    chunkCount: number;
    totalWords: number;
    averageChunkSize: number;
    sections: string[];
  }> {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new AppError(`Document ${documentId} not found`, 404);
    }

    const chunks = Array.from(this.vectorStore.values()).filter(
      doc => doc.metadata.documentId === documentId
    );

    return {
      chunkCount: chunks.length,
      totalWords: document.metadata.wordCount,
      averageChunkSize: document.chunks.reduce((sum, chunk) => sum + chunk.length, 0) / document.chunks.length,
      sections: []
    };
  }

  async getVectorDBStats(): Promise<{
    totalVectors: number;
    dimensions: number;
    documents: number;
  }> {
    return {
      totalVectors: this.vectorStore.size,
      dimensions: ragConfig.embedding.dimensions,
      documents: this.documents.size
    };
  }

  async validateDocumentFile(filePath: string): Promise<{
    isValid: boolean;
    error?: string;
  }> {
    try {
      const stats = await fs.stat(filePath);
      const extension = path.extname(filePath).toLowerCase();

      if (!stats.isFile()) {
        return { isValid: false, error: 'Path is not a file' };
      }

      if (stats.size === 0) {
        return { isValid: false, error: 'File is empty' };
      }

      if (stats.size > 50 * 1024 * 1024) { // 50MB limit
        return { isValid: false, error: 'File too large (max 50MB)' };
      }

      const allowedExtensions = ['.txt', '.pdf', '.docx'];
      if (!allowedExtensions.includes(extension)) {
        return { isValid: false, error: `Unsupported file type: ${extension}` };
      }

      return { isValid: true };

    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    vectorDB: {
      connected: boolean;
      totalVectors: number;
      dimensions: number;
    };
    llm: {
      connected: boolean;
      model: string;
    };
    error?: string;
  }> {
    try {
      const ollamaHealth = await this.ollamaService!.healthCheck();
      const vectorStats = await this.getVectorDBStats();

      return {
        status: 'healthy',
        vectorDB: {
          connected: true,
          totalVectors: vectorStats.totalVectors,
          dimensions: vectorStats.dimensions,
        },
        llm: {
          connected: ollamaHealth.status === 'healthy',
          model: ragConfig.llm.model
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        vectorDB: {
          connected: false,
          totalVectors: 0,
          dimensions: 0,
        },
        llm: {
          connected: false,
          model: ragConfig.llm.model
        },
        error: error.message,
      };
    }
  }

  /**
   * Fallback method to process documents without embeddings
   * Used when Ollama is not available for development purposes
   */
  private async processDocumentFallback(filePath: string, documentId: string): Promise<{
    document: ProcessedDocument;
    chunks: VectorDocument[];
  }> {
    const startTime = Date.now();

    try {
      // Read and parse document
      const content = await this.parseDocument(filePath);
      const chunks = this.chunkDocument(content);

      // Create vector documents with placeholder embeddings
      const vectorDocuments: VectorDocument[] = chunks.map((chunk, index) => ({
        id: `${documentId}_chunk_${index}`,
        documentId,
        content: chunk,
        embedding: new Array(768).fill(0), // Placeholder embedding vector
        metadata: {
          chunkIndex: index,
          length: chunk.length,
          documentId,
        },
      }));

      // Store in vector database (even with placeholder embeddings)
      await this.vectorStore.addDocuments(vectorDocuments);

      const processed: ProcessedDocument = {
        documentId,
        filename: path.basename(filePath),
        wordCount: this.getWordCount(content),
        chunkCount: chunks.length,
        processingTime: `${Date.now() - startTime}ms`,
        createdAt: new Date(),
      };

      logger.info('Document processed successfully (fallback mode)', {
        documentId: processed.documentId,
        filename: processed.filename,
        chunkCount: processed.chunkCount,
        wordCount: processed.wordCount,
        processingTime: processed.processingTime,
      });

      return {
        document: processed,
        chunks: vectorDocuments,
      };
    } catch (error) {
      logger.error('Error processing document (fallback mode)', {
        error: error.message,
        documentId,
        filePath
      });
      throw new AppError(`Failed to process document: ${error.message}`, 500);
    }
  }
}

export default LocalRAGService;