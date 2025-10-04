'use client';

import React from 'react';
import { AudioMetrics } from '@ai-speech-evaluator/shared';
import {
  Activity,
  Clock,
  MessageCircle,
  Volume2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Mic,
  BarChart3,
} from 'lucide-react';

interface AudioMetricsDisplayProps {
  metrics: AudioMetrics;
  className?: string;
}

/**
 * Production-ready Audio Metrics Display Component
 * Shows comprehensive speech analysis with visual indicators
 */
export const AudioMetricsDisplay: React.FC<AudioMetricsDisplayProps> = ({
  metrics,
  className = '',
}) => {
  const { speechRate, pauseAnalysis, fillerWords, audioQuality, speakingPerformance } = metrics;

  // Get color based on score
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getQualityIcon = (quality: string) => {
    if (quality.includes('optimal') || quality.includes('excellent') || quality.includes('good')) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (quality.includes('fair') || quality.includes('medium')) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getComparisonBadge = (comparison: 'below' | 'optimal' | 'above') => {
    const colors = {
      below: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      optimal: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      above: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };

    const labels = {
      below: 'Sotto',
      optimal: 'Ottimale',
      above: 'Sopra',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[comparison]}`}>
        {labels[comparison]}
      </span>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Performance Score */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Performance Complessiva
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Valutazione globale delle metriche vocali
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor(speakingPerformance.overallScore)}`}>
              {speakingPerformance.overallScore}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">su 100</div>
          </div>
        </div>

        {/* Strengths */}
        {speakingPerformance.strengths.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Punti di Forza
            </h4>
            <ul className="space-y-1">
              {speakingPerformance.strengths.map((strength, idx) => (
                <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {speakingPerformance.weaknesses.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Aree di Miglioramento
            </h4>
            <ul className="space-y-1">
              {speakingPerformance.weaknesses.map((weakness, idx) => (
                <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {speakingPerformance.suggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Suggerimenti
            </h4>
            <ul className="space-y-1">
              {speakingPerformance.suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">→</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Speech Rate Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Velocità di Eloquio</h4>
            </div>
            {getQualityIcon(speechRate.articulation.quality)}
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Parole al minuto</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {speechRate.wordsPerMinute}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (speechRate.wordsPerMinute / 200) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>130 WPM</span>
                <span>170 WPM (ottimale)</span>
                <span>200 WPM</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Valutazione</span>
                {getComparisonBadge(speakingPerformance.comparedToOptimal.speechRate)}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                {speechRate.recommendation}
              </p>
            </div>
          </div>
        </div>

        {/* Pauses Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Analisi Pause</h4>
            </div>
            {getQualityIcon(pauseAnalysis.quality)}
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Totale pause</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {pauseAnalysis.totalPauses}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Durata media</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {pauseAnalysis.avgPauseDuration.toFixed(1)}s
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Distribuzione</div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Brevi (&lt;0.5s)</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {pauseAnalysis.pauseDistribution.short}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Medie (0.5-2s)</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {pauseAnalysis.pauseDistribution.medium}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Lunghe (&gt;2s)</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {pauseAnalysis.pauseDistribution.long}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                {pauseAnalysis.recommendation}
              </p>
            </div>
          </div>
        </div>

        {/* Filler Words Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-orange-500" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Parole Riempitive</h4>
            </div>
            {getQualityIcon(fillerWords.quality)}
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Totale rilevate</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {fillerWords.totalCount}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Tasso</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {fillerWords.fillerRate.toFixed(1)}/100
                </div>
              </div>
            </div>

            {Object.keys(fillerWords.byType).length > 0 && (
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Più frequenti</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(fillerWords.byType)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([word, count]) => (
                      <span
                        key={word}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-xs"
                      >
                        <span className="font-medium">{word}</span>
                        <span className="text-orange-600 dark:text-orange-400">×{count}</span>
                      </span>
                    ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                {fillerWords.recommendation}
              </p>
            </div>
          </div>
        </div>

        {/* Audio Quality Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-green-500" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Qualità Audio</h4>
            </div>
            {getQualityIcon(audioQuality.clarity.quality)}
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Volume</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {audioQuality.volume.quality}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Media: {audioQuality.volume.avgDb.toFixed(1)} dB
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Intonazione</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {audioQuality.pitch.quality}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {audioQuality.pitch.monotone ? 'Monotona' : `Variazione: ${audioQuality.pitch.variation.toFixed(1)} Hz`}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Chiarezza</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {audioQuality.clarity.quality}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                SNR: {audioQuality.clarity.snr.toFixed(1)} dB
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                {audioQuality.recommendation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison to Optimal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Mic className="w-5 h-5 text-indigo-500" />
          Confronto con Parametri Ottimali
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Velocità</div>
            {getComparisonBadge(speakingPerformance.comparedToOptimal.speechRate)}
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pause</div>
            {getComparisonBadge(speakingPerformance.comparedToOptimal.pauses)}
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Riempitive</div>
            {getComparisonBadge(speakingPerformance.comparedToOptimal.fillerWords)}
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Volume</div>
            {getComparisonBadge(speakingPerformance.comparedToOptimal.volume)}
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Intonazione</div>
            {getComparisonBadge(speakingPerformance.comparedToOptimal.pitch)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioMetricsDisplay;
