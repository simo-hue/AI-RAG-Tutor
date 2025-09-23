import { Pinecone } from '@pinecone-database/pinecone';
import { VectorDBInterface, VectorDBConfig, VectorRecord, SearchResult, QueryOptions } from './types';

export class PineconeVectorDB implements VectorDBInterface {
  private client: Pinecone;
  private index: any;
  private connected: boolean = false;

  constructor(private config: VectorDBConfig) {
    this.client = new Pinecone({
      apiKey: config.apiKey,
      environment: config.environment || 'us-west1-gcp-free',
    });
  }

  async connect(): Promise<void> {
    try {
      // Verifica se l'indice esiste
      const indexList = await this.client.listIndexes();
      const indexExists = (indexList as any)?.some((idx: any) => idx.name === this.config.indexName);

      if (!indexExists) {
        throw new Error(`Index '${this.config.indexName}' does not exist. Create it first.`);
      }

      this.index = this.client.index(this.config.indexName);
      this.connected = true;

      console.log(`Connected to Pinecone index: ${this.config.indexName}`);
    } catch (error) {
      console.error('Failed to connect to Pinecone:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.index = null;
    console.log('Disconnected from Pinecone');
  }

  isConnected(): boolean {
    return this.connected && this.index !== null;
  }

  async createIndex(name: string, dimensions: number): Promise<void> {
    try {
      await this.client.createIndex({
        name,
        dimension: dimensions,
        metric: 'cosine',
        waitUntilReady: true,
      });

      console.log(`Created Pinecone index: ${name}`);
    } catch (error) {
      console.error(`Failed to create index ${name}:`, error);
      throw error;
    }
  }

  async deleteIndex(name: string): Promise<void> {
    try {
      await this.client.deleteIndex(name);
      console.log(`Deleted Pinecone index: ${name}`);
    } catch (error) {
      console.error(`Failed to delete index ${name}:`, error);
      throw error;
    }
  }

  async listIndexes(): Promise<string[]> {
    try {
      const response = await this.client.listIndexes();
      return (response as any)?.map((idx: any) => idx.name || '') || [];
    } catch (error) {
      console.error('Failed to list indexes:', error);
      throw error;
    }
  }

  async getIndexStats(): Promise<{
    totalVectors: number;
    dimensions: number;
    indexFullness: number;
  }> {
    this.ensureConnected();

    try {
      const stats = await this.index.describeIndexStats();

      return {
        totalVectors: stats.totalVectorCount || 0,
        dimensions: stats.dimension || this.config.dimensions,
        indexFullness: stats.indexFullness || 0,
      };
    } catch (error) {
      console.error('Failed to get index stats:', error);
      throw error;
    }
  }

  async upsert(vectors: VectorRecord[]): Promise<void> {
    this.ensureConnected();

    if (vectors.length === 0) return;

    try {
      // Converte i nostri VectorRecord nel formato Pinecone
      const pineconeVectors = vectors.map(vector => ({
        id: vector.id,
        values: vector.vector,
        metadata: vector.metadata,
      }));

      // Upsert in batch per efficienza
      const batchSize = 100;
      for (let i = 0; i < pineconeVectors.length; i += batchSize) {
        const batch = pineconeVectors.slice(i, i + batchSize);
        await this.index.upsert(batch);
      }

      console.log(`Upserted ${vectors.length} vectors to Pinecone`);
    } catch (error) {
      console.error('Failed to upsert vectors:', error);
      throw error;
    }
  }

  async query(
    vector: number[],
    topK: number = 10,
    filter?: Record<string, any>
  ): Promise<SearchResult[]> {
    this.ensureConnected();

    try {
      const queryRequest: any = {
        vector,
        topK,
        includeMetadata: true,
      };

      if (filter) {
        queryRequest.filter = filter;
      }

      const response = await this.index.query(queryRequest);

      return (response.matches || []).map((match: any) => ({
        id: match.id,
        score: match.score || 0,
        metadata: match.metadata || {},
      }));
    } catch (error) {
      console.error('Failed to query vectors:', error);
      throw error;
    }
  }

  async delete(ids: string[]): Promise<void> {
    this.ensureConnected();

    if (ids.length === 0) return;

    try {
      await this.index.deleteMany(ids);
      console.log(`Deleted ${ids.length} vectors from Pinecone`);
    } catch (error) {
      console.error('Failed to delete vectors:', error);
      throw error;
    }
  }

  async deleteAll(): Promise<void> {
    this.ensureConnected();

    try {
      await this.index.deleteAll();
      console.log('Deleted all vectors from Pinecone index');
    } catch (error) {
      console.error('Failed to delete all vectors:', error);
      throw error;
    }
  }

  async fetch(ids: string[]): Promise<VectorRecord[]> {
    this.ensureConnected();

    if (ids.length === 0) return [];

    try {
      const response = await this.index.fetch(ids);

      return Object.entries(response.vectors || {}).map(([id, vector]: [string, any]) => ({
        id,
        vector: vector.values || [],
        metadata: vector.metadata || {},
      }));
    } catch (error) {
      console.error('Failed to fetch vectors:', error);
      throw error;
    }
  }

  async update(id: string, metadata: Record<string, any>): Promise<void> {
    this.ensureConnected();

    try {
      await this.index.update({
        id,
        setMetadata: metadata,
      });

      console.log(`Updated metadata for vector ${id}`);
    } catch (error) {
      console.error(`Failed to update vector ${id}:`, error);
      throw error;
    }
  }

  // Metodi di utilità specifici per Pinecone

  async deleteByDocumentId(documentId: string): Promise<void> {
    this.ensureConnected();

    try {
      await this.index.deleteMany({
        filter: { documentId }
      });

      console.log(`Deleted all vectors for document ${documentId}`);
    } catch (error) {
      console.error(`Failed to delete vectors for document ${documentId}:`, error);
      throw error;
    }
  }

  async queryByDocument(
    vector: number[],
    documentId: string,
    topK: number = 10
  ): Promise<SearchResult[]> {
    return this.query(vector, topK, { documentId });
  }

  async getVectorsByDocument(documentId: string): Promise<VectorRecord[]> {
    this.ensureConnected();

    try {
      // Pinecone non ha un metodo diretto per ottenere vettori by filter
      // Dobbiamo fare una query con un vettore dummy
      const dummyVector = new Array(this.config.dimensions).fill(0);

      const results = await this.query(dummyVector, 10000, { documentId });

      // Fetch i vettori completi
      const ids = results.map(r => r.id);
      return this.fetch(ids);
    } catch (error) {
      console.error(`Failed to get vectors for document ${documentId}:`, error);
      throw error;
    }
  }

  private ensureConnected(): void {
    if (!this.isConnected()) {
      throw new Error('Not connected to Pinecone. Call connect() first.');
    }
  }

  // Metodo per configurare l'indice con le impostazioni ottimali
  async setupOptimalIndex(name: string): Promise<void> {
    try {
      await this.createIndex(name, this.config.dimensions);

      // Attendere che l'indice sia pronto
      let ready = false;
      let attempts = 0;
      const maxAttempts = 30;

      while (!ready && attempts < maxAttempts) {
        try {
          const indexList = await this.client.listIndexes();
          const indexInfo = (indexList as any)?.find((idx: any) => idx.name === name);
          ready = indexInfo?.status?.ready || false;

          if (!ready) {
            console.log(`Waiting for index ${name} to be ready... (${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 10000)); // 10 secondi
          }
        } catch (error) {
          console.warn('Error checking index status:', error);
        }
        attempts++;
      }

      if (!ready) {
        throw new Error(`Index ${name} did not become ready within expected time`);
      }

      console.log(`Index ${name} is ready for use`);
    } catch (error) {
      console.error(`Failed to setup optimal index ${name}:`, error);
      throw error;
    }
  }
}