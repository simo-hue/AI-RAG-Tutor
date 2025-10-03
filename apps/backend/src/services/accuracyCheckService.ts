import { OllamaService } from './ollamaService';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { DocumentChunk } from '@ai-speech-evaluator/shared';

export interface Statement {
  text: string;
  startPosition: number;
  endPosition: number;
  type: 'factual' | 'opinion' | 'filler';
}

export interface FactCheckResult {
  statement: string;
  isAccurate: boolean;
  confidence: number; // 0-1
  evidenceInDocument: string | null;
  discrepancy: string | null;
  severity: 'none' | 'minor' | 'moderate' | 'critical';
}

export interface DetailedAccuracyReport {
  overallAccuracyScore: number; // 0-100
  totalStatements: number;
  accurateStatements: number;
  inaccurateStatements: number;
  factChecks: FactCheckResult[];
  summary: {
    criticalErrors: string[];
    moderateErrors: string[];
    minorErrors: string[];
    strengths: string[];
  };
}

export class AccuracyCheckService {
  private ollamaService: OllamaService | null = null;
  private static instance: AccuracyCheckService | null = null;

  private constructor() {}

  static async getInstance(): Promise<AccuracyCheckService> {
    if (!this.instance) {
      this.instance = new AccuracyCheckService();
      await this.instance.initialize();
    }
    return this.instance;
  }

  private async initialize(): Promise<void> {
    try {
      this.ollamaService = await OllamaService.getInstance();
      logger.info('AccuracyCheckService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AccuracyCheckService', { error: error.message });
      throw new AppError('Failed to initialize AccuracyCheckService', 500);
    }
  }

  /**
   * Analizza l'accuratezza della presentazione statement-by-statement
   */
  async performDetailedAccuracyCheck(
    transcription: string,
    relevantChunks: Array<{
      content: string;
      score: number;
      metadata: DocumentChunk['metadata'];
    }>,
    documentId: string,
    model?: string
  ): Promise<DetailedAccuracyReport> {
    const startTime = Date.now();
    const modelToUse = model || evaluationConfig.model;

    try {
      logger.info('🔍 Starting detailed accuracy check', {
        documentId,
        model: modelToUse,
        transcriptionLength: transcription.length,
        chunksAvailable: relevantChunks.length
      });

      // Step 1: Segmenta la trascrizione in statements
      const statements = await this.extractStatements(transcription, modelToUse);

      logger.info('📝 Extracted statements for fact-checking', {
        totalStatements: statements.length,
        factualStatements: statements.filter(s => s.type === 'factual').length
      });

      // Step 2: Costruisci il contesto dal documento
      const documentContext = relevantChunks
        .map((chunk, idx) => `[Chunk ${idx + 1}]\n${chunk.content}`)
        .join('\n\n---\n\n');

      // Step 3: Fact-check ogni statement contro il documento
      const factChecks: FactCheckResult[] = [];

      for (const statement of statements) {
        // Solo fact-check per affermazioni fattuali
        if (statement.type === 'factual') {
          const factCheck = await this.checkStatementAccuracy(
            statement.text,
            documentContext,
            modelToUse
          );
          factChecks.push(factCheck);
        }
      }

      // Step 4: Analizza i risultati e genera report
      const report = this.generateAccuracyReport(statements, factChecks);

      const processingTime = Date.now() - startTime;

      logger.info('✅ Detailed accuracy check completed', {
        documentId,
        overallScore: report.overallAccuracyScore,
        totalStatements: report.totalStatements,
        accurateStatements: report.accurateStatements,
        criticalErrors: report.summary.criticalErrors.length,
        processingTime: `${processingTime}ms`
      });

      return report;

    } catch (error) {
      logger.error('Detailed accuracy check failed', {
        documentId,
        error: error.message
      });
      throw new AppError(`Accuracy check failed: ${error.message}`, 500);
    }
  }

