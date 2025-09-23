export interface ParsedDocument {
  id: string;
  filename: string;
  content: string;
  metadata: {
    title?: string;
    author?: string;
    pageCount?: number;
    wordCount: number;
    language?: string;
    extractedAt: Date;
  };
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  index: number;
  startPosition: number;
  endPosition: number;
  metadata: {
    wordCount: number;
    characterCount: number;
    section?: string;
    heading?: string;
  };
}

export interface ChunkingOptions {
  chunkSize?: number; // caratteri per chunk
  chunkOverlap?: number; // overlap tra chunks
  preserveSentences?: boolean; // mantieni frasi intere
  preserveParagraphs?: boolean; // mantieni paragrafi interi
  customSeparators?: string[]; // separatori personalizzati
}

export interface EmbeddingOptions {
  model?: string; // modello OpenAI per embeddings
  dimensions?: number; // dimensioni vector embeddings
  batchSize?: number; // batch size per API calls
}

export interface VectorEmbedding {
  chunkId: string;
  vector: number[];
  metadata: {
    documentId: string;
    chunkIndex: number;
    content: string;
  };
}

export type SupportedFileType = 'pdf' | 'docx' | 'txt';