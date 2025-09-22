'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  Upload,
  Mic,
  Brain,
  FileText,
  BarChart3,
  CheckCircle,
  Play,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <Badge variant="info" className="mb-6 animate-fade-in">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by AI & RAG Technology
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-secondary-900 mb-6 animate-slide-up">
              Valuta le tue{' '}
              <span className="text-gradient">presentazioni</span>
              <br />con l'intelligenza artificiale
            </h1>
            <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up animation-delay-200">
              Sistema avanzato di valutazione speech basato su RAG che analizza le tue presentazioni
              orali confrontandole con documenti di riferimento per un feedback preciso e dettagliato.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-400">
              <Link href="/upload">
                <Button size="lg" className="px-8 py-4">
                  <Play className="w-5 h-5 mr-2" />
                  Inizia la Demo
                </Button>
              </Link>
              <Button variant="secondary" size="lg" className="px-8 py-4">
                <FileText className="w-5 h-5 mr-2" />
                Documentazione
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-4">
              Come Funziona
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Un processo semplice in 4 passaggi per valutare le tue presentazioni
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Upload,
                title: 'Carica Documento',
                description: 'Carica il tuo documento di riferimento (PDF, DOCX, TXT)',
                step: '01'
              },
              {
                icon: Mic,
                title: 'Registra Audio',
                description: 'Registra la tua presentazione direttamente nel browser',
                step: '02'
              },
              {
                icon: Brain,
                title: 'Analisi AI',
                description: 'Il sistema analizza il contenuto usando tecnologia RAG',
                step: '03'
              },
              {
                icon: BarChart3,
                title: 'Risultati',
                description: 'Ricevi feedback dettagliato e punteggio di valutazione',
                step: '04'
              }
            ].map((item, index) => (
              <Card key={index} className="text-center relative">
                <div className="absolute -top-4 left-4 bg-primary-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
                  {item.step}
                </div>
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gradient-to-br from-secondary-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-4">
              Caratteristiche Avanzate
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Tutto quello che ti serve per valutare e migliorare le tue presentazioni
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {[
                {
                  icon: FileText,
                  title: 'Supporto Multi-formato',
                  description: 'Carica documenti PDF, DOCX e TXT per analisi complete'
                },
                {
                  icon: Brain,
                  title: 'Tecnologia RAG',
                  description: 'Retrieval-Augmented Generation per analisi contestuale precisa'
                },
                {
                  icon: BarChart3,
                  title: 'Scoring Dettagliato',
                  description: 'Valutazione multi-criterio: accuratezza, chiarezza, completezza'
                }
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-secondary-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Card className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                  Feedback Intelligente
                </h3>
                <p className="text-secondary-600 mb-6">
                  Ricevi suggerimenti personalizzati per migliorare la tua presentazione
                  basati sull'analisi del contenuto del documento di riferimento.
                </p>
                <div className="space-y-3">
                  {['Accuratezza del contenuto', 'Chiarezza espositiva', 'Completezza argomenti'].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
                      <span className="text-secondary-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Pronto a migliorare le tue presentazioni?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Inizia subito con la nostra demo interattiva e scopri come l'AI può aiutarti.
          </p>
          <Link href="/upload">
            <Button
              size="lg"
              variant="secondary"
              className="px-8 py-4 text-primary-600 hover:text-primary-700"
            >
              Inizia la Demo Gratuita
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}