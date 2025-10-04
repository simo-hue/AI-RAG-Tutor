export interface Document {
  id: string;
  name: string;
  content: string;
  type: 'pdf' | 'docx' | 'txt';
  uploadedAt: Date;
  wordCount?: number;
  chunkCount?: number;
  chunks?: DocumentChunk[];
  detectedLanguage?: {
    code: string;
    name: string;
    confidence?: number;
    detectionMethod: 'automatic' | 'manual';
  };
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
  audioMetrics?: AudioMetrics;
}

/**
 * Advanced audio analysis metrics
 * Production-ready audio quality and speech analysis
 */
export interface AudioMetrics {
  // Speech rate analysis
  speechRate: SpeechRateMetrics;

  // Pause detection
  pauseAnalysis: PauseAnalysis;

  // Filler words detection
  fillerWords: FillerWordsAnalysis;

  // Volume and pitch analysis
  audioQuality: AudioQualityMetrics;

  // Overall speaking performance
  speakingPerformance: SpeakingPerformance;
}

export interface SpeechRateMetrics {
  wordsPerMinute: number;
  syllablesPerMinute?: number;
  articulation: {
    rate: number; // WPM excluding pauses
    quality: 'slow' | 'optimal' | 'fast' | 'very-fast';
  };
  recommendation: string;
}

export interface PauseAnalysis {
  totalPauses: number;
  avgPauseDuration: number; // in seconds
  maxPauseDuration: number;
  minPauseDuration: number;
  pauses: Pause[];
  pauseDistribution: {
    short: number; // < 0.5s
    medium: number; // 0.5s - 2s
    long: number; // > 2s
  };
  quality: 'too-frequent' | 'optimal' | 'too-rare';
  recommendation: string;
}

export interface Pause {
  startTime: number;
  endTime: number;
  duration: number;
  contextBefore?: string;
  contextAfter?: string;
}

export interface FillerWordsAnalysis {
  totalCount: number;
  fillerRate: number; // fillers per 100 words
  detectedFillers: DetectedFiller[];
  byType: {
    [key: string]: number; // 'ehm': 5, 'uhm': 3, 'cioè': 2, etc.
  };
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  recommendation: string;
}

export interface DetectedFiller {
  word: string;
  timestamp: number;
  confidence: number;
  context: string;
}

export interface AudioQualityMetrics {
  // Volume analysis
  volume: {
    avgDb: number;
    minDb: number;
    maxDb: number;
    consistency: number; // 0-100, higher is more consistent
    quality: 'too-quiet' | 'quiet' | 'optimal' | 'loud' | 'too-loud';
  };

  // Pitch variation (intonation)
  pitch: {
    avgHz: number;
    minHz: number;
    maxHz: number;
    variation: number; // Standard deviation
    monotone: boolean;
    quality: 'monotone' | 'low-variation' | 'optimal' | 'high-variation';
  };

  // Audio clarity
  clarity: {
    snr: number; // Signal-to-noise ratio in dB
    quality: 'poor' | 'fair' | 'good' | 'excellent';
  };

  recommendation: string;
}

export interface SpeakingPerformance {
  overallScore: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  comparedToOptimal: {
    speechRate: 'below' | 'optimal' | 'above';
    pauses: 'below' | 'optimal' | 'above';
    fillerWords: 'below' | 'optimal' | 'above';
    volume: 'below' | 'optimal' | 'above';
    pitch: 'below' | 'optimal' | 'above';
  };
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