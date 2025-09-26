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

      // Preprocessing semantico dei chunks per migliorare la qualità degli embeddings
      const preprocessedChunks = chunks.map(chunk => this.preprocessChunkForEmbedding(chunk));

      // Generate embeddings for all chunks
      console.log('🔍 DEBUG - Generating embeddings for chunks:', {
        documentId,
        chunkCount: chunks.length,
        firstChunkPreview: chunks[0]?.substring(0, 100) + '...',
        firstPreprocessedPreview: preprocessedChunks[0]?.substring(0, 100) + '...'
      });

      const embeddings = await this.ollamaService!.generateEmbeddings(preprocessedChunks);

      console.log('🔍 DEBUG - Embeddings generated:', {
        documentId,
        embeddingsCount: embeddings.length,
        firstEmbeddingLength: embeddings[0]?.length,
        firstEmbeddingPreview: embeddings[0]?.slice(0, 5),
        firstEmbeddingNorm: embeddings[0] ? Math.sqrt(embeddings[0].reduce((sum, val) => sum + val * val, 0)) : 0
      });

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

    // Preprocessing del contenuto per migliorare la qualità dei chunk
    const preprocessedContent = this.preprocessContent(content);

    // Strategia di chunking semantico migliorata
    if (ragConfig.chunking.preserveParagraphs) {
      return this.chunkByParagraphs(preprocessedContent, chunkSize, overlap);
    } else if (ragConfig.chunking.preserveSentences) {
      return this.chunkBySentences(preprocessedContent, chunkSize, overlap);
    } else {
      return this.chunkByWords(preprocessedContent, chunkSize, overlap);
    }
  }

  private preprocessContent(content: string): string {
    // Normalizza spazi multipli e caratteri speciali
    let processed = content
      .replace(/\s+/g, ' ') // Normalizza spazi multipli
      .replace(/\n\s*\n/g, '\n\n') // Normalizza paragrafi multipli
      .replace(/[""]/g, '"') // Normalizza virgolette
      .replace(/['']/g, "'") // Normalizza apostrofi
      .trim();

    return processed;
  }

  private chunkByParagraphs(content: string, chunkSize: number, overlap: number): string[] {
    const paragraphs = content.split(/\n\s*\n/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      if (!trimmedParagraph) continue;

      // Se il paragrafo da solo è più grande della dimensione del chunk
      if (trimmedParagraph.length > chunkSize) {
        // Salva il chunk corrente se non è vuoto
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        // Spezza il paragrafo in frasi
        const sentenceChunks = this.chunkBySentences(trimmedParagraph, chunkSize, overlap);
        chunks.push(...sentenceChunks);
      } else if ((currentChunk + '\n\n' + trimmedParagraph).length > chunkSize) {
        // Salva il chunk corrente e inizia uno nuovo
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = trimmedParagraph;
      } else {
        // Aggiungi il paragrafo al chunk corrente
        currentChunk += currentChunk ? '\n\n' + trimmedParagraph : trimmedParagraph;
      }
    }

    // Aggiungi l'ultimo chunk
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return this.addOverlapToChunks(chunks, overlap);
  }

  private chunkBySentences(content: string, chunkSize: number, overlap: number): string[] {
    // Pattern più sofisticato per identificare la fine delle frasi
    const sentencePattern = /[.!?]+(?:\s+(?=[A-Z])|$)/g;
    const sentences = content.split(sentencePattern).filter(s => s.trim());

    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      // Se la frase da sola è più grande della dimensione del chunk
      if (trimmedSentence.length > chunkSize) {
        // Salva il chunk corrente se non è vuoto
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        // Spezza la frase in parole
        const wordChunks = this.chunkByWords(trimmedSentence, chunkSize, overlap);
        chunks.push(...wordChunks);
      } else if ((currentChunk + ' ' + trimmedSentence).length > chunkSize) {
        // Salva il chunk corrente e inizia uno nuovo
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = trimmedSentence;
      } else {
        // Aggiungi la frase al chunk corrente
        currentChunk += currentChunk ? ' ' + trimmedSentence : trimmedSentence;
      }
    }

    // Aggiungi l'ultimo chunk
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return this.addOverlapToChunks(chunks, overlap);
  }

  private chunkByWords(content: string, chunkSize: number, overlap: number): string[] {
    const words = content.split(/\s+/);
    const chunks: string[] = [];

    // Calcola il numero approssimativo di parole per chunk (assumendo 5 caratteri per parola in media)
    const wordsPerChunk = Math.floor(chunkSize / 5);
    const overlapWords = Math.floor(overlap / 5);

    for (let i = 0; i < words.length; i += wordsPerChunk - overlapWords) {
      const chunkWords = words.slice(i, i + wordsPerChunk);
      const chunk = chunkWords.join(' ');

      if (chunk.trim()) {
        chunks.push(chunk.trim());
      }

      // Evita loop infiniti
      if (i + wordsPerChunk >= words.length) break;
    }

    return chunks;
  }

  private addOverlapToChunks(chunks: string[], overlapSize: number): string[] {
    if (chunks.length <= 1 || overlapSize <= 0) return chunks;

    const overlappedChunks: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      let chunk = chunks[i];

      // Aggiungi overlap con il chunk precedente
      if (i > 0) {
        const prevChunk = chunks[i - 1];
        const overlapText = prevChunk.slice(-overlapSize);
        if (overlapText.trim()) {
          chunk = overlapText + ' ' + chunk;
        }
      }

      overlappedChunks.push(chunk);
    }

    return overlappedChunks;
  }

  private preprocessQueryForEmbedding(query: string): string {
    // Preprocessing specifico per query di ricerca
    let processed = query
      .toLowerCase() // Normalizza case per migliore matching
      .replace(/[^\w\s\àèéìíîòóùúâêôç]/g, ' ') // Rimuovi punteggiatura ma mantieni accenti italiani
      .replace(/\s+/g, ' ') // Normalizza spazi
      .trim();

    // Espandi contrazioni comuni in italiano
    const contractions = {
      "dell'": "della ",
      "dell'": "della ",
      "sull'": "sulla ",
      "nell'": "nella ",
      "all'": "alla ",
      "c'è": "ci è",
      "dov'è": "dove è",
      "cos'è": "cosa è",
      "com'è": "come è"
    };

    for (const [contraction, expansion] of Object.entries(contractions)) {
      processed = processed.replace(new RegExp(contraction, 'gi'), expansion);
    }

    // Aggiungi sinonimi e termini correlati per migliorare il matching
    const synonymMap = {
      "terra": "terra pianeta mondo globo",
      "spazio": "spazio universo cosmo",
      "rosso": "rosso scarlatto cremisi",
      "pulsante": "pulsante battente vibrante",
      "ruota": "ruota gira rotate movimento"
    };

    for (const [word, synonyms] of Object.entries(synonymMap)) {
      if (processed.includes(word)) {
        processed += " " + synonyms;
      }
    }

    return processed;
  }

  private preprocessChunkForEmbedding(chunk: string): string {
    // Preprocessing per chunks di documento
    let processed = chunk
      .replace(/\s+/g, ' ') // Normalizza spazi
      .replace(/[""]/g, '"') // Normalizza virgolette
      .replace(/['']/g, "'") // Normalizza apostrofi
      .trim();

    // Mantieni case originale per chunks di documento ma pulisci caratteri problematici
    processed = processed.replace(/[^\w\s\àèéìíîòóùúâêôç.,!?;:()\-"']/g, ' ');

    // Assicurati che il chunk abbia una lunghezza minima significativa
    if (processed.length < 20) {
      return processed;
    }

    // Aggiungi contesto semantico se il chunk è molto corto
    if (processed.length < 100) {
      processed = "Contenuto del documento: " + processed;
    }

    return processed;
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
      // Preprocessing semantico della query per migliorare la qualità dell'embedding
      const preprocessedQuery = this.preprocessQueryForEmbedding(query);

      // Generate embedding for query
      const queryEmbedding = await this.ollamaService!.generateEmbedding(preprocessedQuery);

      // Debug embedding generation
      console.log('🔍 DEBUG - Query embedding:', {
        originalQuery: query.substring(0, 50) + '...',
        preprocessedQuery: preprocessedQuery.substring(0, 50) + '...',
        queryLength: query.length,
        preprocessedLength: preprocessedQuery.length,
        embeddingLength: queryEmbedding.length,
        embeddingPreview: queryEmbedding.slice(0, 5),
        embeddingNorm: Math.sqrt(queryEmbedding.reduce((sum, val) => sum + val * val, 0))
      });

      // Filter documents by documentId if specified
      const relevantDocs = Array.from(this.vectorStore.values()).filter(doc =>
        !documentId || doc.metadata.documentId === documentId
      );

      console.log('🔍 DEBUG - Vector store status:', {
        totalVectors: this.vectorStore.size,
        requestedDocumentId: documentId,
        relevantDocsFound: relevantDocs.length,
        vectorStoreKeys: Array.from(this.vectorStore.keys()).slice(0, 5) // Prime 5 chiavi per debug
      });

      if (relevantDocs.length === 0) {
        throw new AppError(
          documentId
            ? `No document chunks found for document ID: ${documentId}. Document may not have been processed correctly.`
            : 'No documents found in the vector store. Please upload and process a document first.',
          404
        );
      }

      // Calculate multiple similarity metrics for hybrid scoring
      const similarities = relevantDocs.map(doc => {
        let cosineScore = 0;
        let jaccardScore = 0;
        let semanticScore = 0;

        try {
          // Validazione embeddings
          if (!doc.embedding || doc.embedding.length === 0 || !queryEmbedding || queryEmbedding.length === 0) {
            console.warn('🔍 WARNING - Missing or empty embeddings:', {
              docEmbeddingLength: doc.embedding?.length || 0,
              queryEmbeddingLength: queryEmbedding?.length || 0,
              docId: doc.id
            });
            cosineScore = 0;
          } else {
            cosineScore = this.cosineSimilarity(queryEmbedding, doc.embedding);
          }

          // Validazione contenuto
          if (!doc.content || doc.content.trim().length === 0) {
            console.warn('🔍 WARNING - Empty document content for doc:', doc.id);
            jaccardScore = 0;
            semanticScore = 0;
          } else {
            jaccardScore = this.jaccardSimilarity(query, doc.content);
            semanticScore = this.semanticWordOverlap(query, doc.content);
          }

          // Controlli NaN/Infinity
          cosineScore = isNaN(cosineScore) || !isFinite(cosineScore) ? 0 : cosineScore;
          jaccardScore = isNaN(jaccardScore) || !isFinite(jaccardScore) ? 0 : jaccardScore;
          semanticScore = isNaN(semanticScore) || !isFinite(semanticScore) ? 0 : semanticScore;

        } catch (error) {
          console.error('🔍 ERROR calculating similarities for doc:', doc.id, error.message);
          cosineScore = jaccardScore = semanticScore = 0;
        }

        // Weighted hybrid score
        const hybridScore = (cosineScore * 0.6) + (jaccardScore * 0.2) + (semanticScore * 0.2);

        return {
          ...doc,
          score: hybridScore,
          metrics: {
            cosine: cosineScore,
            jaccard: jaccardScore,
            semantic: semanticScore,
            hybrid: hybridScore
          }
        };
      });

      // Sort by similarity and take top K
      const results = similarities
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(doc => ({
          content: doc.content,
          score: doc.score,
          metadata: doc.metadata
        }));

      // Debug aggiuntivo per investigare il problema di similarità
      console.log('🔍 DEBUG - Similarity search details:', {
        query: query.substring(0, 100) + '...',
        totalDocs: relevantDocs.length,
        topK,
        documentId,
        resultsFound: results.length,
        allScores: similarities.map(s => s.score).sort((a, b) => b - a),
        topResults: results.map(r => ({
          score: r.score,
          contentPreview: r.content.substring(0, 50) + '...',
          metrics: r.metrics
        }))
      });

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

  private jaccardSimilarity(text1: string, text2: string): number {
    // Similarità di Jaccard basata su word sets
    const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 2));

    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  private semanticWordOverlap(query: string, content: string): number {
    // Overlap semantico che considera sinonimi e variazioni
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const contentWords = content.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    // Mappa di sinonimi estesa per l'italiano
    const synonymGroups = [
      ['terra', 'pianeta', 'mondo', 'globo'],
      ['spazio', 'universo', 'cosmo', 'vuoto'],
      ['rosso', 'scarlatto', 'cremisi', 'vermiglio'],
      ['pulsante', 'battente', 'vibrante', 'tremolante'],
      ['ruota', 'gira', 'rotate', 'movimento', 'rotazione'],
      ['lento', 'lenta', 'lentamente', 'gradualmente'],
      ['grande', 'enorme', 'gigante', 'imponente'],
      ['sfera', 'palla', 'globo', 'sferico']
    ];

    let matches = 0;
    let totalQueryWords = queryWords.length;

    for (const queryWord of queryWords) {
      // Match diretto
      if (contentWords.includes(queryWord)) {
        matches++;
        continue;
      }

      // Match con sinonimi
      for (const group of synonymGroups) {
        if (group.includes(queryWord)) {
          const synonymMatch = group.some(synonym => contentWords.includes(synonym));
          if (synonymMatch) {
            matches += 0.8; // Peso ridotto per match sinonimico
            break;
          }
        }
      }

      // Match parziale (radici delle parole)
      if (queryWord.length > 4) {
        const root = queryWord.slice(0, -2);
        const partialMatch = contentWords.some(word => word.startsWith(root) || word.includes(root));
        if (partialMatch) {
          matches += 0.5; // Peso ridotto per match parziale
        }
      }
    }

    return totalQueryWords === 0 ? 0 : matches / totalQueryWords;
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