  /**
   * Estrae statements dalla trascrizione
   */
  private async extractStatements(transcription: string, model?: string): Promise<Statement[]> {
    const prompt = `Analizza questa trascrizione e identifica ogni AFFERMAZIONE FATTUALE distinta.

TRASCRIZIONE:
${transcription}

COMPITO:
Estrai tutte le affermazioni fattuali (fatti, dati, numeri, nomi, date, concetti specifici).
IGNORA frasi di riempimento come "ehm", "diciamo", "in pratica", saluti, transizioni.

Rispondi in formato JSON:
{
  "statements": [
    {
      "text": "affermazione fattuale completa",
      "type": "factual"
    }
  ]
}

IMPORTANTE: Ogni statement deve essere una frase completa e verificabile.`;

    const systemPrompt = `Sei un esperto di analisi testuale. Estrai affermazioni fattuali dal testo ignorando filler e opinioni soggettive.`;

    try {
      const response = await this.ollamaService!.generateChat(prompt, systemPrompt, model);
      const jsonMatch = response.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        // Fallback: split semplice per frasi
        return this.fallbackStatementExtraction(transcription);
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return parsed.statements.map((s: any, idx: number) => ({
        text: s.text,
        startPosition: idx,
        endPosition: idx + 1,
        type: s.type as 'factual' | 'opinion' | 'filler'
      }));

    } catch (error) {
      logger.warn('Statement extraction failed, using fallback', { error: error.message });
      return this.fallbackStatementExtraction(transcription);
    }
  }

  /**
   * Fallback: estrazione semplice basata su punteggiatura
   */
  private fallbackStatementExtraction(transcription: string): Statement[] {
    const sentences = transcription
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10); // Ignora frasi troppo corte

