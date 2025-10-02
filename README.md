# AI Speech Evaluator - Sistema di Valutazione Presentazioni 🎯

Un sistema **completamente locale** e **intelligente** di valutazione speech-to-text basato su RAG (Retrieval-Augmented Generation) che analizza presentazioni orali confrontandole con documenti di riferimento utilizzando **Ollama**, **Whisper locale** e **rilevamento automatico della lingua**.

**🚀 STATUS: PRODUZIONE-READY** - Sistema completo, testato e ottimizzato con gestione automatica di Ollama, selezione modelli AI e supporto multi-lingua

## 🎬 Demo Live

**Frontend**: [http://localhost:3002](http://localhost:3002) - Interfaccia utente completa
**Backend API**: [http://localhost:3001](http://localhost:3001) - Server API con gestione automatica Ollama

### ⚡ Quick Start Demo

1. **Avvia l'applicazione**: `npm run dev` (Ollama si avvia automaticamente!)
2. **Test Microfono**: [/microphone-test](http://localhost:3002/microphone-test) - Test hardware professionale
3. **Demo Completa**: [/upload](http://localhost:3002/upload) - Flusso completo con auto-config
4. **Documentazione**: [/docs](http://localhost:3002/docs) - Guida utente integrata

---

## 🌟 Caratteristiche Principali

### 🔒 **100% Privacy & Controllo Locale**
- **Nessuna dipendenza da API esterne** - Tutto eseguito localmente
- **Privacy totale** - I dati non lasciano mai il tuo server
- **Costi zero** - Nessun costo per API calls
- **Controllo completo** - Modelli e configurazioni personalizzabili
- **Avvio automatico** - Ollama e dipendenze gestite automaticamente

### 🤖 **Gestione Intelligente AI (Nuova v1.7.0!)**
- ✅ **Avvio Automatico Ollama**: Il sistema avvia e gestisce Ollama automaticamente
- ✅ **Selezione Modelli AI**: Interfaccia grafica per scaricare e selezionare modelli LLM
- ✅ **Download Modelli**: Scarica modelli direttamente dall'interfaccia con progress bar
- ✅ **Gestione Modelli**: Visualizza, installa e switcha tra modelli disponibili
- ✅ **Monitoraggio Status**: Verifica stato Ollama e modelli in tempo reale

### 🌍 **Supporto Multi-Lingua Intelligente (Nuova v1.7.0!)**
- ✅ **Rilevamento Automatico**: Identifica la lingua del documento automaticamente
- ✅ **10+ Lingue Supportate**: Italiano, Inglese, Spagnolo, Francese, Tedesco, e altro
- ✅ **Validazione Compatibilità**: Controlla coerenza tra documento e audio
- ✅ **Override Manuale**: Selezione manuale della lingua quando necessario
- ✅ **Feedback Intelligente**: Warning per incompatibilità linguistiche

### 🚀 **Funzionalità Complete (100% Operative)**
- ✅ **Upload Documenti Multi-formato**: PDF, DOCX, TXT con drag & drop
- ✅ **Test Microfono Professionale**: Selezione dispositivi, livelli real-time
- ✅ **Registrazione Audio Avanzata**: Waveform real-time, controlli professionali
- ✅ **Speech-to-Text Multi-Lingua**: Trascrizione Whisper con rilevamento lingua
- ✅ **Sistema RAG Intelligente**: Embedding e similarity search con Ollama
- ✅ **Valutazione AI Avanzata**: Analytics dashboard, scoring multi-criterio
- ✅ **Interfaccia Moderna**: Design responsive con configurazione intelligente
- ✅ **Architettura Professionale**: Middleware di sicurezza, logging strutturato

## 🏗️ Architettura

```
ai-speech-evaluator/
├── apps/
│   ├── frontend/              # Next.js React app
│   │   ├── src/components/
│   │   │   ├── ollama/       # Gestione modelli Ollama (NUOVO!)
│   │   │   ├── language/     # Selezione lingua (NUOVO!)
│   │   │   ├── audio/        # Registrazione e test
│   │   │   ├── evaluation/   # Valutazione e feedback
│   │   │   └── document/     # Upload documenti
│   │   └── src/app/          # Pages e routing
│   └── backend/               # Express.js API server
│       ├── src/routes/        # API endpoints
│       │   ├── ollamaRoutes  # Gestione Ollama (NUOVO!)
│       │   └── languageRoutes # Gestione lingua (NUOVO!)
│       └── src/utils/
│           ├── ollamaManager # Avvio auto Ollama (NUOVO!)
│           └── languageDetector # Rilevamento lingua (NUOVO!)
├── packages/
│   ├── shared/               # Tipi e schemi condivisi
│   ├── database/             # Prisma ORM e migrations
│   ├── ai-services/          # Servizi AI e RAG
│   └── audio-services/       # Servizi audio e trascrizione
└── docs/                     # Documentazione
    ├── OLLAMA_SETUP.md      # Setup Ollama (NUOVO!)
    └── LANGUAGE_SUPPORT.md  # Supporto lingue (NUOVO!)
```

## 🛠️ Stack Tecnologico

### Frontend
- **Next.js 14** - React framework con App Router
- **TypeScript** - Type safety completo
- **Tailwind CSS** - Styling moderno e responsive
- **React Dropzone** - File upload con drag & drop
- **MediaRecorder API** - Registrazione audio nativa
- **AudioContext API** - Analisi audio real-time

### Backend
- **Express.js** - Web server con middleware enterprise
- **TypeScript** - Type safety completo
- **Multer** - File upload sicuro
- **Winston** - Logging professionale
- **Helmet** - Security headers

### 🤖 **AI & ML Locale (Gestito Automaticamente!)**
- **Ollama** ✅ - Avvio automatico e gestione modelli LLM
- **Llama 3.2** ✅ - Modello AI principale (3B/1B parametri)
- **Nomic Embed** ✅ - Embeddings per RAG (768 dimensioni)
- **OpenAI Whisper** ✅ - Speech-to-text multi-lingua locale
- **Custom RAG Pipeline** ✅ - Pipeline RAG ottimizzata

## 🚀 Quick Start

### Prerequisiti

**Obbligatori:**
- **Node.js 18+** - Runtime JavaScript
- **Python 3.8+** - Per OpenAI Whisper
- **Ollama** - Server LLM locale ([Download](https://ollama.ai))

**Opzionali:**
- **PostgreSQL** - Per storage persistente (futuro)
- **Docker** - Per deployment containerizzato

### 🔧 Installazione Rapida

#### 1. **Setup Ollama**

```bash
# macOS/Linux - Installa Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Windows - Scarica da https://ollama.ai

# ✨ NUOVO: Non serve avviare manualmente!
# L'applicazione avvierà Ollama automaticamente
```

#### 2. **Setup OpenAI Whisper**

```bash
# Installa Whisper per trascrizione locale
pip3 install openai-whisper

# Verifica installazione
whisper --help

# Pre-scarica modello (opzionale)
python3 -c "import whisper; whisper.load_model('base')"
```

#### 3. **Setup Progetto**

```bash
# Clone repository
git clone https://github.com/simo-hue/AI-RAG-Tutor.git
cd AI-RAG-Tutor

# Installa dipendenze
npm install

# Configura environment (opzionale - usa valori di default)
cp apps/backend/.env.example apps/backend/.env
```

#### 4. **Avvia Applicazione**

```bash
# 🚀 Avvio con auto-configurazione
npm run dev

# Il sistema automaticamente:
# ✅ Avvia Ollama (se non è già in esecuzione)
# ✅ Verifica modelli disponibili
# ✅ Mostra stato nella console
# ✅ Avvia frontend e backend
```

**Console Output:**
```
✅ Ollama service is running
✅ Default model llama3.2:3b is available
🚀 Server running on port 3001 in development mode
🤖 Ollama API: http://localhost:3001/api/ollama
📍 Health check: http://localhost:3001/api/health
```

### ✅ **Verifica Setup**

1. **Frontend**: [http://localhost:3002](http://localhost:3002)
2. **Backend Health**: [http://localhost:3001/api/health](http://localhost:3001/api/health)
3. **Ollama Status**: [http://localhost:3001/api/ollama/status](http://localhost:3001/api/ollama/status)

### 🎯 **Primo Utilizzo - Demo Guidata**

1. **Apri** [http://localhost:3002/upload](http://localhost:3002/upload)

2. **Configura Sistema** (nella parte superiore):
   - **Selettore Modelli AI**: Verifica/scarica modello Ollama
   - **Selettore Lingua**: Lascia su "Auto" o seleziona manualmente

3. **Carica Documento**:
   - Trascina un file TXT, PDF o DOCX
   - Il sistema rileva automaticamente la lingua
   - Attendi completamento processing

4. **Registra Audio**:
   - Clicca "Inizia Registrazione"
   - Parla per ~1-2 minuti
   - Stop registrazione
   - Trascrizione automatica nella stessa lingua del documento

5. **Ottieni Feedback**:
   - Clicca "Ottieni Feedback"
   - Attendi valutazione AI (~30 secondi)
   - Esplora risultati nei 5 tab disponibili

## 🎯 **Nuove Funzionalità v1.7.0**

### 🤖 **Gestione Automatica Ollama**

#### Avvio Automatico
```typescript
// Il backend avvia automaticamente Ollama
npm run dev

// Output:
✅ Ollama service is running
✅ Default model llama3.2:3b is available
```

#### Interfaccia Gestione Modelli
- **Lista Modelli**: Visualizza tutti i modelli installati
- **Download Modelli**: Scarica nuovi modelli con progress bar
- **Selezione Modello**: Scegli quale modello usare per le valutazioni
- **Modelli Consigliati**:
  - 🏆 **llama3.2:3b** - Veloce e bilanciato (consigliato)
  - ⚡ **llama3.2:1b** - Leggerissimo per test rapidi
  - 💪 **llama3.1:8b** - Più potente ma più lento
  - 🎨 **gemma2:2b** - Alternativa di Google

#### API Ollama
```bash
# Status Ollama
GET /api/ollama/status

# Avvia Ollama
POST /api/ollama/start

# Lista modelli
GET /api/ollama/models

# Scarica modello
POST /api/ollama/models/pull
Body: { "modelName": "llama3.2:3b" }
```

### 🌍 **Supporto Multi-Lingua Intelligente**

#### Rilevamento Automatico
```typescript
// Il sistema rileva automaticamente la lingua:
1. Carica documento.txt
   → Sistema analizza il testo
   → Rileva: Italiano (confidenza: 92%)

2. Mostra nella UI:
   🇮🇹 Italiano (Auto) ✅
   Confidenza: Alta (92%)
```

#### Lingue Supportate
| Lingua | Auto-Detect | Whisper | Valutazione |
|--------|-------------|---------|-------------|
| 🇮🇹 Italiano | ✅ | ✅ | ✅ |
| 🇬🇧 Inglese | ✅ | ✅ | ✅ |
| 🇪🇸 Spagnolo | ✅ | ✅ | ✅ |
| 🇫🇷 Francese | ✅ | ✅ | ✅ |
| 🇩🇪 Tedesco | ✅ | ✅ | ✅ |
| 🇵🇹 Portoghese | ✅ | ✅ | ✅ |
| 🇨🇳 Cinese | ✅ | ✅ | ✅ |
| 🇯🇵 Giapponese | ✅ | ✅ | ✅ |
| 🇷🇺 Russo | ✅ | ✅ | ✅ |
| 🇸🇦 Arabo | ✅ | ✅ | ✅ |

#### Validazione Compatibilità
```typescript
// Il sistema controlla coerenza documento/audio
Documento: Italiano ✅
Audio: Italiano ✅
→ Valutazione procede

Documento: Italiano ⚠️
Audio: Inglese ⚠️
→ Warning: Lingue diverse, valutazione inaccurata
```

#### API Lingue
```bash
# Lista lingue supportate
GET /api/languages

# Rileva lingua da testo
POST /api/languages/detect
Body: { "text": "Il tuo testo...", "method": "heuristic" }

# Valida compatibilità
POST /api/languages/validate
Body: {
  "documentLanguage": "it",
  "transcriptionLanguage": "en"
}
```

## 📊 **Flusso Operativo Completo (Aggiornato)**

```
1. ⚡ npm run dev
   ↓
2. 🤖 Sistema avvia Ollama automaticamente
   ↓
3. 📄 Upload Documento
   ↓
4. 🌍 Rilevamento automatico lingua (es: Italiano 92%)
   ↓
5. ✂️ Chunking + Embedding (Ollama)
   ↓
6. 🎤 Registrazione Audio
   ↓
7. 🗣️ Trascrizione (Whisper in lingua selezionata)
   ↓
8. ✅ Validazione compatibilità lingue
   ↓
9. 🔍 RAG Query → Retrieval Chunks rilevanti
   ↓
10. 🧠 Valutazione AI (modello selezionato)
    ↓
11. 📊 Feedback Dettagliato + Analytics
```

## 📚 **API Endpoints (Aggiornati v1.7.0)**

### 🤖 **Gestione Ollama** (NUOVO!)
```http
GET    /api/ollama/status              # Status servizio Ollama
POST   /api/ollama/start               # Avvia Ollama
GET    /api/ollama/models              # Lista modelli installati
POST   /api/ollama/models/pull         # Scarica modello
POST   /api/ollama/models/ensure       # Verifica disponibilità
```

### 🌍 **Gestione Lingue** (NUOVO!)
```http
GET    /api/languages                  # Lista lingue supportate
POST   /api/languages/detect           # Rileva lingua da testo
POST   /api/languages/validate         # Valida compatibilità
```

### 📄 **Documenti RAG**
```http
POST   /api/documents/upload           # Upload con rilevamento lingua
GET    /api/documents/                 # Lista documenti
GET    /api/documents/:id              # Dettagli documento
DELETE /api/documents/:id              # Elimina documento
POST   /api/documents/:id/search       # Similarity search
```

### 🎵 **Audio e Trascrizione**
```http
POST   /api/audio/upload               # Upload audio
POST   /api/audio/:id/transcribe       # Trascrizione (con lingua)
GET    /api/audio/:id                  # Dettagli registrazione
DELETE /api/audio/:id                  # Elimina registrazione
```

### 🎯 **Valutazione AI**
```http
POST   /api/evaluations/evaluate       # Valutazione completa
GET    /api/evaluations/health         # Health check AI
```

### 🔍 **Monitoring**
```http
GET    /api/health                     # Health check generale
```

## ⚙️ **Configurazione**

### Backend Environment (apps/backend/.env)

```env
# Server
NODE_ENV=development
PORT=3001

# Ollama (Gestito automaticamente!)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Vector Database
VECTOR_DB_TYPE=memory
EMBEDDING_DIMENSIONS=768

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50

# CORS
FRONTEND_URL=http://localhost:3002
```

## 🔧 **Troubleshooting**

### Ollama non si avvia

**Problema**: `⚠️ Ollama service failed to start`

**Soluzioni**:
```bash
# 1. Verifica installazione
which ollama

# 2. Avvia manualmente
ollama serve

# 3. Controlla log
cat ~/.ollama/logs/server.log
```

### Modello non trovato

**Problema**: `Default model llama3.2:3b not found`

**Soluzioni**:
1. **Dall'interfaccia**: Vai su `/upload` → Selettore modelli → Clicca "Scarica"
2. **Da terminale**: `ollama pull llama3.2:3b`

### Rilevamento lingua errato

**Problema**: Lingua rilevata incorrettamente

**Soluzioni**:
1. **Disattiva "Auto"**: Click sul toggle Auto/Manuale
2. **Seleziona manualmente**: Click sulla lingua corretta
3. **Verifica documento**: Assicurati che il testo sia nella lingua aspettata

### Errore EADDRINUSE (Porta in uso)

```bash
# Cleanup automatico e restart
npm run restart

# O manualmente
npm run kill-ports
npm run dev
```

## 📈 **Aggiornamenti Recenti**

### ✅ **v1.7.0 - Gestione Intelligente AI e Multi-Lingua** (Ottobre 2024)
- **🤖 Auto-Start Ollama**: Avvio automatico del servizio Ollama all'avvio dell'app
- **🎛️ Model Manager UI**: Interfaccia grafica per gestire modelli Ollama
- **📥 Model Download**: Download modelli con progress bar in tempo reale
- **🌍 Language Auto-Detection**: Rilevamento automatico lingua documento
- **🗣️ Multi-Language Support**: 10+ lingue con validazione compatibilità
- **✅ Language Validation**: Warning per incompatibilità documento/audio
- **🎨 Enhanced UI**: Selettori modelli e lingua integrati nel flusso
- **📚 Complete Documentation**: Guide per Ollama e supporto lingue

### ✅ **v1.6.0 - Sistema Professionale Completo** (Settembre 2024)
- **🎤 Professional Microphone Test**: Test avanzato con selezione dispositivi
- **📊 Advanced Feedback System**: Dashboard analytics con 5 tab specializzati
- **🎯 Enhanced Audio Pipeline**: Visualizzazione livelli real-time
- **📈 Statistical Analysis**: Analytics con calcoli varianza e trends

### 🎯 **Roadmap Prossimi Aggiornamenti**
- **🔄 Model Switching**: Cambio modello in tempo reale senza restart
- **📊 Language Analytics**: Statistiche utilizzo lingue e confidenza
- **🎙️ Language-Specific STT**: Ottimizzazioni Whisper per lingua specifica
- **🌐 Custom Language Support**: Aggiunta lingue personalizzate
- **📱 Mobile Optimization**: Ottimizzazione completa per dispositivi mobili
- **🐳 Docker Deployment**: Container production-ready con auto-config
- **👥 User Management**: Sistema autenticazione e profili utente

## 📚 **Documentazione Aggiuntiva**

- **[OLLAMA_SETUP.md](OLLAMA_SETUP.md)** - Guida completa setup e gestione Ollama
- **[LANGUAGE_SUPPORT.md](LANGUAGE_SUPPORT.md)** - Supporto multi-lingua e casistiche
- **[docs/](./docs/)** - Documentazione tecnica completa

## 🆘 Supporto

### Problemi o Domande
- Apri un [Issue](https://github.com/simo-hue/AI-RAG-Tutor/issues)
- Consulta la [documentazione](./docs/)
- Verifica i file di setup: [OLLAMA_SETUP.md](OLLAMA_SETUP.md), [LANGUAGE_SUPPORT.md](LANGUAGE_SUPPORT.md)

### Bug Reports Template

Quando riporti un bug, includi:

```markdown
**Descrizione del problema:**
[Descrizione dettagliata]

**Environment:**
- OS: [macOS 14.0 / Ubuntu 22.04 / Windows 11]
- Node.js: [v18.17.0]
- Python: [3.9.7]
- Browser: [Chrome 117.0 / Firefox 118.0]
- Ollama: [Installato? Versione?]

**Modelli Ollama:**
- Modelli installati: [llama3.2:3b, ...]
- Modello selezionato: [llama3.2:3b]

**Lingua:**
- Lingua documento: [Italiano]
- Lingua audio: [Italiano]
- Rilevamento auto: [Sì/No]

**Passi per riprodurre:**
1. [Primo passo]
2. [Secondo passo]
3. [Errore]

**Log Output:**
```
[Backend logs]
[Frontend console]
[Ollama logs se applicabile]
```

**Screenshot:**
[Se applicabile]
```

## 🤝 Contribuire

1. Fork il repository
2. Crea feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Apri Pull Request

## 📄 Licenza

Questo progetto è sotto licenza MIT. Vedi `LICENSE` per dettagli.

---

## 🎉 **Pronto all'Uso!**

Con le nuove funzionalità v1.7.0, l'applicazione è **ancora più semplice da usare**:

1. ✅ **Installa Ollama** (una volta)
2. ✅ **Installa Whisper** (una volta)
3. ✅ **npm install** (una volta)
4. 🚀 **npm run dev** (sempre)

**Tutto il resto è automatico!** 🎯

Il sistema:
- Avvia Ollama per te
- Rileva la lingua automaticamente
- Scarica i modelli dall'interfaccia
- Gestisce la compatibilità documento/audio
- Fornisce feedback intelligente

**Zero configurazione manuale richiesta!** ✨
