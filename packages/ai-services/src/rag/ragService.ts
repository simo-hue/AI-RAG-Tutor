import { DocumentParser } from '../document-processing/documentParser';
import { TextChunker } from '../document-processing/textChunker';
import { EmbeddingService } from '../document-processing/embeddingService';
import { VectorDBInterface } from '../vector-database/types';
import { PineconeVectorDB } from '../vector-database/pineconeService';
import { MemoryVectorDB } from '../vector-database/memoryVectorDB';
import {
  ParsedDocument,
  DocumentChunk,
  ChunkingOptions,
  EmbeddingOptions,
  VectorEmbedding
} from '../document-processing/types';
import { VectorRecord, SearchResult } from '../vector-database/types';

export interface RAGConfig {
  openaiApiKey: string;
  vectorDB: {
    type: 'pinecone' | 'memory';
    apiKey?: string;
    environment?: string;
    indexName: string;
    dimensions: number;
  };
  chunking?: ChunkingOptions;
  embedding?: EmbeddingOptions;
}

export interface RAGSearchResult {
  content: string;
  score: number;
  metadata: {
    documentId: string;
    chunkId: string;
    chunkIndex: number;
    section?: string;
    heading?: string;
  };
}

export class RAGService {
  private documentParser: DocumentParser;
  private textChunker: TextChunker;
  private embeddingService: EmbeddingService;
  private vectorDB: VectorDBInterface;

  constructor(private config: RAGConfig) {
    this.documentParser = new DocumentParser();
    this.textChunker = new TextChunker(config.chunking);
    this.embeddingService = new EmbeddingService(config.openaiApiKey, config.embedding);

    // Inizializza il vector database basato sulla configurazione
    if (config.vectorDB.type === 'pinecone') {
      if (!config.vectorDB.apiKey) {
        throw new Error('Pinecone API key is required when using Pinecone vector DB');
      }
      this.vectorDB = new PineconeVectorDB({
        apiKey: config.vectorDB.apiKey,
        environment: config.vectorDB.environment,
        indexName: config.vectorDB.indexName,
        dimensions: config.vectorDB.dimensions,
      });
    } else {
      this.vectorDB = new MemoryVectorDB({
        apiKey: '', // Non necessario per MemoryDB
        indexName: config.vectorDB.indexName,
        dimensions: config.vectorDB.dimensions,
      });
    }
  }

  async initialize(): Promise<void> {
    await this.vectorDB.connect();
    console.log('RAG Service initialized successfully');
  }

  async shutdown(): Promise<void> {
    await this.vectorDB.disconnect();
    console.log('RAG Service shut down');
  }

  async processDocument(filePath: string, documentId?: string): Promise<{
    document: ParsedDocument;
    chunks: DocumentChunk[];
    embeddings: VectorEmbedding[];
  }> {
    console.log(`Processing document: ${filePath}`);

    // 1. Parse del documento
    const document = await this.documentParser.parseDocument(filePath, documentId);
    console.log(`Parsed document: ${document.metadata.wordCount} words`);

    // 2. Chunking del contenuto
    const chunks = this.textChunker.chunkDocument(document);
    console.log(`Created ${chunks.length} chunks`);

    // 3. Generazione embeddings
    const embeddings = await this.embeddingService.generateEmbeddings(chunks);
    console.log(`Generated ${embeddings.length} embeddings`);

    // 4. Salvataggio nel vector database
    const vectorRecords: VectorRecord[] = embeddings.map(embedding => ({
      id: embedding.chunkId,
      vector: embedding.vector,
      metadata: {
        documentId: embedding.metadata.documentId,
        chunkId: embedding.chunkId,
        content: embedding.metadata.content,
        chunkIndex: embedding.metadata.chunkIndex,
        wordCount: chunks.find(c => c.id === embedding.chunkId)?.metadata.wordCount,
        section: chunks.find(c => c.id === embedding.chunkId)?.metadata.section,
        heading: chunks.find(c => c.id === embedding.chunkId)?.metadata.heading,
      },
    }));

    await this.vectorDB.upsert(vectorRecords);
    console.log(`Stored ${vectorRecords.length} vectors in database`);

    return { document, chunks, embeddings };
  }

