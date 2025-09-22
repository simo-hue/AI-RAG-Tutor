import { z } from 'zod';

export const DocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  type: z.enum(['pdf', 'docx', 'txt']),
  content: z.string().min(1, 'Document content is required'),
});

export const AudioRecordingSchema = z.object({
  documentId: z.string().uuid('Invalid document ID'),
  duration: z.number().positive('Duration must be positive'),
  audioData: z.instanceof(Buffer, { message: 'Invalid audio data' }),
});

export const EvaluationRequestSchema = z.object({
  audioRecordingId: z.string().uuid('Invalid audio recording ID'),
  transcription: z.string().min(1, 'Transcription is required'),
  documentContent: z.string().min(1, 'Document content is required'),
});

export const CriterionScoreSchema = z.object({
  score: z.number().min(0).max(10),
  maxScore: z.literal(10),
  feedback: z.string(),
  evidence: z.array(z.string()),
});

export const EvaluationSchema = z.object({
  overallScore: z.number().min(0).max(100),
  criteria: z.object({
    contentAccuracy: CriterionScoreSchema,
    clarity: CriterionScoreSchema,
    completeness: CriterionScoreSchema,
    organization: CriterionScoreSchema,
    relevance: CriterionScoreSchema,
  }),
  feedback: z.string(),
  suggestedImprovements: z.array(z.string()),
});

export const RAGQuerySchema = z.object({
  query: z.string().min(1, 'Query is required'),
  documentId: z.string().uuid('Invalid document ID'),
  topK: z.number().positive().optional().default(5),
});

export type DocumentInput = z.infer<typeof DocumentSchema>;
export type AudioRecordingInput = z.infer<typeof AudioRecordingSchema>;
export type EvaluationRequest = z.infer<typeof EvaluationRequestSchema>;
export type RAGQuery = z.infer<typeof RAGQuerySchema>;