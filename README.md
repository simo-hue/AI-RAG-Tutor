# AI Speech Evaluator - Sistema di Valutazione Presentazioni 🎯

Un sistema **completamente locale** e **operativo** di valutazione speech-to-text basato su RAG (Retrieval-Augmented Generation) che analizza presentazioni orali confrontandole con documenti di riferimento utilizzando **Ollama** e **Whisper locale**.

**🚀 STATUS: PRODUZIONE-READY** - Sistema completo, testato e ottimizzato con feedback avanzato e test microfono professionale

## 🎬 Demo Live

**Frontend**: [http://localhost:3000](http://localhost:3000) - Interfaccia utente completa
**Backend API**: [http://localhost:3001](http://localhost:3001) - Server API con documentazione

### ⚡ Quick Demo
1. **Test Microfono**: [/microphone-test](http://localhost:3000/microphone-test) - Test hardware come Google Meet
2. **Demo Completa**: [/upload](http://localhost:3000/upload) - Flusso completo valutazione
3. **Documentazione**: [/docs](http://localhost:3000/docs) - Guida utente integrata

---

## 🌟 Caratteristiche Principali

### 🔒 **100% Privacy & Controllo Locale**
- **Nessuna dipendenza da API esterne** - Tutto eseguito localmente
- **Privacy totale** - I dati non lasciano mai il tuo server
- **Costi zero** - Nessun costo per API calls
- **Controllo completo** - Modelli e configurazioni personalizzabili

### 🚀 **Funzionalità Complete (100% Operative)**
- ✅ **Upload Documenti Multi-formato**: PDF, DOCX, TXT con drag & drop
- ✅ **Test Microfono Professionale**: Selezione dispositivi, livelli real-time, visualizzazione audio
- ✅ **Registrazione Audio Avanzata**: Waveform real-time, controlli professionali e validazione audio
- ✅ **Speech-to-Text Locale**: Trascrizione Whisper completamente configurata e ottimizzata
- ✅ **Sistema RAG Intelligente**: Embedding e similarity search con Ollama
- ✅ **Valutazione AI Avanzata**: Analytics dashboard, scoring multi-criterio con feedback professionale
- ✅ **Interfaccia Moderna**: Design responsive con Tailwind CSS e componenti UI avanzati
- ✅ **Architettura Professionale**: Middleware di sicurezza, logging strutturato, rate limiting
- ✅ **Gestione Automatica Porte**: Cleanup automatico per evitare conflitti
- ✅ **Sistema Feedback Completo**: Analytics avanzati, piani di miglioramento personalizzati

## 🏗️ Architettura

```
ai-speech-evaluator/
├── apps/
│   ├── frontend/          # Next.js React app
│   └── backend/           # Express.js API server
├── packages/
│   ├── shared/            # Tipi e schemi condivisi
│   ├── database/          # Prisma ORM e migrations
│   ├── ai-services/       # Servizi AI e RAG
│   └── audio-services/    # Servizi audio e trascrizione
├── docs/                  # Documentazione
└── scripts/               # Utility scripts
```

## 🛠️ Stack Tecnologico

### Frontend
- **Next.js 14** - React framework con App Router
- **TypeScript** - Type safety completo
- **Tailwind CSS** - Styling moderno e responsive
- **React Dropzone** - File upload con drag & drop
- **MediaRecorder API** - Registrazione audio nativa
- **AudioContext API** - Analisi audio real-time
- **Canvas API** - Visualizzazione waveform
- **Lucide React** - Icons moderni

### Backend
- **Express.js** - Web server con middleware enterprise
- **TypeScript** - Type safety completo
- **Multer** - File upload sicuro
- **Winston** - Logging professionale
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting granulare
- **Express Validator** - Validazione input robusta

### 🤖 **AI & ML Locale (Configurato e Testato)**
- **Ollama** ✅ - LLM locale (Llama 3.2:3b, Qwen, ecc.)
- **OpenAI Whisper** ✅ - Speech-to-text locale con modello base precaricato
- **Vector Store** ✅ - Similarity search in-memory o Pinecone
- **Custom RAG Pipeline** ✅ - Implementazione RAG ottimizzata e testata
- **Embedding Locale** ✅ - Nomic Embed Text via Ollama (768 dimensioni)

## 🚀 Quick Start

### Prerequisiti (Obbligatori)
- **Node.js 18+** ✅ - Runtime JavaScript
- **Python 3.8+** ✅ - Per OpenAI Whisper
- **Ollama** ✅ - Server LLM locale ([Installa qui](https://ollama.ai))
- **Browser moderno** ✅ - Con supporto MediaRecorder API

### Prerequisiti Opzionali
- **PostgreSQL** - Per storage persistente (futuro)
- **Pinecone** - Per vector database cloud (opzionale)
- **Docker** - Per deployment containerizzato

### 🔧 Installazione

#### 1. **Setup Ollama (Obbligatorio)**
```bash
# Installa Ollama dal sito ufficiale
curl -fsSL https://ollama.ai/install.sh | sh

# Avvia il server Ollama
ollama serve

# In un nuovo terminale, scarica i modelli richiesti
ollama pull llama3.2:3b          # Modello LLM principale
ollama pull nomic-embed-text     # Modello per embeddings
```

#### 2. **Setup OpenAI Whisper (Obbligatorio)**
```bash
# Installa OpenAI Whisper per trascrizione locale
pip3 install openai-whisper

# Verifica installazione
whisper --help

# Il modello 'base' verrà scaricato automaticamente al primo uso
# Puoi pre-scaricare il modello per evitare latenza:
python3 -c "import whisper; whisper.load_model('base')"
```

#### 3. **Clone e Setup Progetto**
```bash
# Clone repository
git clone https://github.com/simo-hue/AI-RAG-Tutor.git
cd AI-RAG-Tutor

# Installa dipendenze
npm install

# Configura environment dal template
cp apps/backend/.env.example apps/backend/.env
```

#### 4. **Configurazione Base (.env)**
```bash
# File: apps/backend/.env
NODE_ENV=development
PORT=3002

# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Vector Database (memory per sviluppo)
VECTOR_DB_TYPE=memory
EMBEDDING_DIMENSIONS=768

# File Storage
UPLOAD_DIR=./uploads

# CORS
FRONTEND_URL=http://localhost:3000
```

#### 5. **Avvia Applicazione**
```bash
# Avvia entrambi i servizi contemporaneamente
npm run dev

# Oppure separatamente:
npm run dev:frontend    # Frontend su porta 3000
npm run dev:backend     # Backend su porta 3002
```

### ✅ **Verifica Setup**
1. **Frontend**: http://localhost:3000
2. **Backend Health**: http://localhost:3002/api/health
3. **Ollama Status**: http://localhost:11434/api/tags
4. **Whisper Test**: `whisper --help` (deve mostrare help senza errori)

### 🔧 **Troubleshooting Comuni**

#### Errore EADDRINUSE (Porta già in uso)
```bash
# Il sistema include cleanup automatico, ma in caso di problemi:
npm run restart        # Cleanup automatico e restart
# oppure manualmente:
npm run kill-ports     # Kill processi su porte 3000,3002
```

#### Problemi Microfono/Audio
```bash
# Se il test del microfono non funziona:
# 1. Verifica permessi browser (icona microfono nella barra indirizzi)
# 2. Controlla che il microfono sia collegato e funzionante
# 3. Prova con un browser diverso (Chrome/Firefox/Safari)
# 4. Verifica che nessun'altra app stia usando il microfono
```

#### Errore "Settings is not defined" o componenti non definiti
```bash
# Se vedi errori di componenti non definiti:
# 1. Verifica che tutti gli import siano corretti
# 2. Riavvia il dev server: npm run dev
# 3. Pulisci cache: rm -rf .next && npm run dev
```

#### Errore Whisper SSL/Certificati
```bash
# Se Whisper non riesce a scaricare modelli:
python3 -c "
import ssl
ssl._create_default_https_context = ssl._create_unverified_context
import whisper
whisper.load_model('base')
"
```

#### Ollama non risponde
```bash
# Riavvia Ollama
pkill ollama
ollama serve

# Verifica modelli installati
ollama list

# Test connessione Ollama
curl http://localhost:11434/api/tags
```

#### Problemi con il Feedback Analytics
```bash
# Se il sistema di feedback non mostra i dati:
# 1. Verifica che Ollama sia in esecuzione
# 2. Controlla che il modello LLM sia scaricato
# 3. Verifica la connessione backend su porta 3002
# 4. Controlla i log del backend per errori AI
```

## 🎯 **Funzionalità Avanzate Implementate**

### 🎤 **Test Microfono Professionale** (Nuovo in v1.6.0)
Il sistema di test del microfono è stato completamente ridisegnato per offrire un'esperienza simile a Google Meet/Zoom:

#### Caratteristiche Principali:
- **Selezione Dispositivi**: Dropdown automatico di tutti i microfoni disponibili
- **Visualizzazione Real-time**: Indicatori colorati di livello audio (rosso/giallo/verde)
- **Gestione Permessi**: Richiesta automatica permessi con istruzioni chiare
- **Feedback Visivo**: Barre di livello animate e indicatore percentuale
- **Status Monitoring**: Stati chiari (Pronto/Test in Corso/Errore)
- **Auto-cleanup**: Gestione automatica risorse audio e memory leak prevention

#### Utilizzo:
1. Accedi alla pagina [/microphone-test](http://localhost:3000/microphone-test)
2. Consenti l'accesso al microfono quando richiesto
3. Seleziona il dispositivo dal dropdown (se ne hai più di uno)
4. Clicca "Inizia Test Audio" e parla normalmente
5. Monitora i livelli colorati - l'ideale è nel verde (20-80%)
6. Clicca "Test Completato" quando sei soddisfatto

### 📊 **Sistema Feedback Avanzato** (Nuovo in v1.6.0)
Dashboard analytics professionale con 5 tab specializzati per analisi complete:

#### Tab Disponibili:
1. **📋 Overview**: Punteggi generali con grafici radar e indicatori di performance
2. **📈 Detailed Analysis**: Breakdown dettagliato per ogni criterio di valutazione
3. **🎯 Improvement Plan**: Piano di miglioramento personalizzato con azioni prioritarie
4. **📊 Analytics**: Statistiche avanzate (varianza, mediana, range, trends)
5. **🔍 RAG Context**: Visualizzazione chunks del documento utilizzati nell'analisi

#### Metriche Calcolate:
- **Statistical Analysis**: Media, mediana, varianza, deviazione standard
- **Performance Range**: Range punteggi e consistency analysis
- **Improvement Priorities**: Raccomandazioni basate su gap analysis
- **Context Relevance**: Matching score tra presentazione e documento di riferimento

## 🎯 **Funzionalità Complete Disponibili**

### ✅ **Sistema RAG Completo**
- **Upload Documenti**: PDF, DOCX, TXT con validazione e drag & drop
- **Document Processing**: Parsing intelligente, chunking e generazione embeddings
- **Vector Search**: Similarity search contestuale con Ollama e Nomic Embed
- **Context Retrieval**: Recupero chunks rilevanti per valutazione RAG

### ✅ **Test e Registrazione Audio Professionale**
- **Microphone Test**: Test dispositivi con selezione microfono come Google Meet/Zoom
- **Audio Level Monitoring**: Visualizzazione livelli real-time con indicatori colorati
- **Device Management**: Enumerazione automatica dispositivi e gestione permessi
- **Audio Recording**: Registrazione browser con waveform professional e controlli avanzati
- **Speech-to-Text**: Trascrizione locale con Whisper (no API esterne)
- **Audio Processing**: Gestione formati multipli, validazione e pulizia automatica

### ✅ **Valutazione AI Avanzata con Analytics**
- **Evaluation Engine**: Valutazione multi-criterio con Ollama LLM
- **Advanced Scoring**: Accuracy, Clarity, Completeness, Coherence, Fluency con statistiche
- **Professional Feedback**: Dashboard analytics con 5 tab specializzati
- **Improvement Plans**: Piani di miglioramento personalizzati con priorità azioni
- **Statistical Analysis**: Analisi varianza, mediana, range e performance trends
- **RAG Context Visualization**: Visualizzazione chunks rilevanti utilizzati nell'analisi

### ✅ **Sicurezza e Monitoring**
- **Rate Limiting**: Limiti granulari per tipo di operazione
- **Input Validation**: Validazione robusta con express-validator
- **Security Headers**: Protezione completa con Helmet
- **Structured Logging**: Logging professionale con Winston
- **Health Checks**: Monitoring servizi AI e database

## 📊 **Flusso Operativo Completo**

### Pipeline Implementata 🚀
```
1. Upload Documento → Validazione → Parsing
                                     ↓
2. Chunking Intelligente → Embedding Generation (Ollama)
                                     ↓
3. Vector Storage → Similarity Index → Ready for Query
                                     ↓
4. Audio Recording → Local Transcription (Whisper)
                                     ↓
5. Context Retrieval → RAG Query → Relevant Chunks
                                     ↓
6. AI Evaluation (Ollama) → Multi-Criteria Scoring
                                     ↓
7. Detailed Feedback → Recommendations → Final Report
```

## ⚙️ **Configurazione Avanzata**

### 🔧 **Backend Environment (apps/backend/.env)**

#### Configurazione Base (Obbligatoria)
```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Ollama LLM Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_TIMEOUT=120000

# Vector Database
VECTOR_DB_TYPE=memory                # 'memory' o 'pinecone'
EMBEDDING_DIMENSIONS=768
EMBEDDING_BATCH_SIZE=5

# Document Processing
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
PRESERVE_SENTENCES=true

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50
```

#### Configurazione Avanzata (Opzionale)
```env
# Whisper Local (Trascrizione)
WHISPER_MODEL_PATH=./models/whisper
WHISPER_MODEL=base
WHISPER_LANGUAGE=auto

# Security & CORS
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=info

# Rate Limiting (Personalizzabile)
EVALUATION_RATE_LIMIT=20            # Valutazioni per ora
UPLOAD_RATE_LIMIT=10                # Upload per ora
TRANSCRIPTION_RATE_LIMIT=30         # Trascrizioni per ora

# Pinecone (Solo se VECTOR_DB_TYPE=pinecone)
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=gcp-starter
PINECONE_INDEX_NAME=ai-speech-evaluator
```

### 🎚️ **Modelli Supportati**

#### LLM Models (via Ollama)
```bash
# Modelli raccomandati per qualità/performance
ollama pull llama3.2:3b         # Veloce, buona qualità
ollama pull llama3.2:7b         # Migliore qualità, più lento
ollama pull qwen2.5:7b          # Alternativa high-quality
ollama pull mistral:7b          # Buono per evaluazioni
```

#### Embedding Models
```bash
ollama pull nomic-embed-text    # Raccomandato (768 dim)
ollama pull mxbai-embed-large   # Alta qualità (1024 dim)
```

#### Whisper Models (Locale)
- **tiny**: Velocissimo, qualità base
- **base**: Bilanciato (raccomandato)
- **small**: Qualità migliore
- **medium**: Alta qualità, più lento

## 📚 **API Endpoints Completi**

### 📄 **Documenti RAG**
```http
POST   /api/documents/upload                    # Upload documento con processing
GET    /api/documents/                          # Lista documenti
GET    /api/documents/:id                       # Dettagli documento
DELETE /api/documents/:id                       # Elimina documento
GET    /api/documents/:id/status                # Stato processing
POST   /api/documents/:id/process               # Riprocessa documento
POST   /api/documents/:documentId/search        # Similarity search
POST   /api/documents/:documentId/relevant-context  # Context per valutazione
GET    /api/documents/:id/chunks                # Visualizza chunks
GET    /api/documents/:id/metadata              # Metadata documento
```

### 🎵 **Audio e Trascrizione**
```http
POST   /api/audio/upload                        # Upload audio
POST   /api/audio/:id/transcribe                # Trascrizione locale
GET    /api/audio/:id                           # Dettagli registrazione
DELETE /api/audio/:id                           # Elimina registrazione
GET    /api/audio/document/:documentId          # Audio per documento
GET    /api/audio/:id/status                    # Stato processing
```

### 🎯 **Valutazione AI**
```http
POST   /api/evaluations/evaluate                # Valutazione completa
POST   /api/evaluations/quick                   # Valutazione rapida
POST   /api/evaluations/detailed-feedback       # Feedback dettagliato
POST   /api/evaluations/compare                 # Confronta presentazioni
POST   /api/evaluations/full-analysis          # Analisi completa
POST   /api/evaluations/batch                  # Valutazioni multiple
GET    /api/evaluations/criteria               # Spiegazione criteri
GET    /api/evaluations/health                 # Health check AI
```

### 🔍 **Monitoring e Health**
```http
GET    /api/health                             # Health check generale
GET    /api/documents/health                   # Health check RAG
GET    /api/evaluations/health                 # Health check AI
```

## 🧪 Testing (in configurazione)

```bash
# Test suite completa (in sviluppo)
npm run test

# Test coverage (in sviluppo)
npm run test:coverage

# Test watch mode (in sviluppo)
npm run test:watch
```

## 📦 Deployment

### Docker (disponibile)
```bash
# Build immagini
docker-compose build

# Avvia servizi
docker-compose up -d
```

### Produzione (in configurazione)
```bash
# Build ottimizzato (in sviluppo)
npm run build

# Avvia produzione (in sviluppo)
npm run start
```

## 🔍 Monitoring (in sviluppo)

- **Logs**: Winston con rotazione automatica (in configurazione)
- **Metrics**: Prometheus + Grafana ready (in sviluppo)
- **Health Checks**: `/health` endpoint (in sviluppo)
- **Error Tracking**: Strutturato per Sentry (in sviluppo)

## 🤝 Contribuire

1. Fork il repository
2. Crea feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Apri Pull Request

## 📄 Licenza

Questo progetto è sotto licenza MIT. Vedi `LICENSE` per dettagli.

## 📈 **Aggiornamenti Recenti**

### ✅ **v1.6.0 - Sistema Professionale Completo** (Settembre 2024)
- **🎤 Professional Microphone Test**: Test microfono avanzato con selezione dispositivi come Google Meet/Zoom
- **📊 Advanced Feedback System**: Dashboard analytics con 5 tab specializzati e piani miglioramento
- **🎯 Enhanced Audio Pipeline**: Visualizzazione livelli real-time e gestione dispositivi automatica
- **🛡️ Component Robustness**: Audit completo applicazione con correzione errori TypeScript/ESLint
- **🎨 UI/UX Improvements**: Interfaccia ottimizzata con componenti professionali e cleanup automatico
- **📈 Statistical Analysis**: Analytics avanzati con calcoli varianza, mediana e performance trends
- **🔧 Code Quality**: Rimozione funzionalità obsolete e ottimizzazione architettura componenti

### ✅ **v1.5.0 - Sistema Completamente Operativo** (Settembre 2024)
- **🎯 Whisper Integration**: Configurato e testato OpenAI Whisper locale
- **🔧 Automatic Port Management**: Sistema di cleanup automatico porte
- **🎨 Enhanced UI**: Interface completa per valutazione con tabs e statistiche
- **🚀 Real-time Processing**: Visualizzazione backend processing in tempo reale
- **🛡️ Security Hardening**: Middleware di sicurezza completo
- **📊 Comprehensive Analytics**: Dashboard statistiche avanzato
- **✅ End-to-End Testing**: Pipeline completa testata e validata

### 🎯 **Roadmap Prossimi Aggiornamenti**
- **Database Persistence**: Integrazione PostgreSQL per storage permanente
- **User Management**: Sistema di autenticazione e profili utente
- **Batch Processing**: Valutazione multipla e confronto presentazioni
- **Advanced Analytics**: Metriche di performance e trend analysis
- **Mobile Responsive**: Ottimizzazione completa per dispositivi mobili
- **Docker Deployment**: Container production-ready
- **Export Features**: Esportazione report in PDF e statistiche CSV
- **Real-time Collaboration**: Condivisione sessioni di valutazione
- **Custom Models**: Supporto modelli LLM personalizzati

## ⚡ **Ottimizzazioni Performance**

### 🚀 **Configurazioni Consigliate per Performance Ottimale**

#### Hardware Minimo Raccomandato:
- **CPU**: 4+ core (Intel i5/AMD Ryzen 5 o superiore)
- **RAM**: 8GB+ (16GB raccomandato per modelli LLM più grandi)
- **Storage**: SSD con 10GB+ spazio libero
- **Audio**: Microfono USB dedicato o cuffie di qualità

#### Ottimizzazioni Ollama:
```bash
# Per sistemi con GPU NVIDIA (opzionale)
ollama pull llama3.2:3b-q8_0      # Versione quantizzata ad alta qualità
ollama pull llama3.2:7b-q4_0      # Bilanciamento qualità/velocità

# Per sistemi con RAM limitata
ollama pull llama3.2:1b           # Modello più leggero
```

#### Ottimizzazioni Browser:
```bash
# Chrome flags per performance audio ottimale:
# chrome://flags/#enable-experimental-web-platform-features
# chrome://flags/#autoplay-policy (No user gesture required)
```

#### Monitoring Performance:
- **Frontend**: Componenti React ottimizzati con useMemo/useCallback
- **Audio Pipeline**: Cleanup automatico AudioContext per prevenire memory leaks
- **AI Processing**: Timeout configurabili per evitare blocking
- **Rate Limiting**: Limiti intelligenti per proteggere risorse sistema

## 🆘 Supporto

Per problemi o domande:
- Apri un [Issue](https://github.com/simo-hue/AI-RAG-Tutor/issues)
- Consulta la [documentazione](./docs/)
- Contatta il team di sviluppo

### 🐛 **Bug Reports**
Quando riporti un bug, includi:
1. **Sistema Operativo**: macOS/Linux/Windows + versione
2. **Versioni Software**: Node.js, Python, npm, browser utilizzato
3. **Log Output**: Output completo dei terminali frontend/backend
4. **Passi per riprodurre**: Sequenza dettagliata del problema
5. **File coinvolti**: Tipi di documenti, formati audio, dimensioni file
6. **Errori Browser**: Console del browser (F12) per errori JavaScript
7. **Configurazione**: File .env e configurazioni Ollama/Whisper
8. **Dispositivi Audio**: Modello microfono e configurazione sistema

### 📋 **Template Bug Report**
```
**Descrizione del problema:**
[Descrizione dettagliata del bug]

**Environment:**
- OS: [macOS 14.0 / Ubuntu 22.04 / Windows 11]
- Node.js: [v18.17.0]
- Python: [3.9.7]
- Browser: [Chrome 117.0 / Firefox 118.0]

**Passi per riprodurre:**
1. [Primo passo]
2. [Secondo passo]
3. [Errore si verifica qui]

**Risultato atteso:**
[Cosa dovrebbe succedere]

**Risultato effettivo:**
[Cosa succede invece]

**Log Output:**
[Output terminale backend]
[Output terminale frontend]
[Console browser (se applicabile)]

**File di test:**
[Tipo e dimensione documento]
[Formato audio utilizzato]
```
