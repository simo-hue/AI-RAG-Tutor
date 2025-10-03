'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { Check, AlertCircle, RefreshCw, Brain, Loader2, Server, HardDrive } from 'lucide-react';

interface OllamaModel {
  name: string;
  model: string;
  size: number;
  modified_at: string;
  digest: string;
  details?: {
    parameter_size?: string;
    quantization_level?: string;
    family?: string;
  };
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

// REMOVED: Hardcoded recommended models list
// Now showing only locally installed models

export const OllamaModelSelector = ({
  onModelSelect,
  defaultModel = 'llama3.2:3b',
  className
}: OllamaModelSelectorProps) => {
  const [status, setStatus] = useState<OllamaStatus | null>(null);
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(defaultModel);
  const [loading, setLoading] = useState(true);
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

      if (!statusRes.ok) {
        throw new Error(`HTTP ${statusRes.status}: ${statusRes.statusText}`);
      }

      const statusData = await statusRes.json();

      console.log('Ollama status response:', statusData);

      if (statusData.success && statusData.data) {
        setStatus(statusData.data);

        // Load models if Ollama is running and reachable
        if (statusData.data.running && statusData.data.apiReachable) {
          await loadModels();
        }
      } else {
        setError(statusData.error || 'Risposta status non valida');
        // Set a default "not running" status
        setStatus({
          installed: false,
          running: false,
          apiReachable: false,
          error: statusData.error
        });
      }
    } catch (err) {
      console.error('Error checking Ollama status:', err);
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(`Impossibile verificare lo stato di Ollama: ${errorMessage}`);

      // Set a default "error" status
      setStatus({
        installed: false,
        running: false,
        apiReachable: false,
        error: errorMessage
      });
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

      if (!modelsRes.ok) {
        throw new Error(`HTTP ${modelsRes.status}: ${modelsRes.statusText}`);
      }

      const modelsData = await modelsRes.json();

      console.log('Ollama models response:', modelsData);

      if (modelsData.success && modelsData.data?.models) {
        setModels(modelsData.data.models);

        // Only auto-select if no model is currently selected
        if (modelsData.data.models.length > 0 && !selectedModel) {
          const firstModel = modelsData.data.models[0].name;
          setSelectedModel(firstModel);
          onModelSelect?.(firstModel);
        }
      }
    } catch (err) {
      console.error('Error loading models:', err);
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(`Impossibile caricare i modelli: ${errorMessage}`);
    }
  };

  const formatSize = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) {
      return `${gb.toFixed(2)} GB`;
    }
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
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

  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName);
    onModelSelect?.(modelName);
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

  // Only show "Not Running" if we have a definitive status and it's not running
  if (status && !status.running) {
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
            {!status.installed && (
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
            {status.installed && !status.running && (
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
            {status.installed && status.running && !status.apiReachable && (
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
            {error && (
              <div className="mt-2 p-2 bg-warning-100 border border-warning-300 rounded text-xs text-warning-800">
                {error}
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
              <Server className="w-5 h-5 text-success-600" />
              <span>Ollama AI Server</span>
              <Badge variant="success" size="sm">
                <Check className="w-3 h-3 mr-1" />
                Attivo
              </Badge>
            </CardTitle>
            {status?.version && (
              <p className="text-xs text-secondary-600 mt-1 flex items-center gap-2">
                <span className="font-medium">{status.version}</span>
                {status.executablePath && (
                  <>
                    <span className="text-secondary-400">•</span>
                    <span className="text-secondary-500">{status.executablePath}</span>
                  </>
                )}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={checkStatus} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
        </div>
        {error && (
          <div className="mt-3 p-3 bg-error-50 border border-error-200 rounded text-sm text-error-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {/* Show message if no models installed */}
        {models.length === 0 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary-100 mb-4">
              <HardDrive className="w-8 h-8 text-secondary-400" />
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Nessun modello installato
            </h3>
            <p className="text-sm text-secondary-600 mb-4 max-w-md mx-auto">
              Per iniziare, installa un modello usando il comando Ollama dal terminale:
            </p>
            <div className="bg-secondary-900 text-secondary-50 px-4 py-3 rounded-lg font-mono text-sm inline-block mb-4">
              ollama pull llama3.2:3b
            </div>
            <p className="text-xs text-secondary-500">
              Dopo l'installazione, aggiorna questa pagina per vedere i modelli disponibili.
            </p>
          </div>
        )}

        {/* All Installed Models Section */}
        {models.length > 0 && (
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <HardDrive className="w-5 h-5 text-primary-600" />
                <div>
                  <h5 className="text-base font-semibold text-secondary-900">
                    Modelli Installati Localmente
                  </h5>
                  <p className="text-xs text-secondary-600">
                    {models.length} {models.length === 1 ? 'modello disponibile' : 'modelli disponibili'} sul tuo sistema
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {models.map((model) => {
                const isSelected = selectedModel === model.name;
                return (
                  <div
                    key={model.digest}
                    className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50'
                    }`}
                    onClick={() => handleModelSelect(model.name)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h6 className="font-semibold text-secondary-900 truncate text-base">
                            {model.name}
                          </h6>
                          {isSelected && (
                            <Badge variant="success" size="sm">
                              <Check className="w-3 h-3 mr-1" />
                              In Uso
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-secondary-600">
                          <div className="flex items-center gap-1">
                            <span className="text-secondary-500 font-medium">Dimensione:</span>
                            <span>{formatSize(model.size)}</span>
                          </div>
                          {model.details?.parameter_size && (
                            <div className="flex items-center gap-1">
                              <span className="text-secondary-500 font-medium">Parametri:</span>
                              <span>{model.details.parameter_size}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span className="text-secondary-500 font-medium">Modificato:</span>
                            <span>{formatDate(model.modified_at)}</span>
                          </div>
                          {model.details?.quantization_level && (
                            <div className="flex items-center gap-1">
                              <span className="text-secondary-500 font-medium">Quantizzazione:</span>
                              <span>{model.details.quantization_level}</span>
                            </div>
                          )}
                          {model.details?.family && (
                            <div className="flex items-center gap-1 col-span-2">
                              <span className="text-secondary-500 font-medium">Famiglia:</span>
                              <span>{model.details.family}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-2 text-xs text-secondary-400 font-mono truncate">
                          Digest: {model.digest.substring(0, 16)}...
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant={isSelected ? 'primary' : 'outline'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModelSelect(model.name);
                        }}
                        className="flex-shrink-0"
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Attivo
                          </>
                        ) : (
                          'Seleziona'
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Model Info Box */}
        <div className="mt-4 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Brain className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-secondary-900 mb-1">
                Modello Attivo
              </p>
              <p className="text-xs text-secondary-700 font-mono bg-white px-2 py-1 rounded border border-secondary-200 inline-block">
                {selectedModel}
              </p>
              <p className="text-xs text-secondary-600 mt-2">
                Questo modello verrà utilizzato per generare embeddings e valutare le tue presentazioni in base al documento di riferimento.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
