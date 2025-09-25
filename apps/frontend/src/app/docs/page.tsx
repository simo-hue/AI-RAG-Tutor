'use client';

import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { StructuredData } from '@/components/seo/StructuredData';

export const metadata: Metadata = {
  title: 'Documentazione Completa - AI Speech Evaluator',
  description: 'Guida completa per utilizzare AI Speech Evaluator. Tutorial passo-passo, risoluzione problemi, esempi pratici e casi d\'uso per studenti e professionisti. Impara a migliorare le tue presentazioni orali con l\'AI.',
  keywords: [
    'guida AI speech evaluator',
    'tutorial valutazione presentazioni',
    'come usare speech evaluator AI',
    'documentazione presentazioni orali',
    'manuale utente AI feedback',
    'guida preparazione esami orali',
    'tutorial speech coaching AI',
    'istruzioni valutazione discorso',
    'documentazione RAG presentazioni',
    'help speech analysis AI'
  ],
  openGraph: {
    title: 'Documentazione Completa - AI Speech Evaluator',
    description: 'Guida completa con tutorial, esempi e risoluzione problemi per utilizzare al meglio AI Speech Evaluator nel miglioramento delle tue presentazioni orali.',
    url: 'https://ai-speech-evaluator.com/docs',
    images: [
      {
        url: '/docs-og-image.png',
        width: 1200,
        height: 630,
        alt: 'Documentazione AI Speech Evaluator - Guida Completa'
      }
    ],
  },
  alternates: {
    canonical: 'https://ai-speech-evaluator.com/docs',
  },
};
import { Footer } from '@/components/layout/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  FileText,
  Upload,
  Mic,
  Brain,
  Settings,
  Code,
  ExternalLink,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Users,
  Star
} from 'lucide-react';
import Link from 'next/link';

