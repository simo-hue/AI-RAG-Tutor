import { OllamaService } from './ollamaService';
import { evaluationConfig } from '../config/ragConfig';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { DocumentChunk } from '@ai-speech-evaluator/shared';

export interface EvaluationCriteria {
  accuracy: number;
  clarity: number;
  completeness: number;
  coherence: number;
  fluency: number;
}

export interface EvaluationResult {
  overallScore: number;
  criteria: EvaluationCriteria;
  feedback: {
    strengths: string[];
    improvements: string[];
    detailedFeedback: string;
  };
  metadata: {
    documentId: string;
    transcriptionLength: number;
    relevantChunksUsed: number;
    evaluatedAt: Date;
    processingTime?: number;
    contextQuality?: {
      averageSimilarity: number;
      chunksUsed: number;
      contextLength: number;
    };
  };
}

export class LocalEvaluationService {
  private ollamaService: OllamaService | null = null;
  private static instance: LocalEvaluationService | null = null;

  private constructor() {}

  static async getInstance(): Promise<LocalEvaluationService> {
    if (!this.instance) {
      this.instance = new LocalEvaluationService();
      await this.instance.initialize();
    }
    return this.instance;
  }

  private async initialize(): Promise<void> {
    try {
      this.ollamaService = await OllamaService.getInstance();
      logger.info('Local Evaluation Service initialized successfully', {
        model: evaluationConfig.model,
        language: evaluationConfig.language
      });
    } catch (error) {
      logger.error('Failed to initialize Local Evaluation Service', { error: error.message });
      throw new AppError('Failed to initialize Local Evaluation Service', 500);
    }
  }

  async evaluatePresentation(
    transcription: string,
    relevantChunks: Array<{
      content: string;
      score: number;
      metadata: DocumentChunk['metadata'];
    }>,
    documentId: string
  ): Promise<EvaluationResult> {
    const startTime = Date.now();

    try {
      // Costruisci il contesto rilevante
      const context = relevantChunks
        .map((chunk, index) => `[Sezione ${index + 1}]\n${chunk.content}`)
        .join('\n\n');

      // Crea il prompt di valutazione
      const evaluationPrompt = this.buildEvaluationPrompt(transcription, context);

      // Genera la valutazione usando Ollama
      const rawEvaluation = await this.ollamaService!.generateChat(
        evaluationPrompt,
        this.getSystemPrompt()
      );

      // Parse del risultato
      const evaluation = this.parseEvaluationResult(rawEvaluation, documentId, transcription.length, relevantChunks.length);

      const processingTime = Date.now() - startTime;
      evaluation.metadata.processingTime = processingTime;

      logger.info('Presentation evaluation completed', {
        documentId,
        overallScore: evaluation.overallScore,
        transcriptionLength: transcription.length,
        chunksUsed: relevantChunks.length,
        processingTime: `${processingTime}ms`
      });

      return evaluation;

    } catch (error) {
      logger.error('Presentation evaluation failed', {
        documentId,
        transcriptionLength: transcription.length,
        error: error.message
      });
      throw new AppError(`Evaluation failed: ${error.message}`, 500);
    }
  }

  async generateDetailedFeedback(
    transcription: string,
    relevantChunks: Array<{
      content: string;
      score: number;
      metadata: DocumentChunk['metadata'];
    }>,
    focusArea?: keyof EvaluationCriteria
  ): Promise<string> {
    try {
      const context = relevantChunks
        .map((chunk, index) => `[Sezione ${index + 1}]\n${chunk.content}`)
        .join('\n\n');

      const feedbackPrompt = this.buildDetailedFeedbackPrompt(transcription, context, focusArea);

      const detailedFeedback = await this.ollamaService!.generateChat(
        feedbackPrompt,
        this.getFeedbackSystemPrompt()
      );

      logger.info('Detailed feedback generated', {
        transcriptionLength: transcription.length,
        chunksUsed: relevantChunks.length,
        focusArea,
        feedbackLength: detailedFeedback.length
      });

      return detailedFeedback;

    } catch (error) {
      logger.error('Detailed feedback generation failed', {
        transcriptionLength: transcription.length,
        focusArea,
        error: error.message
      });
      throw new AppError(`Failed to generate detailed feedback: ${error.message}`, 500);
    }
  }

  async comparePresentations(evaluations: EvaluationResult[]): Promise<{
    averageScores: EvaluationCriteria & { overall: number };
    trends: {
      improving: string[];
      declining: string[];
      stable: string[];
    };
    recommendations: string[];
  }> {
    try {
      if (evaluations.length === 0) {
        throw new AppError('No evaluations provided for comparison', 400);
      }

      // Calcola medie
      const averageScores = this.calculateAverageScores(evaluations);

      // Analizza tendenze
      const trends = this.analyzeTrends(evaluations);

      // Genera raccomandazioni
      const recommendations = await this.generateComparisonRecommendations(evaluations, averageScores, trends);

      logger.info('Presentations comparison completed', {
        evaluationCount: evaluations.length,
        overallAverage: averageScores.overall
      });

      return {
        averageScores,
        trends,
        recommendations
      };

    } catch (error) {
      logger.error('Presentations comparison failed', {
        evaluationCount: evaluations.length,
        error: error.message
      });
      throw new AppError(`Failed to compare presentations: ${error.message}`, 500);
    }
  }

