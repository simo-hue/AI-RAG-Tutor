# Sistema di Controllo Accuratezza Dettagliato

## 📋 Panoramica

È stato implementato un sistema avanzato di verifica dell'accuratezza che analizza statement-by-statement la trascrizione confrontandola con il documento di riferimento. Questo sistema fornisce un feedback granulare su quali affermazioni sono accurate e quali presentano discrepanze.

## 🎯 Obiettivo

Migliorare la precisione del controllo di accuratezza passando da una valutazione generale a un'analisi dettagliata di ogni singola affermazione, identificando:
- Quali affermazioni sono verificabili nel documento
- Quali affermazioni sono errate o non supportate
- Il livello di gravità degli errori (critico, moderato, minore)
- L'evidenza specifica nel documento a supporto/contraddizione

## 🏗️ Architettura

### Backend Components

#### 1. **AccuracyCheckService** (`apps/backend/src/services/accuracyCheckService.ts`)

Nuovo servizio dedicato al fact-checking granulare:

```typescript
export class AccuracyCheckService {
  // Analisi accuratezza dettagliata
  async performDetailedAccuracyCheck(
    transcription: string,
    relevantChunks: Array<{...}>,
    documentId: string
  ): Promise<DetailedAccuracyReport>

  // Estrae statements dalla trascrizione
  private async extractStatements(transcription: string): Promise<Statement[]>

  // Verifica singolo statement contro documento
  private async checkStatementAccuracy(
    statement: string,
    documentContext: string
  ): Promise<FactCheckResult>

  // Genera report finale con score e summary
  private generateAccuracyReport(
    statements: Statement[],
    factChecks: FactCheckResult[]
  ): DetailedAccuracyReport
}
```

**Caratteristiche principali:**
- **Statement Extraction**: Utilizza LLM per identificare affermazioni fattuali, con fallback regex-based
- **Fact-Checking**: Confronta ogni statement con il documento usando prompt strutturati
- **Severity Classification**: Categorizza errori in critical (-20 punti), moderate (-10), minor (-3)
- **Evidence Extraction**: Identifica citazioni esatte dal documento a supporto/contraddizione

#### 2. **Integrazione in EvaluationService** (`apps/backend/src/services/evaluationService.ts`)

Modifiche:
```typescript
async evaluatePresentation(
  transcription: string,
  documentId: string,
  options?: {
    maxRelevantChunks?: number;
    minSimilarityScore?: number;
    detailedAccuracyCheck?: boolean;  // ← NUOVA OPZIONE
  }
): Promise<{
  evaluation: EvaluationResult;
  contextUsed: {...};
  accuracyReport?: DetailedAccuracyReport;  // ← NUOVO CAMPO
}>
```

**Logica di integrazione:**
1. Esegue valutazione standard RAG
2. Se `detailedAccuracyCheck: true`, chiama AccuracyCheckService
3. Sovrascrive il punteggio di accuratezza standard con quello dettagliato
4. Ricalcola overall score con il nuovo valore di accuratezza
5. Include accuracyReport nella risposta

#### 3. **Controller Update** (`apps/backend/src/controllers/evaluationController.ts`)

Aggiunto `accuracyReport` alla risposta API:
```typescript
res.json({
  success: true,
  data: {
    evaluation: result.evaluation,
    contextUsed: result.contextUsed,
    accuracyReport: result.accuracyReport,  // ← NUOVO
    evaluationId: generateEvaluationId(),
  },
  message: 'Presentation evaluated successfully',
});
```

### Frontend Components

#### 1. **AccuracyReport Component** (`apps/frontend/src/components/evaluation/AccuracyReport.tsx`)

Nuovo componente UI per visualizzare il report dettagliato:

**Sezioni:**
- **Overall Score Card**: Score complessivo, statements accurate/errate
- **Critical Errors**: Lista errori critici con sfondo rosso
- **Moderate Errors**: Lista errori moderati con sfondo arancione
- **Minor Errors**: Lista errori minori con sfondo blu
- **Verified Statements**: Affermazioni verificate con successo
- **Statement-by-Statement Detail**: Card dettagliata per ogni fact-check con:
  - Statement originale
  - Evidenza nel documento
  - Discrepanza (se presente)
  - Badge di confidenza e severità

#### 2. **EvaluationResults Update** (`apps/frontend/src/components/evaluation/EvaluationResults.tsx`)

Modifiche:
- Aggiunta tab "Accuratezza Dettagliata" (visibile solo se accuracyReport presente)
- Import e integrazione del componente AccuracyReport
- Gestione stato per nuova tab

#### 3. **Service Layer** (`apps/frontend/src/services/evaluationService.ts`)

Aggiornato per supportare il nuovo report:

```typescript
export interface DetailedAccuracyReport {
  overallAccuracyScore: number;
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

export interface EvaluationResult {
  // ... existing fields
  accuracyReport?: DetailedAccuracyReport;  // ← NUOVO
}
```

