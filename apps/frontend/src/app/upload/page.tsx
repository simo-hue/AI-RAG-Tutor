'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StructuredData } from '@/components/seo/StructuredData';
import { DocumentUpload, ProcessedDocument } from '@/components/document/DocumentUpload';
import { SimpleAudioRecorder } from '@/components/audio/SimpleAudioRecorder';
import { EvaluationProcessor } from '@/components/evaluation/EvaluationProcessor';
import { OllamaStatusPanel } from '@/components/admin/OllamaStatus';
import { EnhancedEvaluationResults } from '@/components/evaluation/EnhancedEvaluationResults';
import { OllamaModelSelector } from '@/components/ollama/OllamaModelSelector';
import { LanguageSelector } from '@/components/language/LanguageSelector';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { FileText, ArrowRight, CheckCircle, Mic, BarChart3 } from 'lucide-react';
import { EvaluationResult } from '@/services/evaluationService';
import Link from 'next/link';

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processedDocuments, setProcessedDocuments] = useState<ProcessedDocument[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('llama3.2:3b');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('it');
  const [documentText, setDocumentText] = useState<string>('');

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleDocumentProcessed = (document: ProcessedDocument) => {
    setProcessedDocuments(prev => [...prev, document]);
    // Use the first processed document as the active documentId
    if (!documentId) {
      setDocumentId(document.documentId);
    }

    // Se il documento ha una lingua rilevata, impostala automaticamente
    if (document.detectedLanguage) {
      console.log('🌍 Setting language from document:', document.detectedLanguage);
      setSelectedLanguage(document.detectedLanguage.code);
      handleLanguageSelect(document.detectedLanguage.code);
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

  const handleFeedbackRequest = () => {
    // Debug: log current state
    console.log('Feedback richiesto - Stato corrente:', {
      transcription: transcription?.substring(0, 50) + '...',
      transcriptionLength: transcription?.length,
      documentId,
      processedDocuments: processedDocuments.length
    });

    // When feedback is requested, start the evaluation process if we have transcription and document
    if (transcription && documentId) {
      console.log('✅ Condizioni soddisfatte, avvio valutazione');
      handleStartEvaluation();
    } else {
      // Show detailed alert with current state
      const missing = [];
      if (!transcription) missing.push('trascrizione');
      if (!documentId) missing.push('documento');

      alert(`Elementi mancanti: ${missing.join(', ')}.\nAssicurati di aver caricato un documento e completato la registrazione.`);
    }
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

  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName);
    console.log('Selected model:', modelName);
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    console.log('Selected language:', language);
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

        {/* Configuration Panel - Always visible */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ollama Model Selector */}
          <OllamaModelSelector
            onModelSelect={handleModelSelect}
            defaultModel={selectedModel}
          />

          {/* Language Selector */}
          <LanguageSelector
            onLanguageSelect={handleLanguageSelect}
            defaultLanguage={selectedLanguage}
            autoDetect={true}
            documentText={documentText}
            showAutoDetection={true}
          />
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
                  onDocumentTextExtracted={(text) => setDocumentText(text)}
                  maxFiles={3}
                  maxSize={50}
                />

                {processedDocuments.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-secondary-200">
                    <div className="space-y-4">
                      {/* Status Summary */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-secondary-900 flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-success-600" />
                            <span>{processedDocuments.length} documento{processedDocuments.length > 1 ? 'i' : ''} processato{processedDocuments.length > 1 ? 'i' : ''}</span>
                          </p>
                          <p className="text-xs text-secondary-500">
                            {processedDocuments.reduce((sum, doc) => sum + (doc.wordCount || 0), 0)} parole •
                            Contenuto estratto e pronto per l'analisi RAG locale
                          </p>
                        </div>
                        <Button
                          onClick={() => setCurrentStep(2)}
                          className="flex items-center space-x-2"
                        >
                          <span>Continua alla Registrazione</span>
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Document Details */}
                      <div className="space-y-2">
                        {processedDocuments.map((doc, index) => (
                          <div key={index} className="p-3 bg-success-50 border border-success-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                                  <FileText className="w-4 h-4 text-success-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-success-900">
                                    {doc.file.name}
                                  </p>
                                  <p className="text-xs text-success-700">
                                    Processato localmente • Pronto per valutazione AI
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" size="sm" className="bg-success-50 text-success-700 border-success-200">
                                  {(doc.wordCount || 0).toLocaleString()} parole
                                </Badge>
                                {doc.detectedLanguage && (
                                  <Badge variant="outline" size="sm" className="bg-primary-50 text-primary-700 border-primary-200">
                                    {doc.detectedLanguage.name} ({Math.round((doc.detectedLanguage.confidence || 0) * 100)}%)
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Technical Info */}
                      <div className="p-3 bg-info-50 border border-info-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="w-4 h-4 text-info-600" />
                          <span className="text-sm font-medium text-info-800">Processamento Locale Completato</span>
                        </div>
                        <p className="text-xs text-info-700">
                          ✓ Contenuto estratto da {processedDocuments.length} file
                          <br />
                          ✓ Embeddings generati con modello locale
                          <br />
                          ✓ Vector database indicizzato e pronto per ricerca semantica
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Audio Recording */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Microphone Test Banner */}
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Mic className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-900">
                          Test del Microfono Raccomandato
                        </h3>
                        <p className="text-sm text-blue-700">
                          Verifica che il tuo microfono funzioni correttamente prima di registrare
                        </p>
                      </div>
                    </div>
                    <Link href="/microphone-test">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        Testa Microfono
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <SimpleAudioRecorder
                onRecordingComplete={(audioBlob, duration) => {
                  if (process.env.NODE_ENV === 'development') {
                    console.log('Recording completed:', { audioBlob, duration });
                  }
                }}
                onTranscriptionComplete={handleTranscriptionComplete}
                onFeedbackRequest={handleFeedbackRequest}
                autoTranscribe={true}
                maxDuration={600} // 10 minutes
                language={selectedLanguage}
              />

              {transcription && (
                <div className="space-y-4">
                  <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-success-600" />
                      <h4 className="text-sm font-semibold text-success-800">
                        Trascrizione Completata
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-success-700">
                        <span>Lunghezza: {transcription.length} caratteri</span>
                        <span>Parole: ~{transcription.split(' ').length}</span>
                      </div>
                      <p className="text-sm text-success-700 leading-relaxed bg-white/60 p-3 rounded border">
                        {transcription}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-info-50 border border-info-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Mic className="w-4 h-4 text-info-600" />
                      <span className="text-sm font-medium text-info-800">Processamento Audio Locale</span>
                    </div>
                    <p className="text-xs text-info-700">
                      ✓ Audio processato con Whisper locale
                      <br />
                      ✓ Trascrizione generata senza invio dati esterni
                      <br />
                      ✓ Pronto per analisi di similarità con il documento
                    </p>
                  </div>
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
                    className="bg-primary-600 hover:bg-primary-700 text-white"
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
                  model={selectedModel}
                  onEvaluationComplete={handleEvaluationComplete}
                  onError={handleEvaluationError}
                />
              )}

              {/* Show results when evaluation is complete */}
              {evaluationResult && !isEvaluating && (
                <EnhancedEvaluationResults
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

                        {/* Show Ollama diagnostics if there's a service error */}
                        {(evaluationError?.includes('Service') ||
                          evaluationError?.includes('RAG') ||
                          evaluationError?.includes('initialized') ||
                          evaluationError?.includes('Internal Server Error')) && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-error-800 mb-2">🔧 Pannello Diagnostico</h4>
                            <OllamaStatusPanel />
                          </div>
                        )}
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

        {/* System Status - Local Processing */}
        <Card className="mt-12 border-success-200 bg-success-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-success-800">
              <CheckCircle className="w-5 h-5" />
              <span>Sistema Completamente Locale</span>
            </CardTitle>
            <p className="text-success-700 text-sm">
              Tutti i dati rimangono sul tuo dispositivo - nessun invio a servizi esterni
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-white/60 rounded-lg border border-success-200">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-4 h-4 text-success-600" />
                  <span className="text-sm font-medium text-success-800">Elaborazione Documenti</span>
                </div>
                <p className="text-xs text-success-700">
                  • Estrazione contenuto locale<br />
                  • Embeddings generati in locale<br />
                  • Vector database in memoria
                </p>
              </div>

              <div className="p-3 bg-white/60 rounded-lg border border-success-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Mic className="w-4 h-4 text-success-600" />
                  <span className="text-sm font-medium text-success-800">Trascrizione Audio</span>
                </div>
                <p className="text-xs text-success-700">
                  • Whisper locale (base model)<br />
                  • Audio processato offline<br />
                  • Nessun invio dati esterni
                </p>
              </div>

              <div className="p-3 bg-white/60 rounded-lg border border-success-200">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-success-600" />
                  <span className="text-sm font-medium text-success-800">Valutazione AI</span>
                </div>
                <p className="text-xs text-success-700">
                  • Ollama LLM (llama3.2:3b)<br />
                  • Analisi completamente locale<br />
                  • Privacy garantita al 100%
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-info-50 border border-info-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-info-600" />
                <span className="text-sm font-medium text-info-800">Vantaggi del Processamento Locale</span>
              </div>
              <ul className="text-xs text-info-700 space-y-1">
                <li>🔒 Privacy completa - i tuoi dati non lasciano mai il dispositivo</li>
                <li>⚡ Nessuna dipendenza da connessione internet per l'elaborazione</li>
                <li>💰 Nessun costo per API esterne o servizi cloud</li>
                <li>🎯 Controllo completo sui modelli e sulla qualità dell'analisi</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-6">
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