  private getSystemPrompt(): string {
    return `Sei un esperto valutatore di presentazioni in lingua italiana. Il tuo compito è valutare la qualità di una presentazione orale basandoti sul contenuto del documento di riferimento.

Criteri di valutazione:
1. ACCURATEZZA (0-100): Quanto fedelmente la presentazione riflette il contenuto del documento
2. CHIAREZZA (0-100): Quanto è comprensibile e ben strutturata la presentazione
3. COMPLETEZZA (0-100): Quanto completamente sono stati coperti gli argomenti principali
4. COERENZA (0-100): Quanto è logica e ben organizzata la struttura del discorso
5. FLUENCY (0-100): Quanto è naturale e scorrevole l'esposizione

Rispondi SEMPRE nel seguente formato JSON valido:
{
  "accuratezza": [punteggio],
  "chiarezza": [punteggio],
  "completezza": [punteggio],
  "coerenza": [punteggio],
  "fluency": [punteggio],
  "punti_forza": ["punto1", "punto2", "punto3"],
  "miglioramenti": ["area1", "area2", "area3"],
  "feedback_dettagliato": "Analisi completa della presentazione..."
}`;
  }

  private getFeedbackSystemPrompt(): string {
    return `Sei un coach esperto di public speaking e comunicazione efficace. Fornisci feedback costruttivo e specifico per aiutare a migliorare le presentazioni.

Il tuo feedback deve essere:
- Specifico e actionable
- Positivo ma onesto
- Focalizzato sul miglioramento
- Basato sui contenuti del documento di riferimento

Scrivi in italiano con un tono professionale ma incoraggiante.`;
  }

  private buildEvaluationPrompt(transcription: string, context: string): string {
    return `Valuta questa presentazione orale rispetto al documento di riferimento.

DOCUMENTO DI RIFERIMENTO:
${context}

PRESENTAZIONE DA VALUTARE:
${transcription}

Valuta la presentazione secondo i criteri specificati e restituisci la valutazione nel formato JSON richiesto.`;
  }

  private buildDetailedFeedbackPrompt(
    transcription: string,
    context: string,
    focusArea?: keyof EvaluationCriteria
  ): string {
    let prompt = `Fornisci un feedback dettagliato per migliorare questa presentazione.

DOCUMENTO DI RIFERIMENTO:
${context}

PRESENTAZIONE:
${transcription}

`;

    if (focusArea) {
      const focusAreaNames = {
        accuracy: 'accuratezza del contenuto',
        clarity: 'chiarezza espositiva',
        completeness: 'completezza della trattazione',
        coherence: 'coerenza logica',
        fluency: 'fluidità dell\'esposizione'
      };

      prompt += `FOCUS SPECIFICO: Concentrati particolarmente sulla ${focusAreaNames[focusArea]}.

`;
    }

    prompt += `Fornisci consigli specifici e pratici per migliorare la presentazione. Include esempi concreti quando possibile.`;

    return prompt;
  }

