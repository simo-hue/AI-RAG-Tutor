'use client';

import { Header } from '@/components/layout/Header';
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
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function DocsPage() {
  return (
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

          {/* Quick Start */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChevronRight className="w-5 h-5 mr-2 text-primary-600" />
                Quick Start
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-semibold mb-2">1. Carica Documento</h3>
                  <p className="text-sm text-secondary-600">Carica il tuo documento di riferimento (PDF, DOCX, TXT)</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Mic className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-semibold mb-2">2. Registra Audio</h3>
                  <p className="text-sm text-secondary-600">Registra la tua presentazione direttamente nel browser</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-semibold mb-2">3. Ottieni Feedback</h3>
                  <p className="text-sm text-secondary-600">Ricevi valutazione dettagliata e suggerimenti</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-primary-600" />
                Caratteristiche Principali
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2">🔒 100% Privacy & Locale</h4>
                  <p className="text-secondary-600">
                    Tutto è eseguito localmente usando Ollama e Whisper. I tuoi dati non lasciano mai il tuo computer.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2">🤖 Tecnologia RAG Avanzata</h4>
                  <p className="text-secondary-600">
                    Utilizza Retrieval-Augmented Generation per analisi contestuale precisa del contenuto.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2">📊 Valutazione Multi-Criterio</h4>
                  <p className="text-secondary-600">
                    Scoring dettagliato su accuratezza, chiarezza, completezza, coerenza e fluency.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2">🎯 Feedback Intelligente</h4>
                  <p className="text-secondary-600">
                    Suggerimenti personalizzati per migliorare la tua presentazione.
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
  );
}