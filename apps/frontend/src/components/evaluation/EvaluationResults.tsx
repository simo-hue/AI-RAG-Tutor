'use client';

import { useState } from 'react';
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
  Share2
} from 'lucide-react';
import { EvaluationResult } from '@/services/evaluationService';

interface EvaluationResultsProps {
  evaluationResult: EvaluationResult;
  onRestart?: () => void;
  className?: string;
}

export const EvaluationResults = ({
  evaluationResult,
  onRestart,
  className
}: EvaluationResultsProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'criteria' | 'context' | 'suggestions'>('overview');

  const { evaluation, contextUsed, evaluationId } = evaluationResult;

  const criteriaData = [
    { name: 'Accuratezza', value: evaluation.criteria.accuracy, icon: Target, color: 'text-blue-600' },
    { name: 'Chiarezza', value: evaluation.criteria.clarity, icon: Brain, color: 'text-green-600' },
    { name: 'Completezza', value: evaluation.criteria.completeness, icon: CheckCircle2, color: 'text-purple-600' },
    { name: 'Coerenza', value: evaluation.criteria.coherence, icon: BarChart3, color: 'text-orange-600' },
    { name: 'Fluidità', value: evaluation.criteria.fluency, icon: TrendingUp, color: 'text-teal-600' }
  ];

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

  const formatProcessingTime = (time: string) => {
    const match = time.match(/(\d+)ms/);
    if (match) {
      const ms = parseInt(match[1]);
      if (ms < 1000) return `${ms}ms`;
      return `${(ms / 1000).toFixed(1)}s`;
    }
    return time;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Overall Score */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Valutazione Completata</h2>
              <p className="text-primary-100">
                Analisi dettagliata della tua presentazione
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">
                {evaluation.overallScore.toFixed(1)}/10
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {getScoreLabel(evaluation.overallScore)}
              </Badge>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-secondary-500 mr-2" />
                <span className="text-sm text-secondary-600">Tempo Elaborazione</span>
              </div>
              <div className="text-lg font-semibold text-secondary-900">
                {formatProcessingTime(evaluation.metadata.processingTime)}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <FileText className="w-5 h-5 text-secondary-500 mr-2" />
                <span className="text-sm text-secondary-600">Lunghezza Testo</span>
              </div>
              <div className="text-lg font-semibold text-secondary-900">
                {evaluation.metadata.transcriptionLength} caratteri
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Brain className="w-5 h-5 text-secondary-500 mr-2" />
                <span className="text-sm text-secondary-600">Chunk Utilizzati</span>
              </div>
              <div className="text-lg font-semibold text-secondary-900">
                {evaluation.metadata.contextQuality.chunksUsed}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-secondary-100 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Panoramica', icon: BarChart3 },
          { id: 'criteria', label: 'Criteri Dettagliati', icon: Target },
          { id: 'context', label: 'Contesto RAG', icon: Brain },
          { id: 'suggestions', label: 'Suggerimenti', icon: TrendingUp }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Criteria Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary-600" />
                <span>Punteggi per Criterio</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {criteriaData.map((criterion) => (
                  <div key={criterion.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <criterion.icon className={`w-4 h-4 ${criterion.color}`} />
                        <span className="text-sm font-medium text-secondary-900">
                          {criterion.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-secondary-900">
                        {criterion.value.toFixed(1)}/10
                      </span>
                    </div>
                    <Progress
                      value={(criterion.value / 10) * 100}
                      className="h-2"
                      color={criterion.value >= 7 ? 'success' : criterion.value >= 5 ? 'warning' : 'error'}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Context Quality */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-primary-600" />
                <span>Qualità del Contesto</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-info-50 rounded-lg border border-info-200">
                  <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-info-600" />
                    <span className="text-sm font-medium text-info-800">
                      Similarità Media
                    </span>
                  </div>
                  <div className="text-sm font-bold text-info-900">
                    {(evaluation.metadata.contextQuality.averageSimilarity * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Chunk Analizzati</span>
                    <span className="font-medium">{evaluation.metadata.contextQuality.chunksUsed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Lunghezza Contesto</span>
                    <span className="font-medium">{evaluation.metadata.contextQuality.totalContextLength} caratteri</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Score Totale RAG</span>
                    <span className="font-medium">{contextUsed.totalScore.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'criteria' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {criteriaData.map((criterion) => (
            <Card key={criterion.name}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <criterion.icon className={`w-5 h-5 ${criterion.color}`} />
                    <span>{criterion.name}</span>
                  </div>
                  <Badge className={`${getScoreColor(criterion.value)} border`}>
                    {criterion.value.toFixed(1)}/10
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress
                  value={(criterion.value / 10) * 100}
                  className="h-3 mb-4"
                  color={criterion.value >= 7 ? 'success' : criterion.value >= 5 ? 'warning' : 'error'}
                />
                <p className="text-sm text-secondary-600">
                  {criterion.name === 'Accuratezza' && 'Valuta quanto il contenuto della presentazione corrisponde accuratamente alle informazioni nel documento di riferimento.'}
                  {criterion.name === 'Chiarezza' && 'Misura quanto chiaramente e comprensibilmente sono stati espressi i concetti durante la presentazione.'}
                  {criterion.name === 'Completezza' && 'Valuta se tutti i punti principali del documento sono stati trattati nella presentazione.'}
                  {criterion.name === 'Coerenza' && 'Misura la logicità e la connessione tra i diversi argomenti presentati.'}
                  {criterion.name === 'Fluidità' && 'Valuta la scorrevolezza e la naturalezza del linguaggio utilizzato nella presentazione.'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'context' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-primary-600" />
                <span>Chunk di Contesto Utilizzati</span>
              </CardTitle>
              <p className="text-secondary-600 text-sm mt-1">
                Sezioni del documento più rilevanti per la valutazione
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contextUsed.relevantChunks.map((chunk, index) => (
                  <div key={index} className="border border-secondary-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" size="sm">
                          Chunk {chunk.metadata.chunkIndex + 1}
                        </Badge>
                        <Badge
                          variant={chunk.score > 0.8 ? 'success' : chunk.score > 0.6 ? 'warning' : 'default'}
                          size="sm"
                        >
                          Similarità: {(chunk.score * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-secondary-700 leading-relaxed">
                      {chunk.content.length > 300
                        ? `${chunk.content.substring(0, 300)}...`
                        : chunk.content}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'suggestions' && (
        <div className="space-y-6">
          {/* Strengths */}
          {evaluation.feedback.strengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-success-600" />
                  <span>Punti di Forza</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {evaluation.feedback.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <TrendingUp className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-secondary-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Improvements */}
          {evaluation.feedback.improvements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-warning-600" />
                  <span>Aree di Miglioramento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {evaluation.feedback.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <TrendingDown className="w-4 h-4 text-warning-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-secondary-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Detailed Feedback */}
          {evaluation.feedback.detailedFeedback && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <span>Feedback Dettagliato</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-secondary-700 leading-relaxed">
                    {evaluation.feedback.detailedFeedback}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Esporta Report
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Condividi
              </Button>
            </div>
            {onRestart && (
              <Button onClick={onRestart}>
                Nuova Valutazione
              </Button>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-secondary-200 text-xs text-secondary-500">
            <div className="flex justify-between">
              <span>ID Valutazione: {evaluationId}</span>
              <span>Valutato il: {new Date(evaluation.metadata.evaluatedAt).toLocaleDateString('it-IT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};