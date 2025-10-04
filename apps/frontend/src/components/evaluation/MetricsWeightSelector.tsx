'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { Sliders, TrendingUp, Zap, BookOpen, Target, Award } from 'lucide-react';

export interface MetricWeight {
  name: string;
  weight: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  key: 'accuracy' | 'fluency' | 'completeness' | 'clarity' | 'relevance';
}

export interface MetricsWeights {
  accuracy: number;
  fluency: number;
  completeness: number;
  clarity: number;
  relevance: number;
}

const DEFAULT_METRICS: MetricWeight[] = [
  {
    key: 'accuracy',
    name: 'Accuratezza',
    weight: 30,
    icon: Target,
    description: 'Correttezza delle informazioni rispetto al documento'
  },
  {
    key: 'fluency',
    name: 'Fluidità',
    weight: 25,
    icon: Zap,
    description: 'Naturalezza e scorrevolezza del discorso'
  },
  {
    key: 'completeness',
    name: 'Completezza',
    weight: 20,
    icon: BookOpen,
    description: 'Copertura degli argomenti del documento'
  },
  {
    key: 'clarity',
    name: 'Chiarezza',
    weight: 15,
    icon: TrendingUp,
    description: 'Comprensibilità e organizzazione del discorso'
  },
  {
    key: 'relevance',
    name: 'Pertinenza',
    weight: 10,
    icon: Award,
    description: 'Rilevanza dei contenuti rispetto al contesto'
  }
];

interface MetricsWeightSelectorProps {
  onWeightsChange?: (weights: MetricsWeights) => void;
  defaultWeights?: Partial<MetricsWeights>;
  className?: string;
}

export const MetricsWeightSelector = ({
  onWeightsChange,
  defaultWeights,
  className
}: MetricsWeightSelectorProps) => {
  const [metrics, setMetrics] = useState<MetricWeight[]>(() => {
    if (defaultWeights) {
      return DEFAULT_METRICS.map(metric => ({
        ...metric,
        weight: defaultWeights[metric.key] || metric.weight
      }));
    }
    return DEFAULT_METRICS;
  });

  const [selectedPreset, setSelectedPreset] = useState<string>('balanced');

  const presets = {
    balanced: {
      name: 'Bilanciato',
      description: 'Tutti i criteri hanno peso equilibrato',
      weights: { accuracy: 30, fluency: 25, completeness: 20, clarity: 15, relevance: 10 }
    },
    accuracy_focused: {
      name: 'Focus Accuratezza',
      description: 'Privilegia la correttezza delle informazioni',
      weights: { accuracy: 50, fluency: 15, completeness: 15, clarity: 10, relevance: 10 }
    },
    fluency_focused: {
      name: 'Focus Fluidità',
      description: 'Privilegia la naturalezza del discorso',
      weights: { accuracy: 20, fluency: 45, completeness: 15, clarity: 10, relevance: 10 }
    },
    completeness_focused: {
      name: 'Focus Completezza',
      description: 'Privilegia la copertura degli argomenti',
      weights: { accuracy: 20, fluency: 15, completeness: 45, clarity: 10, relevance: 10 }
    },
    presentation: {
      name: 'Presentazione Orale',
      description: 'Ottimizzato per presentazioni pubbliche',
      weights: { accuracy: 25, fluency: 30, completeness: 15, clarity: 20, relevance: 10 }
    },
    exam: {
      name: 'Esame Orale',
      description: 'Ottimizzato per valutazioni accademiche',
      weights: { accuracy: 40, fluency: 15, completeness: 30, clarity: 10, relevance: 5 }
    }
  };

  const handleWeightChange = (key: MetricWeight['key'], value: number) => {
    const newMetrics = metrics.map(metric =>
      metric.key === key ? { ...metric, weight: value } : metric
    );
    setMetrics(newMetrics);
    setSelectedPreset('custom');

    const weights = newMetrics.reduce((acc, metric) => {
      acc[metric.key] = metric.weight;
      return acc;
    }, {} as MetricsWeights);

    if (onWeightsChange) {
      onWeightsChange(weights);
    }
  };

  const applyPreset = (presetKey: string) => {
    const preset = presets[presetKey as keyof typeof presets];
    if (!preset) return;

    const newMetrics = metrics.map(metric => ({
      ...metric,
      weight: preset.weights[metric.key]
    }));

    setMetrics(newMetrics);
    setSelectedPreset(presetKey);

    if (onWeightsChange) {
      onWeightsChange(preset.weights);
    }
  };

  const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-primary-600" />
            <CardTitle>Pesi Metriche di Valutazione</CardTitle>
          </div>
          <Badge variant={totalWeight === 100 ? 'success' : 'warning'} size="sm">
            Totale: {totalWeight}%
          </Badge>
        </div>
        <p className="text-sm text-secondary-600 mt-2">
          Configura l'importanza di ciascun criterio nella valutazione finale
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Preset Selection */}
          <div>
            <label className="text-sm font-medium text-secondary-700 mb-2 block">
              Profili Predefiniti
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(presets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedPreset === key
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-secondary-200 bg-white hover:border-primary-300'
                  }`}
                >
                  <div className="font-medium text-sm text-secondary-900">
                    {preset.name}
                  </div>
                  <div className="text-xs text-secondary-600 mt-1">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Weight Sliders */}
          <div>
            <label className="text-sm font-medium text-secondary-700 mb-3 block">
              Personalizza Pesi {selectedPreset === 'custom' && '(Personalizzato)'}
            </label>
            <div className="space-y-4">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-secondary-600" />
                        <span className="text-sm font-medium text-secondary-900">
                          {metric.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={metric.weight}
                          onChange={(e) => handleWeightChange(metric.key, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-sm border border-secondary-300 rounded text-right"
                        />
                        <span className="text-sm text-secondary-600">%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={metric.weight}
                      onChange={(e) => handleWeightChange(metric.key, parseInt(e.target.value))}
                      className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <p className="text-xs text-secondary-500">{metric.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Warning if total is not 100 */}
          {totalWeight !== 100 && (
            <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <p className="text-sm text-warning-800">
                ⚠️ Il totale dei pesi dovrebbe essere 100%. Attualmente: {totalWeight}%
              </p>
            </div>
          )}

          {/* Visual Distribution */}
          <div>
            <label className="text-sm font-medium text-secondary-700 mb-2 block">
              Distribuzione Visuale
            </label>
            <div className="flex h-8 rounded-lg overflow-hidden border border-secondary-200">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                const percentage = totalWeight > 0 ? (metric.weight / totalWeight) * 100 : 0;
                const colors = [
                  'bg-blue-500',
                  'bg-green-500',
                  'bg-yellow-500',
                  'bg-purple-500',
                  'bg-pink-500'
                ];
                return (
                  <div
                    key={metric.key}
                    className={`${colors[index]} flex items-center justify-center text-white text-xs font-medium relative group`}
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage > 10 && (
                      <>
                        <Icon className="w-3 h-3 mr-1" />
                        <span>{metric.weight}%</span>
                      </>
                    )}
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-secondary-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                      {metric.name}: {metric.weight}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
