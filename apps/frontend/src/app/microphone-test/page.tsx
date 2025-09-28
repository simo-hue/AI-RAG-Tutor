'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MicrophoneTest } from '@/components/audio/MicrophoneTest';
import { StructuredData } from '@/components/seo/StructuredData';
import { Mic, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MicrophoneTestPage() {
  const router = useRouter();
  return (
    <>
      <StructuredData type="website" />
      <StructuredData
        type="educational"
        data={{
          "@type": "HowTo",
          "name": "Come testare il microfono per registrazioni audio",
          "description": "Guida passo-passo per testare e configurare il microfono prima di registrare presentazioni",
          "step": [
            {
              "@type": "HowToStep",
              "name": "Consenti accesso al microfono",
              "text": "Clicca 'Consenti Accesso' quando richiesto dal browser per abilitare il microfono"
            },
            {
              "@type": "HowToStep",
              "name": "Seleziona il dispositivo",
              "text": "Scegli il microfono da usare dal menu a tendina se ne hai più di uno"
            },
            {
              "@type": "HowToStep",
              "name": "Avvia il test audio",
              "text": "Clicca 'Inizia Test Audio' e parla per vedere il livello audio in tempo reale"
            },
            {
              "@type": "HowToStep",
              "name": "Registra un test",
              "text": "Registra 5 secondi di audio di prova per verificare la qualità"
            },
            {
              "@type": "HowToStep",
              "name": "Ascolta il risultato",
              "text": "Riproduci la registrazione test per confermare che l'audio è chiaro"
            }
          ]
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        <Header />

        {/* Hero Section */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center text-sm text-secondary-600 hover:text-primary-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Torna alla Home
              </Link>
            </div>

            {/* Page Header */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mic className="w-8 h-8" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-secondary-900 mb-6">
                Test del Microfono
              </h1>
              <p className="text-xl text-secondary-600 max-w-3xl mx-auto mb-8">
                Verifica il funzionamento del tuo microfono prima di registrare.
                Seleziona il dispositivo giusto, controlla i livelli audio e testa la qualità di registrazione.
              </p>

              {/* Features Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-secondary-100">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Mic className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-secondary-900 mb-2">
                    Selezione Dispositivo
                  </h3>
                  <p className="text-sm text-secondary-600">
                    Scegli tra tutti i microfoni disponibili sul tuo sistema
                  </p>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-sm border border-secondary-100">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-secondary-900 mb-2">
                    Livelli Audio Real-time
                  </h3>
                  <p className="text-sm text-secondary-600">
                    Visualizza i livelli audio in tempo reale mentre parli
                  </p>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-sm border border-secondary-100">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1m-6 0V9a2 2 0 012-2h2a2 2 0 012 2v1M9 10v10a2 2 0 002 2h2a2 2 0 002-2V10M9 10H7a2 2 0 00-2 2v8a2 2 0 002 2h2" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-secondary-900 mb-2">
                    Verifica Funzionamento
                  </h3>
                  <p className="text-sm text-secondary-600">
                    Testa in tempo reale il funzionamento del microfono
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Test Component */}
        <section className="pb-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <MicrophoneTest
              onTestComplete={(success, deviceId) => {
                if (success) {
                  console.log('Test completato con successo per device:', deviceId);
                  router.push('/upload');
                }
              }}
            />

            {/* Instructions */}
            <div className="mt-12 p-6 bg-white rounded-xl shadow-sm border border-secondary-100">
              <h3 className="font-semibold text-secondary-900 mb-4">
                📋 Come utilizzare il test del microfono:
              </h3>
              <ol className="text-sm text-secondary-700 space-y-3">
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">
                    1
                  </span>
                  <div>
                    <strong>Consenti l'accesso:</strong> Clicca "Consenti Accesso" quando il browser richiede i permessi per il microfono
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">
                    2
                  </span>
                  <div>
                    <strong>Seleziona dispositivo:</strong> Se hai più microfoni, scegli quello che vuoi usare dal menu a tendina
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">
                    3
                  </span>
                  <div>
                    <strong>Avvia test audio:</strong> Clicca "Inizia Test Audio" e parla normalmente per vedere i livelli in tempo reale
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">
                    4
                  </span>
                  <div>
                    <strong>Verifica livelli:</strong> Parla normalmente e controlla che i livelli audio siano nel range verde
                  </div>
                </li>
              </ol>
            </div>

            {/* Tips */}
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-4">
                💡 Suggerimenti per una qualità audio ottimale:
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• <strong>Posizione microfono:</strong> Mantieni il microfono a 15-30cm dalla bocca</li>
                <li>• <strong>Ambiente:</strong> Registra in un ambiente silenzioso senza echi</li>
                <li>• <strong>Livelli audio:</strong> Il livello ideale dovrebbe essere nel verde (20-80%)</li>
                <li>• <strong>Dispositivo:</strong> Usa cuffie con microfono per ridurre il feedback</li>
                <li>• <strong>Test preliminare:</strong> Fai sempre un test prima di registrazioni importanti</li>
              </ul>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}