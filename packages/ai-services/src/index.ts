// Transcription services
export { WhisperService } from './transcription';
export type { TranscriptionOptions, TranscriptionResult } from './transcription';

// Document processing
export { DocumentParser, TextChunker, EmbeddingService } from './document-processing';
export type {
  ParsedDocument,
  DocumentChunk,
  ChunkingOptions,
  EmbeddingOptions,
  VectorEmbedding,
  SupportedFileType
} from './document-processing';

// Vector database
export { PineconeVectorDB, MemoryVectorDB } from './vector-database';
export type {
  VectorDBConfig,
  VectorRecord,
  SearchResult,
  VectorDBInterface,
  QueryOptions
} from './vector-database';

// RAG service
export { RAGService } from './rag';
export type { RAGConfig, RAGSearchResult } from './rag';

// Evaluation service
export { EvaluationService } from './evaluation';
export type {
  EvaluationCriteria,
  EvaluationResult,
  EvaluationConfig
} from './evaluation';