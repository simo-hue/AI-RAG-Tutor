import { OllamaService } from './ollamaService';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { DocumentChunk } from '@ai-speech-evaluator/shared';

/**
 * Rappresenta un concetto estratto dal testo
 */
interface ExtractedConcept {
  concept: string;          // Il concetto identificato
  context: string;          // Contesto in cui appare
  importance: number;       // Importanza del concetto (0-1)
  sentences: string[];      // Frasi che esprimono questo concetto
}

/**
 * Risultato del confronto tra concetti
 */
interface ConceptMatch {
  documentConcept: string;
  transcriptionConcept: string;
  semanticSimilarity: number;  // 0-1: quanto sono semanticamente simili
  isPresent: boolean;          // Se il concetto del documento è presente nella trascrizione
  distortion: number;          // 0-1: quanto è distorto il concetto
}

/**
 * Risultato dell'analisi di coerenza concettuale
 */
export interface ConceptCoherenceResult {
  overallCoherence: number;           // 0-100: coerenza complessiva
  conceptMatches: ConceptMatch[];     // Confronto dettagliato dei concetti
  documentConcepts: ExtractedConcept[]; // Concetti trovati nel documento
  transcriptionConcepts: ExtractedConcept[]; // Concetti trovati nella trascrizione
  missingConcepts: string[];          // Concetti del documento mancanti
  extraConcepts: string[];            // Concetti nella trascrizione non nel documento
  distortedConcepts: ConceptMatch[];  // Concetti distorti/modificati
  statistics: {
    totalDocumentConcepts: number;
    matchedConcepts: number;
    missingConcepts: number;
    extraConcepts: number;
    averageSimilarity: number;
    coveragePercentage: number;       // % dei concetti del documento coperti
    fidelityScore: number;            // Score di fedeltà (tiene conto delle distorsioni)
  };
}

/**
 * Servizio per l'analisi semantica della coerenza concettuale
 * Confronta i concetti espressi nella trascrizione con quelli del documento
 */
export class ConceptCoherenceService {
  private ollamaService: OllamaService;
  private static instance: ConceptCoherenceService | null = null;

  private constructor(ollamaService: OllamaService) {
    this.ollamaService = ollamaService;
  }

  static async getInstance(): Promise<ConceptCoherenceService> {
    if (!this.instance) {
      const ollamaService = await OllamaService.getInstance();
      this.instance = new ConceptCoherenceService(ollamaService);
      logger.info('Concept Coherence Service initialized');
    }
    return this.instance;
  }

