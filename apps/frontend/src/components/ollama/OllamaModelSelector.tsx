'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Progress } from '@/components/ui';
import { Download, Check, AlertCircle, RefreshCw, Brain, Loader2 } from 'lucide-react';

interface OllamaModel {
  name: string;
  size: string;
  modified: string;
  digest: string;
}

interface OllamaStatus {
  installed: boolean;
  running: boolean;
  version?: string;
  executablePath?: string;
  apiReachable: boolean;
  error?: string;
}

interface OllamaModelSelectorProps {
  onModelSelect?: (modelName: string) => void;
  defaultModel?: string;
  className?: string;
}

const RECOMMENDED_MODELS = [
  {
    name: 'llama3.2:3b',
    displayName: 'Llama 3.2 3B',
    description: 'Veloce e leggero, ideale per dispositivi con risorse limitate',
    recommended: true,
    size: '~2GB'
  },
  {
    name: 'llama3.2:1b',
    displayName: 'Llama 3.2 1B',
    description: 'Molto leggero, ottimo per test rapidi',
    recommended: false,
    size: '~1GB'
  },
  {
    name: 'llama3.1:8b',
    displayName: 'Llama 3.1 8B',
    description: 'Più potente ma richiede più risorse',
    recommended: false,
    size: '~5GB'
  },
  {
    name: 'gemma2:2b',
    displayName: 'Gemma 2 2B',
    description: 'Alternativa efficiente di Google',
    recommended: false,
    size: '~1.5GB'
  }
];

