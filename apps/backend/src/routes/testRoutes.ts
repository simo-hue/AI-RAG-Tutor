import { Router } from 'express';
import { healthLimiter } from '../middleware/rateLimiter';
import { DocumentService, RAGServiceManager } from '../services/ragService';
import { EvaluationServiceManager } from '../services/evaluationService';
import { logger } from '../utils/logger';

const router = Router();

// Test endpoint per simulare il flusso completo
router.post('/simulate-evaluation', healthLimiter, async (req, res) => {
  const testDocumentPath = '/Users/simo/Downloads/AI-RAG-Tutor/apps/backend/uploads/document-1758893187300-24808871.txt';
  const testDocumentId = 'doc_test_simulation';
  const testTranscription = 'Immagina la terra come un enorme sfera Rossa pulsante che ruota lenta nello spazio';

  try {
    console.log('🧪 === INIZIO SIMULAZIONE COMPLETA ===');

    // Step 1: Inizializza servizi
    console.log('🧪 Step 1: Inizializzazione servizi...');
    const ragService = await RAGServiceManager.getInstance();
    const documentService = new DocumentService(ragService);
    const evaluationService = new EvaluationServiceManager(documentService);

    // Step 2: Processa documento (simula upload)
    console.log('🧪 Step 2: Processamento documento...');
    const processingResult = await documentService.processDocument(testDocumentPath, testDocumentId);
    console.log('🧪 Step 2 - Risultato processamento:', {
      documentId: processingResult.documentId,
      filename: processingResult.filename,
      wordCount: processingResult.wordCount,
      chunkCount: processingResult.chunkCount
    });

    // Step 3: Verifica stats documento
    console.log('🧪 Step 3: Verifica statistiche documento...');
    const stats = await documentService.getDocumentStats(testDocumentId);
    console.log('🧪 Step 3 - Stats documento:', stats);

    // Step 4: Test ricerca similarità
    console.log('🧪 Step 4: Test ricerca similarità...');
    const searchResults = await documentService.searchSimilarContent(testTranscription, testDocumentId, 5);
    console.log('🧪 Step 4 - Risultati ricerca:', {
      resultsCount: searchResults.length,
      topScores: searchResults.map(r => ({ score: r.score, preview: r.content.substring(0, 50) + '...' }))
    });

    // Step 5: Test contesto rilevante
    console.log('🧪 Step 5: Test estrazione contesto rilevante...');
    const contextResult = await documentService.getRelevantContext(testTranscription, testDocumentId, 3);
    console.log('🧪 Step 5 - Contesto rilevante:', {
      chunksFound: contextResult.relevantChunks.length,
      totalScore: contextResult.totalScore,
      contextLength: contextResult.combinedContext.length,
      scores: contextResult.relevantChunks.map(c => c.score)
    });

    // Step 6: Test valutazione completa
    console.log('🧪 Step 6: Test valutazione completa...');
    const evaluationResult = await evaluationService.evaluatePresentation(testTranscription, testDocumentId);
    console.log('🧪 Step 6 - Risultato valutazione:', {
      overallScore: evaluationResult.evaluation.overallScore,
      criteria: evaluationResult.evaluation.criteria,
      contextUsed: evaluationResult.contextUsed
    });

    console.log('🧪 === SIMULAZIONE COMPLETATA CON SUCCESSO ===');

    res.json({
      success: true,
      message: 'Simulazione completata con successo',
      results: {
        processing: processingResult,
        stats,
        search: {
          resultsCount: searchResults.length,
          topScores: searchResults.map(r => r.score)
        },
        context: {
          chunksFound: contextResult.relevantChunks.length,
          totalScore: contextResult.totalScore,
          scores: contextResult.relevantChunks.map(c => c.score)
        },
        evaluation: {
          overallScore: evaluationResult.evaluation.overallScore,
          criteria: evaluationResult.evaluation.criteria,
          contextUsed: evaluationResult.contextUsed
        }
      }
    });

  } catch (error) {
    console.error('🧪 ❌ ERRORE NELLA SIMULAZIONE:', error);

    res.status(500).json({
      success: false,
      message: 'Errore durante la simulazione',
      error: error.message,
      stack: error.stack
    });
  }
});

// Test endpoint per verificare stato dei servizi
router.get('/services-status', healthLimiter, async (req, res) => {
  try {
    const ragService = await RAGServiceManager.getInstance();
    const ragHealth = await RAGServiceManager.healthCheck();

    const documentService = new DocumentService(ragService);
    const evaluationService = new EvaluationServiceManager(documentService);
    const evalHealth = await evaluationService.healthCheck();

    res.json({
      success: true,
      services: {
        rag: ragHealth,
        evaluation: evalHealth
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test endpoint per verificare vector store
router.get('/vector-store-status', healthLimiter, async (req, res) => {
  try {
    const ragService = await RAGServiceManager.getInstance();
    const stats = await ragService.getVectorDBStats();

    res.json({
      success: true,
      vectorStore: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug endpoint per vedere le chiavi del vector store
router.get('/vector-store-keys', healthLimiter, async (req, res) => {
  try {
    const ragService = await RAGServiceManager.getInstance();
    const vectorStore = ragService.vectorStore;

    const keys = Array.from(vectorStore.keys());
    const documents = Array.from(vectorStore.values()).map(doc => ({
      id: doc.id,
      documentId: doc.metadata?.documentId,
      chunkId: doc.metadata?.chunkId,
      contentPreview: doc.content.substring(0, 100) + '...'
    }));

    res.json({
      success: true,
      vectorStore: {
        totalKeys: keys.length,
        keys: keys,
        documents: documents
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export { router as testRoutes };