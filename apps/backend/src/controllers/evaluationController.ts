import { Request, Response, NextFunction } from 'express';
import { EvaluationServiceManager } from '../services/evaluationService';
import { DocumentService, RAGServiceManager } from '../services/ragService';
import { AppError } from '../middleware/errorHandler';

export const evaluationController = {
  async evaluatePresentation(req: Request, res: Response, next: NextFunction) {
    try {
      const { transcription, documentId, options } = req.body;

      // Validazione input
      if (!transcription?.trim()) {
        throw new AppError('Transcription is required', 400);
      }

      if (!documentId?.trim()) {
        throw new AppError('Document ID is required', 400);
      }

      // Inizializza servizi
      const ragService = await RAGServiceManager.getInstance();
      const documentService = new DocumentService(ragService);
      const evaluationService = new EvaluationServiceManager(documentService);

      // Esegui valutazione
      const result = await evaluationService.evaluatePresentation(
        transcription,
        documentId,
        options
      );

      res.json({
        success: true,
        data: {
          evaluation: result.evaluation,
          contextUsed: result.contextUsed,
          evaluationId: generateEvaluationId(),
        },
        message: 'Presentation evaluated successfully',
      });

    } catch (error) {
      next(error);
    }
  },

  async quickEvaluation(req: Request, res: Response, next: NextFunction) {
    try {
      const { transcription, documentId } = req.body;

      if (!transcription?.trim()) {
        throw new AppError('Transcription is required', 400);
      }

      if (!documentId?.trim()) {
        throw new AppError('Document ID is required', 400);
      }

      const ragService = await RAGServiceManager.getInstance();
      const documentService = new DocumentService(ragService);
      const evaluationService = new EvaluationServiceManager(documentService);

      const result = await evaluationService.quickEvaluation(transcription, documentId);

      res.json({
        success: true,
        data: result,
        message: 'Quick evaluation completed',
      });

    } catch (error) {
      next(error);
    }
  },

  async generateDetailedFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const { transcription, documentId, focusArea } = req.body;

      if (!transcription?.trim()) {
        throw new AppError('Transcription is required', 400);
      }

      if (!documentId?.trim()) {
        throw new AppError('Document ID is required', 400);
      }

      const ragService = await RAGServiceManager.getInstance();
      const documentService = new DocumentService(ragService);
      const evaluationService = new EvaluationServiceManager(documentService);

      const result = await evaluationService.generateDetailedFeedback(
        transcription,
        documentId,
        focusArea
      );

      res.json({
        success: true,
        data: result,
        message: 'Detailed feedback generated successfully',
      });

    } catch (error) {
      next(error);
    }
  },

  async comparePresentations(req: Request, res: Response, next: NextFunction) {
    try {
      const { evaluationIds } = req.body;

      if (!evaluationIds || !Array.isArray(evaluationIds) || evaluationIds.length < 2) {
        throw new AppError('At least 2 evaluation IDs are required for comparison', 400);
      }

      if (evaluationIds.length > 10) {
        throw new AppError('Maximum 10 evaluations can be compared at once', 400);
      }

      const ragService = await RAGServiceManager.getInstance();
      const documentService = new DocumentService(ragService);
      const evaluationService = new EvaluationServiceManager(documentService);

      const result = await evaluationService.comparePresentations(evaluationIds);

      res.json({
        success: true,
        data: result,
        message: 'Presentations compared successfully',
      });

    } catch (error) {
      next(error);
    }
  },

  async evaluateWithFullAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const { transcription, documentId, includeDetailedFeedback = false } = req.body;

      if (!transcription?.trim()) {
        throw new AppError('Transcription is required', 400);
      }

      if (!documentId?.trim()) {
        throw new AppError('Document ID is required', 400);
      }

      const ragService = await RAGServiceManager.getInstance();
      const documentService = new DocumentService(ragService);
      const evaluationService = new EvaluationServiceManager(documentService);

      // Esegui valutazione standard
      const evaluationResult = await evaluationService.evaluatePresentation(
        transcription,
        documentId
      );

      const response: any = {
        evaluation: evaluationResult.evaluation,
        contextUsed: evaluationResult.contextUsed,
        evaluationId: generateEvaluationId(),
      };

      // Aggiungi feedback dettagliato se richiesto
      if (includeDetailedFeedback) {
        const feedbackResult = await evaluationService.generateDetailedFeedback(
          transcription,
          documentId
        );
        response.detailedFeedback = feedbackResult;
      }

      res.json({
        success: true,
        data: response,
        message: 'Full analysis completed successfully',
      });

    } catch (error) {
      next(error);
    }
  },

  async evaluateBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { evaluations } = req.body;

      if (!evaluations || !Array.isArray(evaluations) || evaluations.length === 0) {
        throw new AppError('Evaluations array is required', 400);
      }

      if (evaluations.length > 5) {
        throw new AppError('Maximum 5 evaluations can be processed in batch', 400);
      }

      // Validazione structure per ogni valutazione
      for (const evaluation of evaluations) {
        if (!evaluation.transcription?.trim() || !evaluation.documentId?.trim()) {
          throw new AppError('Each evaluation must have transcription and documentId', 400);
        }
      }

      const ragService = await RAGServiceManager.getInstance();
      const documentService = new DocumentService(ragService);
      const evaluationService = new EvaluationServiceManager(documentService);

      const results = [];
      const errors = [];

      // Processa ogni valutazione
      for (let i = 0; i < evaluations.length; i++) {
        const evaluation = evaluations[i];
        try {
          const result = await evaluationService.evaluatePresentation(
            evaluation.transcription,
            evaluation.documentId,
            evaluation.options
          );

          results.push({
            index: i,
            evaluationId: generateEvaluationId(),
            evaluation: result.evaluation,
            contextUsed: result.contextUsed,
          });
        } catch (error) {
          errors.push({
            index: i,
            error: error.message,
            transcription: evaluation.transcription.substring(0, 50) + '...',
          });
        }
      }

      res.json({
        success: true,
        data: {
          results,
          errors,
          totalProcessed: evaluations.length,
          successCount: results.length,
          errorCount: errors.length,
        },
        message: `Batch evaluation completed: ${results.length}/${evaluations.length} successful`,
      });

    } catch (error) {
      next(error);
    }
  },

  async getEvaluationHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const ragService = await RAGServiceManager.getInstance();
      const documentService = new DocumentService(ragService);
      const evaluationService = new EvaluationServiceManager(documentService);

      const health = await evaluationService.healthCheck();

      res.json({
        success: true,
        data: health,
      });

    } catch (error) {
      next(error);
    }
  },

  async getCriteriaExplanation(req: Request, res: Response, next: NextFunction) {
    try {
      const criteriaExplanations = {
        accuracy: {
          name: 'Accuratezza',
          description: 'Misura quanto il contenuto della presentazione riflette fedelmente le informazioni del documento di riferimento',
          range: '0-100',
          factors: [
            'Correttezza delle informazioni presentate',
            'Fedeltà ai dati e fatti del documento',
            'Assenza di errori fattuali o interpretazioni scorrette',
          ],
        },
        clarity: {
          name: 'Chiarezza',
          description: 'Valuta la chiarezza dell\'esposizione e la comprensibilità del messaggio',
          range: '0-100',
          factors: [
            'Uso di linguaggio appropriato e comprensibile',
            'Struttura logica del discorso',
            'Assenza di ambiguità o confusione',
          ],
        },
        completeness: {
          name: 'Completezza',
          description: 'Misura la copertura degli argomenti chiave del documento',
          range: '0-100',
          factors: [
            'Inclusione dei punti principali del documento',
            'Trattazione equilibrata degli argomenti',
            'Copertura degli aspetti più importanti',
          ],
        },
        coherence: {
          name: 'Coerenza',
          description: 'Valuta la logica e la struttura organizzativa del discorso',
          range: '0-100',
          factors: [
            'Flusso logico tra le idee',
            'Connessioni chiare tra le sezioni',
            'Organizzazione strutturata del contenuto',
          ],
        },
        fluency: {
          name: 'Fluency',
          description: 'Misura la naturalezza e la scorrevolezza del parlato',
          range: '0-100',
          factors: [
            'Naturalezza dell\'espressione',
            'Assenza di interruzioni eccessive',
            'Ritmo appropriato del discorso',
          ],
        },
      };

      res.json({
        success: true,
        data: {
          criteria: criteriaExplanations,
          overallScore: {
            name: 'Punteggio Complessivo',
            description: 'Media ponderata di tutti i criteri di valutazione',
            calculation: 'Combinazione di tutti i criteri con possibili pesi specifici basati sul contesto',
          },
        },
        message: 'Evaluation criteria explained successfully',
      });

    } catch (error) {
      next(error);
    }
  },

  // Test endpoints (solo per sviluppo)
  async testEvaluation(req: Request, res: Response, next: NextFunction) {
    try {
      if (process.env.NODE_ENV === 'production') {
        throw new AppError('Test endpoints not available in production', 403);
      }

      const testTranscription = req.body.transcription ||
        'Questa è una presentazione di test per verificare il funzionamento del sistema di valutazione. Il documento parla di tecnologie innovative e il loro impatto sulla società moderna.';

      const testDocumentId = req.body.documentId || 'test-doc-123';

      // Simula una valutazione di test
      const testResult = {
        overallScore: 75,
        criteria: {
          accuracy: 80,
          clarity: 85,
          completeness: 70,
          coherence: 75,
          fluency: 72,
        },
        feedback: {
          strengths: ['Buona struttura generale', 'Linguaggio chiaro e appropriato'],
          improvements: ['Maggiore dettaglio su alcuni punti', 'Conclusione più incisiva'],
          detailedFeedback: 'Presentazione complessivamente buona con una struttura logica e un linguaggio appropriato. Tuttavia, alcuni punti potrebbero essere sviluppati con maggiore dettaglio per migliorare la completezza dell\'argomentazione.',
        },
        metadata: {
          documentId: testDocumentId,
          transcriptionLength: testTranscription.length,
          relevantChunksUsed: 3,
          evaluatedAt: new Date(),
          processingTime: Math.floor(Math.random() * 2000) + 1000,
        },
      };

      res.json({
        success: true,
        data: {
          evaluation: testResult,
          contextUsed: {
            relevantChunks: 3,
            averageSimilarity: 0.75,
            combinedContextLength: 1500,
          },
          evaluationId: generateEvaluationId(),
          isTestData: true,
        },
        message: 'Test evaluation completed successfully',
      });

    } catch (error) {
      next(error);
    }
  },
};

function generateEvaluationId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `eval_${timestamp}_${random}`;
}