# Supporto Multi-Lingua - AI Speech Evaluator

## ✨ Nuova Funzionalità: Gestione Intelligente delle Lingue

Il sistema ora supporta il **rilevamento automatico della lingua** con possibilità di **override manuale**, garantendo valutazioni accurate anche con documenti e audio in lingue diverse.

## 🌍 Lingue Supportate

| Lingua | Codice | Nome Nativo | Whisper Support | Flag |
|--------|--------|-------------|-----------------|------|
| **Italiano** (default) | it | Italiano | ✅ | 🇮🇹 |
| Inglese | en | English | ✅ | 🇬🇧 |
| Spagnolo | es | Español | ✅ | 🇪🇸 |
| Francese | fr | Français | ✅ | 🇫🇷 |
| Tedesco | de | Deutsch | ✅ | 🇩🇪 |
| Portoghese | pt | Português | ✅ | 🇵🇹 |
| Cinese | zh | 中文 | ✅ | 🇨🇳 |
| Giapponese | ja | 日本語 | ✅ | 🇯🇵 |
| Russo | ru | Русский | ✅ | 🇷🇺 |
| Arabo | ar | العربية | ✅ | 🇸🇦 |

## 🎯 Come Funziona

### 1. Rilevamento Automatico (Consigliato)

Il sistema rileva automaticamente la lingua in due modi:

**a) Analisi Euristica (Default)**
- Analizza le prime 500 parole del documento
- Usa pattern linguistici comuni
- Calcola punteggio di confidenza
- **Veloce e affidabile** per le lingue principali

**b) Analisi con Ollama (Opzionale)**
- Usa il modello AI selezionato
- Maggiore accuratezza
- Supporta più lingue e dialetti
- Richiede Ollama attivo

### 2. Selezione Manuale

Se il rilevamento automatico non è accurato:
- Disattiva il modo "Auto"
- Seleziona manualmente la lingua corretta
- Il sistema userà sempre la tua selezione

## ⚠️ Casi Problematici e Soluzioni

### Caso 1: Documento e Audio in Lingue Diverse

**Problema:**
```
Documento: italiano.txt (in italiano)
Audio: registrazione in inglese
```

**Risultato:**
- ❌ Valutazione completamente errata
- ❌ RAG trova contenuti non pertinenti
- ❌ Feedback incoerente

**Soluzione:**
```
1. Il sistema mostra un WARNING:
   ⚠️ "Lingua del documento (Italian) diversa dalla trascrizione (English)"

2. Opzioni:
   a) Registra di nuovo nella lingua corretta
   b) Carica un documento nella lingua dell'audio
   c) Ignora il warning (sconsigliato)
```

### Caso 2: Bassa Confidenza nel Rilevamento

**Problema:**
```
Documento con testo misto o ambiguo
Confidenza rilevamento: 45%
```

**Soluzione:**
```
1. Sistema mostra avviso:
   ⚠️ "Bassa confidenza nel rilevamento"

2. Raccomandazione:
   "Ti consigliamo di selezionare manualmente la lingua"

3. Seleziona manualmente la lingua corretta
```

### Caso 3: Lingua Non Supportata

**Problema:**
```
Documento in catalano, sardo, o altra lingua non nella lista
```

**Soluzione:**
```
1. Seleziona la lingua più simile:
   - Catalano → Spagnolo
   - Sardo → Italiano
   - Greco → Inglese

2. La valutazione potrebbe essere meno precisa
3. Considerare di aggiungere supporto per la lingua
```

## 🔧 API Endpoints

### GET /api/languages
Lista lingue supportate

```bash
curl http://localhost:3001/api/languages
```

**Response:**
```json
{
  "success": true,
  "data": {
    "languages": [
      {
        "code": "it",
        "name": "Italian",
        "nativeName": "Italiano",
        "whisperCode": "it",
        "flag": "🇮🇹"
      },
      ...
    ],
    "default": "it"
  }
}
```

### POST /api/languages/detect
Rileva lingua da testo

```bash
curl -X POST http://localhost:3001/api/languages/detect \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Questo è un testo di esempio in italiano",
    "method": "heuristic"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "code": "it",
    "name": "Italian",
    "confidence": 0.85,
    "detectionMethod": "automatic"
  }
}
```

