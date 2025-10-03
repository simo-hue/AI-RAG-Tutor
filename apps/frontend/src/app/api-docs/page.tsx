import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { Code, Terminal, Lock, Zap, Database, Cpu, CheckCircle, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'API Documentation - AI Speech Evaluator | REST API v1.0',
  description: 'Documentazione completa API REST di AI Speech Evaluator. Integra la valutazione AI-powered delle presentazioni nelle tue applicazioni con esempi, endpoints e SDK.',
  keywords: 'api documentation ai speech, rest api speech evaluation, ai speech evaluator api, rag api documentation, ollama api integration, whisper api',
  openGraph: {
    title: 'API Documentation - AI Speech Evaluator',
    description: 'Integra la valutazione AI nelle tue applicazioni con la nostra REST API',
    type: 'website',
    locale: 'it_IT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'API Docs - AI Speech Evaluator',
    description: 'REST API completa con SDK per JavaScript, Python e Go',
  },
};

export default function APIDocsPage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Header />

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Badge variant="info" className="mb-6">
                <Code className="w-3 h-3 mr-1" />
                REST API v1.0
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-secondary-900 mb-6">
                Documentazione <span className="text-gradient">API</span>
              </h1>
              <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto">
                Integra la valutazione AI-powered delle presentazioni nelle tue applicazioni con la nostra API RESTful
              </p>
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section className="pb-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-primary-200 bg-primary-50/50">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Zap className="w-6 h-6 mr-3 text-primary-600" />
                  Quick Start
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-secondary-900 mb-2">1. Ottieni la tua API Key</h3>
                  <p className="text-secondary-600 mb-3">
                    Registrati e vai su Dashboard → Settings → API Keys per generare la tua chiave
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-secondary-900 mb-2">2. Base URL</h3>
                  <div className="bg-secondary-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    https://api.aispeecheval.com/v1
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-secondary-900 mb-2">3. Autenticazione</h3>
                  <p className="text-secondary-600 mb-3">
                    Includi la tua API key nell'header di ogni richiesta:
                  </p>
                  <div className="bg-secondary-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Main Endpoints */}
        <section className="pb-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-secondary-900 mb-8">Endpoints Principali</h2>

            <div className="space-y-6">
              {/* Upload Document */}
              <Card className="border-secondary-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">Upload Document</CardTitle>
                      <p className="text-secondary-600">Carica un documento di riferimento per la valutazione</p>
                    </div>
                    <Badge variant="success">POST</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="bg-secondary-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4">
                      POST /documents/upload
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2">Request (multipart/form-data)</h4>
                    <div className="bg-secondary-50 p-4 rounded-lg font-mono text-sm">
                      <div className="text-secondary-700">file: <span className="text-primary-600">[binary]</span></div>
                      <div className="text-secondary-700">language: <span className="text-primary-600">"it" | "en" | "es" | "fr" | "de"</span></div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2">Response (200 OK)</h4>
                    <div className="bg-secondary-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre className="text-secondary-700">{`{
  "success": true,
  "data": {
    "document": {
      "id": "doc_abc123",
      "name": "presentation.pdf",
      "wordCount": 1250,
      "chunkCount": 15,
      "detectedLanguage": {
        "code": "it",
        "name": "Italian",
        "confidence": 0.95
      },
      "uploadedAt": "2024-01-15T10:30:00Z"
    }
  }
}`}</pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2">Esempio cURL</h4>
                    <div className="bg-secondary-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{`curl -X POST https://api.aispeecheval.com/v1/documents/upload \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@presentation.pdf" \\
  -F "language=it"`}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transcribe Audio */}
              <Card className="border-secondary-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">Transcribe Audio</CardTitle>
                      <p className="text-secondary-600">Trascrivi una presentazione audio in testo</p>
                    </div>
                    <Badge variant="success">POST</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="bg-secondary-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4">
                      POST /audio/transcribe
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2">Request (multipart/form-data)</h4>
                    <div className="bg-secondary-50 p-4 rounded-lg font-mono text-sm">
                      <div className="text-secondary-700">audio: <span className="text-primary-600">[binary - webm, mp3, wav]</span></div>
                      <div className="text-secondary-700">language?: <span className="text-primary-600">"it" | "en" | "auto"</span></div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2">Response (200 OK)</h4>
                    <div className="bg-secondary-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre className="text-secondary-700">{`{
  "success": true,
  "data": {
    "transcription": "Oggi parlerò dell'importanza...",
    "language": "it",
    "duration": 180.5,
    "confidence": 0.92
  }
}`}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Evaluate Presentation */}
              <Card className="border-secondary-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">Evaluate Presentation</CardTitle>
                      <p className="text-secondary-600">Valuta una presentazione rispetto al documento di riferimento</p>
                    </div>
                    <Badge variant="success">POST</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="bg-secondary-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4">
                      POST /evaluate
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2">Request (application/json)</h4>
                    <div className="bg-secondary-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre className="text-secondary-700">{`{
  "documentId": "doc_abc123",
  "transcription": "Oggi parlerò dell'importanza...",
  "model": "gpt-4" | "claude-3" | "ollama/llama3.2",
  "evaluationCriteria": {
    "accuracy": true,
    "clarity": true,
    "completeness": true,
    "coherence": true,
    "fluency": true
  }
}`}</pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2">Response (200 OK)</h4>
                    <div className="bg-secondary-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre className="text-secondary-700">{`{
  "success": true,
  "data": {
    "evaluation": {
      "scores": {
        "accuracy": 85,
        "clarity": 90,
        "completeness": 75,
        "coherence": 88,
        "fluency": 92,
        "overall": 86
      },
      "feedback": {
        "strengths": [
          "Esposizione chiara e ben strutturata",
          "Ottima fluidità del discorso"
        ],
        "improvements": [
          "Alcuni concetti del documento non sono stati trattati",
          "Approfondire la sezione 3"
        ],
        "detailedAnalysis": "La presentazione..."
      },
      "ragContext": {
        "chunksUsed": 8,
        "averageSimilarity": 0.78,
        "mostRelevantChunks": [
          {
            "content": "L'intelligenza artificiale...",
            "score": 0.92
          }
        ]
      }
    },
    "processingTime": 2.3
  }
}`}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Get Document */}
              <Card className="border-secondary-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">Get Document</CardTitle>
                      <p className="text-secondary-600">Recupera informazioni su un documento caricato</p>
                    </div>
                    <Badge variant="info">GET</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="bg-secondary-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4">
                      GET /documents/:documentId
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2">Response (200 OK)</h4>
                    <div className="bg-secondary-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre className="text-secondary-700">{`{
  "success": true,
  "data": {
    "document": {
      "id": "doc_abc123",
      "name": "presentation.pdf",
      "content": "...",
      "wordCount": 1250,
      "chunkCount": 15,
      "uploadedAt": "2024-01-15T10:30:00Z"
    }
  }
}`}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Error Handling */}
        <section className="pb-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-secondary-900 mb-8">Gestione Errori</h2>

            <Card className="border-secondary-200">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2">Formato Errore Standard</h4>
                    <div className="bg-secondary-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre className="text-secondary-700">{`{
  "success": false,
  "error": {
    "code": "INVALID_API_KEY",
    "message": "The provided API key is invalid or expired",
    "details": {...}
  }
}`}</pre>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {[
                      { code: '400', desc: 'Bad Request - Parametri mancanti o non validi' },
                      { code: '401', desc: 'Unauthorized - API key mancante o non valida' },
                      { code: '403', desc: 'Forbidden - Accesso negato alla risorsa' },
                      { code: '404', desc: 'Not Found - Risorsa non trovata' },
                      { code: '429', desc: 'Too Many Requests - Rate limit superato' },
                      { code: '500', desc: 'Internal Server Error - Errore del server' },
                    ].map((error, i) => (
                      <div key={i} className="flex items-start p-3 bg-red-50 rounded-lg border border-red-200">
                        <Badge variant="error" className="mr-3 mt-0.5">{error.code}</Badge>
                        <span className="text-sm text-secondary-700">{error.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="pb-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-secondary-900 mb-8">Rate Limits</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  plan: 'Free',
                  limits: [
                    '10 richieste/ora',
                    '100 richieste/giorno',
                    '1 MB max file size',
                  ],
                  icon: CheckCircle,
                  color: 'secondary',
                },
                {
                  plan: 'Pro',
                  limits: [
                    '100 richieste/ora',
                    '1000 richieste/giorno',
                    '50 MB max file size',
                  ],
                  icon: Zap,
                  color: 'primary',
                },
                {
                  plan: 'Enterprise',
                  limits: [
                    'Illimitate',
                    'Custom rate limits',
                    '500 MB max file size',
                  ],
                  icon: Database,
                  color: 'success',
                },
              ].map((tier, i) => (
                <Card key={i} className={`border-${tier.color}-200 bg-${tier.color}-50/30`}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-lg">{tier.plan}</CardTitle>
                      <tier.icon className={`w-5 h-5 text-${tier.color}-600`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tier.limits.map((limit, j) => (
                        <li key={j} className="flex items-center text-sm text-secondary-700">
                          <CheckCircle className={`w-4 h-4 mr-2 text-${tier.color}-600 flex-shrink-0`} />
                          {limit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="pb-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-secondary-900 mb-8">Sicurezza</h2>

            <Card className="border-secondary-200">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start">
                    <Lock className="w-5 h-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-secondary-900 mb-2">HTTPS Obbligatorio</h4>
                      <p className="text-sm text-secondary-600">
                        Tutte le richieste devono utilizzare HTTPS. Le richieste HTTP saranno automaticamente reindirizzate.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Lock className="w-5 h-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-secondary-900 mb-2">API Key Rotation</h4>
                      <p className="text-sm text-secondary-600">
                        Puoi rigenerare le tue API key in qualsiasi momento dalla dashboard. Le chiavi vecchie saranno invalidate dopo 24 ore.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Lock className="w-5 h-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-secondary-900 mb-2">Data Encryption</h4>
                      <p className="text-sm text-secondary-600">
                        Tutti i dati sono crittografati at-rest e in-transit utilizzando AES-256 e TLS 1.3.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Lock className="w-5 h-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-secondary-900 mb-2">IP Whitelisting</h4>
                      <p className="text-sm text-secondary-600">
                        Per i piani Enterprise, è possibile limitare l'accesso API a specifici indirizzi IP.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SDKs */}
        <section className="pb-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-8">SDK & Libraries</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'JavaScript/TypeScript', status: 'Disponibile', link: 'npm install @aispeecheval/sdk' },
                { name: 'Python', status: 'Disponibile', link: 'pip install aispeecheval' },
                { name: 'Go', status: 'In arrivo', link: 'Coming soon' },
              ].map((sdk, i) => (
                <Card key={i} className="border-secondary-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{sdk.name}</span>
                      {sdk.status === 'Disponibile' && (
                        <Badge variant="success" className="text-xs">Disponibile</Badge>
                      )}
                      {sdk.status === 'In arrivo' && (
                        <Badge variant="warning" className="text-xs">Presto</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-secondary-900 text-green-400 p-3 rounded-lg font-mono text-xs">
                      {sdk.link}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
