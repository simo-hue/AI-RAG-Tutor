import { LocalEvaluationService, EvaluationResult, EvaluationCriteria } from './localEvaluationService';
import { evaluationConfig } from '../config/ragConfig';
import { AppError } from '../middleware/errorHandler';
import { DocumentService } from './ragService';
import { logger } from '../utils/logger';

export class EvaluationServiceManager {
  private evaluationService: LocalEvaluationService | null = null;
  private documentService: DocumentService;

  constructor(documentService: DocumentService) {
    this.documentService = documentService;
  }

  private async getEvaluationService(): Promise<LocalEvaluationService> {
    if (!this.evaluationService) {
      this.evaluationService = await LocalEvaluationService.getInstance();
    }
    return this.evaluationService;
  }

  async evaluatePresentation(
    transcription: string,
    documentId: string,
    options?: {
      maxRelevantChunks?: number;
      minSimilarityScore?: number;
    }
  ): Promise<{
    evaluation: EvaluationResult;
    contextUsed: {
      relevantChunks: number;
      averageSimilarity: number;
      combinedContextLength: number;
    };
  }> {
    const startTime = Date.now();

    try {
      // Validazione input
      this.validateEvaluationInput(transcription, documentId);

      // Ottieni contesto rilevante dal documento
      const maxChunks = options?.maxRelevantChunks || 3;
      const contextResult = await this.documentService.getRelevantContext(
        transcription,
        documentId,
        maxChunks
      );

      // Debug: Log delle similarità per investigare il problema
      console.log('🔍 DEBUG - Similarity scores:', {
        transcription: transcription.substring(0, 100) + '...',
        documentId,
        chunks: contextResult.relevantChunks.map(chunk => ({
          score: chunk.score,
          contentPreview: chunk.content.substring(0, 100) + '...'
        })),
        totalScore: contextResult.totalScore,
        averageScore: contextResult.totalScore / contextResult.relevantChunks.length
      });

      // Validazione dei risultati prima di calcolare le statistiche
      if (!contextResult.relevantChunks || contextResult.relevantChunks.length === 0) {
        throw new AppError(
          'No content chunks found in document. The document may be empty or processing failed.',
          400
        );
      }

      // Calcola soglia adattiva basata su statistiche del contenuto
      const scores = contextResult.relevantChunks.map(chunk => chunk.score).filter(score => !isNaN(score) && isFinite(score));

      if (scores.length === 0) {
        throw new AppError(
          'No valid similarity scores computed. There may be an issue with the embedding generation or document processing.',
          500
        );
      }

      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);
      const scoreStdDev = Math.sqrt(scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / scores.length);

      // Soglia adattiva: prende in considerazione la distribuzione dei punteggi
      let adaptiveThreshold = options?.minSimilarityScore;
      if (!adaptiveThreshold) {
        if (maxScore < 0.1) {
          // Se tutti i punteggi sono bassi, usa una soglia molto bassa
          adaptiveThreshold = Math.max(0.02, averageScore * 0.3);
        } else if (scoreStdDev < 0.05) {
          // Se i punteggi sono simili, usa la media meno una deviazione standard
          adaptiveThreshold = Math.max(0.03, averageScore - scoreStdDev);
        } else {
          // Usa una percentuale della media, mai sotto 0.03
          adaptiveThreshold = Math.max(0.03, averageScore * 0.6);
        }
      }

      console.log('🔍 DEBUG - Adaptive threshold calculation:', {
        originalChunks: contextResult.relevantChunks.length,
        averageScore: averageScore.toFixed(3),
        maxScore: maxScore.toFixed(3),
        minScore: minScore.toFixed(3),
        scoreStdDev: scoreStdDev.toFixed(3),
        adaptiveThreshold: adaptiveThreshold.toFixed(3),
        strategy: maxScore < 0.1 ? 'low-scores' : scoreStdDev < 0.05 ? 'similar-scores' : 'normal'
      });

      const relevantChunks = contextResult.relevantChunks.filter(
        chunk => chunk.score >= adaptiveThreshold
      );

      console.log('🔍 DEBUG - After adaptive filtering:', {
        originalChunks: contextResult.relevantChunks.length,
        filteredChunks: relevantChunks.length,
        adaptiveThreshold: adaptiveThreshold.toFixed(3),
        rejected: contextResult.relevantChunks.filter(chunk => chunk.score < adaptiveThreshold).length
      });

      if (relevantChunks.length === 0) {
        // Aggiungi più dettagli nell'errore per debug
        const scores = contextResult.relevantChunks.map(c => c.score);
        const maxScore = Math.max(...scores);
        throw new AppError(
          `No relevant content found in document for this transcription. Max similarity score: ${maxScore.toFixed(3)}, adaptive threshold: ${adaptiveThreshold.toFixed(3)}. The speech may not be related to the uploaded document.`,
          400
        );
      }

      // Esegui valutazione
      const evaluationService = await this.getEvaluationService();
      const evaluation = await evaluationService.evaluatePresentation(
        transcription,
        relevantChunks,
        documentId
      );

      const processingTime = Date.now() - startTime;

      // Aggiungi metriche di processamento
      evaluation.metadata = {
        ...evaluation.metadata,
        processingTime,
        contextQuality: {
          averageSimilarity: contextResult.totalScore,
          chunksUsed: relevantChunks.length,
          contextLength: contextResult.combinedContext.length,
        },
      };

      console.log(`Evaluation completed for document ${documentId} in ${processingTime}ms`);

      return {
        evaluation,
        contextUsed: {
          relevantChunks: relevantChunks.length,
          averageSimilarity: contextResult.totalScore,
          combinedContextLength: contextResult.combinedContext.length,
        },
      };

    } catch (error) {
      console.error('Error during evaluation:', error);

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(`Evaluation failed: ${error.message}`, 500);
    }
  }

  async generateDetailedFeedback(
    transcription: string,
    documentId: string,
    focusArea?: keyof EvaluationCriteria
  ): Promise<{
    detailedFeedback: string;
    focusArea?: keyof EvaluationCriteria;
    recommendedActions: string[];
  }> {
    try {
      this.validateEvaluationInput(transcription, documentId);

      // Ottieni contesto rilevante
      const contextResult = await this.documentService.getRelevantContext(
        transcription,
        documentId,
        5 // Più contesto per feedback dettagliato
      );

      // Genera feedback dettagliato
      const evaluationService = await this.getEvaluationService();
      const feedback = await evaluationService.generateDetailedFeedback(
        transcription,
        contextResult.relevantChunks,
        focusArea
      );

      // Genera azioni raccomandate basate sull'area di focus
      const recommendedActions = this.generateRecommendedActions(focusArea, contextResult.totalScore);

      return {
        detailedFeedback: feedback,
        focusArea,
        recommendedActions,
      };

    } catch (error) {
      console.error('Error generating detailed feedback:', error);

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(`Failed to generate detailed feedback: ${error.message}`, 500);
    }
  }

  async comparePresentations(
    evaluationIds: string[]
  ): Promise<{
    comparison: {
      averageScores: EvaluationCriteria & { overall: number };
      trends: {
        improving: string[];
        declining: string[];
        stable: string[];
      };
      recommendations: string[];
    };
    evaluationCount: number;
    timeSpan: {
      from: Date;
      to: Date;
    };
  }> {
    try {
      // In una implementazione reale, questi dati verrebbero recuperati dal database
      // Per ora, simuliamo con valutazioni mock basate sugli ID
      const evaluations = await this.getMockEvaluations(evaluationIds);

      if (evaluations.length === 0) {
        throw new AppError('No evaluations found for comparison', 404);
      }

      const evaluationService = await this.getEvaluationService();
      const comparison = await evaluationService.comparePresentations(evaluations);

      // Calcola timespan
      const dates = evaluations.map(e => e.metadata.evaluatedAt);
      const timeSpan = {
        from: new Date(Math.min(...dates.map(d => d.getTime()))),
        to: new Date(Math.max(...dates.map(d => d.getTime()))),
      };

      return {
        comparison,
        evaluationCount: evaluations.length,
        timeSpan,
      };

    } catch (error) {
      console.error('Error comparing presentations:', error);

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(`Failed to compare presentations: ${error.message}`, 500);
    }
  }

  async quickEvaluation(
    transcription: string,
    documentId: string
  ): Promise<{
    overallScore: number;
    keyStrengths: string[];
    keyImprovements: string[];
    accuracy: number;
    clarity: number;
  }> {
    try {
      const result = await this.evaluatePresentation(transcription, documentId, {
        maxRelevantChunks: 2, // Meno contesto per valutazione rapida
      });

      const evaluation = result.evaluation;

      return {
        overallScore: evaluation.overallScore,
        keyStrengths: evaluation.feedback.strengths.slice(0, 2),
        keyImprovements: evaluation.feedback.improvements.slice(0, 2),
        accuracy: evaluation.criteria.accuracy,
        clarity: evaluation.criteria.clarity,
      };

    } catch (error) {
      console.error('Error in quick evaluation:', error);

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(`Quick evaluation failed: ${error.message}`, 500);
    }
  }

  // Metodi di utilità privati

  private validateEvaluationInput(transcription: string, documentId: string): void {
    if (!transcription?.trim()) {
      throw new AppError('Transcription cannot be empty', 400);
    }

    if (transcription.trim().length < 10) {
      throw new AppError('Transcription too short for meaningful evaluation', 400);
    }

    if (!documentId?.trim()) {
      throw new AppError('Document ID is required', 400);
    }

    // Validazione avanzata per caratteri speciali o contenuto inappropriato
    if (this.containsOnlySpecialCharacters(transcription)) {
      throw new AppError('Transcription contains only special characters or invalid content', 400);
    }
  }

  private containsOnlySpecialCharacters(text: string): boolean {
    const cleanText = text.replace(/[\s\p{P}]/gu, '');
    return cleanText.length === 0;
  }

  private generateRecommendedActions(
    focusArea?: keyof EvaluationCriteria,
    averageSimilarity?: number
  ): string[] {
    const actions: string[] = [];

    if (focusArea) {
      const areaActions: Record<keyof EvaluationCriteria, string[]> = {
        accuracy: [
          'Rileggi attentamente il documento prima della presentazione',
          'Prendi note sui punti chiave durante la lettura',
          'Verifica i fatti e le cifre specifiche menzionate',
        ],
        clarity: [
          'Struttura il discorso con introduzione, sviluppo e conclusioni',
          'Usa un linguaggio semplice e diretto',
          'Evita terminologia tecnica senza spiegazioni',
        ],
        completeness: [
          'Crea una checklist degli argomenti principali del documento',
          'Dedica tempo sufficiente a ogni sezione importante',
          'Aggiungi esempi specifici per ogni punto trattato',
        ],
        coherence: [
          'Usa connettori logici tra le diverse sezioni',
          'Mantieni un filo conduttore chiaro durante tutto il discorso',
          'Evita salti logici tra gli argomenti',
        ],
        fluency: [
          'Pratica la presentazione ad alta voce prima di registrare',
          'Parla a velocità moderata e fai pause strategiche',
          'Prepara mentalmente le transizioni tra le sezioni',
        ],
      };

      actions.push(...areaActions[focusArea]);
    }

    // Aggiungi azioni basate sulla qualità del matching
    if (averageSimilarity !== undefined) {
      if (averageSimilarity < 0.3) {
        actions.push('Assicurati che la presentazione sia strettamente correlata al documento caricato');
        actions.push('Rileggi il documento per comprendere meglio i contenuti chiave');
      } else if (averageSimilarity > 0.8) {
        actions.push('Eccellente allineamento con il documento! Continua così');
      }
    }

    return actions;
  }

  private async getMockEvaluations(evaluationIds: string[]): Promise<EvaluationResult[]> {
    // In una implementazione reale, questo recupererebbe le valutazioni dal database
    // Per ora, generiamo valutazioni mock per testing
    return evaluationIds.map((id, index) => ({
      overallScore: 70 + (index * 5) % 30,
      criteria: {
        accuracy: 75 + (index * 3) % 20,
        clarity: 80 + (index * 2) % 15,
        completeness: 70 + (index * 4) % 25,
        coherence: 85 + (index * 1) % 10,
        fluency: 78 + (index * 2) % 18,
      },
      feedback: {
        strengths: ['Buona struttura', 'Linguaggio chiaro'],
        improvements: ['Maggiori dettagli', 'Più esempi'],
        detailedFeedback: 'Presentazione complessivamente buona con margini di miglioramento.',
      },
      metadata: {
        documentId: `doc-${index}`,
        transcriptionLength: 500 + index * 100,
        relevantChunksUsed: 3,
        evaluatedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
      },
    }));
  }

  // Metodi per gestione errori e logging

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
      const evaluationService = await this.getEvaluationService();
      return await evaluationService.healthCheck();
    } catch (error) {
      logger.error('Evaluation service health check failed', { error: error.message });
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