### POST /api/languages/validate
Valida compatibilità lingue

```bash
curl -X POST http://localhost:3001/api/languages/validate \
  -H "Content-Type": application/json" \
  -d '{
    "documentLanguage": "it",
    "transcriptionLanguage": "en",
    "documentConfidence": 0.9,
    "transcriptionConfidence": 0.95
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "compatible": false,
    "warning": "Lingua del documento (Italian) diversa dalla trascrizione (English)",
    "recommendation": "La valutazione potrebbe essere inaccurata. Assicurati che documento e audio siano nella stessa lingua."
  }
}
```

## 🎨 Interfaccia Utente

### Componente LanguageSelector

Il selettore di lingua è sempre visibile nella pagina `/upload` e offre:

1. **Rilevamento Automatico**
   - Badge "Auto" sulla lingua rilevata
   - Punteggio di confidenza visualizzato
   - Toggle per passare a selezione manuale

2. **Selezione Manuale**
   - Griglia di lingue con flag
   - Click per selezionare
   - Evidenziazione della lingua attiva

3. **Feedback Visivo**
   - ✅ Verde: Alta confidenza (>80%)
   - ⚠️ Giallo: Media confidenza (50-80%)
   - ❌ Rosso: Bassa confidenza (<50%)

4. **Avvisi e Raccomandazioni**
   - Warning per bassa confidenza
   - Alert per lingue incompatibili
   - Note informative

## 📝 Esempi d'Uso

### Esempio 1: Uso Standard (Italiano)

```bash
1. Carica documento: "lezione_storia.txt" (in italiano)
   → Sistema rileva: Italiano (confidenza: 92%)

2. Registra audio in italiano
   → Whisper usa: it

3. Valutazione
   → Lingue compatibili ✅
   → Valutazione accurata
```

### Esempio 2: Cambio Lingua Manuale

```bash
1. Carica documento: "history_lesson.txt"
   → Sistema rileva: Inglese (confidenza: 88%)

2. Utente cambia a Inglese manualmente
   → Disattiva "Auto"
   → Seleziona "English"

3. Registra audio in inglese
   → Whisper usa: en

4. Valutazione
   → Lingue compatibili ✅
   → Valutazione accurata
```

### Esempio 3: Correzione Errore

```bash
1. Carica documento: "testo_misto.txt"
   → Sistema rileva: Spagnolo (confidenza: 55%)
   → Mostra warning: "Bassa confidenza"

2. Utente verifica e corregge
   → Legge il documento
   → Capisce che è italiano
   → Seleziona manualmente "Italiano"

3. Registra audio in italiano
   → Whisper usa: it

4. Valutazione
   → Lingue compatibili ✅
   → Valutazione accurata
```

### Esempio 4: Lingue Diverse (Errore)

```bash
1. Carica documento: "lezione.txt" (italiano)
   → Sistema rileva: Italiano (confidenza: 90%)

2. Registra audio in inglese per errore
   → Whisper rileva: en

3. Sistema mostra ALERT:
   ⚠️ Incompatibilità Rilevata

   Documento: Italiano
   Audio: English

   Raccomandazione:
   - Registra di nuovo in italiano, oppure
   - Carica un documento in inglese

4. Utente sceglie:
   a) ← Torna indietro e registra in italiano
   b) Carica nuovo documento in inglese
```

## 🔍 Algoritmo di Rilevamento

### Metodo Euristico

```typescript
// Cerca parole comuni in diverse lingue
const italianWords = ['il', 'la', 'di', 'è', 'che', 'per', ...];
const englishWords = ['the', 'is', 'are', 'and', 'of', 'to', ...];
const spanishWords = ['el', 'la', 'de', 'es', 'y', 'que', ...];

// Conta occorrenze
const italianCount = countOccurrences(text, italianWords);
const englishCount = countOccurrences(text, englishWords);
// ...

// Lingua con più occorrenze vince
const detected = Math.max(italianCount, englishCount, ...);
const confidence = detected / totalWords;
```

### Metodo Ollama

```typescript
// Usa il modello AI per rilevare la lingua
const prompt = `
  Detect the language of this text and respond ONLY with
  the ISO 639-1 code (e.g., 'it', 'en', 'es').

  Text: "${sample}"
