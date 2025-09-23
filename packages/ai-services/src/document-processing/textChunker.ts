import { DocumentChunk, ChunkingOptions, ParsedDocument } from './types';

export class TextChunker {
  private readonly defaultOptions: Required<ChunkingOptions> = {
    chunkSize: 1000,
    chunkOverlap: 200,
    preserveSentences: true,
    preserveParagraphs: false,
    customSeparators: ['\n\n', '\n', '. ', '! ', '? ', '; '],
  };

  constructor(private options: ChunkingOptions = {}) {
    this.options = { ...this.defaultOptions, ...options };
  }

  chunkDocument(document: ParsedDocument): DocumentChunk[] {
    const { content, id: documentId } = document;
    const chunks: DocumentChunk[] = [];

    if (!content || content.trim().length === 0) {
      return chunks;
    }

    let segments: string[];

    if (this.options.preserveParagraphs) {
      segments = this.chunkByParagraphs(content);
    } else if (this.options.preserveSentences) {
      segments = this.chunkBySentences(content);
    } else {
      segments = this.chunkBySize(content);
    }

    // Combina segmenti se necessario
    const finalChunks = this.combineSegments(segments);

    finalChunks.forEach((chunkContent, index) => {
      const startPosition = this.findStartPosition(content, chunkContent, index);
      const endPosition = startPosition + chunkContent.length;

      chunks.push({
        id: this.generateChunkId(documentId, index),
        documentId,
        content: chunkContent.trim(),
        index,
        startPosition,
        endPosition,
        metadata: {
          wordCount: this.countWords(chunkContent),
          characterCount: chunkContent.length,
          section: this.extractSection(chunkContent),
          heading: this.extractHeading(chunkContent),
        },
      });
    });

    return chunks;
  }

  private chunkByParagraphs(text: string): string[] {
    return text.split(/\n\s*\n/).filter(para => para.trim().length > 0);
  }

  private chunkBySentences(text: string): string[] {
    // Regex per dividere per frasi mantenendo i delimitatori
    const sentenceRegex = /([.!?]+\s*)/;
    const sentences = text.split(sentenceRegex).filter(s => s.trim().length > 0);

    const chunks: string[] = [];
    let currentChunk = '';

    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = sentences[i];
      const delimiter = sentences[i + 1] || '';
      const fullSentence = sentence + delimiter;

      if (currentChunk.length + fullSentence.length <= this.options.chunkSize!) {
        currentChunk += fullSentence;
      } else {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = fullSentence;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  private chunkBySize(text: string): string[] {
    const chunks: string[] = [];
    const chunkSize = this.options.chunkSize!;
    const overlap = this.options.chunkOverlap!;

    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      let chunk = text.slice(i, i + chunkSize);

      // Cerca un buon punto di rottura
      if (i + chunkSize < text.length) {
        const breakPoint = this.findBreakPoint(chunk);
        if (breakPoint > 0) {
          chunk = chunk.slice(0, breakPoint);
        }
      }

      chunks.push(chunk.trim());
    }

    return chunks.filter(chunk => chunk.length > 0);
  }

  private combineSegments(segments: string[]): string[] {
    const chunks: string[] = [];
    let currentChunk = '';
    const maxSize = this.options.chunkSize!;
    const overlap = this.options.chunkOverlap!;

    for (const segment of segments) {
      if (currentChunk.length + segment.length <= maxSize) {
        currentChunk += (currentChunk ? ' ' : '') + segment;
      } else {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());

          // Aggiungi overlap
          const words = currentChunk.split(' ');
          const overlapWords = words.slice(-Math.floor(overlap / 6)); // ~6 chars per parola
          currentChunk = overlapWords.join(' ') + ' ' + segment;
        } else {
          currentChunk = segment;
        }
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  private findBreakPoint(text: string): number {
    const separators = this.options.customSeparators!;

    // Cerca dalla fine del testo verso l'inizio
    for (const separator of separators) {
      const lastIndex = text.lastIndexOf(separator);
      if (lastIndex > text.length * 0.5) { // Solo se è nella seconda metà
        return lastIndex + separator.length;
      }
    }

    // Se non trova separatori, cerca uno spazio
    const lastSpace = text.lastIndexOf(' ');
    if (lastSpace > text.length * 0.7) {
      return lastSpace;
    }

    return -1; // Nessun buon punto di rottura trovato
  }

  private findStartPosition(fullText: string, chunk: string, index: number): number {
    if (index === 0) return 0;

    // Cerca la posizione del chunk nel testo completo
    const searchStart = Math.max(0, index * (this.options.chunkSize! - this.options.chunkOverlap!) - 100);
    const position = fullText.indexOf(chunk.substring(0, 50), searchStart);

    return position >= 0 ? position : searchStart;
  }

  private extractSection(text: string): string | undefined {
    // Cerca pattern per sezioni (es. "1. Introduzione", "Capitolo 1", etc.)
    const sectionMatch = text.match(/^(\d+\.?\s*[A-Z][^.\n]*)/m);
    return sectionMatch ? sectionMatch[1].trim() : undefined;
  }

  private extractHeading(text: string): string | undefined {
    // Cerca il primo paragrafo che potrebbe essere un titolo
    const lines = text.split('\n');
    const firstLine = lines[0]?.trim();

    if (firstLine && firstLine.length < 100 && firstLine.length > 5) {
      // Verifica se sembra un titolo (inizia con maiuscola, non finisce con punto)
      if (/^[A-Z]/.test(firstLine) && !/[.!?]$/.test(firstLine)) {
        return firstLine;
      }
    }

    return undefined;
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private generateChunkId(documentId: string, index: number): string {
    return `${documentId}_chunk_${index.toString().padStart(3, '0')}`;
  }

  // Metodo per rechunk con opzioni diverse
  rechunkDocument(document: ParsedDocument, newOptions: ChunkingOptions): DocumentChunk[] {
    const oldOptions = this.options;
    this.options = { ...this.defaultOptions, ...newOptions };

    const chunks = this.chunkDocument(document);

    this.options = oldOptions; // Ripristina opzioni originali
    return chunks;
  }

  // Analisi qualità chunking
  analyzeChunking(chunks: DocumentChunk[]): {
    averageChunkSize: number;
    minChunkSize: number;
    maxChunkSize: number;
    totalChunks: number;
    averageWordCount: number;
  } {
    if (chunks.length === 0) {
      return {
        averageChunkSize: 0,
        minChunkSize: 0,
        maxChunkSize: 0,
        totalChunks: 0,
        averageWordCount: 0,
      };
    }

    const sizes = chunks.map(chunk => chunk.content.length);
    const wordCounts = chunks.map(chunk => chunk.metadata.wordCount);

    return {
      averageChunkSize: Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length),
      minChunkSize: Math.min(...sizes),
      maxChunkSize: Math.max(...sizes),
      totalChunks: chunks.length,
      averageWordCount: Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length),
    };
  }
}