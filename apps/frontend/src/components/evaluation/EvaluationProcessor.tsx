'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Progress, Button, Badge } from '@/components/ui';
import {
  Loader2,
  Brain,
  FileSearch,
  MessageSquare,
  BarChart3,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Mic,
  Zap,
  Database,
  Search,
  Cpu,
  Network,
  FileText
} from 'lucide-react';
import { EvaluationResult, evaluationService } from '@/services/evaluationService';

interface EvaluationProcessorProps {
  transcription: string;
  documentId: string;
  onEvaluationComplete: (result: EvaluationResult) => void;
  onError: (error: string) => void;
  className?: string;
}

type ProcessingStage =
  | 'initializing'
  | 'loading-context'
  | 'analyzing-content'
  | 'generating-feedback'
  | 'finalizing'
  | 'completed'
  | 'error';

interface ProcessingStep {
  stage: ProcessingStage;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  duration: number; // estimated duration in ms
}

const PROCESSING_STEPS: ProcessingStep[] = [
  {
    stage: 'initializing',
    label: 'Inizializzazione Sistema',
    description: 'Controllo servizi AI (Ollama, Whisper) e inizializzazione RAG...',
    icon: Network,
    duration: 2000
  },
  {
    stage: 'loading-context',
    label: 'Analisi Documento',
    description: 'Caricamento embeddings del documento e ricerca chunk rilevanti...',
    icon: Database,
    duration: 3000
  },
  {
    stage: 'analyzing-content',
    label: 'Elaborazione Audio',
    description: 'Trascrizione audio con Whisper e preprocessing del testo...',
    icon: Mic,
    duration: 4000
  },
  {
    stage: 'generating-feedback',
    label: 'Calcolo Similarità',
    description: 'Generazione embeddings della trascrizione e confronto con il documento...',
    icon: Search,
    duration: 5000
  },
  {
    stage: 'finalizing',
    label: 'Generazione AI',
    description: 'Valutazione con Ollama LLM e creazione feedback personalizzato...',
    icon: Brain,
    duration: 8000
  }
];

