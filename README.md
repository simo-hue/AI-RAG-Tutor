# AI Speech Evaluator - Sistema di Valutazione Presentazioni 🎯

Un sistema **completamente locale** di valutazione speech-to-text basato su RAG (Retrieval-Augmented Generation) che analizza presentazioni orali confrontandole con documenti di riferimento utilizzando **Ollama** e **Whisper locale**.

## 🌟 Caratteristiche Principali

### 🔒 **100% Privacy & Controllo Locale**
- **Nessuna dipendenza da API esterne** - Tutto eseguito localmente
- **Privacy totale** - I dati non lasciano mai il tuo server
- **Costi zero** - Nessun costo per API calls
- **Controllo completo** - Modelli e configurazioni personalizzabili

### 🚀 **Funzionalità Complete**
- **Upload Documenti Multi-formato**: PDF, DOCX, TXT con drag & drop
- **Registrazione Audio Professionale**: Waveform real-time e controlli avanzati
- **Speech-to-Text Locale**: Trascrizione con Whisper locale (no OpenAI)
- **Sistema RAG Intelligente**: Embedding e similarity search con Ollama
- **Valutazione AI Completa**: Scoring multi-criterio con feedback dettagliato
- **Interfaccia Moderna**: Design responsive con Tailwind CSS
- **Architettura Professionale**: Middleware di sicurezza, logging, rate limiting

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

### 🤖 **AI & ML Locale**
- **Ollama** - LLM locale (Llama 3.2, Qwen, ecc.)
- **Whisper Local** - Speech-to-text locale (Whisper.cpp)
- **Vector Store** - Similarity search in-memory o Pinecone
- **Custom RAG Pipeline** - Implementazione RAG ottimizzata
- **Embedding Locale** - Nomic Embed Text via Ollama

## 🚀 Quick Start

### Prerequisiti
- **Node.js 18+** - Runtime JavaScript
- **Ollama** - Server LLM locale ([Installa qui](https://ollama.ai))
- **Browser moderno** - Con supporto MediaRecorder API

### Prerequisiti Opzionali
- **Whisper.cpp** - Per trascrizione audio ottimizzata
- **PostgreSQL** - Per storage persistente (futuro)
- **Pinecone** - Per vector database cloud (opzionale)

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

#### 2. **Clone e Setup Progetto**
```bash
# Clone repository
git clone https://github.com/simo-hue/AI-RAG-Tutor.git
cd AI-RAG-Tutor

# Installa dipendenze
npm install

# Configura environment dal template
cp apps/backend/.env.example apps/backend/.env
```

#### 3. **Configurazione Base (.env)**
```bash
# File: apps/backend/.env
NODE_ENV=development
PORT=3001

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

#### 4. **Avvia Applicazione**
```bash
# Avvia entrambi i servizi contemporaneamente
npm run dev

# Oppure separatamente:
npm run dev:frontend    # Frontend su porta 3000
npm run dev:backend     # Backend su porta 3001
```

### ✅ **Verifica Setup**
1. **Frontend**: http://localhost:3000
2. **Backend Health**: http://localhost:3001/api/health
3. **Ollama Status**: http://localhost:11434/api/tags

## 🎯 **Funzionalità Complete Disponibili**

### ✅ **Sistema RAG Completo**
- **Upload Documenti**: PDF, DOCX, TXT con validazione
- **Document Processing**: Parsing, chunking e generazione embeddings
- **Vector Search**: Similarity search contestuale con Ollama
- **Context Retrieval**: Recupero chunks rilevanti per valutazione

### ✅ **Registrazione e Trascrizione**
- **Audio Recording**: Registrazione browser con waveform real-time
- **Speech-to-Text**: Trascrizione locale con Whisper (no API esterne)
- **Audio Processing**: Gestione formati multipli e validazione

### ✅ **Valutazione AI Avanzata**
- **Evaluation Engine**: Valutazione multi-criterio con Ollama
- **Scoring System**: Accuracy, Clarity, Completeness, Coherence, Fluency
- **Detailed Feedback**: Feedback dettagliato con suggerimenti miglioramento
- **Batch Processing**: Valutazione multipla e confronto presentazioni

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

## 🆘 Supporto

Per problemi o domande:
- Apri un [Issue](https://github.com/simo-hue/AI-RAG-Tutor/issues)
- Consulta la [documentazione](./docs/)
- Contatta il team di sviluppo
