import OpenAI from 'openai';
import { DocumentChunk, EmbeddingOptions, VectorEmbedding } from './types';

export class EmbeddingService {
  private openai: OpenAI;
  private readonly defaultOptions: Required<EmbeddingOptions> = {
    model: 'text-embedding-3-small',
    dimensions: 1536,
    batchSize: 10,
  };

  constructor(apiKey: string, private options: EmbeddingOptions = {}) {
    this.openai = new OpenAI({ apiKey });
    this.options = { ...this.defaultOptions, ...options };
  }

  async generateEmbeddings(chunks: DocumentChunk[]): Promise<VectorEmbedding[]> {
    if (chunks.length === 0) {
      return [];
    }

    const embeddings: VectorEmbedding[] = [];
    const batchSize = this.options.batchSize!;

    // Processa in batch per rispettare i rate limits
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const batchEmbeddings = await this.processBatch(batch);
      embeddings.push(...batchEmbeddings);

      // Aggiungi delay tra batch per evitare rate limiting
      if (i + batchSize < chunks.length) {
        await this.delay(1000); // 1 secondo di delay
      }
    }

    return embeddings;
  }

  private async processBatch(chunks: DocumentChunk[]): Promise<VectorEmbedding[]> {
    try {
      const texts = chunks.map(chunk => this.prepareTextForEmbedding(chunk.content));

      const response = await this.openai.embeddings.create({
        model: this.options.model!,
        input: texts,
        dimensions: this.options.dimensions,
      });

      return response.data.map((embedding, index) => ({
        chunkId: chunks[index].id,
        vector: embedding.embedding,
        metadata: {
          documentId: chunks[index].documentId,
          chunkIndex: chunks[index].index,
          content: chunks[index].content,
        },
      }));

    } catch (error) {
      console.error('Error generating embeddings for batch:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to generate embeddings: ${errorMessage}`);
    }
  }

  async generateSingleEmbedding(text: string): Promise<number[]> {
    try {
      const preparedText = this.prepareTextForEmbedding(text);

      const response = await this.openai.embeddings.create({
        model: this.options.model!,
        input: preparedText,
        dimensions: this.options.dimensions,
      });

      return response.data[0].embedding;

    } catch (error) {
      console.error('Error generating single embedding:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to generate embedding: ${errorMessage}`);
    }
  }

  private prepareTextForEmbedding(text: string): string {
    return text
      // Rimuovi caratteri speciali problematici
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Normalizza spazi
      .replace(/\s+/g, ' ')
      // Trim
      .trim()
      // Limita lunghezza (OpenAI ha limiti sui token)
      .substring(0, 8000); // ~8000 caratteri ≈ safe token limit
  }

  calculateSimilarity(vector1: number[], vector2: number[]): number {
    if (vector1.length !== vector2.length) {
      throw new Error('Vectors must have the same dimensions');
    }

    // Cosine similarity
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

  findMostSimilar(
    queryEmbedding: number[],
    embeddings: VectorEmbedding[],
    topK: number = 5
  ): Array<{ embedding: VectorEmbedding; similarity: number }> {
    const similarities = embeddings.map(embedding => ({
      embedding,
      similarity: this.calculateSimilarity(queryEmbedding, embedding.vector),
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  async searchSimilarChunks(
    query: string,
    embeddings: VectorEmbedding[],
    topK: number = 5
  ): Promise<Array<{ chunk: VectorEmbedding; similarity: number }>> {
    const queryEmbedding = await this.generateSingleEmbedding(query);

    const results = this.findMostSimilar(queryEmbedding, embeddings, topK);

    return results.map(result => ({
      chunk: result.embedding,
      similarity: result.similarity,
    }));
  }

  // Utility per validare embeddings
  validateEmbedding(embedding: number[]): boolean {
    if (!Array.isArray(embedding)) return false;
    if (embedding.length !== this.options.dimensions) return false;
    if (embedding.some(val => typeof val !== 'number' || isNaN(val))) return false;
    return true;
  }

  // Calcola statistiche sugli embeddings
  analyzeEmbeddings(embeddings: VectorEmbedding[]): {
    count: number;
    dimensions: number;
    averageMagnitude: number;
    minMagnitude: number;
    maxMagnitude: number;
  } {
    if (embeddings.length === 0) {
      return {
        count: 0,
        dimensions: 0,
        averageMagnitude: 0,
        minMagnitude: 0,
        maxMagnitude: 0,
      };
    }

    const magnitudes = embeddings.map(emb => {
      const sumSquares = emb.vector.reduce((sum, val) => sum + val * val, 0);
      return Math.sqrt(sumSquares);
    });

    return {
      count: embeddings.length,
      dimensions: embeddings[0].vector.length,
      averageMagnitude: magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length,
      minMagnitude: Math.min(...magnitudes),
      maxMagnitude: Math.max(...magnitudes),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Metodo per ottimizzare embeddings esistenti
  async optimizeEmbeddings(
    embeddings: VectorEmbedding[],
    newOptions: EmbeddingOptions
  ): Promise<VectorEmbedding[]> {
    const oldOptions = this.options;
    this.options = { ...this.defaultOptions, ...newOptions };

    try {
      // Se il modello è cambiato, rigenera tutti gli embeddings
      if (newOptions.model && newOptions.model !== oldOptions.model) {
        const chunks: DocumentChunk[] = embeddings.map(emb => ({
          id: emb.chunkId,
          documentId: emb.metadata.documentId,
          content: emb.metadata.content,
          index: emb.metadata.chunkIndex,
          startPosition: 0,
          endPosition: emb.metadata.content.length,
          metadata: {
            wordCount: emb.metadata.content.split(/\s+/).length,
            characterCount: emb.metadata.content.length,
          },
        }));

        return await this.generateEmbeddings(chunks);
      }

      return embeddings;
    } finally {
      this.options = oldOptions;
    }
  }
}