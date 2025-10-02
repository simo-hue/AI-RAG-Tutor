'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Progress,
  Badge,
  Button
} from '@/components/ui';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  FileText,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Info,
  Download,
  Share2,
  Activity,
  Award,
  Lightbulb,
  BookOpen,
  Zap,
  Eye,
  MessageSquare,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  PieChart,
  BarChart,
  LineChart
} from 'lucide-react';
import { EvaluationResult } from '@/services/evaluationService';

interface EnhancedEvaluationResultsProps {
  evaluationResult: EvaluationResult;
  onRestart?: () => void;
  className?: string;
}

export const EnhancedEvaluationResults = ({
  evaluationResult,
  onRestart,
  className
}: EnhancedEvaluationResultsProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'improvement' | 'analytics' | 'progress'>('overview');

  const { evaluation, contextUsed, evaluationId } = evaluationResult;

  // Dati criteri con informazioni estese
  const criteriaData = useMemo(() => [
    {
      name: 'Accuratezza',
      value: evaluation.criteria.accuracy,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Fedeltà del contenuto rispetto al documento di riferimento',
      weight: 25,
      details: {
        excellent: 'Contenuto perfettamente allineato con il documento',
        good: 'Buona corrispondenza con alcune imprecisioni minori',
        fair: 'Corrispondenza accettabile ma con alcune inesattezze',
        poor: 'Significative discrepanze dal contenuto di riferimento'
      }
    },
    {
      name: 'Chiarezza',
      value: evaluation.criteria.clarity,
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Comprensibilità e chiarezza espositiva',
      weight: 20,
      details: {
        excellent: 'Esposizione cristallina e facilmente comprensibile',
        good: 'Buona chiarezza con occasionali passaggi meno immediati',
        fair: 'Comprensibile ma con alcuni punti poco chiari',
        poor: 'Esposizione confusa e difficile da seguire'
      }
    },
    {
      name: 'Completezza',
      value: evaluation.criteria.completeness,
      icon: CheckCircle2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'Copertura degli argomenti principali',
      weight: 25,
      details: {
        excellent: 'Tutti i punti chiave sono stati trattati esaustivamente',
        good: 'La maggior parte degli argomenti è stata coperta bene',
        fair: 'Copertura accettabile ma mancano alcuni dettagli',
        poor: 'Molti argomenti importanti sono stati omessi'
      }
    },
    {
      name: 'Coerenza',
      value: evaluation.criteria.coherence,
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      description: 'Logica e connessione tra gli argomenti',
      weight: 15,
      details: {
        excellent: 'Perfetta logica sequenziale e connessioni fluide',
        good: 'Buona struttura logica con transizioni appropriate',
        fair: 'Struttura accettabile ma con alcune disconnessioni',
        poor: 'Scarsa coerenza logica e transizioni confuse'
      }
    },
    {
      name: 'Fluidità',
      value: evaluation.criteria.fluency,
      icon: Zap,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      description: 'Scorrevolezza e naturalezza del linguaggio',
      weight: 15,
      details: {
        excellent: 'Linguaggio fluido e naturale senza esitazioni',
        good: 'Buona fluidità con occasionali pause naturali',
        fair: 'Fluidità accettabile ma con alcune incertezze',
        poor: 'Linguaggio frammentato con frequenti esitazioni'
      }
    }
  ], [evaluation.criteria]);

  // Calcoli per analytics
  const analytics = useMemo(() => {
    const scores = criteriaData.map(c => c.value);
    const weightedScore = criteriaData.reduce((sum, c) => sum + (c.value * c.weight / 100), 0);

    return {
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
      median: scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)],
      range: Math.max(...scores) - Math.min(...scores),
      variance: scores.reduce((sum, score) => sum + Math.pow(score - evaluation.overallScore, 2), 0) / scores.length,
      weightedScore,
      strengths: criteriaData.filter(c => c.value >= 7).length,
      weaknesses: criteriaData.filter(c => c.value < 5).length,
      distribution: {
        excellent: criteriaData.filter(c => c.value >= 8).length,
        good: criteriaData.filter(c => c.value >= 6 && c.value < 8).length,
        fair: criteriaData.filter(c => c.value >= 4 && c.value < 6).length,
        poor: criteriaData.filter(c => c.value < 4).length
      }
    };
  }, [criteriaData, evaluation.overallScore]);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-success-600 bg-success-50 border-success-200';
    if (score >= 6) return 'text-warning-600 bg-warning-50 border-warning-200';
    return 'text-error-600 bg-error-50 border-error-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Eccellente';
    if (score >= 6) return 'Buono';
    if (score >= 4) return 'Sufficiente';
    return 'Da migliorare';
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 8) return { label: 'Prestazione Eccellente', icon: Award, color: 'text-success-600' };
    if (score >= 6) return { label: 'Buona Prestazione', icon: TrendingUp, color: 'text-warning-600' };
    if (score >= 4) return { label: 'Prestazione Sufficiente', icon: Minus, color: 'text-info-600' };
    return { label: 'Necessita Miglioramenti', icon: TrendingDown, color: 'text-error-600' };
  };

  const performanceLevel = getPerformanceLevel(evaluation.overallScore);

  const generateDetailedSuggestions = (criterion: any) => {
    const score = criterion.value;
    const suggestions = [];

    if (score < 4) {
      suggestions.push(`🎯 **Priorità Alta**: Focalizzati sul miglioramento di ${criterion.name.toLowerCase()}`);
      suggestions.push(`📚 Studia approfonditamente gli aspetti legati a ${criterion.description.toLowerCase()}`);
      suggestions.push(`🔄 Ripeti l'esercizio concentrandoti specificamente su questo criterio`);
    } else if (score < 6) {
      suggestions.push(`⚡ **Miglioramento Moderato**: ${criterion.name} può essere potenziato`);
      suggestions.push(`🎨 Lavora sui dettagli per perfezionare ${criterion.description.toLowerCase()}`);
    } else if (score < 8) {
      suggestions.push(`✨ **Eccellente Base**: ${criterion.name} è già buono, perfeziona i dettagli`);
      suggestions.push(`🚀 Piccoli aggiustamenti possono portarti all'eccellenza`);
    } else {
      suggestions.push(`🏆 **Eccellente**: Mantieni questo alto livello di ${criterion.name.toLowerCase()}`);
      suggestions.push(`💎 Usa questa competenza come punto di forza per altri criteri`);
    }

    return suggestions;
  };

  const formatProcessingTime = (time: string | number) => {
    if (typeof time === 'number') {
      if (time < 1000) return `${time}ms`;
      return `${(time / 1000).toFixed(1)}s`;
    }
    if (typeof time === 'string') {
      const match = time.match(/(\d+)ms/);
      if (match) {
        const ms = parseInt(match[1]);
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(1)}s`;
      }
      return time;
    }
    return String(time);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Enhanced Header with Performance Badge */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl bg-white/10 backdrop-blur-sm`}>
                  {(() => {
                    const PerformanceIcon = performanceLevel.icon;
                    return <PerformanceIcon className="w-6 h-6" />;
                  })()}
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Valutazione AI Completata</h2>
                  <p className="text-primary-100 text-lg">
                    {performanceLevel.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-primary-200">
                <span>🎯 {criteriaData.length} criteri analizzati</span>
                <span>🧠 {evaluation.metadata.contextQuality.chunksUsed} chunk utilizzati</span>
                <span>⚡ {formatProcessingTime(evaluation.metadata.processingTime)} elaborazione</span>
              </div>
            </div>
            <div className="text-center">
              <div className="relative">
                <div className="text-6xl font-bold mb-2">
                  {evaluation.overallScore.toFixed(1)}
                </div>
                <div className="text-2xl opacity-60">/10</div>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-lg px-4 py-1">
                {getScoreLabel(evaluation.overallScore)}
              </Badge>
            </div>
          </div>

          {/* Performance Meter */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-primary-200">Punteggio Complessivo</span>
              <span className="text-sm text-primary-200">{(evaluation.overallScore * 10).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-white rounded-full h-3 transition-all duration-1000 ease-out shadow-lg"
                style={{ width: `${(evaluation.overallScore / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <CardContent className="p-6 bg-gradient-to-r from-secondary-50 to-white">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary-600">{analytics.strengths}</div>
              <div className="text-xs text-secondary-600">Punti di Forza</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-warning-600">{analytics.weaknesses}</div>
              <div className="text-xs text-secondary-600">Aree Migliorabili</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-info-600">{analytics.range.toFixed(1)}</div>
              <div className="text-xs text-secondary-600">Range Prestazioni</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-success-600">{evaluation.metadata.transcriptionLength}</div>
              <div className="text-xs text-secondary-600">Caratteri Analizzati</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">{(evaluation.metadata.contextQuality.averageSimilarity * 100).toFixed(0)}%</div>
              <div className="text-xs text-secondary-600">Rilevanza Contesto</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Navigation Tabs */}
      <div className="flex space-x-1 bg-secondary-100 rounded-xl p-1">
        {[
          { id: 'overview', label: 'Panoramica', icon: BarChart3, desc: 'Vista generale dei risultati' },
          { id: 'detailed', label: 'Analisi Dettagliata', icon: Target, desc: 'Breakdown per criterio' },
          { id: 'improvement', label: 'Piano di Miglioramento', icon: Lightbulb, desc: 'Suggerimenti personalizzati' },
          { id: 'analytics', label: 'Analytics Avanzate', icon: PieChart, desc: 'Statistiche approfondite' },
          { id: 'progress', label: 'Contesto RAG', icon: Brain, desc: 'Analisi del contesto utilizzato' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`group flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-primary-600 shadow-md scale-105'
                : 'text-secondary-600 hover:text-secondary-900 hover:bg-white/50'
            }`}
            title={tab.desc}
          >
            <div className="flex flex-col items-center space-y-1">
              <tab.icon className="w-5 h-5" />
              <span className="hidden sm:block text-xs">{tab.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Enhanced Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Criteria Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {criteriaData.map((criterion) => (
              <Card key={criterion.name} className={`border-2 ${criterion.borderColor} hover:shadow-lg transition-shadow`}>
                <CardHeader className={`${criterion.bgColor} border-b border-current border-opacity-20`}>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-white ${criterion.color}`}>
                        <criterion.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold">{criterion.name}</div>
                        <div className="text-xs opacity-80 font-normal">{criterion.weight}% del totale</div>
                      </div>
                    </div>
                    <Badge className={`${getScoreColor(criterion.value)} border text-lg px-3 py-1`}>
                      {criterion.value.toFixed(1)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <Progress
                      value={(criterion.value / 10) * 100}
                      className="h-3"
                      color={criterion.value >= 7 ? 'success' : criterion.value >= 5 ? 'warning' : 'error'}
                    />
                    <p className="text-sm text-secondary-600 leading-relaxed">
                      {criterion.description}
                    </p>
                    <div className="text-xs text-secondary-500 bg-secondary-50 rounded-lg p-2">
                      {criterion.value >= 8 && criterion.details.excellent}
                      {criterion.value >= 6 && criterion.value < 8 && criterion.details.good}
                      {criterion.value >= 4 && criterion.value < 6 && criterion.details.fair}
                      {criterion.value < 4 && criterion.details.poor}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-primary-600" />
                <span>Riepilogo delle Prestazioni</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-secondary-900">Distribuzione dei Punteggi</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-success-50 rounded">
                      <span className="text-sm">Eccellente (8-10)</span>
                      <Badge variant="success">{analytics.distribution.excellent} criteri</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-warning-50 rounded">
                      <span className="text-sm">Buono (6-8)</span>
                      <Badge variant="warning">{analytics.distribution.good} criteri</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-info-50 rounded">
                      <span className="text-sm">Sufficiente (4-6)</span>
                      <Badge variant="outline">{analytics.distribution.fair} criteri</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-error-50 rounded">
                      <span className="text-sm">Da migliorare (&lt;4)</span>
                      <Badge variant="error">{analytics.distribution.poor} criteri</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-secondary-900">Statistiche Chiave</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-primary-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary-600">{analytics.average.toFixed(1)}</div>
                      <div className="text-xs text-primary-700">Media</div>
                    </div>
                    <div className="text-center p-3 bg-secondary-50 rounded-lg">
                      <div className="text-2xl font-bold text-secondary-600">{analytics.median.toFixed(1)}</div>
                      <div className="text-xs text-secondary-700">Mediana</div>
                    </div>
                    <div className="text-center p-3 bg-info-50 rounded-lg">
                      <div className="text-2xl font-bold text-info-600">{analytics.range.toFixed(1)}</div>
                      <div className="text-xs text-info-700">Range</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{analytics.weightedScore.toFixed(1)}</div>
                      <div className="text-xs text-purple-700">Ponderato</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'improvement' && (
        <div className="space-y-6">
          {/* Personalized Improvement Plan */}
          <Card className="border-l-4 border-l-primary-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-6 h-6 text-primary-600" />
                <span>Piano di Miglioramento Personalizzato</span>
              </CardTitle>
              <p className="text-secondary-600">
                Basato sulla tua performance, ecco un piano specifico per migliorare le tue presentazioni
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Priority Actions */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="font-semibold text-lg text-secondary-900 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-error-600" />
                    Azioni Prioritarie
                  </h4>
                  {criteriaData
                    .filter(c => c.value < 6)
                    .sort((a, b) => a.value - b.value)
                    .map((criterion, index) => (
                      <div key={criterion.name} className="p-4 bg-error-50 border border-error-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-error-100 text-error-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-error-900 mb-1">
                              Migliorare {criterion.name} (attuale: {criterion.value.toFixed(1)}/10)
                            </h5>
                            <p className="text-sm text-error-800 mb-3">{criterion.description}</p>
                            <div className="space-y-2">
                              {generateDetailedSuggestions(criterion).map((suggestion, i) => (
                                <div key={i} className="text-sm p-2 bg-white rounded border-l-2 border-error-400">
                                  {suggestion}
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 flex items-center space-x-2">
                              <Badge variant="error" size="sm">Priorità Alta</Badge>
                              <span className="text-xs text-error-700">
                                Impatto stimato: +{(6 - criterion.value).toFixed(1)} punti
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                  {criteriaData.filter(c => c.value < 6).length === 0 && (
                    <div className="p-6 bg-success-50 border border-success-200 rounded-lg text-center">
                      <CheckCircle2 className="w-12 h-12 text-success-600 mx-auto mb-3" />
                      <h5 className="font-semibold text-success-900 mb-2">Ottimo Lavoro!</h5>
                      <p className="text-success-800">
                        Tutti i criteri hanno raggiunto un livello soddisfacente. Continua a perfezionare per raggiungere l'eccellenza.
                      </p>
                    </div>
                  )}
                </div>

                {/* Strengths to Leverage */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-secondary-900 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-success-600" />
                    Punti di Forza
                  </h4>
                  {criteriaData
                    .filter(c => c.value >= 7)
                    .sort((a, b) => b.value - a.value)
                    .map((criterion) => (
                      <div key={criterion.name} className="p-3 bg-success-50 border border-success-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <criterion.icon className={`w-4 h-4 ${criterion.color}`} />
                          <span className="font-medium text-success-900">{criterion.name}</span>
                          <Badge variant="success" size="sm">{criterion.value.toFixed(1)}</Badge>
                        </div>
                        <p className="text-xs text-success-800">
                          Usa questa competenza per supportare il miglioramento in altre aree
                        </p>
                      </div>
                    ))}

                  <div className="p-4 bg-info-50 border border-info-200 rounded-lg">
                    <h5 className="font-medium text-info-900 mb-2 flex items-center">
                      <Info className="w-4 h-4 mr-1" />
                      Suggerimento Strategico
                    </h5>
                    <p className="text-sm text-info-800">
                      Focalizzati sui {criteriaData.filter(c => c.value < 6).length} criteri con priorità più alta
                      per ottenere il miglioramento più significativo nel punteggio complessivo.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Practice Exercises */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span>Esercizi di Pratica Raccomandati</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h5 className="font-semibold text-purple-900 mb-2">📚 Pratica Contenutistica</h5>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Rileggi il documento e crea una mappa mentale</li>
                    <li>• Pratica la sintesi dei punti chiave</li>
                    <li>• Registra riassunti di 2-3 minuti per argomento</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h5 className="font-semibold text-green-900 mb-2">🗣️ Pratica Espositiva</h5>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Esercitati davanti allo specchio</li>
                    <li>• Registra video per analizzare gestualità</li>
                    <li>• Pratica con tempi di pausa strategici</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-semibold text-blue-900 mb-2">🔗 Pratica Strutturale</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Crea outline dettagliati prima di parlare</li>
                    <li>• Pratica transizioni tra argomenti</li>
                    <li>• Usa tecniche di storytelling</li>
                  </ul>
                </div>
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h5 className="font-semibold text-orange-900 mb-2">⚡ Pratica della Fluidità</h5>
                  <ul className="text-sm text-orange-800 space-y-1">
                    <li>• Leggi ad alta voce 10 minuti al giorno</li>
                    <li>• Pratica scioglilingua e dizione</li>
                    <li>• Registra e riascolta per identificare pause</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Performance Analytics Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart className="w-5 h-5 text-primary-600" />
                <span>Analytics delle Prestazioni</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score Distribution Chart */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-secondary-900">Distribuzione Punteggi</h4>
                  <div className="space-y-3">
                    {criteriaData.map((criterion) => (
                      <div key={criterion.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{criterion.name}</span>
                          <span className="text-sm text-secondary-600">{criterion.value.toFixed(1)}/10</span>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-secondary-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                criterion.value >= 8 ? 'bg-success-500' :
                                criterion.value >= 6 ? 'bg-warning-500' :
                                criterion.value >= 4 ? 'bg-info-500' : 'bg-error-500'
                              }`}
                              style={{ width: `${(criterion.value / 10) * 100}%` }}
                            />
                          </div>
                          {/* Score markers */}
                          <div className="absolute top-0 left-0 w-full h-2 flex justify-between">
                            {[2, 4, 6, 8].map(mark => (
                              <div key={mark} className="w-px h-2 bg-white opacity-50" style={{ left: `${mark * 10}%` }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistical Analysis */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-secondary-900">Analisi Statistica</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-primary-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary-600">{analytics.average.toFixed(2)}</div>
                      <div className="text-xs text-primary-700">Media Aritmetica</div>
                    </div>
                    <div className="p-3 bg-secondary-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-secondary-600">{analytics.median.toFixed(2)}</div>
                      <div className="text-xs text-secondary-700">Mediana</div>
                    </div>
                    <div className="p-3 bg-info-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-info-600">{analytics.range.toFixed(2)}</div>
                      <div className="text-xs text-info-700">Range Min-Max</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{Math.sqrt(analytics.variance).toFixed(2)}</div>
                      <div className="text-xs text-purple-700">Deviazione Standard</div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <h5 className="font-semibold text-secondary-900 mb-2">Interpretazione</h5>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Consistenza:</strong> {analytics.range < 2 ? 'Alta' : analytics.range < 4 ? 'Media' : 'Bassa'}
                        {analytics.range < 2 && ' - Performance equilibrata su tutti i criteri'}
                        {analytics.range >= 2 && analytics.range < 4 && ' - Alcune aree eccellono rispetto ad altre'}
                        {analytics.range >= 4 && ' - Significative differenze tra i criteri'}
                      </p>
                      <p>
                        <strong>Potenziale di miglioramento:</strong> {
                          criteriaData.filter(c => c.value < 8).length === 0 ? 'Ottimizzazione fine' :
                          criteriaData.filter(c => c.value < 6).length > 2 ? 'Alto potenziale' : 'Miglioramento mirato'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Context Quality Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span>Qualità del Contesto RAG</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h5 className="font-semibold text-secondary-900">Metriche di Rilevanza</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Similarità Media:</span>
                      <Badge variant={evaluation.metadata.contextQuality.averageSimilarity > 0.7 ? 'success' : 'warning'}>
                        {(evaluation.metadata.contextQuality.averageSimilarity * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Chunk Utilizzati:</span>
                      <span className="font-medium">{evaluation.metadata.contextQuality.chunksUsed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Lunghezza Totale:</span>
                      <span className="font-medium">{evaluation.metadata.contextQuality.totalContextLength.toLocaleString()} char</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-semibold text-secondary-900">Distribuzione Similarità</h5>
                  <div className="space-y-2">
                    {contextUsed.relevantChunks.map((chunk, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-xs text-secondary-600">Chunk {index + 1}:</span>
                        <Progress
                          value={chunk.score * 100}
                          className="h-2 flex-1"
                          color={chunk.score > 0.8 ? 'success' : chunk.score > 0.6 ? 'warning' : 'error'}
                        />
                        <span className="text-xs font-medium">{(chunk.score * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-semibold text-secondary-900">Efficacia RAG</h5>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {((evaluation.metadata.contextQuality.averageSimilarity + (contextUsed.totalScore / 10)) / 2 * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-purple-700">Efficacia Complessiva</div>
                    </div>
                  </div>
                  <p className="text-xs text-secondary-600">
                    {evaluation.metadata.contextQuality.averageSimilarity > 0.8
                      ? 'Ottima corrispondenza tra presentazione e documento'
                      : evaluation.metadata.contextQuality.averageSimilarity > 0.6
                      ? 'Buona rilevanza del contesto utilizzato'
                      : 'Il contesto potrebbe essere più pertinente'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="space-y-6">
          {/* RAG Context Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-primary-600" />
                <span>Analisi del Contesto RAG Utilizzato</span>
              </CardTitle>
              <p className="text-secondary-600 text-sm mt-1">
                Chunk del documento più rilevanti per la valutazione della tua presentazione
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contextUsed.relevantChunks
                  .sort((a, b) => b.score - a.score)
                  .map((chunk, index) => (
                    <div key={index} className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" size="sm" className="bg-primary-50">
                            #{chunk.metadata.chunkIndex + 1}
                          </Badge>
                          <Badge
                            variant={chunk.score > 0.8 ? 'success' : chunk.score > 0.6 ? 'warning' : 'default'}
                            size="sm"
                          >
                            {(chunk.score * 100).toFixed(1)}% rilevanza
                          </Badge>
                          <span className="text-xs text-secondary-500">
                            {chunk.content.length} caratteri
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {chunk.score > 0.8 ? (
                            <ArrowUp className="w-4 h-4 text-success-600" />
                          ) : chunk.score > 0.6 ? (
                            <Minus className="w-4 h-4 text-warning-600" />
                          ) : (
                            <ArrowDown className="w-4 h-4 text-error-600" />
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <Progress
                          value={chunk.score * 100}
                          className="h-2"
                          color={chunk.score > 0.8 ? 'success' : chunk.score > 0.6 ? 'warning' : 'error'}
                        />
                      </div>

                      <div className="bg-secondary-50 rounded-lg p-3">
                        <p className="text-sm text-secondary-700 leading-relaxed">
                          {chunk.content.length > 400
                            ? `${chunk.content.substring(0, 400)}...`
                            : chunk.content}
                        </p>
                      </div>

                      {chunk.content.length > 400 && (
                        <Button variant="ghost" size="sm" className="mt-2">
                          <Eye className="w-3 h-3 mr-1" />
                          Visualizza completo
                        </Button>
                      )}
                    </div>
                  ))}
              </div>

              <div className="mt-6 p-4 bg-info-50 border border-info-200 rounded-lg">
                <h5 className="font-semibold text-info-900 mb-2 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Come interpretare questi dati
                </h5>
                <div className="text-sm text-info-800 space-y-1">
                  <p>• <strong>Alta rilevanza (80%+):</strong> Parti del documento strettamente correlate alla tua presentazione</p>
                  <p>• <strong>Media rilevanza (60-80%):</strong> Contenuti parzialmente correlati o argomenti correlati</p>
                  <p>• <strong>Bassa rilevanza (&lt;60%):</strong> Contesto utilizzato ma con correlazione limitata</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'detailed' && (
        <div className="space-y-6">
          {criteriaData.map((criterion) => (
            <Card key={criterion.name} className="overflow-hidden">
              <CardHeader className={`${criterion.bgColor} border-b`}>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <criterion.icon className={`w-6 h-6 ${criterion.color}`} />
                    <div>
                      <span className="text-xl">{criterion.name}</span>
                      <p className="text-sm opacity-80 font-normal mt-1">{criterion.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${criterion.color}`}>
                      {criterion.value.toFixed(1)}/10
                    </div>
                    <Badge className={`${getScoreColor(criterion.value)} border mt-1`}>
                      {getScoreLabel(criterion.value)}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Prestazione</span>
                      <span className="text-sm text-secondary-600">{(criterion.value * 10).toFixed(0)}%</span>
                    </div>
                    <Progress
                      value={(criterion.value / 10) * 100}
                      className="h-4"
                      color={criterion.value >= 7 ? 'success' : criterion.value >= 5 ? 'warning' : 'error'}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        Analisi Dettagliata
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Peso nel calcolo finale:</span>
                          <span className="font-medium">{criterion.weight}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Contributo al punteggio:</span>
                          <span className="font-medium">{(criterion.value * criterion.weight / 100).toFixed(2)} punti</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Posizione relativa:</span>
                          <span className="font-medium">
                            {criteriaData.filter(c => c.value > criterion.value).length + 1}° su {criteriaData.length}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Suggerimenti Specifici
                      </h4>
                      <div className="space-y-2">
                        {generateDetailedSuggestions(criterion).map((suggestion, index) => (
                          <div key={index} className="text-sm p-2 bg-secondary-50 rounded border-l-2 border-primary-300">
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Esporta Report Dettagliato
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Condividi Risultati
              </Button>
              <Button variant="outline" size="sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Guida Miglioramento
              </Button>
            </div>
            {onRestart && (
              <Button onClick={onRestart} className="bg-gradient-to-r from-primary-600 to-primary-700">
                <Star className="w-4 h-4 mr-2" />
                Nuova Valutazione
              </Button>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-secondary-200">
            <div className="flex flex-col sm:flex-row justify-between text-xs text-secondary-500 space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <span>ID: {evaluationId}</span>
                <span>•</span>
                <span>Valutato il: {new Date(evaluation.metadata.evaluatedAt).toLocaleDateString('it-IT', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Powered by AI Speech Evaluator</span>
                <Brain className="w-3 h-3" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};