# AI RAG Tutor

Un sistema avanzato di valutazione speech-to-text basato su RAG (Retrieval-Augmented Generation) che analizza presentazioni orali confrontandole con documenti di riferimento.

## 🚀 Caratteristiche

- **Upload Documenti Multi-formato**: Supporto per PDF, DOCX, TXT
- **Registrazione Audio Avanzata**: Registrazione in-browser con visualizzazione
- **Sistema RAG Intelligente**: Embedding vectoriali e similarity search
- **Valutazione AI Completa**: Scoring multi-criterio con feedback dettagliato
- **Architettura Scalabile**: Monorepo con microservizi modulari
- **Processing Asincrono**: Queue-based processing con BullMQ
- **Real-time Updates**: WebSocket per aggiornamenti live

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
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Dropzone** - File upload
- **Lucide React** - Icons

### Backend
- **Express.js** - Web server
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Redis** - Caching e queues
- **BullMQ** - Job processing

### AI & ML
- **OpenAI GPT-4** - LLM evaluation
- **OpenAI Whisper** - Speech-to-text
- **Pinecone** - Vector database
- **LangChain** - RAG orchestration

## 🚀 Quick Start

### Prerequisiti
- Node.js 18+
- PostgreSQL
- Redis
- Account OpenAI
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
cp .env.example .env
# Modifica .env con le tue API keys
```

4. **Setup database**
```bash
npm run db:migrate
npm run db:seed
```

5. **Avvia sviluppo**
```bash
npm run dev
```

## 📊 Flusso di Valutazione

1. **Upload Documento** → Parsing → Chunking → Embedding
2. **Registrazione Audio** → Trascrizione via Whisper
3. **RAG Query** → Similarity search sui chunks del documento
4. **AI Evaluation** → GPT-4 valuta accuracy, clarity, completeness
5. **Scoring & Feedback** → Punteggio finale con suggerimenti

## 🔧 Configurazione

### Database
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/ai_speech_evaluator"
```

### OpenAI
```env
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4-turbo-preview"
```

### Pinecone
```env
PINECONE_API_KEY="..."
PINECONE_ENVIRONMENT="gcp-starter"
PINECONE_INDEX_NAME="ai-speech-evaluator"
```

## 📝 API Endpoints

### Documenti
- `POST /api/documents/upload` - Upload documento
- `GET /api/documents/:id` - Recupera documento
- `DELETE /api/documents/:id` - Elimina documento

### Audio
- `POST /api/audio/upload` - Upload registrazione
- `POST /api/audio/transcribe` - Trascrivi audio
- `GET /api/audio/:id` - Recupera registrazione

### Valutazione
- `POST /api/evaluation/create` - Crea valutazione
- `GET /api/evaluation/:id` - Recupera valutazione
- `GET /api/evaluation/document/:docId` - Valutazioni per documento

## 🧪 Testing

```bash
# Test suite completa
npm run test

# Test coverage
npm run test:coverage

# Test watch mode
npm run test:watch
```

## 📦 Deployment

### Docker
```bash
# Build immagini
docker-compose build

# Avvia servizi
docker-compose up -d
```

### Produzione
```bash
# Build ottimizzato
npm run build

# Avvia produzione
npm run start
```

## 🔍 Monitoring

- **Logs**: Winston con rotazione automatica
- **Metrics**: Prometheus + Grafana ready
- **Health Checks**: `/health` endpoint
- **Error Tracking**: Strutturato per Sentry

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