export default function DocsPage() {
  return (
    <>
      <StructuredData type="faq" />
      <StructuredData type="educational" />
      <StructuredData
        type="educational"
        data={{
          "@type": "TechArticle",
          "headline": "Documentazione Completa AI Speech Evaluator",
          "description": "Guida completa per utilizzare AI Speech Evaluator. Tutorial, esempi pratici e risoluzione problemi per migliorare le presentazioni orali.",
          "author": {
            "@type": "Organization",
            "name": "AI Speech Evaluator Team"
          },
          "datePublished": "2024-01-15",
          "dateModified": new Date().toISOString().split('T')[0],
          "wordCount": "2500",
          "inLanguage": "it-IT",
          "about": [
            "Speech evaluation with AI",
            "Presentation training tools",
            "Educational AI applications",
            "RAG technology tutorial"
          ]
        }}
      />

      <div className="min-h-screen">
        <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-secondary-900 mb-6">
              Documentazione
            </h1>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Guida completa per utilizzare il sistema AI Speech Evaluator
            </p>
          </div>
        </div>
      </section>

      {/* Documentation Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* What is AI Speech Evaluator */}
          <Card className="mb-8 border-l-4 border-l-primary-600">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2 text-primary-600" />
                Cos'è AI Speech Evaluator?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-secondary-700 mb-4">
                  <strong>AI Speech Evaluator</strong> è uno strumento innovativo che utilizza l'intelligenza artificiale per valutare e migliorare le tue presentazioni orali.
                </p>
                <p className="text-secondary-600 mb-4">
                  🎯 <strong>Perfetto per:</strong> Studenti che preparano esami orali, professionisti che affinano le loro presentazioni, insegnanti che vogliono valutare oggettivamente le performance degli studenti.
                </p>
                <div className="bg-info-50 border border-info-200 rounded-lg p-4">
                  <h4 className="font-semibold text-info-900 mb-2">✨ Cosa lo rende speciale?</h4>
                  <ul className="text-info-800 space-y-1">
                    <li>• <strong>100% Privato</strong> - I tuoi dati non lasciano mai il tuo computer</li>
                    <li>• <strong>Analisi Intelligente</strong> - Confronta la tua presentazione con i documenti di riferimento</li>
                    <li>• <strong>Feedback Dettagliato</strong> - Ricevi suggerimenti specifici per migliorare</li>
                    <li>• <strong>Facile da usare</strong> - Basta caricare un documento e registrare</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Start */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChevronRight className="w-5 h-5 mr-2 text-primary-600" />
                Guida Rapida (5 minuti)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Step by step with more detail */}
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Prepara il tuo documento</h3>
                    <p className="text-secondary-600 mb-2">
                      Carica il documento che vuoi usare come riferimento per la valutazione (dispense, appunti, capitolo di libro, ecc.)
                    </p>
                    <div className="text-sm text-secondary-500">
                      <strong>Formati supportati:</strong> PDF, Word (.docx), Testo (.txt) | <strong>Dimensione max:</strong> 50MB
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Registra la tua presentazione</h3>
                    <p className="text-secondary-600 mb-2">
                      Clicca su "Inizia Registrazione" e presenta l'argomento come faresti durante un esame o una presentazione.
                    </p>
                    <div className="text-sm text-secondary-500">
                      <strong>Consigli:</strong> Parla chiaramente, prenditi il tempo necessario, struttura il discorso con introduzione, sviluppo e conclusione.
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Ricevi la valutazione AI</h3>
                    <p className="text-secondary-600 mb-2">
                      L'intelligenza artificiale analizza la tua presentazione confrontandola con il documento e ti fornisce un punteggio dettagliato.
                    </p>
                    <div className="text-sm text-secondary-500">
                      <strong>Riceverai:</strong> Punteggio generale, valutazioni per categoria (accuratezza, chiarezza, completezza), suggerimenti specifici per migliorare.
                    </div>
                  </div>
                </div>

                <div className="bg-success-50 border border-success-200 rounded-lg p-4 mt-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-success-600 mr-2" />
                    <span className="font-semibold text-success-900">Pronto per iniziare?</span>
                  </div>
                  <p className="text-success-800 mt-2">
                    <Link href="/upload" className="underline font-medium hover:text-success-900">
                      Vai alla demo interattiva →
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Common Problems & Solutions */}
          <Card className="mb-8 border-l-4 border-l-warning-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-warning-600" />
                Problemi Comuni e Soluzioni
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2 flex items-center">
                    <Mic className="w-4 h-4 mr-2" />
                    🎤 "Il microfono non funziona"
                  </h4>
                  <div className="text-secondary-600 space-y-2">
                    <p><strong>Sintomi:</strong> Errore "Requested device not found" o "Permessi negati"</p>
                    <div className="bg-secondary-50 rounded p-3">
                      <p className="font-medium mb-2">Soluzioni (prova in ordine):</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Controlla che un microfono sia collegato fisicamente</li>
                        <li>Su Mac: Preferenze di Sistema → Suono → Input</li>
                        <li>Su Windows: Impostazioni → Sistema → Audio → Input</li>
                        <li>Nel browser: cerca l'icona del microfono nella barra degli indirizzi e abilita</li>
                        <li>Riavvia completamente il browser</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2 flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    📄 "Il documento non viene caricato"
                  </h4>
                  <div className="text-secondary-600">
                    <p><strong>Possibili cause:</strong> Formato non supportato, file troppo grande, caratteri speciali nel nome</p>
                    <div className="bg-secondary-50 rounded p-3 mt-2">
                      <p className="font-medium mb-1">Verifiche da fare:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Il file è in formato PDF, DOCX o TXT?</li>
                        <li>Il file è più piccolo di 50MB?</li>
                        <li>Il nome del file contiene solo lettere, numeri e trattini?</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2 flex items-center">
                    <Brain className="w-4 h-4 mr-2" />
                    🤖 "La valutazione è lenta o non funziona"
                  </h4>
                  <div className="text-secondary-600">
                    <p><strong>Normale:</strong> La prima valutazione può richiedere alcuni minuti per inizializzare l'AI</p>
                    <div className="bg-secondary-50 rounded p-3 mt-2">
                      <p className="font-medium mb-1">Cosa aspettarsi:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Prima valutazione: 3-5 minuti</li>
                        <li>Valutazioni successive: 30-60 secondi</li>
                        <li>Documenti più lunghi richiedono più tempo</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Understanding Your Results */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
                Come Interpretare i Risultati
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-3 flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Punteggio Generale (0-100)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-error-50 border border-error-200 rounded p-3">
                      <div className="font-semibold text-error-900">0-59: Da migliorare</div>
                      <div className="text-sm text-error-700">Focus su accuratezza dei contenuti e struttura del discorso</div>
                    </div>
                    <div className="bg-warning-50 border border-warning-200 rounded p-3">
                      <div className="font-semibold text-warning-900">60-79: Buono</div>
                      <div className="text-sm text-warning-700">Contenuto solido, lavora su fluidità e completezza</div>
                    </div>
                    <div className="bg-success-50 border border-success-200 rounded p-3">
                      <div className="font-semibold text-success-900">80-100: Ottimo</div>
                      <div className="text-sm text-success-700">Presentazione eccellente, perfeziona i dettagli</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-secondary-900 mb-3">Criteri di Valutazione Dettagliati</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-xs font-bold">A</span>
                      </div>
                      <div>
                        <div className="font-medium">Accuratezza</div>
                        <div className="text-sm text-secondary-600">Quanto la tua presentazione è fedele ai contenuti del documento</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 text-xs font-bold">C</span>
                      </div>
                      <div>
                        <div className="font-medium">Chiarezza</div>
                        <div className="text-sm text-secondary-600">Quanto è comprensibile il tuo discorso (pronuncia, ritmo, volume)</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 text-xs font-bold">Co</span>
                      </div>
                      <div>
                        <div className="font-medium">Completezza</div>
                        <div className="text-sm text-secondary-600">Quanto hai coperto dei punti principali del documento</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-yellow-600 text-xs font-bold">Cr</span>
                      </div>
                      <div>
                        <div className="font-medium">Coerenza</div>
                        <div className="text-sm text-secondary-600">Quanto il tuo discorso è ben strutturato e logico</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-600 text-xs font-bold">F</span>
                      </div>
                      <div>
                        <div className="font-medium">Fluidità</div>
                        <div className="text-sm text-secondary-600">Quanto scorrevole e naturale è il tuo modo di parlare</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-info-50 border border-info-200 rounded-lg p-4">
                  <h5 className="font-semibold text-info-900 mb-2">💡 Suggerimenti per Migliorare</h5>
                  <ul className="text-info-800 space-y-1 text-sm">
                    <li>• <strong>Punteggi bassi in Accuratezza:</strong> Rileggi il documento, fai riassunti dei punti chiave</li>
                    <li>• <strong>Punteggi bassi in Chiarezza:</strong> Pratica la dizione, parla più lentamente</li>
                    <li>• <strong>Punteggi bassi in Completezza:</strong> Crea una scaletta degli argomenti prima di registrare</li>
                    <li>• <strong>Punteggi bassi in Coerenza:</strong> Usa connettori logici ("prima", "inoltre", "quindi")</li>
                    <li>• <strong>Punteggi bassi in Fluidità:</strong> Prova multiple volte, riduci le pause</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Use Cases */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-600" />
                Casi d'Uso Pratici
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-3">👨‍🎓 Per Studenti</h4>
                  <div className="space-y-2 text-secondary-600 text-sm">
                    <div>• <strong>Preparazione esami orali:</strong> Carica dispense del professore, registra la tua preparazione</div>
                    <div>• <strong>Presentazioni tesi:</strong> Verifica che copri tutti i punti della tua ricerca</div>
                    <div>• <strong>Esami in lingua straniera:</strong> Migliora pronuncia e fluidità</div>
                    <div>• <strong>Colloqui di lavoro:</strong> Prepara risposte basate su CV e job description</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-secondary-900 mb-3">👩‍💼 Per Professionisti</h4>
                  <div className="space-y-2 text-secondary-600 text-sm">
                    <div>• <strong>Presentazioni aziendali:</strong> Verifica che il pitch copra tutti i punti del brief</div>
                    <div>• <strong>Formazione interna:</strong> Assicurati di coprire tutto il materiale didattico</div>
                    <div>• <strong>Conferenze/Workshop:</strong> Prepara interventi basati su paper o research</div>
                    <div>• <strong>Sales pitch:</strong> Ottimizza presentazioni prodotto basate su schede tecniche</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4">
                <h5 className="font-semibold text-secondary-900 mb-2">🏆 Esempio Pratico: Preparazione Esame</h5>
                <div className="text-secondary-700 text-sm">
                  <p className="mb-2">
                    <strong>Scenario:</strong> Devi sostenere un esame orale di Storia Contemporanea sul capitolo "La Prima Guerra Mondiale"
                  </p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Carica il PDF del capitolo del libro di testo</li>
                    <li>Registra una presentazione di 10-15 minuti sull'argomento</li>
                    <li>Ricevi feedback su cosa hai tralasciato o spiegato male</li>
                    <li>Ripeti finché non ottieni un punteggio soddisfacente</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-primary-600" />
                Caratteristiche Tecniche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2">🔒 100% Privacy & Locale</h4>
                  <p className="text-secondary-600">
                    Tutto è eseguito localmente usando Ollama. I tuoi documenti e registrazioni non lasciano mai il tuo computer.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2">🤖 Tecnologia RAG Avanzata</h4>
                  <p className="text-secondary-600">
                    Utilizza Retrieval-Augmented Generation per analizzare il tuo discorso nel contesto dei documenti di riferimento.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2">📊 Valutazione Multi-Criterio</h4>
                  <p className="text-secondary-600">
                    Scoring dettagliato su 5 criteri: accuratezza, chiarezza, completezza, coerenza e fluidità.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2">🎯 Feedback Intelligente</h4>
                  <p className="text-secondary-600">
                    Suggerimenti personalizzati basati sui punti di forza e debolezza della tua presentazione.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2">🎤 Registrazione Browser Nativa</h4>
                  <p className="text-secondary-600">
                    Usa il microfono direttamente dal browser senza installare software aggiuntivi.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Requirements */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="w-5 h-5 mr-2 text-primary-600" />
                Requisiti di Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Requisiti Obbligatori</h4>
                  <ul className="space-y-2 text-secondary-600">
                    <li>• Node.js 18+</li>
                    <li>• Browser moderno con MediaRecorder API</li>
                    <li>• Ollama installato e configurato</li>
                    <li>• 4GB RAM liberi</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Opzionali</h4>
                  <ul className="space-y-2 text-secondary-600">
                    <li>• Whisper.cpp per trascrizione ottimizzata</li>
                    <li>• PostgreSQL per storage persistente</li>
                    <li>• 8GB RAM per performance migliori</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Documentation */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-600" />
                API Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2">Documenti</h4>
                  <div className="bg-secondary-50 rounded-lg p-3 font-mono text-sm">
                    <div>POST /api/documents/upload</div>
                    <div>GET /api/documents/:id</div>
                    <div>DELETE /api/documents/:id</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2">Audio e Trascrizione</h4>
                  <div className="bg-secondary-50 rounded-lg p-3 font-mono text-sm">
                    <div>POST /api/audio/upload</div>
                    <div>POST /api/audio/:id/transcribe</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2">Valutazione AI</h4>
                  <div className="bg-secondary-50 rounded-lg p-3 font-mono text-sm">
                    <div>POST /api/evaluations/evaluate</div>
                    <div>POST /api/evaluations/detailed-feedback</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ExternalLink className="w-5 h-5 mr-2 text-primary-600" />
                Link Utili
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="https://github.com/simo-hue/AI-RAG-Tutor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Repository GitHub
                </a>
                <a
                  href="https://ollama.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Installazione Ollama
                </a>
                <Link
                  href="/upload"
                  className="flex items-center p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Inizia la Demo
                </Link>
                <a
                  href="http://localhost:3001/api/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Health Check API
                </a>
              </div>
            </CardContent>
          </Card>

        </div>
      </section>

      <Footer />
      </div>
    </>
  );
}