  async searchSimilarContent(
    query: string,
    topK: number = 5,
    documentId?: string
  ): Promise<RAGSearchResult[]> {
    console.log(`Searching for similar content: "${query.substring(0, 50)}..."`);

    // 1. Genera embedding per la query
    const queryEmbedding = await this.embeddingService.generateSingleEmbedding(query);

    // 2. Cerca nel vector database
    const filter = documentId ? { documentId } : undefined;
    const searchResults = await this.vectorDB.query(queryEmbedding, topK, filter);

    // 3. Formatta i risultati
    const ragResults: RAGSearchResult[] = searchResults.map(result => ({
      content: result.metadata.content,
      score: result.score,
      metadata: {
        documentId: result.metadata.documentId,
        chunkId: result.metadata.chunkId,
        chunkIndex: result.metadata.chunkIndex,
        section: result.metadata.section,
        heading: result.metadata.heading,
      },
    }));

    console.log(`Found ${ragResults.length} similar chunks`);
    return ragResults;
  }

  async getRelevantContext(
    transcription: string,
    documentId: string,
    maxChunks: number = 3
  ): Promise<{
    relevantChunks: RAGSearchResult[];
    combinedContext: string;
    totalScore: number;
  }> {
    const relevantChunks = await this.searchSimilarContent(transcription, maxChunks, documentId);

    const combinedContext = relevantChunks
      .map((chunk, index) => `[Chunk ${index + 1}]\n${chunk.content}`)
      .join('\n\n');

    const totalScore = relevantChunks.reduce((sum, chunk) => sum + chunk.score, 0) / relevantChunks.length;

    return {
      relevantChunks,
      combinedContext,
      totalScore,
    };
  }

  async deleteDocument(documentId: string): Promise<void> {
    console.log(`Deleting document ${documentId} from vector database`);

    if ('deleteByDocumentId' in this.vectorDB) {
      await (this.vectorDB as any).deleteByDocumentId(documentId);
    } else {
      // Fallback per interfacce che non supportano deleteByDocumentId
      const vectors = await this.getDocumentVectors(documentId);
      const ids = vectors.map(v => v.id);
      if (ids.length > 0) {
        await this.vectorDB.delete(ids);
      }
    }

    console.log(`Deleted document ${documentId}`);
  }

  async getDocumentVectors(documentId: string): Promise<VectorRecord[]> {
    if ('getVectorsByDocument' in this.vectorDB) {
      return await (this.vectorDB as any).getVectorsByDocument(documentId);
    }

    // Fallback: cerca con query dummy
    const dummyVector = new Array(this.config.vectorDB.dimensions).fill(0);
    const results = await this.vectorDB.query(dummyVector, 10000, { documentId });

    return await this.vectorDB.fetch(results.map(r => r.id));
  }

  async getDocumentStats(documentId: string): Promise<{
    chunkCount: number;
    totalWords: number;
    averageChunkSize: number;
    sections: string[];
  }> {
    const vectors = await this.getDocumentVectors(documentId);

    const sections = new Set<string>();
    let totalWords = 0;
    let totalChars = 0;

    vectors.forEach(vector => {
      if (vector.metadata.section) {
        sections.add(vector.metadata.section);
      }
      if (vector.metadata.wordCount) {
        totalWords += vector.metadata.wordCount;
      }
      totalChars += vector.metadata.content.length;
    });

    return {
      chunkCount: vectors.length,
      totalWords,
      averageChunkSize: vectors.length > 0 ? Math.round(totalChars / vectors.length) : 0,
      sections: Array.from(sections),
    };
  }

  async validateDocumentFile(filePath: string): Promise<{ isValid: boolean; error?: string }> {
    return await this.documentParser.validateDocument(filePath);
  }

  getVectorDBStats(): Promise<{
    totalVectors: number;
    dimensions: number;
    indexFullness: number;
  }> {
    return this.vectorDB.getIndexStats();
  }

  // Metodi per testing e debugging

  async testSimilaritySearch(query: string, documentId?: string): Promise<{
    query: string;
    results: RAGSearchResult[];
    queryEmbedding: number[];
  }> {
    const queryEmbedding = await this.embeddingService.generateSingleEmbedding(query);
    const results = await this.searchSimilarContent(query, 10, documentId);

    return {
      query,
      results,
      queryEmbedding,
    };
  }

  async reprocessDocument(documentId: string, filePath: string): Promise<void> {
    // Elimina il documento esistente
    await this.deleteDocument(documentId);

    // Riprocessa il documento
    await this.processDocument(filePath, documentId);

    console.log(`Reprocessed document ${documentId}`);
  }

  // Ottimizzazione delle performance

  async batchProcessDocuments(filePaths: string[]): Promise<{
    successful: string[];
    failed: Array<{ filePath: string; error: string }>;
  }> {
    const successful: string[] = [];
    const failed: Array<{ filePath: string; error: string }> = [];

    for (const filePath of filePaths) {
      try {
        await this.processDocument(filePath);
        successful.push(filePath);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        failed.push({
          filePath,
          error: errorMessage,
        });
      }
    }

    return { successful, failed };
  }
}