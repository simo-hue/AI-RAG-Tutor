'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DocumentUpload, ProcessedDocument } from '@/components/document/DocumentUpload';
import { AudioRecorder } from '@/components/audio/AudioRecorder';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { FileText, ArrowRight, CheckCircle, Mic } from 'lucide-react';

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processedDocuments, setProcessedDocuments] = useState<ProcessedDocument[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);

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
      icon: CheckCircle,
    },
  ];

  return (
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
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Mic className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <CardTitle>Registrazione Audio</CardTitle>
                    <p className="text-sm text-secondary-600 mt-1">
                      Registra la tua presentazione orale basandoti sui documenti caricati
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AudioRecorder
                  onRecordingComplete={(audioBlob, duration) => {
                    console.log('Recording completed:', { audioBlob, duration });
                  }}
                  onTranscriptionComplete={handleTranscriptionComplete}
                  documentId={documentId || undefined}
                  autoTranscribe={true}
                  maxDuration={600} // 10 minutes
                  className="mb-6"
                />

                {transcription && (
                  <div className="mt-6 p-4 bg-info-50 border border-info-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-info-800 mb-2">
                      Contenuto della presentazione:
                    </h4>
                    <p className="text-sm text-info-700 leading-relaxed">
                      {transcription}
                    </p>
                  </div>
                )}

                <div className="pt-6 border-t border-secondary-200">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                    >
                      Indietro
                    </Button>
                    <Button onClick={() => setCurrentStep(3)}>
                      Continua con Valutazione
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Results (Placeholder) */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Risultati e Feedback</CardTitle>
                <p className="text-secondary-600">
                  Valutazione e feedback dettagliato della tua presentazione
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-success-600" />
                  </div>
                  <p className="text-secondary-600">
                    La funzionalità di valutazione e feedback sarà disponibile presto.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="mt-6"
                  >
                    Ricomincia
                  </Button>
                </div>
              </CardContent>
            </Card>
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
  );
}