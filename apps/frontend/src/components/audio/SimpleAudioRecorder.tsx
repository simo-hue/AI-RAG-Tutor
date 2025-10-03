'use client';

import { useEffect, useState } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  Volume2,
  Clock,
  CheckCircle2,
  Settings,
  ChevronDown,
  MessageSquare,
  Upload,
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Progress } from '@/components/ui';
import { useSimpleAudioRecorder, AudioDevice } from '@/hooks/useSimpleAudioRecorder';
import { AudioFileUploader } from './AudioFileUploader';
import { cn } from '@/utils/cn';

interface SimpleAudioRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void;
  onTranscriptionComplete?: (transcription: string) => void;
  onFeedbackRequest?: () => void;
  maxDuration?: number; // in seconds
  className?: string;
  autoTranscribe?: boolean;
  language?: string;
}

export const SimpleAudioRecorder = ({
  onRecordingComplete,
  onTranscriptionComplete,
  onFeedbackRequest,
  maxDuration = 600, // 10 minutes default
  className,
  autoTranscribe = true,
  language = 'it'
}: SimpleAudioRecorderProps) => {
  const [mode, setMode] = useState<'record' | 'upload'>('record');

  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    transcription,
    error,
    isTranscribing,
    isSupported,
    confidence,
    availableDevices,
    selectedDeviceId,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    selectAudioDevice,
    enumerateAudioDevices,
  } = useSimpleAudioRecorder();


  // Formato durata
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Stop automatico al raggiungimento del tempo massimo
  useEffect(() => {
    if (isRecording && duration >= maxDuration) {
      stopRecording();
    }
  }, [duration, maxDuration, isRecording, stopRecording]);

  // Callback quando la registrazione è completata
  useEffect(() => {
    if (audioBlob && !isRecording && onRecordingComplete) {
      onRecordingComplete(audioBlob, duration);
    }
  }, [audioBlob, isRecording, duration, onRecordingComplete]);

  // Callback per trascrizione completata - quando la registrazione si ferma
  useEffect(() => {
    if (transcription && !isRecording && !isTranscribing && onTranscriptionComplete) {
      onTranscriptionComplete(transcription);
    }
  }, [transcription, isRecording, isTranscribing, onTranscriptionComplete]);

  // Status del recording
  const getRecordingStatus = () => {
    if (error) return { text: 'Errore', variant: 'error' as const };
    if (!isSupported) return { text: 'Non Supportato', variant: 'error' as const };
    if (isTranscribing) return { text: 'Trascrizione in corso...', variant: 'warning' as const };
    if (isRecording && isPaused) return { text: 'In Pausa', variant: 'warning' as const };
    if (isRecording) return { text: 'Registrazione...', variant: 'error' as const };
    if (audioBlob) return { text: 'Completato', variant: 'success' as const };
    return { text: 'Pronto', variant: 'default' as const };
  };

  const status = getRecordingStatus();
  const progressPercentage = Math.min((duration / maxDuration) * 100, 100);

  // UI per browser non supportati
  if (!isSupported) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center">
          <MicOff className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            Registrazione Non Supportata
          </h3>
          <p className="text-secondary-600">
            Il tuo browser non supporta la registrazione audio con riconoscimento vocale.
            Prova con Chrome, Firefox o Safari più recenti.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
              isRecording && !isPaused
                ? 'bg-error-100 text-error-600 animate-pulse'
                : 'bg-primary-100 text-primary-600'
            )}>
              {mode === 'upload' ? <Upload className="w-5 h-5" /> : isRecording ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </div>
            <div>
              <CardTitle>Registrazione Vocale</CardTitle>
              <p className="text-sm text-secondary-600">
                {mode === 'upload' ? 'Carica un file audio esistente' : 'Registrazione e trascrizione in tempo reale (Italiano)'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Mode Toggle */}
            <div className="flex items-center bg-secondary-100 rounded-lg p-1">
              <Button
                variant={mode === 'record' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('record')}
                className="text-xs h-8"
              >
                <Mic className="w-3 h-3 mr-1" />
                Registra
              </Button>
              <Button
                variant={mode === 'upload' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('upload')}
                className="text-xs h-8"
              >
                <Upload className="w-3 h-3 mr-1" />
                Carica
              </Button>
            </div>
            <Badge variant={status.variant} size="sm">
              {status.text}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Upload Mode */}
          {mode === 'upload' && (
            <AudioFileUploader
              onFileSelect={(file) => {
                console.log('File selected:', file.name);
              }}
              onTranscriptionComplete={(text) => {
                onTranscriptionComplete?.(text);
              }}
              onError={(err) => {
                console.error('Upload error:', err);
              }}
              language={language}
              maxSize={100}
            />
          )}

          {/* Record Mode */}
          {mode === 'record' && (
            <>
              {/* Progress Bar */}
              <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-secondary-700">
                Progresso
              </span>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-secondary-400" />
                <span className="text-sm text-secondary-600">
                  {formatDuration(duration)} / {formatDuration(maxDuration)}
                </span>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Microphone Selection */}
          {availableDevices.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary-700">
                  Microfono
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={enumerateAudioDevices}
                  className="text-xs"
                  disabled={isRecording}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Aggiorna
                </Button>
              </div>
              <div className="relative">
                <select
                  value={selectedDeviceId}
                  onChange={(e) => selectAudioDevice(e.target.value)}
                  className="w-full p-2 text-sm border border-secondary-300 rounded-lg bg-white appearance-none cursor-pointer hover:border-primary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  disabled={isRecording}
                >
                  {availableDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none" />
              </div>
              {isRecording && (
                <p className="text-xs text-warning-600">
                  Ferma la registrazione per cambiare microfono
                </p>
              )}
            </div>
          )}

          {/* Current Device Display */}
          {availableDevices.length > 0 && (
            <div className="text-xs text-secondary-500 text-center">
              Microfono attivo: {availableDevices.find(d => d.deviceId === selectedDeviceId)?.label || 'Microfono predefinito'}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center space-x-3">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                className="flex items-center space-x-2"
                size="lg"
              >
                <Mic className="w-5 h-5" />
                <span>Inizia Registrazione</span>
              </Button>
            ) : (
              <>
                {!isPaused ? (
                  <Button
                    onClick={pauseRecording}
                    variant="outline"
                    size="lg"
                  >
                    <Pause className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button
                    onClick={resumeRecording}
                    variant="outline"
                    size="lg"
                  >
                    <Play className="w-5 h-5" />
                  </Button>
                )}
                <Button
                  onClick={stopRecording}
                  variant="secondary"
                  size="lg"
                  className="text-error-600 border-error-600 hover:bg-error-50"
                >
                  <Square className="w-5 h-5" />
                </Button>
              </>
            )}

            {(audioBlob || transcription) && (
              <>
                <Button
                  onClick={clearRecording}
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
                {onFeedbackRequest && (
                  <Button
                    onClick={onFeedbackRequest}
                    variant="outline"
                    size="lg"
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Feedback
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-error-700 font-medium mb-2">
                    {typeof error === 'string' ? error : 'Si è verificato un errore con l\'audio'}
                  </p>
                  {typeof error === 'string' && error.includes('permessi') && (
                    <div className="text-xs text-error-600">
                      <p className="mb-2">Per abilitare il microfono:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Clicca sull'icona del microfono nella barra degli indirizzi</li>
                        <li>Seleziona "Consenti sempre"</li>
                        <li>Ricarica la pagina se necessario</li>
                      </ol>
                    </div>
                  )}
                  {typeof error === 'string' && error.includes('HTTPS') && (
                    <div className="text-xs text-error-600">
                      <p>Il sito deve essere servito tramite HTTPS per accedere al microfono.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Real-time Transcription Display - Enhanced */}
          {(transcription || isRecording) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-secondary-800 flex items-center space-x-2">
                  <span>🎤 Trascrizione in tempo reale</span>
                  {isRecording && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-red-600 font-medium">LIVE</span>
                    </div>
                  )}
                </h4>
                {confidence > 0 && (
                  <div className="flex items-center space-x-1">
                    <Volume2 className="w-3 h-3 text-secondary-500" />
                    <span className="text-xs text-secondary-500">
                      {confidence}% accuratezza
                    </span>
                  </div>
                )}
              </div>

              {/* Enhanced transcription box with better visual feedback */}
              <div className={cn(
                "p-4 rounded-lg min-h-[100px] transition-all duration-300",
                isRecording && transcription
                  ? "bg-green-50 border-2 border-green-200 shadow-md"
                  : isRecording
                  ? "bg-blue-50 border-2 border-blue-200 border-dashed"
                  : "bg-info-50 border border-info-200"
              )}>
                <div className="space-y-3">
                  {/* Transcription text with better formatting */}
                  <div className="text-sm leading-relaxed">
                    {transcription ? (
                      <p className={cn(
                        "transition-all duration-200",
                        isRecording ? "text-green-800 font-medium" : "text-info-800"
                      )}>
                        {transcription}
                        {isRecording && (
                          <span className="inline-block w-1 h-4 bg-green-600 ml-1 animate-pulse"></span>
                        )}
                      </p>
                    ) : isRecording ? (
                      <p className="text-blue-700 italic">
                        🎯 In attesa di parlato... Inizia a parlare chiaramente in italiano.
                      </p>
                    ) : (
                      <p className="text-info-600 italic">
                        Nessuna trascrizione disponibile
                      </p>
                    )}
                  </div>

                  {/* Status indicators */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {(isTranscribing || isRecording) && (
                        <div className="flex items-center space-x-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full animate-pulse",
                            isRecording && transcription ? "bg-green-500" : "bg-blue-500"
                          )}></div>
                          <span className={cn(
                            "text-xs font-medium",
                            isRecording && transcription ? "text-green-600" : "text-blue-600"
                          )}>
                            {isTranscribing ? '🔄 Elaborazione audio...' : '👂 In ascolto...'}
                          </span>
                        </div>
                      )}

                      {transcription && !isRecording && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                          <span className="text-xs text-success-600 font-medium">
                            ✅ Trascrizione completata • {transcription.split(' ').length} parole
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Word count during recording */}
                    {isRecording && transcription && (
                      <div className="text-xs text-green-600 font-medium">
                        {transcription.split(' ').length} parole
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tips for better transcription during recording */}
              {isRecording && !transcription && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Volume2 className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Suggerimenti per una migliore trascrizione:</span>
                  </div>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Parla a voce chiara e con un ritmo normale</li>
                    <li>• Mantieni il microfono a circa 20-30cm di distanza</li>
                    <li>• Evita rumori di fondo e interruzioni</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Success State */}
          {audioBlob && !isRecording && transcription && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-4 bg-success-50 border border-success-200 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-success-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-success-800 mb-1">
                    🎉 Registrazione completata con successo!
                  </p>
                  <p className="text-xs text-success-600">
                    Durata: {formatDuration(duration)} • Parole riconosciute: {transcription.split(' ').length}
                  </p>
                  <p className="text-xs text-success-700 mt-1">
                    ✅ Trascrizione pronta per la valutazione
                  </p>
                </div>
              </div>

              {/* Instructions for next step */}
              <div className="p-3 bg-info-50 border border-info-200 rounded-lg">
                <p className="text-sm text-info-800 font-medium mb-1">
                  📋 Prossimo passo:
                </p>
                <p className="text-xs text-info-700">
                  Clicca il pulsante "Inizia Valutazione" qui sotto per procedere all'analisi della tua presentazione.
                </p>
              </div>

            </div>
          )}

              {/* Info */}
              <div className="text-center">
                <p className="text-xs text-secondary-500">
                  Parla chiaramente in italiano per una migliore trascrizione.
                  Il riconoscimento vocale funziona in tempo reale.
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};