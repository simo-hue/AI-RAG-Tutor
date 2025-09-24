'use client';

import { Card, CardHeader, CardTitle, CardContent, Progress, Badge } from '@/components/ui';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  FileText,
  Brain,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Users,
  Award
} from 'lucide-react';

interface StatisticsData {
  overallScore: number;
  criteria: {
    accuracy: number;
    clarity: number;
    completeness: number;
    coherence: number;
    fluency: number;
  };
  metadata: {
    transcriptionLength: number;
    contextQuality: {
      averageSimilarity: number;
      chunksUsed: number;
      totalContextLength: number;
    };
    processingTime: string;
  };
  contextUsed: {
    totalScore: number;
    relevantChunks: Array<{
      score: number;
    }>;
  };
}

interface EvaluationStatisticsProps {
  data: StatisticsData;
  className?: string;
}

export const EvaluationStatistics = ({ data, className }: EvaluationStatisticsProps) => {
  const { overallScore, criteria, metadata, contextUsed } = data;

  // Calculate various statistics
  const averageCriteriaScore = Object.values(criteria).reduce((sum, score) => sum + score, 0) / 5;
  const highestCriterion = Object.entries(criteria).reduce((a, b) => a[1] > b[1] ? a : b);
  const lowestCriterion = Object.entries(criteria).reduce((a, b) => a[1] < b[1] ? a : b);

  const wordsCount = Math.round(metadata.transcriptionLength / 5); // Rough estimate
  const speakingRate = Math.round(wordsCount / 60); // words per minute (assuming 1 minute)

  const processingTimeMs = parseInt(metadata.processingTime.replace('ms', ''));
  const isOptimalProcessing = processingTimeMs < 10000; // Under 10 seconds

  const contextEfficiency = (contextUsed.totalScore / contextUsed.relevantChunks.length) * 100;

  const getCriterionName = (key: string) => {
    const names = {
      accuracy: 'Accuratezza',
      clarity: 'Chiarezza',
      completeness: 'Completezza',
      coherence: 'Coerenza',
      fluency: 'Fluidità'
    };
    return names[key as keyof typeof names] || key;
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 8) return { level: 'Eccellente', color: 'text-success-600', bgColor: 'bg-success-50' };
    if (score >= 6) return { level: 'Buono', color: 'text-warning-600', bgColor: 'bg-warning-50' };
    if (score >= 4) return { level: 'Sufficiente', color: 'text-info-600', bgColor: 'bg-info-50' };
    return { level: 'Da migliorare', color: 'text-error-600', bgColor: 'bg-error-50' };
  };

  const performance = getPerformanceLevel(overallScore);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`border-2 ${performance.bgColor} border-opacity-50`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${performance.bgColor}`}>
                <Award className={`w-5 h-5 ${performance.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary-900">
                  {overallScore.toFixed(1)}
                </div>
                <div className={`text-sm font-medium ${performance.color}`}>
                  {performance.level}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary-900">
                  {averageCriteriaScore.toFixed(1)}
                </div>
                <div className="text-sm text-secondary-600">
                  Media Criteri
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary-900">
                  {wordsCount}
                </div>
                <div className="text-sm text-secondary-600">
                  Parole (~)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-50">
                <Brain className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary-900">
                  {metadata.contextQuality.chunksUsed}
                </div>
                <div className="text-sm text-secondary-600">
                  Chunk RAG
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Criteria Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-primary-600" />
              <span>Analisi dei Criteri</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(criteria).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-secondary-900">
                      {getCriterionName(key)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={value >= 7 ? 'success' : value >= 5 ? 'warning' : 'error'}
                        size="sm"
                      >
                        {value.toFixed(1)}
                      </Badge>
                      {key === highestCriterion[0] && (
                        <TrendingUp className="w-3 h-3 text-success-500" />
                      )}
                      {key === lowestCriterion[0] && (
                        <TrendingDown className="w-3 h-3 text-error-500" />
                      )}
                    </div>
                  </div>
                  <Progress
                    value={(value / 10) * 100}
                    className="h-2"
                    color={value >= 7 ? 'success' : value >= 5 ? 'warning' : 'error'}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary-600" />
              <span>Metriche di Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-secondary-600" />
                  <span className="text-sm font-medium text-secondary-700">
                    Tempo di Elaborazione
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-secondary-900">
                    {(processingTimeMs / 1000).toFixed(1)}s
                  </span>
                  {isOptimalProcessing && (
                    <Zap className="w-3 h-3 text-success-500" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-secondary-600" />
                  <span className="text-sm font-medium text-secondary-700">
                    Velocità di Parlato
                  </span>
                </div>
                <span className="text-sm font-semibold text-secondary-900">
                  ~{speakingRate} parole/min
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <PieChart className="w-4 h-4 text-secondary-600" />
                  <span className="text-sm font-medium text-secondary-700">
                    Efficienza Contesto
                  </span>
                </div>
                <span className="text-sm font-semibold text-secondary-900">
                  {contextEfficiency.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-secondary-600" />
                  <span className="text-sm font-medium text-secondary-700">
                    Similarità Media
                  </span>
                </div>
                <span className="text-sm font-semibold text-secondary-900">
                  {(metadata.contextQuality.averageSimilarity * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary-600" />
            <span>Insights Automatici</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-success-700 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Punti di Forza</span>
              </h4>
              <ul className="space-y-2">
                <li className="text-sm text-secondary-700">
                  • <strong>{getCriterionName(highestCriterion[0])}</strong> è il tuo punto forte ({highestCriterion[1].toFixed(1)}/10)
                </li>
                {contextEfficiency > 70 && (
                  <li className="text-sm text-secondary-700">
                    • Ottima efficienza nell'utilizzo del contesto RAG
                  </li>
                )}
                {isOptimalProcessing && (
                  <li className="text-sm text-secondary-700">
                    • Elaborazione rapida e efficiente
                  </li>
                )}
                {overallScore >= 7 && (
                  <li className="text-sm text-secondary-700">
                    • Performance complessiva molto buona
                  </li>
                )}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-warning-700 flex items-center space-x-2">
                <TrendingDown className="w-4 h-4" />
                <span>Aree di Miglioramento</span>
              </h4>
              <ul className="space-y-2">
                <li className="text-sm text-secondary-700">
                  • Concentrati su <strong>{getCriterionName(lowestCriterion[0])}</strong> ({lowestCriterion[1].toFixed(1)}/10)
                </li>
                {wordsCount < 100 && (
                  <li className="text-sm text-secondary-700">
                    • Prova a sviluppare maggiormente i contenuti
                  </li>
                )}
                {metadata.contextQuality.averageSimilarity < 0.6 && (
                  <li className="text-sm text-secondary-700">
                    • Migliora l'aderenza al documento di riferimento
                  </li>
                )}
                {overallScore < 6 && (
                  <li className="text-sm text-secondary-700">
                    • Performance generale da migliorare con più pratica
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};