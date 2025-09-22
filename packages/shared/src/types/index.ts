export interface Document {
  id: string;
  name: string;
  content: string;
  type: 'pdf' | 'docx' | 'txt';
  uploadedAt: Date;
  chunks?: DocumentChunk[];
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  embedding?: number[];
  metadata: {
    page?: number;
    section?: string;
    startIndex: number;
    endIndex: number;
  };
}

export interface AudioRecording {
  id: string;
  documentId: string;
  audioUrl: string;
  transcription?: string;
  duration: number;
  recordedAt: Date;
  evaluation?: Evaluation;
}

export interface Evaluation {
  id: string;
  audioRecordingId: string;
  overallScore: number;
  criteria: {
    contentAccuracy: CriterionScore;
    clarity: CriterionScore;
    completeness: CriterionScore;
    organization: CriterionScore;
    relevance: CriterionScore;
  };
  feedback: string;
  suggestedImprovements: string[];
  evaluatedAt: Date;
}

export interface CriterionScore {
  score: number;
  maxScore: number;
  feedback: string;
  evidence: string[];
}

export interface RAGContext {
  relevantChunks: DocumentChunk[];
  similarityScores: number[];
  query: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadProgress {
  documentId: string;
  stage: 'uploading' | 'processing' | 'embedding' | 'complete' | 'error';
  progress: number;
  message?: string;
}

export interface RecordingSession {
  id: string;
  documentId: string;
  status: 'idle' | 'recording' | 'processing' | 'completed' | 'error';
  startedAt?: Date;
  completedAt?: Date;
  audioBlob?: Blob;
}