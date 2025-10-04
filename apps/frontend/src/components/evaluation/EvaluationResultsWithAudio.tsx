'use client';

import { useState, useEffect } from 'react';
import { EvaluationResult } from '@/services/evaluationService';
import { EvaluationResults } from './EvaluationResults';
import { AudioMetricsDisplay } from '../audio/AudioMetricsDisplay';
import { audioAnalysisService } from '@/services/audioAnalysisService';
import { AudioMetrics } from '@ai-speech-evaluator/shared';
import { Mic, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';

interface EvaluationResultsWithAudioProps {
  evaluationResult: EvaluationResult;
  onRestart?: () => void;
  className?: string;
}

/**
 * Enhanced Evaluation Results Component with Audio Metrics
 * Loads and displays advanced audio analysis alongside evaluation results
 */
export const EvaluationResultsWithAudio: React.FC<EvaluationResultsWithAudioProps> = ({
  evaluationResult,
  onRestart,
  className,
}) => {
  const [audioMetrics, setAudioMetrics] = useState<AudioMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [showAudioTab, setShowAudioTab] = useState(false);

  // Load audio metrics if audioRecordingId is available
  useEffect(() => {
    if (evaluationResult.audioRecordingId) {
      loadAudioMetrics();
    }
  }, [evaluationResult.audioRecordingId]);

  const loadAudioMetrics = async () => {
    if (!evaluationResult.audioRecordingId) return;

    setLoadingMetrics(true);
    setMetricsError(null);

    try {
      const metrics = await audioAnalysisService.analyzeAudio(
        evaluationResult.audioRecordingId
      );
      setAudioMetrics(metrics);
      setShowAudioTab(true);
    } catch (error) {
      console.error('Failed to load audio metrics:', error);
      setMetricsError(
        error instanceof Error
          ? error.message
          : 'Impossibile caricare le metriche audio'
      );
    } finally {
      setLoadingMetrics(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Standard Evaluation Results */}
      <EvaluationResults
        evaluationResult={evaluationResult}
        onRestart={onRestart}
        className=""
      />

      {/* Audio Metrics Section */}
      {evaluationResult.audioRecordingId && (
        <div className="space-y-4">
          {/* Audio Metrics Header Card */}
          <Card className="border-2 border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-lg">
                    <Mic className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Analisi Audio Avanzata
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                      Metriche dettagliate sulla qualità della presentazione orale
                    </p>
                  </div>
                </div>

                {loadingMetrics && (
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Analisi in corso...</span>
                  </div>
                )}

                {!loadingMetrics && !audioMetrics && !metricsError && (
                  <Button
                    onClick={loadAudioMetrics}
                    variant="outline"
                    size="sm"
                    className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                  >
                    Analizza Audio
                  </Button>
                )}
              </CardTitle>
            </CardHeader>

            {metricsError && (
              <CardContent>
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                      Errore nell'analisi audio
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-400">
                      {metricsError}
                    </p>
                    <Button
                      onClick={loadAudioMetrics}
                      variant="outline"
                      size="sm"
                      className="mt-3 border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Riprova
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}

            {loadingMetrics && (
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Analisi in corso
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Stiamo analizzando velocità di eloquio, pause, parole riempitive e qualità
                      audio...
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Audio Metrics Display */}
          {audioMetrics && !loadingMetrics && (
            <AudioMetricsDisplay metrics={audioMetrics} />
          )}
        </div>
      )}
    </div>
  );
};

export default EvaluationResultsWithAudio;