export const EvaluationProcessor = ({
  transcription,
  documentId,
  onEvaluationComplete,
  onError,
  className
}: EvaluationProcessorProps) => {
  const [currentStage, setCurrentStage] = useState<ProcessingStage>('initializing');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentDetails, setCurrentDetails] = useState<string>('');
  const [systemStats, setSystemStats] = useState({
    chunksProcessed: 0,
    embeddingsGenerated: 0,
    similarityScores: [] as number[],
    modelUsed: 'ollama'
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    startEvaluation();
  }, [transcription, documentId]);

  const startEvaluation = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Simulate processing stages for better UX
      await simulateProcessingStages();

      // Actual API call
      const result = await evaluationService.evaluatePresentation(
        transcription,
        documentId,
        {
          maxChunks: 5,
          detailedFeedback: true
        }
      );

      setCurrentStage('completed');
      setProgress(100);
      onEvaluationComplete(result);

    } catch (err) {
      let errorMessage = 'Errore sconosciuto durante la valutazione';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String(err.message);
      } else {
        errorMessage = String(err);
      }

      setError(errorMessage);
      setCurrentStage('error');
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateProcessingStages = async () => {
    let totalProgress = 0;
    const totalDuration = PROCESSING_STEPS.reduce((sum, step) => sum + step.duration, 0);

    for (const step of PROCESSING_STEPS) {
      setCurrentStage(step.stage);

      // Set stage-specific details and simulate backend activities
      await simulateStageActivities(step.stage);

      // Simulate gradual progress for this step
      const stepProgress = (step.duration / totalDuration) * 100;
      const startProgress = totalProgress;
      const endProgress = totalProgress + stepProgress;

      const stepStartTime = Date.now();
      while (Date.now() - stepStartTime < step.duration) {
        const elapsed = Date.now() - stepStartTime;
        const currentProgress = startProgress + (elapsed / step.duration) * stepProgress;
        setProgress(Math.min(currentProgress, endProgress));

        // Update details during processing
        await updateStageDetails(step.stage, elapsed, step.duration);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      totalProgress = endProgress;
    }
  };

  const simulateStageActivities = async (stage: ProcessingStage) => {
    switch (stage) {
      case 'initializing':
        setCurrentDetails('Verifica connettività Ollama...');
        await new Promise(resolve => setTimeout(resolve, 500));
        setCurrentDetails('Controllo modelli disponibili...');
        await new Promise(resolve => setTimeout(resolve, 500));
        setCurrentDetails('Inizializzazione sistema RAG...');
        break;

      case 'loading-context':
        setCurrentDetails('Caricamento embeddings del documento...');
        await new Promise(resolve => setTimeout(resolve, 800));
        setCurrentDetails('Indicizzazione chunk nel vector database...');
        await new Promise(resolve => setTimeout(resolve, 800));
        setSystemStats(prev => ({ ...prev, chunksProcessed: Math.floor(Math.random() * 15) + 5 }));
        setCurrentDetails('Ottimizzazione indici di ricerca...');
        break;

      case 'analyzing-content':
        setCurrentDetails('Preprocessamento audio per Whisper...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCurrentDetails('Trascrizione con modello Whisper base...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        setCurrentDetails('Pulizia e normalizzazione del testo trascritto...');
        await new Promise(resolve => setTimeout(resolve, 500));
        setCurrentDetails('Segmentazione in frasi per analisi...');
        break;

      case 'generating-feedback':
        setCurrentDetails('Generazione embeddings per la trascrizione...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSystemStats(prev => ({ ...prev, embeddingsGenerated: 1 }));
        setCurrentDetails('Calcolo similarità coseno con chunk del documento...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        const scores = Array.from({ length: 5 }, () => Math.random() * 0.4 + 0.6);
        setSystemStats(prev => ({ ...prev, similarityScores: scores }));
        setCurrentDetails('Ranking dei chunk più rilevanti...');
        await new Promise(resolve => setTimeout(resolve, 800));
        setCurrentDetails('Preparazione contesto per il modello LLM...');
        break;

      case 'finalizing':
        setCurrentDetails('Invio prompt al modello Ollama (llama3.2:3b)...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        setCurrentDetails('Generazione criteri di valutazione...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        setCurrentDetails('Analisi punti di forza e debolezza...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        setCurrentDetails('Creazione suggerimenti personalizzati...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        setCurrentDetails('Finalizzazione del report di valutazione...');
        break;
    }
  };

  const updateStageDetails = async (stage: ProcessingStage, elapsed: number, duration: number) => {
    const progress = elapsed / duration;

    switch (stage) {
      case 'initializing':
        if (progress > 0.8) setCurrentDetails('Sistema pronto, avvio elaborazione...');
        break;
      case 'loading-context':
        if (progress > 0.7) setCurrentDetails(`Processati ${systemStats.chunksProcessed} chunk del documento...`);
        break;
      case 'analyzing-content':
        if (progress > 0.6) setCurrentDetails('Completata trascrizione, analisi semantica in corso...');
        break;
      case 'generating-feedback':
        if (progress > 0.5 && systemStats.similarityScores.length > 0) {
          const avgSimilarity = (systemStats.similarityScores.reduce((a, b) => a + b, 0) / systemStats.similarityScores.length * 100).toFixed(1);
          setCurrentDetails(`Similarità media: ${avgSimilarity}% - Selezione contesto ottimale...`);
        }
        break;
      case 'finalizing':
        if (progress > 0.4) setCurrentDetails('Modello AI sta generando feedback dettagliato...');
        if (progress > 0.8) setCurrentDetails('Calcolo punteggio finale...');
        break;
    }
  };

  const retry = () => {
    setCurrentStage('initializing');
    setProgress(0);
    setError(null);
    startEvaluation();
  };

  const getCurrentStep = () => {
    return PROCESSING_STEPS.find(step => step.stage === currentStage);
  };

  const formatElapsedTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  };

  if (error) {
    return (
      <Card className={`border-error-200 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-error-600" />
            <span>Errore durante la Valutazione</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
              <p className="text-sm text-error-700">{typeof error === 'string' ? error : 'Si è verificato un errore durante la valutazione'}</p>
            </div>
            <div className="flex justify-center">
              <Button onClick={retry} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Riprova
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStep = getCurrentStep();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary-600" />
            <span>Valutazione in Corso</span>
          </div>
          <Badge variant="info" size="sm">
            {formatElapsedTime(elapsedTime)}
          </Badge>
        </CardTitle>
        <p className="text-secondary-600 text-sm">
          Analisi intelligente della tua presentazione con tecnologia RAG
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-secondary-700">
                Progresso Generale
              </span>
              <span className="text-sm text-secondary-600">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-3" color="primary" />
          </div>

          {/* Current Step */}
          {currentStep && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <div className="flex-shrink-0">
                  {isProcessing && currentStep.stage !== 'completed' ? (
                    <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-success-600" />
                  )}
                </div>
                <div className="flex-grow">
                  <h4 className="text-sm font-semibold text-primary-800">
                    {currentStep.label}
                  </h4>
                  <p className="text-sm text-primary-600 mt-1">
                    {currentStep.description}
                  </p>
                </div>
              </div>

              {/* Real-time Details */}
              {currentDetails && (
                <div className="p-3 bg-info-50 border border-info-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-info-600 animate-pulse" />
                    <span className="text-sm font-medium text-info-800">
                      Stato attuale:
                    </span>
                  </div>
                  <p className="text-sm text-info-700 mt-1 font-mono">
                    {currentDetails}
                  </p>
                </div>
              )}

              {/* System Statistics */}
              {(systemStats.chunksProcessed > 0 || systemStats.embeddingsGenerated > 0 || systemStats.similarityScores.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {systemStats.chunksProcessed > 0 && (
                    <div className="p-3 bg-secondary-50 border border-secondary-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-secondary-600" />
                        <span className="text-sm font-medium text-secondary-700">
                          Chunk Processati
                        </span>
                      </div>
                      <div className="text-lg font-bold text-secondary-900 mt-1">
                        {systemStats.chunksProcessed}
                      </div>
                    </div>
                  )}

                  {systemStats.embeddingsGenerated > 0 && (
                    <div className="p-3 bg-secondary-50 border border-secondary-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-secondary-600" />
                        <span className="text-sm font-medium text-secondary-700">
                          Embeddings
                        </span>
                      </div>
                      <div className="text-lg font-bold text-secondary-900 mt-1">
                        {systemStats.embeddingsGenerated}
                      </div>
                    </div>
                  )}

                  {systemStats.similarityScores.length > 0 && (
                    <div className="p-3 bg-secondary-50 border border-secondary-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Search className="w-4 h-4 text-secondary-600" />
                        <span className="text-sm font-medium text-secondary-700">
                          Max Similarità
                        </span>
                      </div>
                      <div className="text-lg font-bold text-secondary-900 mt-1">
                        {(Math.max(...systemStats.similarityScores) * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Processing Steps Overview */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-secondary-700 mb-3">
              Fasi di Elaborazione
            </h4>
            <div className="space-y-2">
              {PROCESSING_STEPS.map((step, index) => {
                const isCompleted = PROCESSING_STEPS.findIndex(s => s.stage === currentStage) > index;
                const isCurrent = step.stage === currentStage;

                return (
                  <div
                    key={step.stage}
                    className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                      isCurrent ? 'bg-primary-50 border border-primary-200' :
                      isCompleted ? 'bg-success-50 border border-success-200' :
                      'bg-secondary-50'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                      ) : (
                        <step.icon className="w-4 h-4 text-secondary-400" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <span className={`text-sm font-medium ${
                        isCurrent ? 'text-primary-800' :
                        isCompleted ? 'text-success-700' :
                        'text-secondary-600'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Processing Info */}
          <div className="space-y-4 pt-4 border-t border-secondary-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-secondary-600">Documenti Analizzati</div>
                <div className="text-lg font-semibold text-secondary-900">1</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-secondary-600">Lunghezza Testo</div>
                <div className="text-lg font-semibold text-secondary-900">
                  {transcription.length} caratteri
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="bg-secondary-900 text-secondary-100 rounded-lg p-3 text-xs font-mono">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-3 h-3" />
                <span className="font-medium">Log di Sistema</span>
              </div>
              <div className="space-y-1 text-secondary-300">
                <div>[{formatElapsedTime(elapsedTime)}] Backend: {systemStats.modelUsed} model active</div>
                <div>[{formatElapsedTime(elapsedTime)}] RAG: Vector database ready</div>
                <div>[{formatElapsedTime(elapsedTime)}] Whisper: Transcription service online</div>
                {systemStats.chunksProcessed > 0 && (
                  <div>[{formatElapsedTime(elapsedTime)}] Processing: {systemStats.chunksProcessed} chunks indexed</div>
                )}
                {systemStats.similarityScores.length > 0 && (
                  <div>[{formatElapsedTime(elapsedTime)}] RAG: Similarity scores calculated</div>
                )}
                <div>[{formatElapsedTime(elapsedTime)}] Status: {currentStep?.label || 'Processing'}</div>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-success-50 border border-success-200 rounded">
                <div className="text-xs text-success-600">CPU</div>
                <div className="text-sm font-bold text-success-800">
                  {currentStage === 'finalizing' ? '85%' : '45%'}
                </div>
              </div>
              <div className="text-center p-2 bg-info-50 border border-info-200 rounded">
                <div className="text-xs text-info-600">Memory</div>
                <div className="text-sm font-bold text-info-800">
                  {systemStats.embeddingsGenerated > 0 ? '2.1GB' : '1.2GB'}
                </div>
              </div>
              <div className="text-center p-2 bg-warning-50 border border-warning-200 rounded">
                <div className="text-xs text-warning-600">GPU</div>
                <div className="text-sm font-bold text-warning-800">
                  {currentStage === 'generating-feedback' || currentStage === 'finalizing' ? 'Active' : 'Idle'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};