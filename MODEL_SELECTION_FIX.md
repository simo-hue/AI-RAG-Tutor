# Fix: Coordinazione Selezione Modello Frontend-Backend

## 🔍 Problema Identificato

Durante l'analisi approfondita, ho scoperto che **il parametro `model` non veniva propagato correttamente** dal frontend al backend e all'LLM Ollama.

### Flow Originale (ROTTO):
```
Frontend (EvaluationProcessor)
  ↓ passa model: "llama3.2:3b"
  ↓
Frontend Service (evaluationService.ts)
  ↓ ignora model, non lo invia
  ↓
Backend Controller (evaluationController.ts)
  ↓ riceve options ma non estrae model
  ↓
EvaluationServiceManager
  ↓ non accetta model in options
  ↓
LocalEvaluationService
  ↓ non riceve model parameter
  ↓
OllamaService.generateChat()
  ↓ usa SEMPRE evaluationConfig.model hardcoded ❌
  ↓
Ollama LLM (usa modello sbagliato)
```

### Risultato:
- ✅ Frontend permetteva selezione modello
- ❌ Backend ignorava completamente il parametro
- ❌ Ollama usava sempre il modello di default configurato

## ✅ Soluzione Implementata

Ho implementato il supporto completo del parametro `model` attraverso **TUTTA** la catena di chiamate.

### Flow Corretto (FUNZIONANTE):
```
Frontend (EvaluationProcessor)
  ↓ passa model: "llama3.2:3b" ✅
  ↓
Frontend Service (evaluationService.ts)
  ↓ include model in options ✅
  ↓
Backend Controller (evaluationController.ts)
  ↓ passa options con model ✅
  ↓
EvaluationServiceManager
  ↓ accetta options.model ✅
  ↓
LocalEvaluationService.evaluatePresentation(model)
  ↓ passa model a generateChat() ✅
  ↓
OllamaService.generateChat(prompt, systemPrompt, model)
  ↓ usa model || evaluationConfig.model ✅
  ↓
Ollama LLM (usa modello selezionato!) ✅
```

## 📝 File Modificati

### 1. **Backend - OllamaService** ([ollamaService.ts](apps/backend/src/services/ollamaService.ts:84))

**PRIMA:**
```typescript
async generateChat(prompt: string, systemPrompt?: string): Promise<string> {
  // ...
  const response = await this.client.chat({
    model: evaluationConfig.model,  // ❌ SEMPRE hardcoded
    messages,
    // ...
  });
}
```

**DOPO:**
```typescript
async generateChat(prompt: string, systemPrompt?: string, model?: string): Promise<string> {
  const modelToUse = model || evaluationConfig.model;  // ✅ Usa model passato o fallback

  const response = await this.client.chat({
    model: modelToUse,  // ✅ Dinamico
    messages,
    // ...
  });

  logger.info('Ollama chat generation completed', {
    model: modelToUse,  // ✅ Log del modello usato
    // ...
  });
}
```

### 2. **Backend - LocalEvaluationService** ([localEvaluationService.ts](apps/backend/src/services/localEvaluationService.ts:64))

**PRIMA:**
```typescript
async evaluatePresentation(
  transcription: string,
  relevantChunks: Array<{...}>,
  documentId: string
): Promise<EvaluationResult> {
  // ...
  const rawEvaluation = await this.ollamaService!.generateChat(
    evaluationPrompt,
    this.getSystemPrompt()
    // ❌ Nessun model parameter
  );
}
```

**DOPO:**
```typescript
async evaluatePresentation(
  transcription: string,
  relevantChunks: Array<{...}>,
  documentId: string,
  model?: string  // ✅ Nuovo parametro
): Promise<EvaluationResult> {
  const modelToUse = model || evaluationConfig.model;

  logger.info('🤖 Sending evaluation request to Ollama', {
    model: modelToUse,  // ✅ Log del modello
    // ...
  });

  const rawEvaluation = await this.ollamaService!.generateChat(
    evaluationPrompt,
    this.getSystemPrompt(),
    modelToUse  // ✅ Passa model parameter
  );
}
```

**Stesso fix per `generateDetailedFeedback()`:**
```typescript
async generateDetailedFeedback(
  transcription: string,
  relevantChunks: Array<{...}>,
  focusArea?: keyof EvaluationCriteria,
  model?: string  // ✅ Nuovo parametro
): Promise<string> {
  const modelToUse = model || evaluationConfig.model;

  const detailedFeedback = await this.ollamaService!.generateChat(
    feedbackPrompt,
    this.getFeedbackSystemPrompt(),
    modelToUse  // ✅ Passa model
  );
}
```

