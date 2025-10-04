# AI Speech Evaluator - Sistema di Valutazione Presentazioni 🎯

Un sistema **completamente locale** e **intelligente** di valutazione speech-to-text basato su RAG (Retrieval-Augmented Generation) che analizza presentazioni orali confrontandole **rigorosamente** con documenti di riferimento utilizzando **Ollama**, **Whisper locale** e **rilevamento automatico della lingua**.

**🚀 STATUS: PRODUZIONE-READY** - Sistema completo, testato e ottimizzato con gestione automatica di Ollama, selezione modelli AI e supporto multi-lingua

📖 **Quick Links:** [📋 Docs Index](./DOCS_INDEX.md) | [🚀 Installation](./INSTALLATION_GUIDE.md) | [🧪 Testing Guide](./AUDIO_FEATURES_DOCUMENTATION.md#testing) | [🤝 Contributing](./CONTRIBUTING.md) | [📝 Changelog](./CHANGELOG.md)

## 🎯 Caratteristiche Uniche

### 📊 **Valutazione Rigorosa Basata sul Documento**
- ⚠️ **Zero Conoscenza Esterna**: L'AI valuta SOLO confrontando con il documento caricato
- 🎯 **Accuratezza Rigorosa**: Penalizza automaticamente informazioni non presenti nel documento
- 📖 **Fedeltà al Contenuto**: Verifica che la presentazione rifletta esattamente il documento
- 🔍 **Trasparenza Completa**: Mostra i chunk del documento usati per la valutazione

### 🤖 **Gestione Intelligente Modelli AI**
- ✅ **Selezione Visuale**: Scegli il modello dall'interfaccia grafica
- 📥 **Download Automatico**: Se il modello non è installato, viene scaricato automaticamente
- 📊 **Progress Bar Real-time**: Monitora il download con barra di progresso
- 🔄 **Switch Istantaneo**: Cambia modello al volo senza restart
- 💡 **Raccomandazioni Smart**: Suggerimenti sui modelli migliori per caso d'uso

### 🎙️ **NUOVO: Analisi Audio Avanzata (v2.0.0)** ⭐
- 📈 **Speech Rate Analysis**: Calcolo WPM (Words Per Minute) con raccomandazioni personalizzate
- ⏸️ **Pause Detection**: Analisi pause (brevi/medie/lunghe) e distribuzione ottimale
- 🗣️ **Filler Words Detection**: Rilevamento automatico di 18 filler words italiani (ehm, uhm, cioè, tipo, ecc.)
- 🎵 **Audio Quality Metrics**: Analisi volume, pitch variation, e Signal-to-Noise Ratio
- 🏆 **Speaking Performance Score**: Punteggio complessivo 0-100 con strengths/weaknesses
- 💡 **AI-Powered Recommendations**: Suggerimenti specifici per migliorare ogni aspetto
- 📊 **Beautiful Visualizations**: UI professionale con grafici, gauge e comparison badges
- 🧪 **Production-Ready Testing**: 20+ unit tests, integration tests, E2E tests con Playwright

**[📖 Documentazione Completa](./AUDIO_FEATURES_DOCUMENTATION.md)** | **[🚀 Installation Guide](./INSTALLATION_GUIDE.md)**

---

[Il resto del README rimane come nella versione precedente, con le aggiunte]


---

## 🎯 **NUOVO: Modelli AI e Valutazioni Rigide (v1.8.0)**

### 🤖 **Gestione Modelli Ollama - Guida Completa**

Il sistema ora offre una gestione completa dei modelli Ollama direttamente dall'interfaccia web.

#### **Modelli Consigliati** (in ordine di preferenza)

1. **llama3.2:3b** 🏆 (Raccomandato)
   - Dimensione: ~2GB
   - Velocità: ⚡⚡⚡ Veloce
   - Qualità: ⭐⭐⭐⭐ Ottima
   - **Perfetto per**: Uso quotidiano, bilanciamento velocità/qualità
   
2. **llama3.1:8b** 💪 (Massima Qualità)
   - Dimensione: ~4.7GB  
   - Velocità: ⚡⚡ Medio
   - Qualità: ⭐⭐⭐⭐⭐ Eccellente
   - **Perfetto per**: Valutazioni dettagliate, presentazioni importanti

3. **llama3.2:1b** ⚡ (Leggerissimo)
   - Dimensione: ~1.3GB
   - Velocità: ⚡⚡⚡⚡ Ultra veloce
   - Qualità: ⭐⭐⭐ Buona
   - **Perfetto per**: Test rapidi, hardware limitato

#### **Come Scaricare e Selezionare un Modello**

**Metodo 1: Dall'Interfaccia Web** (Consigliato ✨)

1. Vai su `http://localhost:3002/upload`
2. Trova il pannello "Ollama Model Selector" in alto
3. **Se il modello non è installato**:
   - Vedrai "⚠️ Model llama3.2:3b not available"
   - Clicca il pulsante "Scarica llama3.2:3b"
   - Osserva la progress bar in tempo reale
   - Attendi completamento (2-5 minuti per llama3.2:3b)
4. **Dopo il download**:
   - Il modello apparirà nella lista
   - Click per selezionarlo
   - Vedrai "✅ llama3.2:3b (Active)"

**Metodo 2: Da Terminale**

```bash
# Scarica modello
ollama pull llama3.2:3b

# Verifica installazione
ollama list

# Output dovrebbe mostrare:
# NAME             ID              SIZE
# llama3.2:3b     a1b2c3d4        2.0 GB
```

#### **Monitoraggio Download**

Durante il download dall'interfaccia vedrai:
```
📥 Downloading llama3.2:3b
Progress: ████████░░░░ 65% (1.3 GB / 2.0 GB)
Status: pulling manifest
```

### 📊 **Sistema di Valutazione Rigorosa - Dettagli**

#### **⚠️ Regole CRITICHE di Valutazione**

Il sistema applica prompt **estremamente rigidi** per garantire valutazioni basate **ESCLUSIVAMENTE** sul documento:

```
🔒 PROMPT DI SISTEMA:
"Sei un valutatore che DEVE usare SOLO le informazioni del documento fornito.
NON usare la tua conoscenza generale.
Se la presentazione menziona argomenti NON nel documento, penalizzala."
```

#### **Esempi Pratici**

**Scenario 1: Presentazione Corretta** ✅

```
📄 Documento Caricato:
"L'intelligenza artificiale è una tecnologia che permette ai computer di 
imparare dai dati senza essere esplicitamente programmati."

🎤 Presentazione Registrata:
"Parlerò dell'intelligenza artificiale, una tecnologia che fa imparare
i computer dai dati senza programmarli esplicitamente."

📊 Risultato:
- Accuratezza: 95/100 ✅ (Perfetta corrispondenza)
- Completezza: 90/100 ✅ (Copre tutti i concetti)
- Feedback: "Ottima aderenza al documento. Hai coperto tutti i concetti chiave."
```

**Scenario 2: Informazioni Esterne** ⚠️

```
📄 Documento Caricato:
"L'intelligenza artificiale permette ai computer di imparare dai dati."

🎤 Presentazione Registrata:
"L'AI fu inventata nel 1956 da John McCarthy al Dartmouth College.
Oggi permette ai computer di imparare dai dati."

📊 Risultato:
- Accuratezza: 35/100 ⚠️ (Include molte info esterne)
- Feedback Dettagliato:
  "⚠️ PROBLEMI DI ACCURATEZZA:
  - Hai menzionato '1956' che NON è nel documento
  - Hai menzionato 'John McCarthy' che NON è nel documento  
  - Hai menzionato 'Dartmouth College' che NON è nel documento
  
  ✅ PUNTI CORRETTI:
  - Correttamente menzionato 'imparare dai dati'
  
  💡 SUGGERIMENTO:
  Limita la tua presentazione ai concetti presenti nel documento fornito."
```

#### **Tab "Contesto RAG" - Trasparenza Totale**

Quando visualizzi i risultati, il tab "Contesto RAG" mostra **esattamente** quali parti del documento sono state usate:

```
🔍 CHUNK #1 (Rilevanza: 92%)
"L'intelligenza artificiale è una tecnologia che permette ai 
computer di imparare dai dati..."
📊 Questo chunk è stato usato per valutare l'accuratezza

🔍 CHUNK #2 (Rilevanza: 78%)
"...senza essere esplicitamente programmati. Gli algoritmi di 
machine learning analizzano..."
📊 Questo chunk è stato usato per valutare la completezza
```

### 🐛 **Bug Fixes v1.8.0**

- ✅ **Pulsante Feedback Duplicato**: Rimosso pulsante extra durante registrazione
- ✅ **Lingua Non Visualizzata**: Ora mostra badge "Italian (75%)" dopo upload
- ✅ **Tab Contesto RAG Vuoto**: Risolto, ora mostra correttamente i chunk
- ✅ **Stesso ID Documento/RAG**: Fix critico per matching documento-chunks

### 🔧 **Troubleshooting Aggiuntivo**

#### **Il modello non si scarica**

```bash
# 1. Verifica connessione Ollama
curl http://localhost:11434/api/version

# 2. Verifica spazio disco (servono ~2GB per llama3.2:3b)
df -h ~

# 3. Scarica manualmente
ollama pull llama3.2:3b

# 4. Se fallisce, pulisci e riprova
rm -rf ~/.ollama/models/.tmp
ollama pull llama3.2:3b
```

#### **La valutazione non è rigorosa**

Se l'AI sembra usare conoscenza esterna:

1. **Verifica modello**: Usa `llama3.2:3b` o superiore
2. **Controlla i chunk**: Nel tab "Contesto RAG" verifica che siano significativi
3. **Documento troppo corto**: Min. 100 parole per valutazioni accurate
4. **Riavvia Ollama**: A volte aiuta `ollama serve` da terminale

#### **Tab "Contesto RAG" mostra 0 chunk**

```bash
# Verifica che il documento sia stato processato
curl http://localhost:3001/api/documents/<document-id>

# Dovrebbe ritornare:
# { "success": true, "data": { "chunkCount": 3, ... } }

# Se chunkCount è 0, ri-carica il documento
```

---

## 🧪 Testing

### Unit Tests

```bash
cd apps/backend
npm test                    # Run all unit tests
npm run test:watch          # Watch mode
npm run test:ui             # Visual UI
npm run test:coverage       # Coverage report
```

### Integration Tests

```bash
cd apps/backend
npm run test:integration    # Run integration tests
```

### E2E Tests (Playwright)

```bash
# From root directory
npm run test:e2e            # Run all E2E tests
npm run test:e2e:ui         # Interactive UI mode
npm run test:e2e:debug      # Debug mode
npm run test:e2e:report     # View HTML report
```

**Coverage Target:** >80% for critical features

📖 **[Complete Testing Guide](./AUDIO_FEATURES_DOCUMENTATION.md#testing)**

---

## 📚 Documentazione Completa

- **[📋 DOCS_INDEX.md](./DOCS_INDEX.md)** - Indice di tutta la documentazione
- **[🎙️ AUDIO_FEATURES_DOCUMENTATION.md](./AUDIO_FEATURES_DOCUMENTATION.md)** - Guida completa features audio
- **[🚀 INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)** - Installazione dettagliata
- **[📝 CHANGELOG.md](./CHANGELOG.md)** - Storico versioni e modifiche
- **[📊 IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Riepilogo implementazione v2.0.0

---