  private parseEvaluationResult(
    rawResult: string,
    documentId: string,
    transcriptionLength: number,
    chunksUsed: number
  ): EvaluationResult {
    try {
      // Tenta di estrarre JSON dal risultato
      const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in evaluation result');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      const criteria: EvaluationCriteria = {
        accuracy: this.normalizeScore(parsed.accuratezza || 0),
        clarity: this.normalizeScore(parsed.chiarezza || 0),
        completeness: this.normalizeScore(parsed.completezza || 0),
        coherence: this.normalizeScore(parsed.coerenza || 0),
        fluency: this.normalizeScore(parsed.fluency || 0)
      };

      const overallScore = Math.round(
        (criteria.accuracy + criteria.clarity + criteria.completeness +
         criteria.coherence + criteria.fluency) / 5
      );

      return {
        overallScore,
        criteria,
        feedback: {
          strengths: parsed.punti_forza || [],
          improvements: parsed.miglioramenti || [],
          detailedFeedback: parsed.feedback_dettagliato || 'Feedback non disponibile'
        },
        metadata: {
          documentId,
          transcriptionLength,
          relevantChunksUsed: chunksUsed,
          evaluatedAt: new Date()
        }
      };

    } catch (error) {
      logger.error('Failed to parse evaluation result', {
        rawResult: rawResult.substring(0, 200),
        error: error.message
      });

      // Fallback evaluation
      return {
        overallScore: 70,
        criteria: {
          accuracy: 70,
          clarity: 70,
          completeness: 70,
          coherence: 70,
          fluency: 70
        },
        feedback: {
          strengths: ['Contenuto presente'],
          improvements: ['Errore nel parsing della valutazione'],
          detailedFeedback: 'Errore nella generazione del feedback dettagliato. Si prega di riprovare.'
        },
        metadata: {
          documentId,
          transcriptionLength,
          relevantChunksUsed: chunksUsed,
          evaluatedAt: new Date()
        }
      };
    }
  }

  private normalizeScore(score: number): number {
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateAverageScores(evaluations: EvaluationResult[]): EvaluationCriteria & { overall: number } {
    const totals = evaluations.reduce(
      (acc, evaluation) => ({
        accuracy: acc.accuracy + evaluation.criteria.accuracy,
        clarity: acc.clarity + evaluation.criteria.clarity,
        completeness: acc.completeness + evaluation.criteria.completeness,
        coherence: acc.coherence + evaluation.criteria.coherence,
        fluency: acc.fluency + evaluation.criteria.fluency,
        overall: acc.overall + evaluation.overallScore
      }),
      { accuracy: 0, clarity: 0, completeness: 0, coherence: 0, fluency: 0, overall: 0 }
    );

    const count = evaluations.length;
    return {
      accuracy: Math.round(totals.accuracy / count),
      clarity: Math.round(totals.clarity / count),
      completeness: Math.round(totals.completeness / count),
      coherence: Math.round(totals.coherence / count),
      fluency: Math.round(totals.fluency / count),
      overall: Math.round(totals.overall / count)
    };
  }

  private analyzeTrends(evaluations: EvaluationResult[]): {
    improving: string[];
    declining: string[];
    stable: string[];
  } {
    if (evaluations.length < 2) {
      return { improving: [], declining: [], stable: ['Non abbastanza dati per analizzare le tendenze'] };
    }

    const sortedEvals = evaluations.sort((a, b) =>
      a.metadata.evaluatedAt.getTime() - b.metadata.evaluatedAt.getTime()
    );

    const first = sortedEvals[0];
    const last = sortedEvals[sortedEvals.length - 1];

    const trends = {
      improving: [] as string[],
      declining: [] as string[],
      stable: [] as string[]
    };

    const criteriaNames = {
      accuracy: 'Accuratezza',
      clarity: 'Chiarezza',
      completeness: 'Completezza',
      coherence: 'Coerenza',
      fluency: 'Fluency'
    };

    Object.entries(criteriaNames).forEach(([key, name]) => {
      const firstScore = first.criteria[key as keyof EvaluationCriteria];
      const lastScore = last.criteria[key as keyof EvaluationCriteria];
      const diff = lastScore - firstScore;

      if (diff > 5) {
        trends.improving.push(name);
      } else if (diff < -5) {
        trends.declining.push(name);
      } else {
        trends.stable.push(name);
      }
    });

    return trends;
  }

  private async generateComparisonRecommendations(
    evaluations: EvaluationResult[],
    averageScores: EvaluationCriteria & { overall: number },
    trends: { improving: string[]; declining: string[]; stable: string[] }
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Raccomandazioni basate sui punteggi medi
    const lowestScoreArea = Object.entries(averageScores)
      .filter(([key]) => key !== 'overall')
      .sort(([, a], [, b]) => a - b)[0];

    if (lowestScoreArea) {
      const [area, score] = lowestScoreArea;
      if (score < 70) {
        recommendations.push(`Concentrati sul migliorare la ${area} - punteggio medio attuale: ${score}`);
      }
    }

    // Raccomandazioni basate sulle tendenze
    if (trends.declining.length > 0) {
      recommendations.push(`Attenzione alle aree in declino: ${trends.declining.join(', ')}`);
    }

    if (trends.improving.length > 0) {
      recommendations.push(`Continua a lavorare sui punti di forza: ${trends.improving.join(', ')}`);
    }

    // Raccomandazioni generali
    if (averageScores.overall >= 85) {
      recommendations.push('Eccellente livello generale - mantieni la costanza!');
    } else if (averageScores.overall >= 70) {
      recommendations.push('Buon livello - cerca di essere più consistente nelle diverse aree');
    } else {
      recommendations.push('Lavora sui fondamenti - pratica regolarmente per migliorare');
    }

    return recommendations;
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    ollama: {
      connected: boolean;
      model: string;
    };
    lastEvaluation?: Date;
    error?: string;
  }> {
    try {
      // Test rapido con Ollama
      const testResult = await this.ollamaService!.generateChat(
        'Test di connessione.',
        'Rispondi solo con "OK".'
      );

      return {
        status: 'healthy',
        ollama: {
          connected: true,
          model: evaluationConfig.model,
        },
        lastEvaluation: new Date(),
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        ollama: {
          connected: false,
          model: evaluationConfig.model,
        },
        error: error.message,
      };
    }
  }
}

export default LocalEvaluationService;