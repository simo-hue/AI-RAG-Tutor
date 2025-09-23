# AI RAG Tutor

Un sistema avanzato di valutazione speech-to-text basato su RAG (Retrieval-Augmented Generation) che analizza presentazioni orali confrontandole con documenti di riferimento.

## 🚀 Caratteristiche

- **Upload Documenti Multi-formato**: Supporto per PDF, DOCX, TXT con drag & drop
- **Registrazione Audio Professionale**: Registrazione in-browser con visualizzazione waveform real-time
- **Speech-to-Text Integrato**: Trascrizione automatica tramite OpenAI Whisper
- **Interfaccia Utente Intuitiva**: Design moderno e responsive con Tailwind CSS
- **Sistema RAG Intelligente**: Embedding vectoriali e similarity search (in sviluppo)
- **Valutazione AI Completa**: Scoring multi-criterio con feedback dettagliato (in sviluppo)
- **Architettura Scalabile**: Monorepo con microservizi modulari
- **Processing Asincrono**: Queue-based processing con BullMQ (in sviluppo)
- **Real-time Updates**: WebSocket per aggiornamenti live (in sviluppo)

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
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling moderno e responsive
- **React Dropzone** - File upload con drag & drop
- **MediaRecorder API** - Registrazione audio native
- **AudioContext API** - Analisi audio real-time
- **Canvas API** - Visualizzazione waveform
- **Lucide React** - Icons

### Backend
- **Express.js** - Web server con middleware robusti
- **Multer** - File upload handling
- **Prisma** - Database ORM (in configurazione)
- **PostgreSQL** - Database (in configurazione)
- **Redis** - Caching e queues (in configurazione)
- **BullMQ** - Job processing (in configurazione)

### AI & ML
- **OpenAI Whisper** - Speech-to-text attualmente implementato
- **OpenAI GPT-4** - LLM evaluation (in sviluppo)
- **Pinecone** - Vector database (in sviluppo)
- **LangChain** - RAG orchestration (in sviluppo)

## 🚀 Quick Start

### Prerequisiti
- Node.js 18+
- Account OpenAI (per speech-to-text)
- Browser moderno con supporto MediaRecorder API

### Prerequisiti Futuri (in sviluppo)
- PostgreSQL
- Redis
- Account Pinecone

### Installazione

1. **Clone repository**
```bash
git clone https://github.com/simo-hue/AI-RAG-Tutor.git
cd AI-RAG-Tutor
```

2. **Installa dipendenze**
```bash
npm install
```

3. **Configura environment**
```bash
# Crea file .env nella cartella backend
echo "OPENAI_API_KEY=your_openai_api_key_here" > apps/backend/.env
echo "PORT=3001" >> apps/backend/.env
```

4. **Avvia sviluppo**
```bash
# Avvia frontend (porta 3000)
npm run dev:frontend

# In un altro terminale, avvia backend (porta 3001)
npm run dev:backend

# Oppure avvia entrambi contemporaneamente
npm run dev
```

### Funzionalità Disponibili

- **Upload Documenti**: Drag & drop di file PDF, DOCX, TXT
- **Registrazione Audio**: Registrazione browser con waveform real-time
- **Trascrizione Speech-to-Text**: Conversione automatica audio in testo tramite Whisper
- **Interfaccia Intuitiva**: Design moderno e responsive

## 📊 Flusso Attuale

### Implementato ✅
1. **Upload Documento** → Validazione e memorizzazione file
2. **Registrazione Audio** → Acquisizione tramite MediaRecorder API
3. **Trascrizione** → Conversione audio in testo via OpenAI Whisper
4. **Visualizzazione** → Display trascrizione nell'interfaccia

### In Sviluppo 🚧
1. **Document Processing** → Parsing → Chunking → Embedding
2. **RAG Query** → Similarity search sui chunks del documento
3. **AI Evaluation** → GPT-4 valuta accuracy, clarity, completeness
4. **Scoring & Feedback** → Punteggio finale con suggerimenti

## 🔧 Configurazione

### Configurazione Attuale

#### Backend Environment (apps/backend/.env)
```env
# Obbligatorio per speech-to-text
OPENAI_API_KEY="sk-your_api_key_here"

# Configurazione server
PORT=3001
NODE_ENV=development

# Directory upload (opzionale)
UPLOAD_DIR="./uploads"
```

### Configurazioni Future

#### Database (in sviluppo)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/ai_speech_evaluator"
```

#### Pinecone Vector DB (in sviluppo)
```env
PINECONE_API_KEY="..."
PINECONE_ENVIRONMENT="gcp-starter"
PINECONE_INDEX_NAME="ai-speech-evaluator"
```

## 📝 API Endpoints

### Documenti (in sviluppo)
- `POST /api/documents/upload` - Upload documento
- `GET /api/documents/:id` - Recupera documento
- `DELETE /api/documents/:id` - Elimina documento

### Audio
- `POST /api/audio/upload` - Upload registrazione
- `POST /api/audio/:id/transcribe` - Trascrivi audio
- `GET /api/audio/:id` - Recupera registrazione
- `DELETE /api/audio/:id` - Elimina registrazione
- `GET /api/audio/document/:documentId` - Registrazioni per documento
- `GET /api/audio/:id/status` - Stato processamento

### Valutazione (in sviluppo)
- `POST /api/evaluation/create` - Crea valutazione
- `GET /api/evaluation/:id` - Recupera valutazione
- `GET /api/evaluation/document/:docId` - Valutazioni per documento

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