export const OllamaModelSelector = ({
  onModelSelect,
  defaultModel = 'llama3.2:3b',
  className
}: OllamaModelSelectorProps) => {
  const [status, setStatus] = useState<OllamaStatus | null>(null);
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(defaultModel);
  const [loading, setLoading] = useState(true);
  const [pulling, setPulling] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const statusRes = await fetch('/api/ollama/status', {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      const statusData = await statusRes.json();

      // Handle all status codes: 200 (running), 503 (installed but not running), 424 (not installed)
      setStatus(statusData.data);

      if (statusData.data.running && statusData.data.apiReachable) {
        await loadModels();
      } else if (statusData.data.error) {
        setError(statusData.data.error);
      }
    } catch (err) {
      console.error('Error checking Ollama status:', err);
      setError('Impossibile verificare lo stato di Ollama');
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async () => {
    try {
      const modelsRes = await fetch('/api/ollama/models', {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      const modelsData = await modelsRes.json();

      if (modelsData.success) {
        setModels(modelsData.data.models);
      }
    } catch (err) {
      console.error('Error loading models:', err);
      setError('Impossibile caricare i modelli');
    }
  };

  const startOllama = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/ollama/start', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      const data = await response.json();

      if (data.success) {
        await checkStatus();
      } else {
        setError(data.error || 'Impossibile avviare Ollama');
      }
    } catch (err) {
      console.error('Error starting Ollama:', err);
      setError('Errore durante l\'avvio di Ollama');
    } finally {
      setLoading(false);
    }
  };

  const pullModel = async (modelName: string) => {
    try {
      setPulling(modelName);
      setPullProgress(prev => ({ ...prev, [modelName]: 0 }));

      const response = await fetch('/api/ollama/models/pull', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ modelName })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.substring(6));
            if (data.progress !== undefined) {
              setPullProgress(prev => ({ ...prev, [modelName]: data.progress }));
            }
            if (data.status === 'completed') {
              await loadModels();
            }
            if (data.status === 'error') {
              setError(data.error || 'Errore durante il download del modello');
            }
          } catch {
            // Ignore JSON parse errors
          }
        }
      }
    } catch (err) {
      console.error('Error pulling model:', err);
      setError('Errore durante il download del modello');
    } finally {
      setPulling(null);
    }
  };

  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName);
    onModelSelect?.(modelName);
  };

  const isModelInstalled = (modelName: string) => {
    return models.some(m => m.name === modelName || m.name.startsWith(modelName.split(':')[0]));
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <span className="ml-2 text-secondary-600">Caricamento...</span>
        </CardContent>
      </Card>
    );
  }

  if (!status?.running) {
    return (
      <Card className={`border-warning-200 bg-warning-50 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-warning-900">
            <AlertCircle className="w-5 h-5" />
            <span>Ollama Non Attivo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Not installed */}
            {!status?.installed && (
              <>
                <p className="text-sm text-warning-800">
                  Ollama non è installato sul tuo sistema.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-warning-700">
                    Per utilizzare l'AI Speech Evaluator, installa Ollama:
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => window.open('https://ollama.ai', '_blank')}
                  >
                    Scarica Ollama
                  </Button>
                </div>
              </>
            )}

            {/* Installed but not running */}
            {status?.installed && !status.running && (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-warning-800">
                    Ollama è installato ma non è in esecuzione.
                  </p>
                  {status.version && (
                    <p className="text-xs text-warning-700">
                      <strong>Versione:</strong> {status.version}
                    </p>
                  )}
                  {status.executablePath && (
                    <p className="text-xs text-warning-700">
                      <strong>Percorso:</strong> {status.executablePath}
                    </p>
                  )}
                </div>
                <Button onClick={startOllama} disabled={loading}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Avvia Ollama
                </Button>
              </>
            )}

            {/* Running but API not reachable */}
            {status?.installed && status.running && !status.apiReachable && (
              <>
                <p className="text-sm text-warning-800">
                  Ollama è in esecuzione ma l'API non è raggiungibile.
                </p>
                <p className="text-xs text-warning-700">
                  Controlla che la porta 11434 non sia bloccata o in uso.
                </p>
                <Button onClick={checkStatus} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Ricontrolla
                </Button>
              </>
            )}

            {/* Show error message if available */}
            {status?.error && (
              <div className="mt-2 p-2 bg-warning-100 border border-warning-300 rounded text-xs text-warning-800">
                {status.error}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-primary-600" />
              <span>Modelli AI Disponibili</span>
              <Badge variant="success" size="sm">
                <Check className="w-3 h-3 mr-1" />
                Attivo
              </Badge>
            </CardTitle>
            {status?.version && (
              <p className="text-xs text-secondary-600 mt-1">
                Ollama {status.version}
                {status.executablePath && ` • ${status.executablePath}`}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={checkStatus}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Aggiorna
          </Button>
        </div>
        {error && (
          <div className="mt-2 p-2 bg-error-50 border border-error-200 rounded text-sm text-error-700">
            {error}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {RECOMMENDED_MODELS.map((model) => {
            const installed = isModelInstalled(model.name);
            const isPulling = pulling === model.name;
            const progress = pullProgress[model.name] || 0;
            const isSelected = selectedModel === model.name;

            return (
              <div
                key={model.name}
                className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-secondary-200 hover:border-secondary-300'
                }`}
                onClick={() => installed && handleModelSelect(model.name)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-secondary-900">
                        {model.displayName}
                      </h4>
                      {model.recommended && (
                        <Badge variant="success" size="sm">Consigliato</Badge>
                      )}
                      {installed && (
                        <Badge variant="outline" size="sm" className="bg-success-50 text-success-700">
                          <Check className="w-3 h-3 mr-1" />
                          Installato
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-secondary-600 mb-2">
                      {model.description}
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-secondary-500">
                      <span>Dimensione: {model.size}</span>
                      <span>•</span>
                      <span>{model.name}</span>
                    </div>
                  </div>

                  <div className="ml-4">
                    {installed ? (
                      <Button
                        size="sm"
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModelSelect(model.name);
                        }}
                      >
                        {isSelected ? 'Selezionato' : 'Seleziona'}
                      </Button>
                    ) : isPulling ? (
                      <div className="w-32">
                        <Progress value={progress} size="sm" />
                        <p className="text-xs text-secondary-600 mt-1 text-center">
                          {progress}%
                        </p>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          pullModel(model.name);
                        }}
                        disabled={pulling !== null}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Scarica
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {models.length > 0 && (
          <div className="mt-6 pt-4 border-t border-secondary-200">
            <h5 className="text-sm font-semibold text-secondary-900 mb-2">
              Altri modelli installati ({models.length})
            </h5>
            <div className="space-y-1">
              {models
                .filter(m => !RECOMMENDED_MODELS.some(rm => m.name.startsWith(rm.name.split(':')[0])))
                .map((model) => (
                  <div
                    key={model.name}
                    className="flex items-center justify-between p-2 bg-secondary-50 rounded text-sm"
                  >
                    <span className="text-secondary-700">{model.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleModelSelect(model.name)}
                    >
                      Seleziona
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-info-50 border border-info-200 rounded-lg">
          <p className="text-xs text-info-800">
            <strong>Modello selezionato:</strong> {selectedModel}
          </p>
          <p className="text-xs text-info-700 mt-1">
            Questo modello verrà utilizzato per generare embeddings e valutare le tue presentazioni.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
