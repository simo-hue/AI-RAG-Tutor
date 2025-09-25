'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StructuredData } from '@/components/seo/StructuredData';
import { DocumentUpload, ProcessedDocument } from '@/components/document/DocumentUpload';
import { SimpleAudioRecorder } from '@/components/audio/SimpleAudioRecorder';
import { EvaluationProcessor } from '@/components/evaluation/EvaluationProcessor';
import { EvaluationResults } from '@/components/evaluation/EvaluationResults';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { FileText, ArrowRight, CheckCircle, Mic, BarChart3 } from 'lucide-react';
import { EvaluationResult } from '@/services/evaluationService';

// Page metadata for optimal SEO and LLM discovery
export const metadata: Metadata = {
  title: 'Demo Valutazione AI | Carica e Analizza le tue Presentazioni Orali',
  description: 'Demo interattiva per testare l\'AI Speech Evaluator. Carica il tuo documento di riferimento, registra la presentazione e ricevi feedback intelligente immediato. Sistema RAG avanzato per valutazione precisa.',
  keywords: [
    'demo AI speech evaluator',
    'test valutazione presentazioni',
    'carica documento presentazione',
    'registra presentazione orale',
    'feedback immediato AI',
    'demo gratuita speech analysis',
    'prova valutatore presentazioni',
    'upload documento riferimento',
    'registrazione audio browser',
    'analisi RAG tempo reale',
    'demo interattiva education',
    'test preparazione esami',
    'simulazione valutazione orale',
    'prova gratuita AI coach'
  ],
  openGraph: {
    title: 'Demo AI Speech Evaluator - Testa la Valutazione Intelligente',
    description: 'Prova gratuitamente il nostro sistema AI. Carica documento, registra presentazione, ottieni feedback immediato con tecnologia RAG avanzata.',
    url: 'https://ai-speech-evaluator.com/upload',
    images: [
      {
        url: '/og-upload-demo.png',
        width: 1200,
        height: 630,
        alt: 'Demo AI Speech Evaluator - Interface di Upload e Registrazione'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Demo AI Speech Evaluator - Valutazione Presentazioni',
    description: 'Prova gratis: carica documento, registra presentazione, feedback AI immediato.',
  },
  other: {
    'page-type': 'Interactive Demo',
    'demo-features': 'Document upload, audio recording, real-time transcription, AI evaluation',
    'user-journey': 'Upload reference document → Record presentation → Get AI feedback',
    'ai-capabilities': 'RAG analysis, multi-criteria evaluation, intelligent scoring',
    'supported-formats': 'PDF, DOCX, TXT documents; browser audio recording',
    'processing-time': 'Real-time transcription, instant evaluation results',
    'privacy-assured': 'Local processing, no data retention, secure analysis'
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processedDocuments, setProcessedDocuments] = useState<ProcessedDocument[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleDocumentProcessed = (document: ProcessedDocument) => {
    setProcessedDocuments(prev => [...prev, document]);
    // Use the first processed document as the active documentId
    if (!documentId) {
      setDocumentId(document.documentId);
    }
  };

  const handleTranscriptionComplete = (transcriptionText: string) => {
    setTranscription(transcriptionText);
  };

  const handleStartEvaluation = () => {
    if (transcription && documentId) {
      setIsEvaluating(true);
      setEvaluationError(null);
      setCurrentStep(3);
    }
  };

  const handleEvaluationComplete = (result: EvaluationResult) => {
    setEvaluationResult(result);
    setIsEvaluating(false);
  };

  const handleEvaluationError = (error: string) => {
    setEvaluationError(error);
    setIsEvaluating(false);
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setUploadedFiles([]);
    setProcessedDocuments([]);
    setDocumentId(null);
    setTranscription(null);
    setEvaluationResult(null);
    setEvaluationError(null);
    setIsEvaluating(false);
  };

  const steps = [
    {
      number: 1,
      title: 'Carica Documento',
      description: 'Carica il documento di riferimento per la valutazione',
      icon: FileText,
    },
    {
      number: 2,
      title: 'Registra Audio',
      description: 'Registra la tua presentazione orale',
      icon: Mic,
    },
    {
      number: 3,
      title: 'Ottieni Feedback',
      description: 'Ricevi valutazione e suggerimenti dettagliati',
      icon: BarChart3,
    },
  ];

  return (
    <>
      <StructuredData type="demo" />
      <StructuredData type="software" />

      <div className="min-h-screen">
        <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      currentStep >= step.number
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-200 text-secondary-500'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="mt-2 text-center max-w-24">
                    <p className="text-sm font-medium text-secondary-900">
                      {step.title}
                    </p>
                    <p className="text-xs text-secondary-500 hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 transition-colors ${
                      currentStep > step.number
                        ? 'bg-primary-600'
                        : 'bg-secondary-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Step 1: Upload Documents */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <CardTitle>Carica il Documento di Riferimento</CardTitle>
                    <p className="text-sm text-secondary-600 mt-1">
                      Carica il documento che vuoi utilizzare come riferimento per la valutazione della tua presentazione
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DocumentUpload
                  onFileUpload={handleFileUpload}
                  onDocumentProcessed={handleDocumentProcessed}
                  maxFiles={3}
                  maxSize={50}
                />

                {processedDocuments.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-secondary-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-secondary-900">
                          {processedDocuments.length} documento{processedDocuments.length > 1 ? 'i' : ''} processato{processedDocuments.length > 1 ? 'i' : ''}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {processedDocuments.reduce((sum, doc) => sum + (doc.chunkCount || 0), 0)} chunk pronti per l'analisi RAG
                        </p>
                      </div>
                      <Button
                        onClick={() => setCurrentStep(2)}
                        className="flex items-center space-x-2"
                      >
                        <span>Continua</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Audio Recording */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <SimpleAudioRecorder
                onRecordingComplete={(audioBlob, duration) => {
                  if (process.env.NODE_ENV === 'development') {
                    console.log('Recording completed:', { audioBlob, duration });
                  }
                }}
                onTranscriptionComplete={handleTranscriptionComplete}
                autoTranscribe={true}
                maxDuration={600} // 10 minutes
              />

              {transcription && (
                <div className="p-4 bg-info-50 border border-info-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-info-800 mb-2">
                    Contenuto della presentazione:
                  </h4>
                  <p className="text-sm text-info-700 leading-relaxed">
                    {transcription}
                  </p>
                </div>
              )}

              {transcription && (
                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    Indietro
                  </Button>
                  <Button
                    onClick={handleStartEvaluation}
                    disabled={!transcription || !documentId}
                  >
                    Inizia Valutazione
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Evaluation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Show processing when evaluation is running */}
              {isEvaluating && transcription && documentId && (
                <EvaluationProcessor
                  transcription={transcription}
                  documentId={documentId}
                  onEvaluationComplete={handleEvaluationComplete}
                  onError={handleEvaluationError}
                />
              )}

              {/* Show results when evaluation is complete */}
              {evaluationResult && !isEvaluating && (
                <EvaluationResults
                  evaluationResult={evaluationResult}
                  onRestart={handleRestart}
                />
              )}

              {/* Show error state */}
              {evaluationError && !isEvaluating && (
                <Card className="border-error-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-error-600" />
                      <span>Errore durante la Valutazione</span>
                    </CardTitle>
                    <p className="text-secondary-600">
                      Si è verificato un problema durante l'elaborazione
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                        <p className="text-sm text-error-700">
                          {typeof evaluationError === 'string'
                            ? evaluationError
                            : 'Si è verificato un errore durante la valutazione.'
                          }
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep(2)}
                        >
                          Torna alla Registrazione
                        </Button>
                        <Button onClick={handleStartEvaluation}>
                          Riprova Valutazione
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Initial state - shouldn't normally be shown */}
              {!isEvaluating && !evaluationResult && !evaluationError && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-primary-600" />
                      <span>Pronto per la Valutazione</span>
                    </CardTitle>
                    <p className="text-secondary-600">
                      Avvia la valutazione intelligente della tua presentazione
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Button
                        onClick={handleStartEvaluation}
                        disabled={!transcription || !documentId}
                        size="lg"
                      >
                        Avvia Valutazione AI
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      {(!transcription || !documentId) && (
                        <p className="text-sm text-secondary-500 mt-3">
                          Completa i passaggi precedenti per continuare
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Help Section */}
        <Card className="mt-12">
          <CardContent className="text-center">
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Hai bisogno di aiuto?
            </h3>
            <p className="text-secondary-600 mb-4">
              Consulta la nostra guida per iniziare o contatta il supporto
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline">
                Guida all'uso
              </Button>
              <Button variant="outline">
                Contatta Supporto
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

        <Footer />
      </div>
    </>
  );
}