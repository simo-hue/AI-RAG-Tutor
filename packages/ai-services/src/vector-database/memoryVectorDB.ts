import { VectorDBInterface, VectorDBConfig, VectorRecord, SearchResult } from './types';

export class MemoryVectorDB implements VectorDBInterface {
  private vectors: Map<string, VectorRecord> = new Map();
  private connected: boolean = false;

  constructor(private config: VectorDBConfig) {}

  async connect(): Promise<void> {
    this.connected = true;
    console.log('Connected to Memory Vector DB');
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    console.log('Disconnected from Memory Vector DB');
  }

  isConnected(): boolean {
    return this.connected;
  }

  async createIndex(name: string, dimensions: number): Promise<void> {
    console.log(`Created memory index: ${name} with ${dimensions} dimensions`);
  }

  async deleteIndex(name: string): Promise<void> {
    this.vectors.clear();
    console.log(`Deleted memory index: ${name}`);
  }

  async listIndexes(): Promise<string[]> {
    return [this.config.indexName];
  }

  async getIndexStats(): Promise<{
    totalVectors: number;
    dimensions: number;
    indexFullness: number;
  }> {
    return {
      totalVectors: this.vectors.size,
      dimensions: this.config.dimensions,
      indexFullness: 0, // Memory DB non ha limiti
    };
  }

  async upsert(vectors: VectorRecord[]): Promise<void> {
    this.ensureConnected();

    vectors.forEach(vector => {
      this.vectors.set(vector.id, vector);
    });

    console.log(`Upserted ${vectors.length} vectors to memory`);
  }

  async query(
    vector: number[],
    topK: number = 10,
    filter?: Record<string, any>
  ): Promise<SearchResult[]> {
    this.ensureConnected();

    const results: SearchResult[] = [];

    for (const [id, storedVector] of this.vectors) {
      // Applica filtri se presenti
      if (filter && !this.matchesFilter(storedVector.metadata, filter)) {
        continue;
      }

      const similarity = this.calculateCosineSimilarity(vector, storedVector.vector);

      results.push({
        id,
        score: similarity,
        metadata: storedVector.metadata,
      });
    }

    // Ordina per similarity (score) decrescente e prendi i top K
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  async delete(ids: string[]): Promise<void> {
    this.ensureConnected();

    ids.forEach(id => {
      this.vectors.delete(id);
    });

    console.log(`Deleted ${ids.length} vectors from memory`);
  }

  async deleteAll(): Promise<void> {
    this.ensureConnected();

    this.vectors.clear();
    console.log('Deleted all vectors from memory');
  }

  async fetch(ids: string[]): Promise<VectorRecord[]> {
    this.ensureConnected();

    const results: VectorRecord[] = [];

    ids.forEach(id => {
      const vector = this.vectors.get(id);
      if (vector) {
        results.push(vector);
      }
    });

    return results;
  }

  async update(id: string, metadata: Record<string, any>): Promise<void> {
    this.ensureConnected();

    const vector = this.vectors.get(id);
    if (vector) {
      vector.metadata = { ...vector.metadata, ...metadata };
      this.vectors.set(id, vector);
    }

    console.log(`Updated metadata for vector ${id}`);
  }

  // Utility methods

  private calculateCosineSimilarity(vector1: number[], vector2: number[]): number {
    if (vector1.length !== vector2.length) {
      throw new Error('Vectors must have the same dimensions');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      norm1 += vector1[i] * vector1[i];
      norm2 += vector2[i] * vector2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  private matchesFilter(metadata: Record<string, any>, filter: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(filter)) {
      if (metadata[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private ensureConnected(): void {
    if (!this.isConnected()) {
      throw new Error('Not connected to Memory Vector DB. Call connect() first.');
    }
  }

  // Metodi specifici per Memory DB

  async deleteByDocumentId(documentId: string): Promise<void> {
    this.ensureConnected();

    const idsToDelete: string[] = [];

    for (const [id, vector] of this.vectors) {
      if (vector.metadata.documentId === documentId) {
        idsToDelete.push(id);
      }
    }

    await this.delete(idsToDelete);
    console.log(`Deleted ${idsToDelete.length} vectors for document ${documentId}`);
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

    const results: VectorRecord[] = [];

    for (const vector of this.vectors.values()) {
      if (vector.metadata.documentId === documentId) {
        results.push(vector);
      }
    }

    return results;
  }

  // Metodi per debugging e testing

  getAllVectors(): VectorRecord[] {
    return Array.from(this.vectors.values());
  }

  getVectorCount(): number {
    return this.vectors.size;
  }

  hasVector(id: string): boolean {
    return this.vectors.has(id);
  }

  // Metodi per persistenza (opzionali per testing)

  exportToJSON(): string {
    const data = {
      config: this.config,
      vectors: Array.from(this.vectors.entries()),
    };
    return JSON.stringify(data, null, 2);
  }

  importFromJSON(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);

      if (data.vectors && Array.isArray(data.vectors)) {
        this.vectors.clear();

        data.vectors.forEach(([id, vector]: [string, VectorRecord]) => {
          this.vectors.set(id, vector);
        });

        console.log(`Imported ${this.vectors.size} vectors from JSON`);
      }
    } catch (error) {
      console.error('Failed to import from JSON:', error);
      throw error;
    }
  }

  // Metodi per analisi e statistiche

  analyzeVectors(): {
    totalVectors: number;
    dimensions: number;
    documentsCount: number;
    averageVectorMagnitude: number;
    documentDistribution: Record<string, number>;
  } {
    const documentCounts: Record<string, number> = {};
    let totalMagnitude = 0;

    for (const vector of this.vectors.values()) {
      const docId = vector.metadata.documentId;
      documentCounts[docId] = (documentCounts[docId] || 0) + 1;

      // Calcola magnitude del vettore
      const magnitude = Math.sqrt(
        vector.vector.reduce((sum, val) => sum + val * val, 0)
      );
      totalMagnitude += magnitude;
    }

    return {
      totalVectors: this.vectors.size,
      dimensions: this.config.dimensions,
      documentsCount: Object.keys(documentCounts).length,
      averageVectorMagnitude: this.vectors.size > 0 ? totalMagnitude / this.vectors.size : 0,
      documentDistribution: documentCounts,
    };
  }
}