    return sentences.map((text, idx) => ({
      text,
      startPosition: idx,
      endPosition: idx + 1,
      type: 'factual' as const
    }));
  }

  /**
   * Verifica accuratezza di un singolo statement
   */
  private async checkStatementAccuracy(
    statement: string,
    documentContext: string,
    model?: string
  ): Promise<FactCheckResult> {
    const prompt = `Verifica se questa AFFERMAZIONE è supportata dal DOCUMENTO.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 DOCUMENTO DI RIFERIMENTO (UNICA FONTE DI VERITÀ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${documentContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 AFFERMAZIONE DA VERIFICARE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"${statement}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPITO:
Verifica se l'affermazione è supportata dal documento. Analizza:
1. ✅ L'informazione è PRESENTE e CORRETTA nel documento?
2. ❌ L'informazione NON è nel documento (anche se vera nella realtà)?
3. ⚠️ L'informazione è PARZIALMENTE corretta o DISTORTA?

Rispondi in formato JSON:
{
  "isAccurate": true/false,
  "confidence": 0.0-1.0,
  "evidenceInDocument": "citazione esatta dal documento che supporta/contraddice" o null,
  "discrepancy": "descrizione breve della discrepanza" o null,
  "severity": "none" | "minor" | "moderate" | "critical"
}

REGOLE:
- isAccurate = true SOLO se l'affermazione è supportata dal documento
- confidence = quanto sei sicuro (1.0 = certezza assoluta)
- evidenceInDocument = citazione letterale dal documento
- discrepancy = cosa non corrisponde (se isAccurate = false)
- severity:
  * "none": Affermazione accurata
  * "minor": Differenza insignificante (es. sinonimo)
  * "moderate": Informazione parzialmente errata
  * "critical": Informazione completamente falsa o opposta

ESEMPI:

Documento: "I gatti spaziali hanno 3 zampe"
Affermazione: "I gatti spaziali hanno 4 zampe"
→ {"isAccurate": false, "confidence": 1.0, "evidenceInDocument": "I gatti spaziali hanno 3 zampe", "discrepancy": "Affermazione dice 4 zampe, documento dice 3 zampe", "severity": "critical"}

Documento: "Scoperta avvenuta nel 2150"
Affermazione: "Sono stati scoperti nel 2150"
→ {"isAccurate": true, "confidence": 1.0, "evidenceInDocument": "Scoperta avvenuta nel 2150", "discrepancy": null, "severity": "none"}

Documento: "I gatti hanno pelo viola"
Affermazione: "I gatti hanno pelo color lavanda"
→ {"isAccurate": true, "confidence": 0.9, "evidenceInDocument": "I gatti hanno pelo viola", "discrepancy": null, "severity": "minor"}`;

    const systemPrompt = `Sei un fact-checker rigoroso. Verifica SOLO se l'affermazione è supportata dal documento fornito. NON usare conoscenza esterna.`;

    try {
      const response = await this.ollamaService!.generateChat(prompt, systemPrompt, model);
      const jsonMatch = response.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('Invalid JSON response from LLM');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        statement,
        isAccurate: parsed.isAccurate ?? true,
        confidence: parsed.confidence ?? 0.5,
        evidenceInDocument: parsed.evidenceInDocument || null,
        discrepancy: parsed.discrepancy || null,
        severity: parsed.severity || 'none'
      };

    } catch (error) {
      logger.warn('Fact-check failed for statement, assuming accurate', {
        statement: statement.substring(0, 50),
        error: error.message
      });

      // Fallback conservativo: assume accurato ma bassa confidenza
      return {
        statement,
        isAccurate: true,
        confidence: 0.3,
        evidenceInDocument: null,
        discrepancy: null,
        severity: 'none'
      };
    }
  }

  /**
   * Genera report finale di accuratezza
   */
  private generateAccuracyReport(
    statements: Statement[],
    factChecks: FactCheckResult[]
  ): DetailedAccuracyReport {
    const accurateStatements = factChecks.filter(fc => fc.isAccurate).length;
    const inaccurateStatements = factChecks.filter(fc => !fc.isAccurate).length;

    // Categorizza errori per severità
    const criticalErrors = factChecks
      .filter(fc => fc.severity === 'critical')
      .map(fc => `"${fc.statement}" → ${fc.discrepancy}`);

    const moderateErrors = factChecks
      .filter(fc => fc.severity === 'moderate')
      .map(fc => `"${fc.statement}" → ${fc.discrepancy}`);

    const minorErrors = factChecks
      .filter(fc => fc.severity === 'minor')
      .map(fc => `"${fc.statement}" → ${fc.discrepancy}`);

    const strengths = factChecks
      .filter(fc => fc.isAccurate && fc.confidence > 0.8)
      .map(fc => `✅ Affermazione verificata: "${fc.statement.substring(0, 60)}..."`);

    // Calcola score finale basato su severità
    let totalPenalty = 0;
    factChecks.forEach(fc => {
      if (!fc.isAccurate) {
        switch (fc.severity) {
          case 'critical':
            totalPenalty += 20; // -20 punti per errore critico
            break;
          case 'moderate':
            totalPenalty += 10; // -10 punti per errore moderato
            break;
          case 'minor':
            totalPenalty += 3;  // -3 punti per errore minore
            break;
        }
      }
    });

    // Score base su % di statements accurati
    const baseScore = factChecks.length > 0
      ? (accurateStatements / factChecks.length) * 100
      : 100;

    // Applica penalità
    const finalScore = Math.max(0, Math.min(100, baseScore - totalPenalty));

    return {
      overallAccuracyScore: Math.round(finalScore),
      totalStatements: statements.length,
      accurateStatements,
      inaccurateStatements,
      factChecks,
      summary: {
        criticalErrors: criticalErrors.slice(0, 5), // Max 5 per categoria
        moderateErrors: moderateErrors.slice(0, 5),
        minorErrors: minorErrors.slice(0, 5),
        strengths: strengths.slice(0, 5)
      }
    };
  }
}

export default AccuracyCheckService;