Aggiunta opzione `detailedAccuracyCheck`:
```typescript
async evaluatePresentation(
  transcription: string,
  documentId: string,
  options?: {
    maxChunks?: number;
    detailedFeedback?: boolean;
    detailedAccuracyCheck?: boolean;  // ← NUOVO
    model?: string;
  }
)
```

#### 4. **EvaluationProcessor** (`apps/frontend/src/components/evaluation/EvaluationProcessor.tsx`)

Abilitato per default il detailed accuracy check:
```typescript
const evaluationPromise = evaluationService.evaluatePresentation(
  transcription,
  documentId,
  {
    maxChunks: 5,
    detailedFeedback: true,
    detailedAccuracyCheck: true,  // ← ABILITATO
    model: model
  }
);
```

## 🔍 Algoritmo di Fact-Checking

### Step 1: Statement Extraction
```
Input: Trascrizione completa
↓
LLM Prompt: "Estrai affermazioni fattuali, ignora filler/opinioni"
↓
Output: Array di Statement { text, type: 'factual' | 'opinion' | 'filler' }
↓
Fallback: Split per punteggiatura se LLM fallisce
```

### Step 2: Fact-Checking
Per ogni statement factual:
```
Input: Statement + Contesto documento
↓
LLM Prompt strutturato:
  - Documento di riferimento (unica fonte di verità)
  - Statement da verificare
  - Istruzioni per JSON response
↓
LLM Output: {
  isAccurate: boolean,
  confidence: 0-1,
  evidenceInDocument: string | null,
  discrepancy: string | null,
  severity: 'none' | 'minor' | 'moderate' | 'critical'
}
```

### Step 3: Score Calculation
```
Base Score = (accurate_statements / total_statements) * 100

Penalties:
  - Critical error: -20 punti
  - Moderate error: -10 punti
  - Minor error: -3 punti

Final Score = max(0, min(100, baseScore - totalPenalty))
```

## 📊 Interfacce TypeScript

### FactCheckResult
```typescript
interface FactCheckResult {
  statement: string;              // Affermazione originale
  isAccurate: boolean;            // È supportata dal documento?
  confidence: number;             // 0-1, quanto è sicuro il modello
  evidenceInDocument: string | null;  // Citazione dal documento
  discrepancy: string | null;     // Descrizione della discrepanza
  severity: 'none' | 'minor' | 'moderate' | 'critical';
}
```

### DetailedAccuracyReport
```typescript
interface DetailedAccuracyReport {
  overallAccuracyScore: number;   // 0-100
  totalStatements: number;
  accurateStatements: number;
  inaccurateStatements: number;
  factChecks: FactCheckResult[];
  summary: {
    criticalErrors: string[];     // Max 5
    moderateErrors: string[];     // Max 5
    minorErrors: string[];        // Max 5
    strengths: string[];          // Max 5
  };
}
```

## 🧪 Testing

### Script di Test
È stato creato uno script di test automatico: `test-accuracy-check.sh`

**Cosa testa:**
1. Upload documento di test (gatti spaziali con fatti inventati)
2. Valutazione con trascrizione accurata (deve avere score alto)
3. Valutazione con trascrizione inaccurata (fatti esterni, deve avere score basso)
4. Verifica che score_accurate > score_inaccurate
5. Mostra fact-checks dettagliati

**Come eseguire:**
```bash
./test-accuracy-check.sh
```

### Test Case Esempio

**Documento:**
> "I gatti spaziali sono una specie unica scoperta nel 2150 durante una missione su Marte. Hanno 3 zampe e pelo viola. Possono sopravvivere nello spazio senza tuta spaziale grazie alla loro fisiologia speciale."

**Trascrizione Accurata (alta score):**
> "I gatti spaziali sono stati scoperti nel 2150 su Marte. Hanno 3 zampe e il pelo viola. Possono vivere nello spazio senza protezione."

**Trascrizione Inaccurata (bassa score):**
> "I gatti spaziali sono animali trovati sulla Terra. Hanno 4 zampe come i gatti normali e pelo arancione. Vivono in case come gli altri gatti."

**Risultati attesi:**
- Accurata: ~90-95/100 (fatti corretti dal documento)
- Inaccurata: ~20-30/100 (fatti esterni, penalizzati)

## 🎨 UI/UX

### Tab "Accuratezza Dettagliata"
- Visibile solo quando accuracyReport è presente
- Design con card colorate per severità:
  - 🔴 Rosso: Critical errors
  - 🟠 Arancione: Moderate errors
  - 🔵 Blu: Minor errors
  - 🟢 Verde: Verified statements

### Dettaglio Statement
Ogni fact-check mostra:
```
┌─────────────────────────────────────┐
│ ⚠️ Affermazione #1        [CRITICO] │
│                    [Confidenza: 95%] │
├─────────────────────────────────────┤
│ Affermazione:                        │
│ "I gatti hanno 4 zampe"             │
│                                      │
│ Evidenza nel Documento:              │
│ "I gatti spaziali hanno 3 zampe"    │
│                                      │
│ Discrepanza:                         │
│ "Affermazione dice 4 zampe,         │
│  documento dice 3 zampe"            │
└─────────────────────────────────────┘
```