### 3. **Backend - EvaluationServiceManager** ([evaluationService.ts](apps/backend/src/services/evaluationService.ts:23))

**PRIMA:**
```typescript
async evaluatePresentation(
  transcription: string,
  documentId: string,
  options?: {
    maxRelevantChunks?: number;
    minSimilarityScore?: number;
    detailedAccuracyCheck?: boolean;
    // ❌ Mancava model
  }
): Promise<{...}> {
  // ...
  const evaluation = await evaluationService.evaluatePresentation(
    transcription,
    relevantChunks,
    documentId
    // ❌ Non passava model
  );
}
```

**DOPO:**
```typescript
async evaluatePresentation(
  transcription: string,
  documentId: string,
  options?: {
    maxRelevantChunks?: number;
    minSimilarityScore?: number;
    detailedAccuracyCheck?: boolean;
    model?: string;  // ✅ Aggiunto
  }
): Promise<{...}> {
  // ...
  const evaluation = await evaluationService.evaluatePresentation(
    transcription,
    relevantChunks,
    documentId,
    options?.model  // ✅ Passa model parameter
  );
}
```

### 4. **Backend - AccuracyCheckService** ([accuracyCheckService.ts](apps/backend/src/services/accuracyCheckService.ts:63))

**PRIMA:**
```typescript
async performDetailedAccuracyCheck(
  transcription: string,
  relevantChunks: Array<{...}>,
  documentId: string
): Promise<DetailedAccuracyReport> {
  // ...
  const statements = await this.extractStatements(transcription);
  // ❌ Non passava model

  const factCheck = await this.checkStatementAccuracy(
    statement.text,
    documentContext
    // ❌ Non passava model
  );
}
```

**DOPO:**
```typescript
async performDetailedAccuracyCheck(
  transcription: string,
  relevantChunks: Array<{...}>,
  documentId: string,
  model?: string  // ✅ Nuovo parametro
): Promise<DetailedAccuracyReport> {
  const modelToUse = model || evaluationConfig.model;

  logger.info('🔍 Starting detailed accuracy check', {
    documentId,
    model: modelToUse,  // ✅ Log del modello
    // ...
  });

  const statements = await this.extractStatements(transcription, modelToUse);  // ✅ Passa model

  const factCheck = await this.checkStatementAccuracy(
    statement.text,
    documentContext,
    modelToUse  // ✅ Passa model
  );
}

private async extractStatements(transcription: string, model?: string): Promise<Statement[]> {
  const response = await this.ollamaService!.generateChat(prompt, systemPrompt, model);  // ✅
}

private async checkStatementAccuracy(
  statement: string,
  documentContext: string,
  model?: string  // ✅
): Promise<FactCheckResult> {
  const response = await this.ollamaService!.generateChat(prompt, systemPrompt, model);  // ✅
}
```

### 5. **Backend - Passaggio ad AccuracyCheckService** ([evaluationService.ts](apps/backend/src/services/evaluationService.ts:172))

**PRIMA:**
```typescript
accuracyReport = await accuracyService.performDetailedAccuracyCheck(
  transcription,
  relevantChunks,
  documentId
  // ❌ Non passava model
);
```

**DOPO:**
```typescript
logger.info('🔍 Starting detailed accuracy check', {
  documentId,
  model: options?.model  // ✅ Log del modello
});

accuracyReport = await accuracyService.performDetailedAccuracyCheck(
  transcription,
  relevantChunks,
  documentId,
  options?.model  // ✅ Passa model parameter
);
```

### 6. **Frontend - evaluationService.ts** ([evaluationService.ts](apps/frontend/src/services/evaluationService.ts:105))

**PRIMA:**
```typescript
body: JSON.stringify({
  transcription,
  documentId,
  options: {
    maxRelevantChunks: options?.maxChunks,
    detailedAccuracyCheck: options?.detailedAccuracyCheck,
    // ❌ Mancava model
  }
}),
```

**DOPO:**
```typescript
body: JSON.stringify({
  transcription,
  documentId,
  options: {
    maxRelevantChunks: options?.maxChunks,
    detailedAccuracyCheck: options?.detailedAccuracyCheck,
    model: options?.model,  // ✅ Incluso model
  }
}),
```

## 🎯 Punti di Propagazione del Modello

Il parametro `model` ora viene propagato attraverso:

