'use client';

import { useEffect } from 'react';
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
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Progress } from '@/components/ui';
import { useSimpleAudioRecorder } from '@/hooks/useSimpleAudioRecorder';
import { cn } from '@/utils/cn';

interface SimpleAudioRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void;
  onTranscriptionComplete?: (transcription: string) => void;
  maxDuration?: number; // in seconds
  className?: string;
  autoTranscribe?: boolean;
}

export const SimpleAudioRecorder = ({
  onRecordingComplete,
  onTranscriptionComplete,
  maxDuration = 600, // 10 minutes default
  className,
  autoTranscribe = true
}: SimpleAudioRecorderProps) => {
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
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
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

  // Callback per trascrizione completata
  useEffect(() => {
    if (transcription && !isRecording && onTranscriptionComplete) {
      onTranscriptionComplete(transcription);
    }
  }, [transcription, isRecording, onTranscriptionComplete]);

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
              {isRecording ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </div>
            <div>
              <CardTitle>Registrazione Vocale</CardTitle>
              <p className="text-sm text-secondary-600">
                Registrazione e trascrizione in tempo reale (Italiano)
              </p>
            </div>
          </div>
          <Badge variant={status.variant} size="sm">
            {status.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
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
              <Button
                onClick={clearRecording}
                variant="outline"
                size="lg"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-error-50 border border-error-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0" />
              <p className="text-sm text-error-700">
                {typeof error === 'string' ? error : 'Si è verificato un errore con l\'audio'}
              </p>
            </div>
          )}

          {/* Transcription Display */}
          {transcription && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-secondary-800">
                  Trascrizione in tempo reale:
                </h4>
                {confidence > 0 && (
                  <div className="flex items-center space-x-1">
                    <Volume2 className="w-3 h-3 text-secondary-500" />
                    <span className="text-xs text-secondary-500">
                      {confidence}% fiducia
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4 bg-info-50 border border-info-200 rounded-lg">
                <p className="text-sm text-info-800 leading-relaxed">
                  {transcription || 'In attesa di parlato...'}
                </p>
                {isTranscribing && (
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-2 h-2 bg-info-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-info-600">In ascolto...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success State */}
          {audioBlob && !isRecording && transcription && (
            <div className="flex items-center space-x-2 p-3 bg-success-50 border border-success-200 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-success-800">
                  Registrazione completata!
                </p>
                <p className="text-xs text-success-600">
                  Durata: {formatDuration(duration)} • Parole: {transcription.split(' ').length}
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
        </div>
      </CardContent>
    </Card>
  );
};