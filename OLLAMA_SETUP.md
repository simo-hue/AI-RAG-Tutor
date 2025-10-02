# Configurazione Ollama - AI Speech Evaluator

## ✨ Novità: Avvio Automatico e Gestione Modelli

Il sistema ora avvia automaticamente Ollama e permette di selezionare il modello AI da utilizzare direttamente dall'interfaccia web!

## 🚀 Funzionalità Implementate

### 1. Avvio Automatico di Ollama
Quando avvii l'applicazione con `npm run dev`, il backend:
- ✅ Verifica se Ollama è installato
- ✅ Avvia automaticamente il servizio Ollama se non è già in esecuzione
- ✅ Controlla la disponibilità del modello predefinito (`llama3.2:3b`)
- ✅ Mostra messaggi informativi nella console

### 2. Interfaccia di Gestione Modelli
Nella pagina `/upload` troverai un nuovo componente che ti permette di:
- 📋 Visualizzare tutti i modelli disponibili
- ⬇️ Scaricare nuovi modelli direttamente dall'interfaccia
- ✅ Selezionare quale modello utilizzare per le valutazioni
- 📊 Vedere lo stato di download in tempo reale

### 3. Modelli Consigliati

Il sistema suggerisce i seguenti modelli:

| Modello | Dimensione | Descrizione | Consigliato |
|---------|-----------|-------------|-------------|
| **llama3.2:3b** | ~2GB | Veloce e leggero, ideale per la maggior parte dei casi | ✅ |
| llama3.2:1b | ~1GB | Molto leggero, ottimo per test rapidi | |
| llama3.1:8b | ~5GB | Più potente ma richiede più risorse | |
| gemma2:2b | ~1.5GB | Alternativa efficiente di Google | |

## 📦 Installazione Iniziale

Se Ollama non è ancora installato:

```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Oppure scarica da
# https://ollama.ai
```

## 🎯 Come Utilizzare

### Avvio Rapido

1. **Avvia l'applicazione:**
   ```bash
   npm run dev
   ```

2. **Il sistema automaticamente:**
   - Avvia Ollama (se installato)
   - Verifica i modelli disponibili
   - Mostra lo stato nella console

3. **Vai su http://localhost:3000/upload**
   - Vedrai il selettore di modelli in alto
   - Scarica il modello consigliato se necessario
   - Seleziona il modello da utilizzare

### Download di un Modello

Due modi per scaricare un modello:

**Metodo 1: Dall'interfaccia web (Consigliato)**
1. Vai su `/upload`
2. Trova il modello nel selettore
3. Clicca "Scarica"
4. Attendi il completamento (verrà mostrata una progress bar)

**Metodo 2: Da terminale**
```bash
ollama pull llama3.2:3b
```

## 🔧 API Endpoints Disponibili

Il backend ora espone questi nuovi endpoint:

```bash
# Stato del servizio Ollama
GET /api/ollama/status

# Avvia Ollama
POST /api/ollama/start

# Lista modelli disponibili
GET /api/ollama/models

# Scarica un modello
POST /api/ollama/models/pull
Body: { "modelName": "llama3.2:3b" }

# Verifica disponibilità modello
POST /api/ollama/models/ensure
Body: { "modelName": "llama3.2:3b" }
```

## 🔍 Verifica Installazione

Per verificare che tutto funzioni:

```bash
# 1. Verifica che Ollama sia installato
which ollama

# 2. Verifica che il servizio sia attivo
curl http://localhost:11434/api/tags

# 3. Lista modelli installati
ollama list

# 4. Test del backend
curl http://localhost:3002/api/ollama/status
```

## 📝 Esempio di Utilizzo Completo

```bash
# 1. Avvia l'applicazione
npm run dev

# Output atteso:
# ✅ Ollama service is running
# ✅ Default model llama3.2:3b is available
# 🚀 Server running on port 3002
# 🤖 Ollama API: http://localhost:3002/api/ollama

# 2. Apri il browser
# http://localhost:3000/upload

# 3. Nel selettore modelli:
# - Se llama3.2:3b è già installato: vedrai il badge "Installato"
# - Se non è installato: clicca "Scarica" e attendi

# 4. Carica un documento e registra l'audio

# 5. La valutazione utilizzerà automaticamente il modello selezionato
```

