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
  RefreshCw
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
    label: 'Inizializzazione',
    description: 'Preparazione del sistema di valutazione...',
    icon: Loader2,
    duration: 1000
  },
  {
    stage: 'loading-context',
    label: 'Caricamento Contesto',
    description: 'Ricerca dei chunk più rilevanti nel documento...',
    icon: FileSearch,
    duration: 3000
  },
  {
    stage: 'analyzing-content',
    label: 'Analisi Contenuto',
    description: 'Confronto della presentazione con il documento di riferimento...',
    icon: Brain,
    duration: 5000
  },
  {
    stage: 'generating-feedback',
    label: 'Generazione Feedback',
    description: 'Creazione di suggerimenti personalizzati...',
    icon: MessageSquare,
    duration: 4000
  },
  {
    stage: 'finalizing',
    label: 'Finalizzazione',
    description: 'Calcolo del punteggio finale e preparazione del report...',
    icon: BarChart3,
    duration: 1000
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
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto durante la valutazione';
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

      // Simulate gradual progress for this step
      const stepProgress = (step.duration / totalDuration) * 100;
      const startProgress = totalProgress;
      const endProgress = totalProgress + stepProgress;

      const stepStartTime = Date.now();
      while (Date.now() - stepStartTime < step.duration) {
        const elapsed = Date.now() - stepStartTime;
        const currentProgress = startProgress + (elapsed / step.duration) * stepProgress;
        setProgress(Math.min(currentProgress, endProgress));
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      totalProgress = endProgress;
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
              <p className="text-sm text-error-700">{error}</p>
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
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-secondary-200">
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
        </div>
      </CardContent>
    </Card>
  );
};