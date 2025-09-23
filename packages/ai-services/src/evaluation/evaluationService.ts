import OpenAI from 'openai';
import { RAGSearchResult } from '../rag/ragService';

export interface EvaluationCriteria {
  accuracy: number; // 0-100: Quanto il contenuto riflette il documento
  clarity: number; // 0-100: Chiarezza dell'esposizione
  completeness: number; // 0-100: Completezza degli argomenti trattati
  coherence: number; // 0-100: Coerenza logica del discorso
  fluency: number; // 0-100: Fluency e naturalezza del parlato
}

export interface EvaluationResult {
  overallScore: number; // 0-100: Punteggio complessivo
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
  };
}

export interface EvaluationConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  language?: 'italian' | 'english';
}

export class EvaluationService {
  private openai: OpenAI;
  private readonly defaultConfig: Required<EvaluationConfig> = {
    model: 'gpt-4-turbo-preview',
    temperature: 0.3,
    maxTokens: 2000,
    language: 'italian',
  };

  constructor(apiKey: string, private config: EvaluationConfig = {}) {
    this.openai = new OpenAI({ apiKey });
    this.config = { ...this.defaultConfig, ...config };
  }

  async evaluatePresentation(
    transcription: string,
    relevantContext: RAGSearchResult[],
    documentId: string
  ): Promise<EvaluationResult> {
    if (!transcription.trim()) {
      throw new Error('Transcription cannot be empty');
    }

    if (relevantContext.length === 0) {
      throw new Error('No relevant context provided for evaluation');
    }

    try {
      const prompt = this.buildEvaluationPrompt(transcription, relevantContext);

      const response = await this.openai.chat.completions.create({
        model: this.config.model!,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: this.config.temperature!,
        max_tokens: this.config.maxTokens!,
      });

      const evaluation = this.parseEvaluationResponse(response.choices[0].message.content || '');

      return {
        ...evaluation,
        metadata: {
          documentId,
          transcriptionLength: transcription.length,
          relevantChunksUsed: relevantContext.length,
          evaluatedAt: new Date(),
        },
      };

    } catch (error) {
      console.error('Error during evaluation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Evaluation failed: ${errorMessage}`);
    }
  }

  private getSystemPrompt(): string {
    const language = this.config.language === 'italian' ? 'italiano' : 'English';

    return `Sei un valutatore esperto di presentazioni orali. Il tuo compito è analizzare una trascrizione di una presentazione confrontandola con il contenuto del documento di riferimento.

CRITERI DI VALUTAZIONE (punteggio 0-100 per ciascuno):

1. **ACCURATEZZA** (0-100): Quanto il contenuto della presentazione riflette fedelmente le informazioni del documento
   - 90-100: Informazioni perfettamente allineate, nessun errore factuale
   - 70-89: Informazioni generalmente corrette, errori minori
   - 50-69: Alcune imprecisioni o omissioni significative
   - 30-49: Diverse informazioni scorrette o fuorvianti
   - 0-29: Contenuto largamente inaccurato o non correlato

2. **CHIAREZZA** (0-100): Chiarezza dell'esposizione e comprensibilità
   - 90-100: Esposizione cristallina, terminologia appropriata
   - 70-89: Generalmente chiaro, qualche passaggio poco fluido
   - 50-69: Comprensibile ma con alcuni punti confusi
   - 30-49: Diverse parti poco chiare o ambigue
   - 0-29: Esposizione confusa e difficile da seguire

3. **COMPLETEZZA** (0-100): Copertura degli argomenti chiave del documento
   - 90-100: Tutti i punti principali sono stati trattati
   - 70-89: La maggior parte degli argomenti chiave è presente
   - 50-69: Alcuni argomenti importanti sono stati omessi
   - 30-49: Molti punti chiave mancanti
   - 0-29: Copertura molto limitata degli argomenti

4. **COERENZA** (0-100): Logica e struttura del discorso
   - 90-100: Discorso perfettamente strutturato e logico
   - 70-89: Buona organizzazione con qualche salto logico minore
   - 50-69: Struttura accettabile ma con alcune incongruenze
   - 30-49: Organizzazione poco chiara o contraddizioni
   - 0-29: Discorso disorganizzato e incoerente

5. **FLUENCY** (0-100): Naturalezza e fluidity del parlato
   - 90-100: Parlato naturale e scorrevole
   - 70-89: Generalmente fluido con qualche esitazione
   - 50-69: Accettabile ma con interruzioni frequenti
   - 30-49: Parlato frammentato o innaturale
   - 0-29: Molto difficile da seguire per problemi di fluency

PUNTEGGIO COMPLESSIVO: Media ponderata dei criteri (puoi assegnare pesi diversi in base al contesto).

FEEDBACK:
- Fornisci 2-3 punti di forza specifici
- Indica 2-3 aree di miglioramento concrete
- Scrivi un feedback dettagliato di 3-4 frasi

Rispondi in ${language} con il formato JSON specificato.`;
  }

  private buildEvaluationPrompt(transcription: string, relevantContext: RAGSearchResult[]): string {
    const contextText = relevantContext
      .map((chunk, index) => `[Sezione ${index + 1} - Score: ${chunk.score.toFixed(3)}]\n${chunk.content}`)
      .join('\n\n---\n\n');

    return `
DOCUMENTO DI RIFERIMENTO:
${contextText}

---

TRASCRIZIONE DELLA PRESENTAZIONE:
${transcription}

---

COMPITO:
Valuta la presentazione basandoti sui 5 criteri specificati nel prompt di sistema. Confronta attentamente il contenuto della trascrizione con le informazioni del documento di riferimento.

Fornisci la valutazione nel seguente formato JSON:

{
  "overallScore": <numero 0-100>,
  "criteria": {
    "accuracy": <numero 0-100>,
    "clarity": <numero 0-100>,
    "completeness": <numero 0-100>,
    "coherence": <numero 0-100>,
    "fluency": <numero 0-100>
  },
  "feedback": {
    "strengths": ["<punto di forza 1>", "<punto di forza 2>", "<punto di forza 3>"],
    "improvements": ["<miglioramento 1>", "<miglioramento 2>", "<miglioramento 3>"],
    "detailedFeedback": "<feedback dettagliato di 3-4 frasi>"
  }
}`;
  }

  private parseEvaluationResponse(response: string): Omit<EvaluationResult, 'metadata'> {
    try {
      // Cerca il JSON nella risposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const evaluation = JSON.parse(jsonMatch[0]);

      // Validazione della struttura
      this.validateEvaluationStructure(evaluation);

      return evaluation;

    } catch (error) {
      console.error('Failed to parse evaluation response:', error);
      console.error('Response was:', response);

      // Fallback: restituisci una valutazione di default
      return this.createFallbackEvaluation(response);
    }
  }

  private validateEvaluationStructure(evaluation: any): void {
    const requiredFields = ['overallScore', 'criteria', 'feedback'];
    const requiredCriteria = ['accuracy', 'clarity', 'completeness', 'coherence', 'fluency'];
    const requiredFeedback = ['strengths', 'improvements', 'detailedFeedback'];

    // Verifica campi principali
    for (const field of requiredFields) {
      if (!(field in evaluation)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Verifica criteri
    for (const criterion of requiredCriteria) {
      if (!(criterion in evaluation.criteria)) {
        throw new Error(`Missing criterion: ${criterion}`);
      }
      const score = evaluation.criteria[criterion];
      if (typeof score !== 'number' || score < 0 || score > 100) {
        throw new Error(`Invalid score for ${criterion}: ${score}`);
      }
    }

    // Verifica feedback
    for (const feedbackField of requiredFeedback) {
      if (!(feedbackField in evaluation.feedback)) {
        throw new Error(`Missing feedback field: ${feedbackField}`);
      }
    }

    // Verifica overall score
    const overallScore = evaluation.overallScore;
    if (typeof overallScore !== 'number' || overallScore < 0 || overallScore > 100) {
      throw new Error(`Invalid overall score: ${overallScore}`);
    }
  }

  private createFallbackEvaluation(originalResponse: string): Omit<EvaluationResult, 'metadata'> {
    return {
      overallScore: 50,
      criteria: {
        accuracy: 50,
        clarity: 50,
        completeness: 50,
        coherence: 50,
        fluency: 50,
      },
      feedback: {
        strengths: ['Presentazione completata'],
        improvements: ['Errore nella valutazione automatica', 'Riprova con una presentazione più chiara'],
        detailedFeedback: `Errore nella valutazione automatica. Risposta originale: ${originalResponse.substring(0, 200)}...`,
      },
    };
  }

  // Metodi per analisi approfondite

  async generateDetailedFeedback(
    transcription: string,
    relevantContext: RAGSearchResult[],
    focusArea?: keyof EvaluationCriteria
  ): Promise<string> {
    const focusPrompt = focusArea
      ? `Concentrati particolarmente sulla valutazione di: ${focusArea}`
      : 'Fornisci un feedback bilanciato su tutti i criteri';

    const prompt = `
DOCUMENTO DI RIFERIMENTO:
${relevantContext.map(chunk => chunk.content).join('\n\n---\n\n')}

TRASCRIZIONE:
${transcription}

${focusPrompt}

Fornisci un feedback dettagliato e costruttivo di almeno 5-6 frasi che aiuti a migliorare la presentazione.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model!,
        messages: [
          {
            role: 'system',
            content: 'Sei un coach esperto di public speaking. Fornisci feedback dettagliato e costruttivo.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 1000,
      });

      return response.choices[0].message.content || 'Impossibile generare feedback dettagliato.';

    } catch (error) {
      console.error('Error generating detailed feedback:', error);
      return 'Errore nella generazione del feedback dettagliato.';
    }
  }

  async comparePresentations(
    evaluations: EvaluationResult[]
  ): Promise<{
    averageScores: EvaluationCriteria & { overall: number };
    trends: {
      improving: string[];
      declining: string[];
      stable: string[];
    };
    recommendations: string[];
  }> {
    if (evaluations.length === 0) {
      throw new Error('No evaluations provided for comparison');
    }

    // Calcola medie
    const averageScores = evaluations.reduce(
      (acc, evaluation) => {
        acc.accuracy += evaluation.criteria.accuracy;
        acc.clarity += evaluation.criteria.clarity;
        acc.completeness += evaluation.criteria.completeness;
        acc.coherence += evaluation.criteria.coherence;
        acc.fluency += evaluation.criteria.fluency;
        acc.overall += evaluation.overallScore;
        return acc;
      },
      { accuracy: 0, clarity: 0, completeness: 0, coherence: 0, fluency: 0, overall: 0 }
    );

    const count = evaluations.length;
    Object.keys(averageScores).forEach(key => {
      averageScores[key as keyof typeof averageScores] = Math.round(averageScores[key as keyof typeof averageScores] / count);
    });

    // Analizza trends (solo se ci sono almeno 2 valutazioni)
    let trends: { improving: string[], declining: string[], stable: string[] } = { improving: [], declining: [], stable: [] };
    if (evaluations.length >= 2) {
      const first = evaluations[0];
      const last = evaluations[evaluations.length - 1];

      Object.keys(first.criteria).forEach(criterion => {
        const diff = last.criteria[criterion as keyof EvaluationCriteria] - first.criteria[criterion as keyof EvaluationCriteria];
        if (diff > 5) trends.improving.push(criterion);
        else if (diff < -5) trends.declining.push(criterion);
        else trends.stable.push(criterion);
      });
    }

    // Genera raccomandazioni basate sui pattern
    const recommendations = this.generateRecommendations(averageScores, trends);

    return { averageScores, trends, recommendations };
  }

  private generateRecommendations(
    averageScores: EvaluationCriteria & { overall: number },
    trends: { improving: string[]; declining: string[]; stable: string[] }
  ): string[] {
    const recommendations: string[] = [];

    // Raccomandazioni basate sui punteggi più bassi
    const criteriaEntries = Object.entries(averageScores).filter(([key]) => key !== 'overall');
    const lowestScores = criteriaEntries
      .sort(([,a], [,b]) => a - b)
      .slice(0, 2);

    lowestScores.forEach(([criterion, score]) => {
      if (score < 60) {
        recommendations.push(this.getCriterionRecommendation(criterion, score));
      }
    });

    // Raccomandazioni basate sui trends
    if (trends.declining.length > 0) {
      recommendations.push(`Prestare attenzione ai seguenti aspetti in declino: ${trends.declining.join(', ')}`);
    }

    if (trends.improving.length > 0) {
      recommendations.push(`Continuare a migliorare: ${trends.improving.join(', ')}`);
    }

    return recommendations;
  }

  private getCriterionRecommendation(criterion: string, score: number): string {
    const recommendations: Record<string, string> = {
      accuracy: 'Rileggi attentamente il documento prima della presentazione e verifica che tutte le informazioni siano corrette',
      clarity: 'Lavora sulla struttura del discorso e usa un linguaggio più semplice e diretto',
      completeness: 'Assicurati di coprire tutti i punti principali del documento con esempi specifici',
      coherence: 'Organizza meglio i contenuti con una struttura logica chiara (introduzione, sviluppo, conclusioni)',
      fluency: 'Pratica la presentazione ad alta voce per migliorare la naturalezza del parlato',
    };

    return recommendations[criterion] || `Migliorare l'aspetto: ${criterion}`;
  }
}