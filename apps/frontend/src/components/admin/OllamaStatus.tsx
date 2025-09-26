'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { CheckCircle, XCircle, RefreshCw, Loader, AlertCircle, Play } from 'lucide-react';

interface OllamaStatus {
  running: boolean;
  modelsAvailable: boolean;
  version?: string;
  models?: string[];
  error?: string;
}

interface ModelCheck {
  available: boolean;
  missing: string[];
  required: string[];
}

interface OllamaData {
  success: boolean;
  ollama: OllamaStatus;
  modelCheck: ModelCheck;
  message?: string;
  error?: string;
}

export const OllamaStatusPanel = () => {
  const [status, setStatus] = useState<OllamaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/health/ollama/models');
      const data = await response.json();
      setStatus(data);

      if (!response.ok) {
        setError(data.message || 'Failed to fetch Ollama status');
      }
    } catch (err) {
      setError('Connection error - check if backend is running');
      console.error('Ollama status fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const startOllama = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health/ollama/start', { method: 'POST' });
      const data = await response.json();

      if (response.ok) {
        await fetchStatus(); // Refresh status after starting
      } else {
        setError(data.message || 'Failed to start Ollama');
      }
    } catch (err) {
      setError('Failed to start Ollama');
      console.error('Ollama start error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health/ollama/refresh', { method: 'POST' });
      const data = await response.json();
      setStatus(data);

      if (!response.ok) {
        setError(data.message || 'Failed to refresh Ollama status');
      }
    } catch (err) {
      setError('Failed to refresh Ollama status');
      console.error('Ollama refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (isRunning: boolean, hasModels: boolean) => {
    if (isRunning && hasModels) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (isRunning) {
      return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusText = (isRunning: boolean, hasModels: boolean) => {
    if (isRunning && hasModels) return 'Ready';
    if (isRunning) return 'Running (Models Missing)';
    return 'Not Running';
  };

  const getStatusColor = (isRunning: boolean, hasModels: boolean) => {
    if (isRunning && hasModels) return 'bg-green-100 text-green-800';
    if (isRunning) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>🦙 Ollama AI Service</span>
            {loading && <Loader className="w-4 h-4 animate-spin" />}
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              onClick={refreshStatus}
              size="sm"
              variant="outline"
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              onClick={startOllama}
              size="sm"
              disabled={loading || (status?.ollama.running && status?.modelCheck.available)}
            >
              <Play className="w-4 h-4 mr-1" />
              Start
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {status && (
          <>
            {/* Overall Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                {getStatusIcon(status.ollama.running, status.modelCheck.available)}
                <span className="font-medium">
                  {getStatusText(status.ollama.running, status.modelCheck.available)}
                </span>
              </div>
              <Badge className={getStatusColor(status.ollama.running, status.modelCheck.available)}>
                {status.success ? 'Operational' : 'Issues Detected'}
              </Badge>
            </div>

            {/* Ollama Details */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Service Details</h4>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 font-medium ${status.ollama.running ? 'text-green-600' : 'text-red-600'}`}>
                    {status.ollama.running ? 'Running' : 'Stopped'}
                  </span>
                </div>
                {status.ollama.version && (
                  <div>
                    <span className="text-gray-500">Version:</span>
                    <span className="ml-2 text-gray-900">{status.ollama.version}</span>
                  </div>
                )}
              </div>

              {/* Models Status */}
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Required Models</h5>
                <div className="space-y-2">
                  {status.modelCheck.required.map((model, index) => {
                    const isAvailable = !status.modelCheck.missing.includes(model);
                    return (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{model}</span>
                        <div className="flex items-center space-x-1">
                          {isAvailable ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className={isAvailable ? 'text-green-600' : 'text-red-600'}>
                            {isAvailable ? 'Installed' : 'Missing'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Available Models */}
              {status.ollama.models && status.ollama.models.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Installed Models</h5>
                  <div className="flex flex-wrap gap-1">
                    {status.ollama.models.map((model, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {model}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Info */}
              {status.ollama.error && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">{status.ollama.error}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• This panel shows the status of the Ollama AI service</p>
          <p>• Both service and required models must be ready for AI features to work</p>
          <p>• Use the "Start" button to initialize Ollama if it's not running</p>
        </div>
      </CardContent>
    </Card>
  );
};