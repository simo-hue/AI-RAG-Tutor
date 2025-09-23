export interface VectorDBConfig {
  apiKey: string;
  environment?: string;
  indexName: string;
  dimensions: number;
}

export interface VectorRecord {
  id: string;
  vector: number[];
  metadata: {
    documentId: string;
    chunkId: string;
    content: string;
    chunkIndex: number;
    wordCount?: number;
    section?: string;
    heading?: string;
    [key: string]: any;
  };
}

export interface SearchResult {
  id: string;
  score: number; // similarity score
  metadata: VectorRecord['metadata'];
}

export interface VectorDBInterface {
  // Connessione e setup
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Gestione indice
  createIndex(name: string, dimensions: number): Promise<void>;
  deleteIndex(name: string): Promise<void>;
  listIndexes(): Promise<string[]>;
  getIndexStats(): Promise<{
    totalVectors: number;
    dimensions: number;
    indexFullness: number;
  }>;

  // Operazioni vettori
  upsert(vectors: VectorRecord[]): Promise<void>;
  query(
    vector: number[],
    topK?: number,
    filter?: Record<string, any>
  ): Promise<SearchResult[]>;
  delete(ids: string[]): Promise<void>;
  deleteAll(): Promise<void>;

  // Utility
  fetch(ids: string[]): Promise<VectorRecord[]>;
  update(id: string, metadata: Record<string, any>): Promise<void>;
}

export interface QueryOptions {
  topK?: number;
  includeMetadata?: boolean;
  includeValues?: boolean;
  filter?: Record<string, any>;
  namespace?: string;
}