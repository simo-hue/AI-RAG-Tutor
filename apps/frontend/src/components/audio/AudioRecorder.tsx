'use client';

import { useEffect, useState } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Clock,
  AlertCircle,
  Settings,
  ChevronDown
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Progress } from '@/components/ui';
import { AudioWaveform } from './AudioWaveform';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { cn } from '@/utils/cn';

interface AudioRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void;
  onTranscriptionComplete?: (transcription: string) => void;
  documentId?: string;
  maxDuration?: number; // in seconds
  className?: string;
  autoTranscribe?: boolean;
}

export const AudioRecorder = ({
  onRecordingComplete,
  onTranscriptionComplete,
  documentId,
  maxDuration = 600, // 10 minutes default
  className,
  autoTranscribe = false
}: AudioRecorderProps) => {
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    error,
    isSupported,
    hasPermission,
    isUploading,
    isTranscribing,
    transcription,
    availableDevices,
    selectedDeviceId,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearRecording,
    uploadAndTranscribe,
    getAnalyzerData,
    getAudioDevices,
    selectDevice,
  } = useAudioRecorder();

  const [analyzerData, setAnalyzerData] = useState<{ volume: number; frequencies: number[] }>({ volume: 0, frequencies: [] });
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);

  // Load available audio devices on component mount
  useEffect(() => {
    if (isSupported && hasPermission === null) {
      getAudioDevices();
    }
  }, [isSupported, hasPermission, getAudioDevices]);

  // Update analyzer data during recording
  useEffect(() => {
    if (!isRecording || isPaused) return;

    const interval = setInterval(() => {
      const data = getAnalyzerData();
      if (data) {
        setAnalyzerData(data);
      }
    }, 50); // 20fps

    return () => clearInterval(interval);
  }, [isRecording, isPaused, getAnalyzerData]);

  // Auto-stop when max duration reached
  useEffect(() => {
    if (isRecording && duration >= maxDuration) {
      stopRecording();
    }
  }, [duration, maxDuration, isRecording, stopRecording]);

  // Handle recording completion
  useEffect(() => {
    if (audioBlob && !isRecording) {
      onRecordingComplete?.(audioBlob, duration);

      // Auto-transcribe if enabled and documentId is available
      if (autoTranscribe && documentId) {
        handleTranscribe();
      }
    }
  }, [audioBlob, isRecording, duration, onRecordingComplete, autoTranscribe, documentId]);

  // Handle transcription completion
  useEffect(() => {
    if (transcription) {
      onTranscriptionComplete?.(transcription);
    }
  }, [transcription, onTranscriptionComplete]);

  // Handle transcription
  const handleTranscribe = async () => {
    if (!documentId || !audioBlob) return;

    try {
      await uploadAndTranscribe(documentId);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Transcription failed:', error);
      }
    }
  };

  // Format duration display
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle audio playback
  const togglePlayback = () => {
    if (!audioUrl) return;

    if (isPlaying) {
      audioElement?.pause();
      setIsPlaying(false);
    } else {
      if (!audioElement) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPlaying(false);
        audio.onpause = () => setIsPlaying(false);
        audio.onplay = () => setIsPlaying(true);
        setAudioElement(audio);
        audio.play();
      } else {
        audioElement.play();
      }
      setIsPlaying(true);
    }
  };

  // Download recording
  const downloadRecording = () => {
    if (!audioBlob) return;

    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${new Date().toISOString().slice(0, 19)}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get recording status
  const getRecordingStatus = () => {
    if (error) return { text: 'Errore', variant: 'error' as const };
    if (!isSupported) return { text: 'Non Supportato', variant: 'error' as const };
    if (hasPermission === false) return { text: 'Permesso Negato', variant: 'error' as const };
    if (isTranscribing) return { text: 'Trascrizione in corso...', variant: 'warning' as const };
    if (isUploading) return { text: 'Salvataggio audio...', variant: 'warning' as const };
    if (isRecording && isPaused) return { text: 'Registrazione in pausa', variant: 'warning' as const };
    if (isRecording) return { text: 'Registrazione attiva', variant: 'success' as const };
    if (transcription) return { text: 'Trascrizione completata', variant: 'success' as const };
    if (audioBlob) return { text: 'Registrazione completata', variant: 'success' as const };
    return { text: 'Pronto per registrare', variant: 'default' as const };
  };

  // Get detailed status description
  const getDetailedStatusDescription = () => {
    if (isUploading) return 'Salvataggio del file audio sul server...';
    if (isTranscribing) return 'Conversione da audio a testo utilizzando Whisper AI locale...';
    if (isRecording && !isPaused) return 'Registrazione audio in corso. Parla chiaramente nel microfono.';
    if (isRecording && isPaused) return 'Registrazione messa in pausa. Clicca play per continuare.';
    if (transcription) return 'La trascrizione è stata completata con successo. Il testo è pronto per l\'analisi.';
    if (audioBlob) return 'La registrazione è stata completata. Puoi ascoltarla o avviare la trascrizione.';
    return '';
  };

  const status = getRecordingStatus();

  if (!isSupported) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center">
          <MicOff className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            Registrazione Non Supportata
          </h3>
          <p className="text-secondary-600">
            Il tuo browser non supporta la registrazione audio.
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
              isRecording
                ? 'bg-error-100 text-error-600'
                : 'bg-primary-100 text-primary-600'
            )}>
              {isRecording ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </div>
            <div>
              <CardTitle className="text-lg">Registrazione Audio</CardTitle>
              <div className="space-y-2 mt-1">
                <div className="flex items-center space-x-2">
                  <Badge variant={status.variant} size="sm">
                    {status.text}
                  </Badge>
                  {isRecording && (
                    <div className="flex items-center space-x-1 text-xs text-secondary-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatDuration(duration)}</span>
                    </div>
                  )}
                </div>
                {getDetailedStatusDescription() && (
                  <p className="text-xs text-secondary-600 leading-relaxed">
                    {getDetailedStatusDescription()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Recording Actions */}
          <div className="flex items-center space-x-2">
            {!isRecording && !audioBlob && (
              <Button
                onClick={startRecording}
                className="bg-error-600 hover:bg-error-700"
                disabled={hasPermission === false}
              >
                <Mic className="w-4 h-4 mr-2" />
                Inizia
              </Button>
            )}

            {isRecording && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isPaused ? resumeRecording : pauseRecording}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopRecording}
                >
                  <Square className="w-4 h-4" />
                </Button>
              </>
            )}

            {audioBlob && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePlayback}
                  disabled={isUploading || isTranscribing}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadRecording}
                  disabled={isUploading || isTranscribing}
                >
                  <Download className="w-4 h-4" />
                </Button>
                {!autoTranscribe && documentId && !transcription && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTranscribe}
                    disabled={isUploading || isTranscribing}
                  >
                    {isUploading || isTranscribing ? 'Trascrivendo...' : 'Trascrivi'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearRecording}
                  disabled={isUploading || isTranscribing}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Microphone Selection */}
        {availableDevices.length > 1 && !isRecording && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-secondary-900 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Seleziona Microfono
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeviceSelector(!showDeviceSelector)}
              >
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform",
                  showDeviceSelector && "rotate-180"
                )} />
              </Button>
            </div>

            {showDeviceSelector && (
              <div className="space-y-2">
                {availableDevices.map((device) => (
                  <div
                    key={device.deviceId}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all",
                      selectedDeviceId === device.deviceId
                        ? "bg-primary-50 border-primary-300 text-primary-700"
                        : "bg-white border-secondary-200 hover:bg-secondary-50"
                    )}
                    onClick={() => selectDevice(device.deviceId)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        selectedDeviceId === device.deviceId
                          ? "bg-primary-500"
                          : "bg-secondary-300"
                      )} />
                      <div>
                        <p className="text-sm font-medium">{device.label}</p>
                        <p className="text-xs text-secondary-500">
                          ID: {device.deviceId.slice(0, 20)}...
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-error-50 border border-error-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0" />
            <p className="text-sm text-error-700">{error}</p>
          </div>
        )}

        {/* Waveform Visualization */}
        <div className="space-y-3">
          <AudioWaveform
            isRecording={isRecording && !isPaused}
            volume={analyzerData.volume}
            frequencies={analyzerData.frequencies}
            height={100}
            className="bg-secondary-50 border border-secondary-200"
          />

          {/* Volume Indicator */}
          {isRecording && (
            <div className="flex items-center space-x-3">
              {analyzerData.volume > 0.1 ? (
                <Volume2 className="w-4 h-4 text-success-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-secondary-400" />
              )}
              <div className="flex-1">
                <Progress
                  value={analyzerData.volume * 100}
                  className="h-2"
                  color={analyzerData.volume > 0.7 ? 'warning' : 'success'}
                />
              </div>
              <span className="text-xs text-secondary-500 w-12">
                {Math.round(analyzerData.volume * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Duration and Progress */}
        {(isRecording || audioBlob) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary-600">Durata</span>
              <span className="font-mono text-secondary-900">
                {formatDuration(duration)} / {formatDuration(maxDuration)}
              </span>
            </div>
            <Progress
              value={(duration / maxDuration) * 100}
              className="h-1"
              color={duration > maxDuration * 0.9 ? 'warning' : 'primary'}
            />
          </div>
        )}

        {/* Transcription Display */}
        {transcription && (
          <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
            <h4 className="text-sm font-semibold text-success-800 mb-2">Trascrizione:</h4>
            <p className="text-sm text-success-700 leading-relaxed">{transcription}</p>
          </div>
        )}

        {/* Recording Tips and Information */}
        {!isRecording && !audioBlob && hasPermission !== false && (
          <div className="p-4 bg-info-50 border border-info-200 rounded-lg">
            <div className="text-center space-y-3">
              <div>
                <p className="text-sm font-semibold text-info-800 mb-2">
                  💡 Suggerimenti per una registrazione ottimale:
                </p>
                <ul className="space-y-1 text-xs text-info-700 text-left">
                  <li>• Parla chiaramente a circa 30cm dal microfono selezionato</li>
                  <li>• Evita rumori di fondo, eco e interruzioni</li>
                  <li>• Mantieni un volume costante durante la registrazione</li>
                  <li>• La registrazione verrà automaticamente trascritta utilizzando Whisper AI locale</li>
                </ul>
              </div>

              {availableDevices.length > 1 && (
                <div className="pt-2 border-t border-info-200">
                  <p className="text-xs text-info-600">
                    <strong>Microfono selezionato:</strong> {' '}
                    {availableDevices.find(d => d.deviceId === selectedDeviceId)?.label || 'Microfono predefinito'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};