## 📈 Metriche e Logging

### Backend Logs
```typescript
logger.info('🔍 Starting detailed accuracy check', {
  documentId,
  transcriptionLength,
  chunksAvailable
});

logger.info('📝 Extracted statements for fact-checking', {
  totalStatements,
  factualStatements
});

logger.info('✅ Detailed accuracy check completed', {
  overallScore,
  criticalErrors: count,
  processingTime
});
```

### Performance
- Statement extraction: ~2-5s
- Fact-checking per statement: ~1-2s
- Total per presentazione (5-10 statements): ~10-20s

## 🔄 Flusso End-to-End

```
1. Frontend: User completa registrazione
                    ↓
2. Frontend: EvaluationProcessor chiama API
             con detailedAccuracyCheck: true
                    ↓
3. Backend: EvaluationService riceve richiesta
                    ↓
4. Backend: Recupera chunks RAG rilevanti
                    ↓
5. Backend: Se detailedAccuracyCheck = true:
            → AccuracyCheckService.performDetailedAccuracyCheck()
                    ↓
6. Backend: AccuracyCheckService:
            → extractStatements()
            → Per ogni statement: checkStatementAccuracy()
            → generateAccuracyReport()
                    ↓
7. Backend: Sovrascrive accuracy score
            Ricalcola overall score
                    ↓
8. Backend: Ritorna evaluation + accuracyReport
                    ↓
9. Frontend: EvaluationResults riceve report
                    ↓
10. Frontend: Mostra tab "Accuratezza Dettagliata"
             con AccuracyReport component
                    ↓
11. User: Visualizza analisi statement-by-statement
```

## ✅ Checklist Implementazione

- [x] Creato AccuracyCheckService con statement extraction
- [x] Implementato fact-checking statement-by-statement
- [x] Aggiunto sistema di severity e penalties
- [x] Integrato in EvaluationService
- [x] Aggiornato controller per includere accuracyReport
- [x] Creato componente UI AccuracyReport
- [x] Aggiornato EvaluationResults con nuova tab
- [x] Aggiornato service layer frontend
- [x] Abilitato detailedAccuracyCheck per default
- [x] Creato script di test automatico
- [x] Documentazione completa

## 🚀 Come Usare

### Backend API
```bash
curl -X POST http://localhost:3001/api/evaluations/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": "...",
    "documentId": "doc-123",
    "options": {
      "detailedAccuracyCheck": true
    }
  }'
```

### Frontend Code
```typescript
const result = await evaluationService.evaluatePresentation(
  transcription,
  documentId,
  {
    detailedAccuracyCheck: true
  }
);

// result.accuracyReport conterrà il report dettagliato
if (result.accuracyReport) {
  console.log('Critical Errors:', result.accuracyReport.summary.criticalErrors);
  console.log('Overall Score:', result.accuracyReport.overallAccuracyScore);
}
```

## 🔧 Configurazione

### Prompt Engineering
I prompt per statement extraction e fact-checking sono in:
- `accuracyCheckService.ts:137-156` (extraction)
- `accuracyCheckService.ts:208-262` (fact-checking)

Possono essere personalizzati per migliorare l'accuratezza.

### Penalty System
In `accuracyCheckService.ts:331-346`:
```typescript
switch (fc.severity) {
  case 'critical': totalPenalty += 20; break;
  case 'moderate': totalPenalty += 10; break;
  case 'minor': totalPenalty += 3; break;
}
```

Modificare i valori per cambiare l'impatto degli errori sullo score.

## 📝 Note Tecniche

### Fallback Handling
- Se LLM fallisce extraction: usa split regex
- Se LLM fallisce fact-check: assume accurato con bassa confidenza (0.3)
- Garantisce sempre una risposta, anche in caso di errori

### Ottimizzazioni Future
- [ ] Caching dei fact-checks per statements simili
- [ ] Parallel processing per fact-checks
- [ ] Fine-tuning del prompt per migliorare precision/recall
- [ ] Metriche di calibrazione per confidence scores
- [ ] A/B testing tra modelli LLM diversi

## 🎯 Benefici

1. **Granularità**: Identifica esattamente quali affermazioni sono problematiche
2. **Trasparenza**: Mostra evidenza dal documento per ogni verifica
3. **Educativo**: L'utente capisce precisamente cosa è sbagliato
4. **Affidabilità**: Riduce dipendenza da conoscenza esterna dell'LLM
5. **Debugging**: Facilita individuazione di problemi nel RAG

## 📚 Riferimenti

- RAG Implementation: `apps/backend/src/services/evaluationService.ts`
- Accuracy Service: `apps/backend/src/services/accuracyCheckService.ts`
- UI Component: `apps/frontend/src/components/evaluation/AccuracyReport.tsx`
- Test Script: `test-accuracy-check.sh`