  /**
   * Analizza la coerenza concettuale tra trascrizione e documento
   */
  async analyzeConceptCoherence(
    transcription: string,
    documentChunks: Array<{
      content: string;
      score: number;
      metadata: DocumentChunk['metadata'];
    }>,
    model?: string
  ): Promise<ConceptCoherenceResult> {
    const startTime = Date.now();

    try {
      logger.info('🧠 Starting concept coherence analysis', {
        transcriptionLength: transcription.length,
        documentChunks: documentChunks.length
      });

      // Combina i chunk del documento
      const documentText = documentChunks.map(c => c.content).join('\n\n');

      // 1. Estrai concetti dal documento
      logger.info('📄 Extracting concepts from document...');
      const documentConcepts = await this.extractConcepts(documentText, 'documento', model);
      logger.info(`✅ Extracted ${documentConcepts.length} concepts from document`);

      // 2. Estrai concetti dalla trascrizione
      logger.info('🎤 Extracting concepts from transcription...');
      const transcriptionConcepts = await this.extractConcepts(transcription, 'trascrizione', model);
      logger.info(`✅ Extracted ${transcriptionConcepts.length} concepts from transcription`);

      // 3. Confronta i concetti semanticamente
      logger.info('🔍 Comparing concepts semantically...');
      const conceptMatches = await this.compareConceptsSemantically(
        documentConcepts,
        transcriptionConcepts,
        model
      );

      // 4. Identifica concetti mancanti, extra e distorti
      const { missing, extra, distorted } = this.categorizeConceptDifferences(
        conceptMatches,
        documentConcepts,
        transcriptionConcepts
      );

      // 5. Calcola statistiche e score
      const statistics = this.calculateStatistics(
        conceptMatches,
        documentConcepts,
        transcriptionConcepts,
        missing.length,
        extra.length
      );

      const processingTime = Date.now() - startTime;

      logger.info('✅ Concept coherence analysis completed', {
        processingTime: `${processingTime}ms`,
        overallCoherence: statistics.fidelityScore,
        documentConcepts: documentConcepts.length,
        transcriptionConcepts: transcriptionConcepts.length,
        matched: statistics.matchedConcepts,
        missing: missing.length,
        extra: extra.length,
        distorted: distorted.length
      });

      return {
        overallCoherence: statistics.fidelityScore,
        conceptMatches,
        documentConcepts,
        transcriptionConcepts,
        missingConcepts: missing,
        extraConcepts: extra,
        distortedConcepts: distorted,
        statistics
      };

    } catch (error) {
      logger.error('Failed to analyze concept coherence', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transcriptionLength: transcription?.length,
        documentChunks: documentChunks?.length
      });
      throw new AppError('Concept coherence analysis failed', 500);
    }
  }

  /**
   * Estrae i concetti principali da un testo usando Ollama
   */
  private async extractConcepts(
    text: string,
    sourceType: string,
    model?: string
  ): Promise<ExtractedConcept[]> {
    const prompt = `Analizza il seguente testo ed estrai TUTTI i concetti principali discussi.

Per ogni concetto, fornisci:
1. Il nome del concetto (breve, max 5 parole)
2. Una frase che lo descrive nel contesto
3. Un punteggio di importanza (0.0-1.0) basato su quanto è centrale nel testo

TESTO DA ANALIZZARE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${text}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ISTRUZIONI:
- Estrai TUTTI i concetti significativi, anche quelli meno centrali
- Sii specifico: preferisci "fotosintesi clorofilliana" a "processo biologico"
- Cattura sfumature e dettagli specifici del testo
- Includi sia concetti principali che secondari
- Ogni concetto deve essere unico e distinto

Restituisci SOLO un JSON array in questo formato (nessun testo extra):
[
  {
    "concept": "nome del concetto",
    "context": "breve descrizione contestuale",
    "importance": 0.9,
    "sentences": ["frase dove appare il concetto"]
  }
]`;

    try {
      const response = await this.ollamaService.generateChat(
        prompt,
        `Sei un esperto di analisi concettuale. Estrai concetti in modo preciso e granulare. Restituisci SOLO JSON valido, nessun testo extra.`,
        model
      );

      // Parse del JSON
      const cleanedResponse = this.cleanJSONResponse(response);
      const concepts: ExtractedConcept[] = JSON.parse(cleanedResponse);

      logger.info(`Extracted concepts from ${sourceType}`, {
        count: concepts.length,
        topConcepts: concepts.slice(0, 3).map(c => c.concept)
      });

      return concepts;

    } catch (error) {
      logger.error(`Failed to extract concepts from ${sourceType}`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Fallback: estrazione basica se l'LLM fallisce
      return this.extractConceptsFallback(text);
    }
  }

  /**
   * Confronta semanticamente i concetti usando embeddings e analisi LLM
   */
  private async compareConceptsSemantically(
    documentConcepts: ExtractedConcept[],
    transcriptionConcepts: ExtractedConcept[],
    model?: string
  ): Promise<ConceptMatch[]> {
    const matches: ConceptMatch[] = [];

    for (const docConcept of documentConcepts) {
      // Trova il concetto più simile nella trascrizione
      let bestMatch: ConceptMatch | null = null;
      let highestSimilarity = 0;

      for (const transConcept of transcriptionConcepts) {
        const similarity = await this.calculateSemanticSimilarity(
          docConcept,
          transConcept,
          model
        );

        if (similarity > highestSimilarity) {
          highestSimilarity = similarity;
          bestMatch = {
            documentConcept: docConcept.concept,
            transcriptionConcept: transConcept.concept,
            semanticSimilarity: similarity,
            isPresent: similarity >= 0.6, // Soglia di presenza
            distortion: this.calculateDistortion(similarity, docConcept, transConcept)
          };
        }
      }

      if (bestMatch) {
        matches.push(bestMatch);
      } else {
        // Concetto del documento non trovato
        matches.push({
          documentConcept: docConcept.concept,
          transcriptionConcept: '',
          semanticSimilarity: 0,
          isPresent: false,
          distortion: 1.0
        });
      }
    }

    return matches;
  }

  /**
   * Calcola la similarità semantica tra due concetti
   */
  private async calculateSemanticSimilarity(
    concept1: ExtractedConcept,
    concept2: ExtractedConcept,
    model?: string
  ): Promise<number> {
    // Usa l'LLM per valutare la similarità semantica
    const prompt = `Confronta questi due concetti e valuta quanto sono semanticamente simili.

CONCETTO 1: "${concept1.concept}"
Contesto: ${concept1.context}

CONCETTO 2: "${concept2.concept}"
Contesto: ${concept2.context}

Valuta:
1. Esprimono lo stesso concetto? (anche se con parole diverse)
2. Quanto è precisa la corrispondenza?
3. Ci sono distorsioni o modifiche significative?

Rispondi SOLO con un numero da 0.0 a 1.0 dove:
- 1.0 = concetti identici o perfettamente equivalenti
- 0.8-0.9 = concetti molto simili, stessa essenza
- 0.6-0.7 = concetti correlati ma con differenze
- 0.4-0.5 = concetti vagamente correlati
- 0.0-0.3 = concetti diversi o non correlati

Restituisci SOLO il numero (es: 0.85)`;

    try {
      const response = await this.ollamaService.generateChat(
        prompt,
        'Sei un esperto di analisi semantica. Valuta la similarità concettuale con precisione. Rispondi SOLO con un numero.',
        model
      );

      const similarity = parseFloat(response.trim());
      return isNaN(similarity) ? 0 : Math.min(1.0, Math.max(0.0, similarity));

    } catch (error) {
      logger.warn('Failed to calculate semantic similarity, using fallback', {
        error: error instanceof Error ? error.message : 'Unknown'
      });
      // Fallback: similarità basata su sovrapposizione di parole
      return this.calculateWordOverlapSimilarity(concept1.concept, concept2.concept);
    }
  }

  /**
   * Calcola la distorsione del concetto
   */
  private calculateDistortion(
    similarity: number,
    docConcept: ExtractedConcept,
    transConcept: ExtractedConcept
  ): number {
    // Distorsione alta se:
    // - Bassa similarità ma concetti correlati (cambio di significato)
    // - Concetto importante nel documento ma poco fedele
    if (similarity < 0.6) {
      return 0.8 + (1.0 - similarity) * 0.2;
    } else if (similarity < 0.8) {
      return (1.0 - similarity) * docConcept.importance;
    }
    return 0; // Nessuna distorsione significativa
  }

  /**
   * Categorizza le differenze tra concetti
   */
  private categorizeConceptDifferences(
    matches: ConceptMatch[],
    documentConcepts: ExtractedConcept[],
    transcriptionConcepts: ExtractedConcept[]
  ): {
    missing: string[];
    extra: string[];
    distorted: ConceptMatch[];
  } {
    const missing = matches
      .filter(m => !m.isPresent)
      .map(m => m.documentConcept);

    const matchedTransConcepts = new Set(
      matches
        .filter(m => m.isPresent)
        .map(m => m.transcriptionConcept)
    );

    const extra = transcriptionConcepts
      .filter(tc => !matchedTransConcepts.has(tc.concept))
      .map(tc => tc.concept);

    const distorted = matches.filter(m => m.distortion > 0.3);

    return { missing, extra, distorted };
  }

  /**
   * Calcola le statistiche finali
   */
  private calculateStatistics(
    matches: ConceptMatch[],
    documentConcepts: ExtractedConcept[],
    transcriptionConcepts: ExtractedConcept[],
    missingCount: number,
    extraCount: number
  ): ConceptCoherenceResult['statistics'] {
    const matchedConcepts = matches.filter(m => m.isPresent).length;
    const totalDocumentConcepts = documentConcepts.length;

    const averageSimilarity = matches.length > 0
      ? matches.reduce((sum, m) => sum + m.semanticSimilarity, 0) / matches.length
      : 0;

    const coveragePercentage = totalDocumentConcepts > 0
      ? (matchedConcepts / totalDocumentConcepts) * 100
      : 0;

    // Fidelity score: penalizza concetti mancanti, extra e distorti
    let fidelityScore = coveragePercentage;

    // Penalità per concetti extra (informazioni non nel documento)
    const extraPenalty = (extraCount / (totalDocumentConcepts || 1)) * 30;
    fidelityScore -= extraPenalty;

    // Penalità per distorsioni
    const distortionPenalty = matches
      .filter(m => m.isPresent)
      .reduce((sum, m) => sum + m.distortion * 10, 0) / (matchedConcepts || 1);
    fidelityScore -= distortionPenalty;

    // Bonus per alta similarità media
    if (averageSimilarity > 0.8) {
      fidelityScore += 5;
    }

    fidelityScore = Math.max(0, Math.min(100, fidelityScore));

    return {
      totalDocumentConcepts,
      matchedConcepts,
      missingConcepts: missingCount,
      extraConcepts: extraCount,
      averageSimilarity,
      coveragePercentage,
      fidelityScore
    };
  }

  /**
   * Fallback per estrazione concetti quando LLM fallisce
   */
  private extractConceptsFallback(text: string): ExtractedConcept[] {
    // Estrazione semplice basata su frasi
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 10).map((sentence, idx) => ({
      concept: sentence.trim().substring(0, 50),
      context: sentence.trim(),
      importance: 1.0 - (idx * 0.1),
      sentences: [sentence.trim()]
    }));
  }

  /**
   * Fallback per calcolo similarità
   */
  private calculateWordOverlapSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const words1Array = Array.from(words1);
    const words2Array = Array.from(words2);

    const intersection = new Set(words1Array.filter(w => words2.has(w)));
    const union = new Set(words1Array.concat(words2Array));

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Pulisce la risposta JSON dall'LLM
   */
  private cleanJSONResponse(response: string): string {
    // Rimuovi markdown code blocks
    let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Trova il primo [ e l'ultimo ]
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');

    if (firstBracket !== -1 && lastBracket !== -1) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    }

    return cleaned.trim();
  }
}
