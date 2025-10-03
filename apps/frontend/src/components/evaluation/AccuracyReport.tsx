'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Progress
} from '@/components/ui';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  FileCheck,
  AlertCircle
} from 'lucide-react';

interface FactCheckResult {
  statement: string;
  isAccurate: boolean;
  confidence: number;
  evidenceInDocument: string | null;
  discrepancy: string | null;
  severity: 'none' | 'minor' | 'moderate' | 'critical';
}

interface DetailedAccuracyReport {
  overallAccuracyScore: number;
  totalStatements: number;
  accurateStatements: number;
  inaccurateStatements: number;
  factChecks: FactCheckResult[];
  summary: {
    criticalErrors: string[];
    moderateErrors: string[];
    minorErrors: string[];
    strengths: string[];
  };
}

interface AccuracyReportProps {
  accuracyReport: DetailedAccuracyReport;
}

export const AccuracyReport = ({ accuracyReport }: AccuracyReportProps) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="error" size="sm">Critico</Badge>;
      case 'moderate':
        return <Badge variant="warning" size="sm">Moderato</Badge>;
      case 'minor':
        return <Badge variant="info" size="sm">Minore</Badge>;
      default:
        return <Badge variant="success" size="sm">Accurato</Badge>;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-error-600" />;
      case 'moderate':
        return <AlertTriangle className="w-5 h-5 text-warning-600" />;
      case 'minor':
        return <AlertCircle className="w-5 h-5 text-info-600" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-success-600" />;
    }
  };

  const accuracyPercentage = (accuracyReport.accurateStatements / accuracyReport.totalStatements) * 100;

  return (
    <div className="space-y-6">
      {/* Overall Accuracy Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <span>Analisi Accuratezza Dettagliata</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <div className="text-3xl font-bold text-primary-700 mb-1">
                {accuracyReport.overallAccuracyScore}
              </div>
              <div className="text-sm text-secondary-600">Score Accuratezza</div>
            </div>
            <div className="text-center p-4 bg-success-50 rounded-lg">
              <div className="text-3xl font-bold text-success-700 mb-1">
                {accuracyReport.accurateStatements}
              </div>
              <div className="text-sm text-secondary-600">Affermazioni Accurate</div>
            </div>
            <div className="text-center p-4 bg-error-50 rounded-lg">
              <div className="text-3xl font-bold text-error-700 mb-1">
                {accuracyReport.inaccurateStatements}
              </div>
              <div className="text-sm text-secondary-600">Affermazioni Errate</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Accuratezza Complessiva</span>
              <span className="font-medium">{accuracyPercentage.toFixed(1)}%</span>
            </div>
            <Progress
              value={accuracyPercentage}
              className="h-3"
              color={accuracyPercentage >= 80 ? 'success' : accuracyPercentage >= 60 ? 'warning' : 'error'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Critical Errors */}
      {accuracyReport.summary.criticalErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-error-600" />
              <span>Errori Critici</span>
              <Badge variant="error">{accuracyReport.summary.criticalErrors.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {accuracyReport.summary.criticalErrors.map((error, index) => (
                <li key={index} className="flex items-start space-x-3 p-3 bg-error-50 rounded-lg border border-error-200">
                  <XCircle className="w-4 h-4 text-error-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-error-800">{error}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Moderate Errors */}
      {accuracyReport.summary.moderateErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-warning-600" />
              <span>Errori Moderati</span>
              <Badge variant="warning">{accuracyReport.summary.moderateErrors.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {accuracyReport.summary.moderateErrors.map((error, index) => (
                <li key={index} className="flex items-start space-x-3 p-3 bg-warning-50 rounded-lg border border-warning-200">
                  <AlertTriangle className="w-4 h-4 text-warning-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-warning-800">{error}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Minor Errors */}
      {accuracyReport.summary.minorErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-info-600" />
              <span>Errori Minori</span>
              <Badge variant="info">{accuracyReport.summary.minorErrors.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {accuracyReport.summary.minorErrors.map((error, index) => (
                <li key={index} className="flex items-start space-x-3 p-3 bg-info-50 rounded-lg border border-info-200">
                  <AlertCircle className="w-4 h-4 text-info-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-info-800">{error}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Strengths */}
      {accuracyReport.summary.strengths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-success-600" />
              <span>Affermazioni Verificate</span>
              <Badge variant="success">{accuracyReport.summary.strengths.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {accuracyReport.summary.strengths.map((strength, index) => (
                <li key={index} className="flex items-start space-x-3 p-3 bg-success-50 rounded-lg border border-success-200">
                  <CheckCircle2 className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-success-800">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Detailed Fact Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-primary-600" />
            <span>Verifica Affermazioni (Statement-by-Statement)</span>
          </CardTitle>
          <p className="text-sm text-secondary-600 mt-1">
            Ogni affermazione è stata verificata contro il documento di riferimento
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accuracyReport.factChecks.map((factCheck, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  factCheck.isAccurate ? 'border-success-200 bg-success-50/50' : 'border-error-200 bg-error-50/50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getSeverityIcon(factCheck.severity)}
                    <span className="text-sm font-medium">Affermazione #{index + 1}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getSeverityBadge(factCheck.severity)}
                    <Badge variant="outline" size="sm">
                      Confidenza: {(factCheck.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-medium text-secondary-500 uppercase mb-1">
                      Affermazione:
                    </div>
                    <p className="text-sm text-secondary-900 italic">
                      "{factCheck.statement}"
                    </p>
                  </div>

                  {factCheck.evidenceInDocument && (
                    <div>
                      <div className="text-xs font-medium text-secondary-500 uppercase mb-1">
                        Evidenza nel Documento:
                      </div>
                      <p className="text-sm text-secondary-700 bg-secondary-50 p-2 rounded">
                        {factCheck.evidenceInDocument}
                      </p>
                    </div>
                  )}

                  {factCheck.discrepancy && (
                    <div>
                      <div className="text-xs font-medium text-error-500 uppercase mb-1">
                        Discrepanza:
                      </div>
                      <p className="text-sm text-error-700 bg-error-50 p-2 rounded border border-error-200">
                        {factCheck.discrepancy}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
