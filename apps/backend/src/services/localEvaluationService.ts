import { OllamaService } from './ollamaService';
import { evaluationConfig } from '../config/ragConfig';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { DocumentChunk } from '@ai-speech-evaluator/shared';
import { ConceptCoherenceService, ConceptCoherenceResult } from './conceptCoherenceService';

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
  conceptCoherence?: ConceptCoherenceResult; // Analisi concettuale dettagliata
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
    documentId: string,
    model?: string
  ): Promise<EvaluationResult> {
    const startTime = Date.now();
    const modelToUse = model || evaluationConfig.model;

    try {
      // Log dei chunk usati per RAG
      logger.info('🔍 RAG Evaluation - Chunks used for evaluation', {
        documentId,
        model: modelToUse,
        totalChunks: relevantChunks.length,
        chunkDetails: relevantChunks.map((chunk, idx) => ({
          index: idx + 1,
          score: chunk.score.toFixed(3),
          contentPreview: chunk.content.substring(0, 100) + '...',
          section: chunk.metadata.section,
          length: chunk.content.length
        })),
        transcriptionLength: transcription.length,
        transcriptionPreview: transcription.substring(0, 150) + '...'
      });

      // Costruisci il contesto rilevante SOLO dai chunk del documento
      const context = relevantChunks
        .map((chunk, index) => `[Sezione ${index + 1} del Documento - Score: ${chunk.score.toFixed(3)}]\n${chunk.content}`)
        .join('\n\n---\n\n');

      logger.info('📄 RAG Context built for evaluation', {
        contextLength: context.length,
        numberOfSections: relevantChunks.length,
        contextPreview: context.substring(0, 200) + '...'
      });

      // Crea il prompt di valutazione
      const evaluationPrompt = this.buildEvaluationPrompt(transcription, context);

      // Genera la valutazione usando Ollama
      logger.info('🤖 Sending evaluation request to Ollama', {
        model: modelToUse,
        promptLength: evaluationPrompt.length,
        systemPromptLength: this.getSystemPrompt().length
      });

      const rawEvaluation = await this.ollamaService!.generateChat(
        evaluationPrompt,
        this.getSystemPrompt(),
        modelToUse  // Pass model parameter
      );

      logger.info('📊 Raw evaluation received from Ollama', {
        responseLength: rawEvaluation.length,
        responsePreview: rawEvaluation.substring(0, 300) + '...'
      });

      // Parse del risultato
      const evaluation = this.parseEvaluationResult(rawEvaluation, documentId, transcription.length, relevantChunks.length);

      // 🧠 ANALISI CONCETTUALE SEMANTICA
      // Analizza la coerenza concettuale tra trascrizione e documento
      logger.info('🧠 Starting concept coherence analysis...');
      try {
        const conceptService = await ConceptCoherenceService.getInstance();
        const conceptAnalysis = await conceptService.analyzeConceptCoherence(
          transcription,
          relevantChunks,
          modelToUse
        );

        evaluation.conceptCoherence = conceptAnalysis;

        // AGGIUSTA IL PUNTEGGIO DI ACCURATEZZA in base alla coerenza concettuale
        // Se i concetti non coincidono, abbassa l'accuratezza
        const conceptFidelity = conceptAnalysis.overallCoherence;

        logger.info('📊 Concept analysis impact on accuracy', {
          originalAccuracy: evaluation.criteria.accuracy,
          conceptFidelity,
          extraConcepts: conceptAnalysis.extraConcepts.length,
          missingConcepts: conceptAnalysis.missingConcepts.length,
          distortedConcepts: conceptAnalysis.distortedConcepts.length
        });

        // SISTEMA DI PENALIZZAZIONE RIGOROSO basato su metriche oggettive
        const { statistics, extraConcepts, missingConcepts, distortedConcepts } = conceptAnalysis;

        // Calcola penalità basate su metriche concrete
        let forcedAccuracy = 100;

        // PENALITÀ 1: Concetti mancanti (non ha parlato di cose importanti del documento)
        const missingPenalty = (missingConcepts.length / statistics.totalDocumentConcepts) * 60;
        forcedAccuracy -= missingPenalty;

        // PENALITÀ 2: Concetti extra (ha aggiunto cose NON nel documento)
        // Questa è la penalità PIÙ SEVERA perché indica che sta inventando
        const extraPenalty = extraConcepts.length * 15; // -15 punti per ogni concetto extra
        forcedAccuracy -= extraPenalty;

        // PENALITÀ 3: Concetti distorti (ha parlato di cose del documento ma in modo sbagliato)
        const distortionPenalty = distortedConcepts.reduce((sum, d) => sum + (d.distortion * 10), 0);
        forcedAccuracy -= distortionPenalty;

        // BONUS: Coverage alta
        if (statistics.coveragePercentage > 90) {
          forcedAccuracy += 5;
        }

        // Limita tra 0 e 100
        forcedAccuracy = Math.max(0, Math.min(100, forcedAccuracy));

        logger.warn('🎯 FORCED ACCURACY CALCULATION', {
          originalLLMAccuracy: evaluation.criteria.accuracy,
          missingConcepts: missingConcepts.length,
          missingPenalty: `-${missingPenalty.toFixed(1)}`,
          extraConcepts: extraConcepts.length,
          extraPenalty: `-${extraPenalty.toFixed(1)}`,
          distortedConcepts: distortedConcepts.length,
          distortionPenalty: `-${distortionPenalty.toFixed(1)}`,
          calculatedAccuracy: forcedAccuracy,
          conceptFidelity
        });

        // USA IL PUNTEGGIO PIÙ BASSO tra quello dell'LLM e quello calcolato
        // Questo previene che l'LLM dia punteggi troppo alti
        const finalAccuracy = Math.min(evaluation.criteria.accuracy, forcedAccuracy);

        const originalAccuracy = evaluation.criteria.accuracy;
        evaluation.criteria.accuracy = finalAccuracy;

        logger.warn(`🔴 ACCURACY ADJUSTED: ${finalAccuracy.toFixed(1)} (LLM said ${originalAccuracy.toFixed(1)}, forced calculation ${forcedAccuracy.toFixed(1)})`);

        // AGGIUSTA ANCHE COMPLETENESS basata sulla coverage dei concetti
        // Se mancano concetti, la completeness DEVE essere bassa
        const forcedCompleteness = statistics.coveragePercentage;
        const originalCompleteness = evaluation.criteria.completeness;
        evaluation.criteria.completeness = Math.min(originalCompleteness, forcedCompleteness);

        if (originalCompleteness !== evaluation.criteria.completeness) {
          logger.warn(`🔴 COMPLETENESS ADJUSTED: ${evaluation.criteria.completeness.toFixed(1)} (LLM said ${originalCompleteness.toFixed(1)}, but coverage is only ${forcedCompleteness.toFixed(1)}%)`);
        }

        // Aggiungi feedback sui concetti mancanti/extra con dettagli
        if (conceptAnalysis.missingConcepts.length > 0) {
          const missingList = conceptAnalysis.missingConcepts.slice(0, 5).join(', ');
          const moreCount = conceptAnalysis.missingConcepts.length > 5 ? ` (+${conceptAnalysis.missingConcepts.length - 5} altri)` : '';
          evaluation.feedback.improvements.push(
            `⚠️ **CONCETTI MANCANTI** (${conceptAnalysis.missingConcepts.length}/${statistics.totalDocumentConcepts}): Non hai menzionato: ${missingList}${moreCount}`
          );
        }

        if (conceptAnalysis.extraConcepts.length > 0) {
          const extraList = conceptAnalysis.extraConcepts.slice(0, 5).join(', ');
          const moreCount = conceptAnalysis.extraConcepts.length > 5 ? ` (+${conceptAnalysis.extraConcepts.length - 5} altri)` : '';
          evaluation.feedback.improvements.push(
            `❌ **CONCETTI NON NEL DOCUMENTO** (${conceptAnalysis.extraConcepts.length}): Hai aggiunto concetti esterni: ${extraList}${moreCount}. ATTENZIONE: Devi parlare SOLO di ciò che è nel documento.`
          );
        }

        if (conceptAnalysis.distortedConcepts.length > 0) {
          const distortedList = conceptAnalysis.distortedConcepts
            .slice(0, 3)
            .map(d => `"${d.documentConcept}" → "${d.transcriptionConcept}"`)
            .join(', ');
          evaluation.feedback.improvements.push(
            `⚠️ **CONCETTI DISTORTI** (${conceptAnalysis.distortedConcepts.length}): Hai modificato i concetti rispetto al documento: ${distortedList}. Mantieni maggiore fedeltà al contenuto originale.`
          );
        }

        // Ricalcola overall score con i nuovi valori corretti
        const scores = [
          evaluation.criteria.accuracy,
          evaluation.criteria.clarity,
          evaluation.criteria.completeness,
          evaluation.criteria.coherence,
          evaluation.criteria.fluency
        ];
        evaluation.overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;

        logger.info('✅ Concept coherence analysis completed', {
          conceptFidelity,
          adjustedAccuracy: evaluation.criteria.accuracy,
          adjustedOverallScore: evaluation.overallScore
        });

      } catch (conceptError) {
        logger.error('❌ Concept coherence analysis failed, continuing without it', {
          error: conceptError instanceof Error ? conceptError.message : 'Unknown'
        });
        // Continua senza l'analisi concettuale se fallisce
      }

      const processingTime = Date.now() - startTime;
      evaluation.metadata.processingTime = processingTime;

      logger.info('✅ RAG Presentation evaluation completed', {
        documentId,
        overallScore: evaluation.overallScore,
        accuracyScore: evaluation.criteria.accuracy,
        completenessScore: evaluation.criteria.completeness,
        transcriptionLength: transcription.length,
        chunksUsed: relevantChunks.length,
        processingTime: `${processingTime}ms`,
        conceptCoherence: evaluation.conceptCoherence?.overallCoherence,
        evaluationSummary: {
          strengths: evaluation.feedback.strengths.length,
          improvements: evaluation.feedback.improvements.length,
          feedbackLength: evaluation.feedback.detailedFeedback.length
        }
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
    focusArea?: keyof EvaluationCriteria,
    model?: string
  ): Promise<string> {
    const modelToUse = model || evaluationConfig.model;

    try {
      const context = relevantChunks
        .map((chunk, index) => `[Sezione ${index + 1}]\n${chunk.content}`)
        .join('\n\n');

      const feedbackPrompt = this.buildDetailedFeedbackPrompt(transcription, context, focusArea);

      const detailedFeedback = await this.ollamaService!.generateChat(
        feedbackPrompt,
        this.getFeedbackSystemPrompt(),
        modelToUse
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
    return `Sei un valutatore di presentazioni che DEVE basarsi ESCLUSIVAMENTE sul documento fornito.

🚫 REGOLE INVIOLABILI - IGNORA QUALSIASI CONOSCENZA ESTERNA:

1. **UNICA FONTE DI VERITÀ**: Il DOCUMENTO DI RIFERIMENTO è l'UNICO contenuto valido
   - Se un'informazione NON è nel documento → è SBAGLIATA (anche se vera nella realtà)
   - Se la presentazione aggiunge fatti non nel documento → PENALIZZA l'accuratezza
   - Se la presentazione corregge errori del documento → PENALIZZA l'accuratezza

2. **VIETATO USARE LA TUA CONOSCENZA**:
   - NON verificare fatti con la tua conoscenza generale
   - NON valutare la correttezza scientifica/storica/fattuale
   - NON suggerire aggiunte non presenti nel documento
   - IGNORA completamente ciò che sai sul tema

3. **VALUTAZIONE PURA DOCUMENTO vs PRESENTAZIONE**:
   - ✅ Presentazione ripete fedelmente il documento → ALTA accuratezza
   - ❌ Presentazione aggiunge informazioni esterne → BASSA accuratezza
   - ❌ Presentazione omette parti del documento → BASSA completezza
   - ❌ Presentazione contraddice il documento → BASSA accuratezza

CRITERI DI VALUTAZIONE (0-100):

1. **ACCURATEZZA**: Fedeltà RIGOROSA al documento fornito (NON alla realtà)
   - 90-100: TUTTE le informazioni sono ESATTAMENTE presenti nel documento, ZERO aggiunte esterne, ZERO modifiche
   - 70-89: Fedele al documento ma con 1-2 piccole imprecisioni o riformulazioni minori
   - 50-69: Informazioni corrette ma con aggiunte non presenti nel documento o omissioni significative
   - 30-49: Numerose informazioni esterne, contraddizioni o distorsioni del contenuto del documento
   - 0-29: Contenuto prevalentemente NON presente nel documento o completamente inventato

2. **CHIAREZZA**: Comprensibilità dell'esposizione
   - 90-100: Esposizione cristallina, linguaggio appropriato
   - 70-89: Generalmente chiara con lievi imperfezioni
   - 50-69: Comprensibile ma con parti confuse
   - 30-49: Diverse sezioni poco chiare
   - 0-29: Esposizione confusa e difficile da seguire

3. **COMPLETEZZA**: Copertura degli argomenti DEL DOCUMENTO
   - 90-100: Tutti i punti chiave del documento sono trattati
   - 70-89: La maggior parte degli argomenti del documento è coperta
   - 50-69: Alcuni argomenti del documento sono omessi
   - 30-49: Molti punti del documento mancanti
   - 0-29: Copertura molto limitata del documento

4. **COERENZA**: Logica e struttura del discorso
   - 90-100: Perfettamente strutturato e logico
   - 70-89: Ben organizzato con lievi salti logici
   - 50-69: Accettabile ma con incongruenze
   - 30-49: Poco chiaro o contraddittorio
   - 0-29: Disorganizzato e incoerente

5. **FLUENCY**: Naturalezza dell'esposizione
   - 90-100: Parlato naturale e scorrevole
   - 70-89: Generalmente fluido con esitazioni minori
   - 50-69: Accettabile ma con interruzioni frequenti
   - 30-49: Frammentato o innaturale
   - 0-29: Molto difficile da seguire

⚠️ ESEMPIO CRITICO:
- Documento dice: "Il cielo è verde"
- Presentazione dice: "Il cielo è blu"
- Valutazione: BASSA accuratezza (anche se "blu" è corretto nella realtà, NON è nel documento)

Rispondi SOLO con JSON valido (nessun testo aggiuntivo):
{
  "accuratezza": <0-100>,
  "chiarezza": <0-100>,
  "completezza": <0-100>,
  "coerenza": <0-100>,
  "fluency": <0-100>,
  "punti_forza": ["punto1", "punto2", "punto3"],
  "miglioramenti": ["area1", "area2", "area3"],
  "feedback_dettagliato": "Analisi dettagliata..."
}`;
  }

  private getFeedbackSystemPrompt(): string {
    return `Sei un coach di presentazioni che valuta ESCLUSIVAMENTE l'aderenza al documento fornito.

🚫 REGOLE ASSOLUTE - IL DOCUMENTO È L'UNICA VERITÀ:

1. **NON ESISTONO INFORMAZIONI FUORI DAL DOCUMENTO**:
   - Se non è nel documento → NON deve essere nella presentazione
   - Se la presentazione aggiunge fatti → è UN ERRORE (anche se veri)
   - Il documento fornito è l'UNICO riferimento valido

2. **IGNORA LA TUA CONOSCENZA GENERALE**:
   - NON valutare la correttezza scientifica/storica/fattuale
   - NON suggerire aggiunte di informazioni esterne
   - NON lodare "conoscenze aggiuntive" portate dallo speaker
   - Valuta SOLO: documento → presentazione

3. **FEEDBACK DEVE CONCENTRARSI SU**:
   ✅ Fedeltà al documento (riproduzione accurata del contenuto)
   ✅ Completezza (copertura di tutti i punti del documento)
   ✅ Chiarezza espositiva (come è spiegato il contenuto del documento)
   ✅ Struttura logica (come sono organizzati i punti del documento)
   ✅ Fluidità del parlato

   ❌ NON suggerire di aggiungere informazioni non nel documento
   ❌ NON lodare "approfondimenti" esterni al documento
   ❌ NON correggere il documento con la tua conoscenza

⚠️ ESEMPIO:
- Documento: "I gatti hanno 3 zampe"
- Presentazione: "I gatti hanno 4 zampe"
- Feedback corretto: "❌ Errore: hai detto 4 zampe, ma il documento specifica 3 zampe"
- Feedback SBAGLIATO: "✅ Bravo, hai corretto l'errore del documento"

Il feedback deve essere:
- Specifico e pratico
- Costruttivo ma rigoroso sull'aderenza al documento
- Focalizzato su come riprodurre meglio il contenuto del documento
- In italiano, tono professionale

RICORDA: Il documento fornito è la SOLA fonte di verità per questa valutazione.`;
  }

  private buildEvaluationPrompt(transcription: string, context: string): string {
    return `🎯 COMPITO: Confronta la PRESENTAZIONE con il DOCUMENTO e valuta l'aderenza.

⛔ VINCOLO ASSOLUTO: Il documento qui sotto è l'UNICA fonte di verità. Ignora qualsiasi tua conoscenza sul tema.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 DOCUMENTO DI RIFERIMENTO (UNICA FONTE DI VERITÀ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${context}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎤 PRESENTAZIONE DA VALUTARE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${transcription}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 ISTRUZIONI DI VALUTAZIONE:

1. **ACCURATEZZA (0-100)** - Fedeltà RIGOROSA ed ESCLUSIVA al documento:
   • OGNI SINGOLA informazione nella presentazione DEVE essere ESATTAMENTE nel documento
   • Se c'è anche UN SOLO fatto/concetto/numero NON presente nel documento → max 60/100
   • Se ci sono 2-3 fatti non presenti nel documento → max 40/100
   • Se ci sono molti fatti non presenti o inventati → max 20/100
   • Se la presentazione aggiunge conoscenze esterne (anche se vere) → PENALIZZA SEVERAMENTE
   • Se la presentazione "corregge" errori del documento → è UN GRAVE ERRORE, penalizza fortemente
   • Se la presentazione contraddice il documento su QUALSIASI punto → max 30/100

   ⚠️ SEVERITÀ MASSIMA: Sii ESTREMAMENTE rigoroso nel valutare l'accuratezza. Il documento è l'UNICA verità.

2. **CHIAREZZA (0-100)** - Comprensibilità:
   • Quanto è chiara l'esposizione del contenuto del documento
   • Linguaggio appropriato e comprensibile

3. **COMPLETEZZA (0-100)** - Copertura del documento:
   • Quanti argomenti DEL DOCUMENTO sono stati trattati
   • NON conta aggiungere argomenti non nel documento

4. **COERENZA (0-100)** - Struttura logica:
   • Organizzazione del discorso
   • Flusso logico tra le parti

5. **FLUENCY (0-100)** - Naturalezza:
   • Fluidità del parlato
   • Assenza di interruzioni eccessive

⚠️ SEVERITÀ ESTREMA - LEGGI ATTENTAMENTE:

🔴 PENALIZZAZIONI SEVERE per l'accuratezza:
- Anche UNA SOLA informazione non nel documento → MASSIMO 60/100 in accuratezza
- Due-tre informazioni non nel documento → MASSIMO 40/100 in accuratezza
- Molte informazioni inventate/esterne → MASSIMO 20/100 in accuratezza
- Contraddizioni con il documento → MASSIMO 30/100 in accuratezza

🔴 ESEMPI di cosa PENALIZZARE SEVERAMENTE:
- Presentazione: "La Terra è blu" quando documento dice "La Terra è rossa" → ERRORE GRAVE
- Presentazione aggiunge dettagli non nel documento (anche se veri) → ERRORE
- Presentazione spiega meglio/corregge il documento → ERRORE (deve ripetere fedelmente)
- Presentazione usa sinonimi che cambiano significato → PENALIZZA
- Presentazione interpreta invece di citare → PENALIZZA

✅ ALTA accuratezza SOLO se:
- Riproduzione ESATTA del contenuto del documento
- ZERO aggiunte, ZERO interpretazioni, ZERO correzioni
- Fedeltà letterale ai fatti presentati nel documento

📊 METODO DI VALUTAZIONE:
1. Identifica OGNI affermazione nella presentazione
2. Per CIASCUNA affermazione, verifica se è ESATTAMENTE nel documento
3. Conta le affermazioni NON presenti nel documento
4. Applica le penalizzazioni sopra indicate

🚨 SII RIGOROSO: In caso di dubbio, PENALIZZA. È meglio essere troppo severi che troppo indulgenti.

Restituisci SOLO il JSON (nessun testo extra).`;
  }

  private buildDetailedFeedbackPrompt(
    transcription: string,
    context: string,
    focusArea?: keyof EvaluationCriteria
  ): string {
    let prompt = `🎯 COMPITO: Fornisci feedback per migliorare l'aderenza della presentazione al documento.

⛔ REGOLA CRITICA: Il documento fornito è l'UNICA fonte valida. NON esistono informazioni al di fuori di esso.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 DOCUMENTO DI RIFERIMENTO (UNICA FONTE DI VERITÀ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${context}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎤 PRESENTAZIONE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${transcription}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

    if (focusArea) {
      const focusAreaInstructions = {
        accuracy: `🎯 FOCUS: ADERENZA AL DOCUMENTO

Analizza OGNI informazione nella presentazione:
- ✅ Se è nel documento → ottimo
- ❌ Se NON è nel documento → è un errore, anche se vera
- ❌ Se "corregge" il documento → è un errore, deve ripetere fedelmente

Suggerisci come rimanere più fedeli al documento fornito.`,

        clarity: `🎯 FOCUS: CHIAREZZA ESPOSITIVA

Analizza come vengono spiegate le informazioni DEL DOCUMENTO:
- La terminologia del documento è usata correttamente?
- La spiegazione rende chiaro il contenuto del documento?
- La struttura aiuta a comprendere il documento?`,

        completeness: `🎯 FOCUS: COMPLETEZZA RISPETTO AL DOCUMENTO

Verifica quali parti DEL DOCUMENTO sono state coperte:
- Quali sezioni del documento sono state trattate?
- Quali parti del documento mancano?
- Suggerisci di coprire meglio il contenuto del documento (NON di aggiungere altro)`,

        coherence: `🎯 FOCUS: COERENZA LOGICA

Analizza l'organizzazione della presentazione:
- La sequenza degli argomenti è logica?
- Le transizioni tra le parti sono chiare?
- La struttura riflette l'organizzazione del documento?`,

        fluency: `🎯 FOCUS: FLUIDITÀ DELL'ESPOSIZIONE

Analizza la naturalezza del parlato:
- Il ritmo è appropriato?
- Ci sono troppe esitazioni o interruzioni?
- Il parlato scorre in modo naturale?`
      };

      prompt += `${focusAreaInstructions[focusArea]}

`;
    }

    prompt += `📋 ISTRUZIONI PER IL FEEDBACK:

✅ FEEDBACK CORRETTO:
- "Hai menzionato X, che non è presente nel documento - attieniti solo al contenuto fornito"
- "Manca la sezione Y del documento - assicurati di coprirla"
- "Hai spiegato bene il concetto Z presente nel documento"

❌ FEEDBACK SBAGLIATO (NON fare così):
- "Potresti aggiungere informazioni su..." (se non nel documento)
- "Sarebbe utile approfondire con..." (se fonte esterna)
- "Hai corretto bene l'errore del documento" (deve ripetere fedelmente)

🎯 OBIETTIVO: Aiutare a riprodurre fedelmente il documento, NON a migliorarlo o integrarlo.

Fornisci feedback specifico, pratico e costruttivo in italiano (5-7 frasi).`;

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