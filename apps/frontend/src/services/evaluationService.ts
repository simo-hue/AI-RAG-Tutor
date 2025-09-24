import { APIResponse } from '@ai-speech-evaluator/shared';

export interface EvaluationResult {
  evaluation: {
    overallScore: number;
    criteria: {
      accuracy: number;
      clarity: number;
      completeness: number;
      coherence: number;
      fluency: number;
    };
    feedback: {
      strengths: string[];
      improvements: string[];
      detailedFeedback: string;
    };
    metadata: {
      documentId: string;
      transcriptionLength: number;
      contextQuality: {
        averageSimilarity: number;
        chunksUsed: number;
        totalContextLength: number;
      };
      processingTime: string;
      evaluatedAt: string;
    };
  };
  contextUsed: {
    relevantChunks: Array<{
      content: string;
      score: number;
      metadata: {
        documentId: string;
        chunkId: string;
        chunkIndex: number;
      };
    }>;
    combinedContext: string;
    totalScore: number;
  };
  evaluationId: string;
}

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  vectorDB: {
    connected: boolean;
    totalVectors: number;
    dimensions: number;
  };
  llm: {
    connected: boolean;
    model: string;
  };
  error?: string;
}

class EvaluationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  }

  async evaluatePresentation(
    transcription: string,
    documentId: string,
    options?: {
      maxChunks?: number;
      detailedFeedback?: boolean;
    }
  ): Promise<EvaluationResult> {
    const response = await fetch(`${this.baseUrl}/api/evaluation/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcription,
        documentId,
        ...options
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: APIResponse<EvaluationResult> = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Evaluation failed');
    }

    return data.data!;
  }

  async getEvaluationHealth(): Promise<HealthCheckResult> {
    const response = await fetch(`${this.baseUrl}/api/evaluation/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    const data: APIResponse<HealthCheckResult> = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Health check failed');
    }

    return data.data!;
  }

  async quickEvaluation(
    transcription: string,
    documentId: string
  ): Promise<{
    score: number;
    feedback: string;
    processingTime: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/evaluation/quick`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcription,
        documentId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: APIResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Quick evaluation failed');
    }

    return data.data!;
  }
}

export const evaluationService = new EvaluationService();