1. ✅ **Frontend UI** → `EvaluationProcessor` (già esistente)
2. ✅ **Frontend Service** → `evaluationService.evaluatePresentation()` (già esistente)
3. ✅ **API Request** → Body con `options.model` (**FIXATO**)
4. ✅ **Backend Controller** → `evaluationService.evaluatePresentation()` (già passava options)
5. ✅ **EvaluationServiceManager** → Accept `options.model` (**FIXATO**)
6. ✅ **LocalEvaluationService** → Accept `model` parameter (**FIXATO**)
7. ✅ **OllamaService** → Accept `model` parameter (**FIXATO**)
8. ✅ **AccuracyCheckService** → Accept `model` parameter (**FIXATO**)
9. ✅ **Ollama Client** → Use dynamic model (**FIXATO**)

## 🧪 Testing

Per verificare che il fix funzioni:

### 1. Verifica nei Log

Quando esegui una valutazione, dovresti vedere nei log del backend:

```
[info]: 🔍 RAG Evaluation - Chunks used for evaluation {
  "documentId": "...",
  "model": "llama3.2:3b",  ← Modello selezionato!
  ...
}

[info]: 🤖 Sending evaluation request to Ollama {
  "model": "llama3.2:3b",  ← Modello usato!
  ...
}

[info]: Ollama chat generation completed {
  "model": "llama3.2:3b",  ← Conferma modello!
  ...
}
```

### 2. Test Funzionale

```bash
# Test con modello specifico
curl -X POST http://localhost:3001/api/evaluations/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": "Test di valutazione con modello personalizzato",
    "documentId": "doc-123",
    "options": {
      "model": "llama3:latest",
      "detailedAccuracyCheck": true
    }
  }'
```

Verifica nei log che il modello usato sia `llama3:latest` e non il default.

### 3. Test Frontend

1. Apri l'app nel browser
2. Nella UI di valutazione, seleziona un modello diverso dal default (es. `llama3:latest`)
3. Esegui una valutazione
4. Controlla i log del backend per vedere quale modello è stato effettivamente usato

## 📊 Impatto

### Prima del Fix:
- ❌ Selettore modello nel frontend era **inutile**
- ❌ Sempre usato `evaluationConfig.model` (default: `llama3.2:3b`)
- ❌ Impossibile testare modelli diversi
- ❌ Nessun log del modello effettivamente usato

### Dopo il Fix:
- ✅ Selettore modello nel frontend **funzionante**
- ✅ Modello dinamico in base alla selezione utente
- ✅ Fallback a `evaluationConfig.model` se non specificato
- ✅ Log completi del modello usato in ogni fase
- ✅ Supporto per `detailedAccuracyCheck` con modello personalizzato

## 🔧 Dettagli Tecnici

### Pattern Utilizzato

In ogni funzione che chiama l'LLM, ho usato questo pattern:

```typescript
async functionName(...args, model?: string) {
  const modelToUse = model || evaluationConfig.model;

  logger.info('Operation starting', { model: modelToUse, ... });

  const result = await this.ollamaService!.generateChat(
    prompt,
    systemPrompt,
    modelToUse  // Passa esplicitamente
  );

  return result;
}
```

### Vantaggi del Pattern:
1. **Backward Compatible**: Se `model` non viene passato, usa il default
2. **Explicit Logging**: Ogni operazione logga il modello usato
3. **No Breaking Changes**: Funziona sia con che senza model parameter
4. **Consistent**: Stesso pattern in tutti i servizi

## 📚 Conclusioni

### Problema Risolto:
Il parametro `model` ora viene correttamente propagato da frontend a Ollama attraverso **tutti** i layer:
- Frontend UI ✅
- Frontend Service ✅
- API HTTP ✅
- Backend Controller ✅
- Evaluation Services ✅
- Ollama Service ✅
- LLM Client ✅

### Verifiche Effettuate:
- ✅ Compilazione senza errori (0 TypeScript errors)
- ✅ Tutti i servizi aggiornati
- ✅ Logging completo implementato
- ✅ Backward compatibility mantenuta

### Come Verificare:
1. Controllare i log del backend durante una valutazione
2. Verificare che il modello nei log corrisponda a quello selezionato
3. Testare con modelli diversi e confermare che vengano usati

### Benefici:
- 🎯 **Selezione modello funzionante**: Gli utenti possono ora scegliere quale modello usare
- 🔍 **Debugging migliorato**: Log chiari mostrano quale modello viene usato
- 🧪 **Testing flessibile**: Possibile testare diverse LLM senza cambiare configurazione
- 🚀 **Scalabilità**: Facile aggiungere nuovi modelli in futuro