`;

const response = await ollama.generate({
  model: 'llama3.2:3b',
  prompt,
  stream: false
});

const languageCode = response.response.trim().toLowerCase();
```

## 🧪 Testing

### Test Case 1: Italiano

```bash
# Documento
echo "Questo è un testo di prova in italiano. Il sistema deve rilevare correttamente la lingua italiana." > test_it.txt

# Upload
curl -X POST http://localhost:3001/api/documents/upload \
  -F "document=@test_it.txt"

# Verifica rilevamento
curl http://localhost:3001/api/languages/detect \
  -d '{"text": "..."}'

# Risultato atteso
{
  "code": "it",
  "confidence": 0.9+
}
```

### Test Case 2: English

```bash
# Document
echo "This is a test document in English. The system should detect English language correctly." > test_en.txt

# Expected detection
{
  "code": "en",
  "confidence": 0.9+
}
```

### Test Case 3: Mixed (Should show warning)

```bash
# Document (Italian)
echo "Documento in italiano" > doc_it.txt

# Audio transcript (English)
"This is my presentation in English"

# Expected validation
{
  "compatible": false,
  "warning": "Languages do not match"
}
```

## 🛠️ Architettura

### Backend

```
utils/languageDetector.ts
├── detectFromText()        # Rilevamento euristico
├── detectWithOllama()      # Rilevamento con AI
├── validateLanguageMatch() # Validazione compatibilità
└── getLanguageByCode()     # Lookup lingua

routes/languageRoutes.ts
├── GET /api/languages           # Lista lingue
├── POST /api/languages/detect   # Rileva lingua
└── POST /api/languages/validate # Valida compatibilità
```

### Frontend

```
components/language/LanguageSelector.tsx
├── Auto-detection mode
├── Manual selection mode
├── Confidence display
└── Warning/Alert system

app/upload/page.tsx
├── selectedLanguage state
├── documentText state
├── handleLanguageSelect()
└── Pass to SimpleAudioRecorder
```

## 🚨 Limitazioni Note

1. **Testi Brevi**: Rilevamento meno accurato con testi < 100 parole
2. **Testi Misti**: Potrebbero creare confusione nel rilevamento
3. **Dialetti**: Non supportati, usa lingua standard più vicina
4. **Codice/Tecnico**: Testo molto tecnico può avere confidenza bassa

## 💡 Best Practices

1. **Documenti Puliti**: Usa testo pulito senza codice o formule
2. **Verifica Rilevamento**: Controlla sempre la lingua rilevata
3. **Stesso Idioma**: Documento e audio nella stessa lingua
4. **Override Manuale**: Se confidenza < 70%, seleziona manualmente
5. **Test Audio**: Usa "Testa Microfono" per verificare qualità

## 🔄 Flusso Completo

```
1. User carica documento
   ↓
2. Sistema estrae testo
   ↓
3. LanguageDetector rileva lingua
   ↓
4. UI mostra lingua + confidenza
   ↓
5. User verifica/corregge
   ↓
6. User registra audio
   ↓
7. Whisper usa lingua selezionata
   ↓
8. Sistema valida compatibilità
   ↓
9. Se incompatibili → Warning
   ↓
10. Valutazione procede o si blocca
```

## 📊 Metriche di Confidenza

| Confidenza | Livello | Azione Raccomandata |
|-----------|---------|---------------------|
| 80-100% | Alta ✅ | Procedi con auto-detection |
| 50-79% | Media ⚠️ | Verifica manualmente |
| 0-49% | Bassa ❌ | **Seleziona manualmente** |

## 🎉 Risultato

Ora il sistema:
- ✅ Rileva automaticamente la lingua del documento
- ✅ Permette override manuale se necessario
- ✅ Valida compatibilità documento/audio
- ✅ Mostra warning per incompatibilità
- ✅ Supporta 10+ lingue principali
- ✅ Fornisce feedback chiaro sulla confidenza
- ✅ Si integra perfettamente nel flusso di upload

**L'utente non deve preoccuparsi della lingua nella maggior parte dei casi!**

Il rilevamento automatico funziona bene, ma se necessario può sempre correggerlo manualmente.