## 🛠️ Risoluzione Problemi

### Ollama non si avvia automaticamente

**Sintomi:**
- Console mostra "⚠️ Ollama service failed to start"

**Soluzioni:**
1. Verifica che Ollama sia installato: `which ollama`
2. Avvia manualmente: `ollama serve`
3. Controlla i log: `cat ~/.ollama/logs/server.log`

### Modello non trovato

**Sintomi:**
- "Default model llama3.2:3b not found"

**Soluzioni:**
1. Scarica dall'interfaccia web (metodo consigliato)
2. Oppure da terminale: `ollama pull llama3.2:3b`

### Errore durante il download

**Sintomi:**
- Download si blocca o fallisce

**Soluzioni:**
1. Controlla la connessione internet
2. Verifica spazio su disco (i modelli possono essere grandi)
3. Riprova il download
4. Scarica manualmente: `ollama pull nome-modello`

## 🎨 Personalizzazione

### Cambiare il Modello Predefinito

Modifica il file `/apps/backend/src/server.ts`:

```typescript
const defaultModel = 'llama3.2:3b'; // Cambia qui
```

### Aggiungere Nuovi Modelli Consigliati

Modifica il file `/apps/frontend/src/components/ollama/OllamaModelSelector.tsx`:

```typescript
const RECOMMENDED_MODELS = [
  {
    name: 'tuo-modello',
    displayName: 'Il Tuo Modello',
    description: 'Descrizione del modello',
    recommended: true,
    size: '~XGB'
  },
  // ...
];
```

## 📚 Architettura

### Backend (`apps/backend/src/`)

- **`utils/ollamaManager.ts`**: Gestione del ciclo di vita di Ollama
  - Avvio automatico del servizio
  - Verifica installazione
  - Download e gestione modelli

- **`routes/ollamaRoutes.ts`**: API REST per Ollama
  - Status check
  - Model management
  - Download progress tracking

- **`server.ts`**: Integrazione nell'avvio del server
  - Auto-start di Ollama
  - Verifica modelli
  - Graceful shutdown

### Frontend (`apps/frontend/src/`)

- **`components/ollama/OllamaModelSelector.tsx`**: UI per gestione modelli
  - Visualizzazione modelli disponibili
  - Download con progress bar
  - Selezione modello attivo

- **`app/upload/page.tsx`**: Integrazione nel flusso di upload
  - Selettore sempre visibile
  - Passaggio modello al processor

- **`components/evaluation/EvaluationProcessor.tsx`**: Utilizzo modello selezionato
  - Parametro `model` nell'API call

## 🔄 Flusso Completo

```
1. Utente avvia app
   ↓
2. Backend verifica/avvia Ollama
   ↓
3. Backend controlla modelli disponibili
   ↓
4. Utente apre /upload
   ↓
5. Frontend mostra modelli disponibili
   ↓
6. Utente seleziona/scarica modello
   ↓
7. Utente carica documento e registra
   ↓
8. Valutazione usa modello selezionato
   ↓
9. Risultati mostrati all'utente
```

## 📞 Supporto

Se incontri problemi:

1. Controlla i log del backend
2. Verifica lo stato su `/api/ollama/status`
3. Consulta i log di Ollama: `~/.ollama/logs/`
4. Apri un issue su GitHub con i dettagli

## 🎉 Test Rapido

Per testare tutto subito usando i file nella cartella `attachments/`:

```bash
# 1. Avvia l'app
npm run dev

# 2. Vai su http://localhost:3000/upload

# 3. Nel selettore modelli:
#    - Verifica che llama3.2:3b sia installato o scaricalo

# 4. Carica il documento:
#    - attachments/text.txt

# 5. Carica l'audio:
#    - attachments/record.m4a

# 6. Clicca "Ottieni Feedback"

# 7. Osserva il modello selezionato in azione!
```

---

**Fatto! 🎉**

Ora l'applicazione gestisce automaticamente Ollama e permette di scegliere il modello AI preferito direttamente dall'interfaccia web, senza bisogno di configurazioni manuali!
