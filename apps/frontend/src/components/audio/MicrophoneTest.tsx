'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Settings,
  ChevronDown,
  Volume2,
  Square,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Download,
  Radio
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Progress, Badge } from '@/components/ui';
import { cn } from '@/utils/cn';

interface AudioDevice {
  deviceId: string;
  label: string;
}

interface MicrophoneTestProps {
  onTestComplete?: (success: boolean, deviceId?: string) => void;
  className?: string;
}

export const MicrophoneTest = ({ onTestComplete, className }: MicrophoneTestProps) => {
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [frequencyData, setFrequencyData] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Enumera dispositivi audio
  const enumerateDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microfono ${device.deviceId.slice(0, 8)}`
        }));

      setAudioDevices(audioInputs);

      if (audioInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(audioInputs[0].deviceId);
      }
    } catch (err) {
      console.error('Error enumerating devices:', err);
      setError('Impossibile accedere ai dispositivi audio');
    }
  }, [selectedDeviceId]);

  // Richiedi permessi e enumera dispositivi
  const requestPermissions = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop());
      await enumerateDevices();
    } catch (err: any) {
      setHasPermission(false);
      if (err.name === 'NotAllowedError') {
        setError('Permessi del microfono negati. Clicca sull\'icona del microfono nella barra degli indirizzi per consentire l\'accesso.');
      } else if (err.name === 'NotFoundError') {
        setError('Nessun microfono trovato. Verifica che un microfono sia collegato.');
      } else {
        setError(`Errore di accesso al microfono: ${err.message}`);
      }
    }
  }, [enumerateDevices]);

  // Analizza il livello audio e frequenze
  const analyzeAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calcola livello audio
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const average = sum / bufferLength;
    const normalizedLevel = Math.min(100, (average / 255) * 100 * 3);
    setAudioLevel(normalizedLevel);

    // Estrai dati di frequenza per visualizzazione (32 barre)
    const bars = 32;
    const barWidth = Math.floor(bufferLength / bars);
    const frequencies: number[] = [];

    for (let i = 0; i < bars; i++) {
      let barSum = 0;
      for (let j = 0; j < barWidth; j++) {
        barSum += dataArray[i * barWidth + j];
      }
      const barAverage = barSum / barWidth;
      frequencies.push(Math.min(100, (barAverage / 255) * 100));
    }
    setFrequencyData(frequencies);

    if (isTestingMic) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudioLevel);
    }
  }, [isTestingMic]);

  // Avvia test microfono
  const startMicrophoneTest = useCallback(async () => {
    if (!selectedDeviceId) return;

    try {
      setError(null);
      setIsTestingMic(true);
      setAudioLevel(0);
      setFrequencyData([]);

      const constraints = {
        audio: {
          deviceId: { exact: selectedDeviceId },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Crea audio context e analyzer
      audioContextRef.current = new AudioContext();

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.7;
      source.connect(analyserRef.current);

      // Avvia analisi audio
      analyzeAudioLevel();

    } catch (err: any) {
      setIsTestingMic(false);
      if (err.name === 'NotAllowedError') {
        setError('Permessi del microfono negati.');
      } else if (err.name === 'NotFoundError') {
        setError('Dispositivo audio non trovato.');
      } else if (err.name === 'NotReadableError') {
        setError('Il microfono è già in uso da un\'altra applicazione.');
      } else {
        setError(`Errore test microfono: ${err.message}`);
      }
    }
  }, [selectedDeviceId, analyzeAudioLevel]);

  // Avvia registrazione
  const startRecording = useCallback(async () => {
    if (!streamRef.current) return;

    try {
      audioChunksRef.current = [];
      setRecordedBlob(null);
      setRecordingDuration(0);

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType
        });
        setRecordedBlob(blob);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      // Timer per durata registrazione
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      setError(`Errore durante la registrazione: ${err.message}`);
    }
  }, []);

  // Ferma registrazione
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  }, [isRecording]);

  // Ferma test microfono
  const stopMicrophoneTest = useCallback(() => {
    setIsTestingMic(false);
    setAudioLevel(0);
    setFrequencyData([]);

    if (isRecording) {
      stopRecording();
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
  }, [isRecording, stopRecording]);

  // Play/Pause registrazione
  const togglePlayback = useCallback(() => {
    if (!recordedBlob) return;

    if (isPlaying && audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioElementRef.current) {
        const audioUrl = URL.createObjectURL(recordedBlob);
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPlaying(false);
        audio.onpause = () => setIsPlaying(false);
        audio.onplay = () => setIsPlaying(true);
        audioElementRef.current = audio;
        audio.play();
      } else {
        audioElementRef.current.play();
      }
      setIsPlaying(true);
    }
  }, [recordedBlob, isPlaying]);

  // Download registrazione
  const downloadRecording = useCallback(() => {
    if (!recordedBlob) return;

    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mic-test-${new Date().toISOString().slice(0, 19)}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [recordedBlob]);

  // Reset test
  const resetTest = useCallback(() => {
    stopMicrophoneTest();
    setError(null);
    setRecordedBlob(null);
    setRecordingDuration(0);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setIsPlaying(false);
  }, [stopMicrophoneTest]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determina stato test
  const getTestStatus = () => {
    if (error) return { text: 'Errore', variant: 'error' as const };
    if (!hasPermission) return { text: 'Permessi Richiesti', variant: 'warning' as const };
    if (isRecording) return { text: 'Registrazione', variant: 'error' as const };
    if (isTestingMic) return { text: 'Test Attivo', variant: 'success' as const };
    if (recordedBlob) return { text: 'Test Completato', variant: 'success' as const };
    return { text: 'Pronto', variant: 'default' as const };
  };

  const status = getTestStatus();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetTest();
    };
  }, [resetTest]);

  // Auto-request permissions on mount
  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
              isTestingMic
                ? 'bg-success-100 text-success-600'
                : hasPermission
                ? 'bg-primary-100 text-primary-600'
                : 'bg-error-100 text-error-600'
            )}>
              {hasPermission ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </div>
            <div>
              <CardTitle>Test Microfono Professionale</CardTitle>
              <p className="text-sm text-secondary-600">
                Verifica e registra l'audio del tuo microfono
              </p>
            </div>
          </div>
          <Badge variant={status.variant} size="sm">
            {status.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Permission Request */}
        {!hasPermission && (
          <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-warning-800 mb-2">
                  Permessi microfono richiesti
                </p>
                <p className="text-sm text-warning-700 mb-3">
                  Per testare e registrare il microfono, dobbiamo accedere ai tuoi dispositivi audio.
                </p>
                <Button
                  onClick={requestPermissions}
                  size="sm"
                  className="bg-warning-600 hover:bg-warning-700"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Consenti Accesso
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Device Selection */}
        {hasPermission && audioDevices.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-secondary-700">
                Seleziona Microfono
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={enumerateDevices}
                disabled={isTestingMic}
              >
                <Settings className="w-4 h-4 mr-1" />
                Aggiorna
              </Button>
            </div>
            <div className="relative">
              <select
                value={selectedDeviceId}
                onChange={(e) => {
                  setSelectedDeviceId(e.target.value);
                  if (isTestingMic) {
                    stopMicrophoneTest();
                  }
                }}
                className="w-full p-3 text-sm border border-secondary-300 rounded-lg bg-white appearance-none cursor-pointer hover:border-primary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                disabled={isTestingMic}
              >
                {audioDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Frequency Spectrum Visualizer */}
        {hasPermission && isTestingMic && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-secondary-700 flex items-center">
                <Radio className="w-4 h-4 mr-2 text-primary-600" />
                Analisi Spettro Audio
              </span>
              {isTestingMic && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">LIVE</span>
                </div>
              )}
            </div>

            {/* Frequency bars - Waveform visualization */}
            <div className="relative h-32 bg-gradient-to-b from-secondary-50 to-secondary-100 rounded-lg overflow-hidden p-2">
              <div className="flex items-end justify-between h-full space-x-0.5">
                {frequencyData.map((value, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t transition-all duration-75 ease-out"
                    style={{
                      height: `${Math.max(2, value)}%`,
                      backgroundColor:
                        value < 30 ? '#10b981' : // green
                        value < 60 ? '#f59e0b' : // yellow
                        '#ef4444' // red
                    }}
                  />
                ))}
              </div>
              {frequencyData.every(f => f === 0) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-secondary-500">
                    In attesa di segnale audio...
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audio Level Indicator */}
        {hasPermission && isTestingMic && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-secondary-700">
                Livello Audio
              </span>
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-secondary-400" />
                <span className="text-sm text-secondary-600 font-mono">
                  {Math.round(audioLevel)}%
                </span>
              </div>
            </div>

            {/* Volume meter with color gradient */}
            <div className="relative h-8 bg-secondary-100 rounded-lg overflow-hidden border border-secondary-200">
              <div
                className={cn(
                  "h-full transition-all duration-100 ease-out",
                  audioLevel < 20 && "bg-gradient-to-r from-red-400 to-red-500",
                  audioLevel >= 20 && audioLevel < 60 && "bg-gradient-to-r from-green-400 to-green-500",
                  audioLevel >= 60 && audioLevel < 85 && "bg-gradient-to-r from-yellow-400 to-yellow-500",
                  audioLevel >= 85 && "bg-gradient-to-r from-red-500 to-red-600"
                )}
                style={{ width: `${Math.min(audioLevel, 100)}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-secondary-700">
                  {audioLevel > 0 ? 'Ottimo!' : 'Parla nel microfono'}
                </span>
              </div>
            </div>

            {/* Level indicator bars */}
            <div className="flex space-x-1">
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-3 flex-1 rounded-sm transition-all duration-75",
                    audioLevel > (i * 100 / 24)
                      ? i < 8
                        ? "bg-green-500 shadow-sm shadow-green-400"
                        : i < 18
                        ? "bg-yellow-500 shadow-sm shadow-yellow-400"
                        : "bg-red-500 shadow-sm shadow-red-400"
                      : "bg-secondary-200"
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recording Duration */}
        {isRecording && (
          <div className="p-4 bg-error-50 border-2 border-error-300 rounded-lg animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-error-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-error-800">
                  Registrazione in corso...
                </span>
              </div>
              <span className="text-lg font-mono font-bold text-error-900">
                {formatDuration(recordingDuration)}
              </span>
            </div>
          </div>
        )}

        {/* Playback Controls */}
        {recordedBlob && !isRecording && (
          <div className="p-4 bg-success-50 border border-success-300 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-success-800 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Registrazione Completata
                </h4>
                <p className="text-xs text-success-700 mt-1">
                  Durata: {formatDuration(recordingDuration)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={togglePlayback}
                  className="bg-white"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-1" />
                      Pausa
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1" />
                      Ascolta
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadRecording}
                  className="bg-white"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Test Controls */}
        {hasPermission && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              {!isTestingMic ? (
                <Button
                  onClick={startMicrophoneTest}
                  disabled={!selectedDeviceId}
                  className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700"
                  size="lg"
                >
                  <Mic className="w-5 h-5" />
                  <span>Avvia Test Microfono</span>
                </Button>
              ) : (
                <>
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      className="flex items-center space-x-2 bg-error-600 hover:bg-error-700"
                      size="lg"
                    >
                      <Radio className="w-5 h-5" />
                      <span>Registra Test Audio</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      variant="outline"
                      className="flex items-center space-x-2 border-error-300"
                      size="lg"
                    >
                      <Square className="w-5 h-5" />
                      <span>Ferma Registrazione</span>
                    </Button>
                  )}

                  <Button
                    onClick={stopMicrophoneTest}
                    variant="outline"
                    size="lg"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Ferma Test
                  </Button>
                </>
              )}

              {(recordedBlob || error) && !isTestingMic && (
                <Button
                  onClick={resetTest}
                  variant="ghost"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Nuovo Test
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-error-700 font-medium mb-1">
                  Errore Test Microfono
                </p>
                <p className="text-sm text-error-600">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Test Guidelines */}
        {isTestingMic && !isRecording && !recordedBlob && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Istruzioni per il test:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1.5">
              <li>• <strong>Parla a voce normale</strong> verso il microfono</li>
              <li>• Il livello ideale è <strong className="text-green-700">verde (20-80%)</strong></li>
              <li>• Osserva le <strong>barre di frequenza</strong> mentre parli</li>
              <li>• Clicca <strong>"Registra Test Audio"</strong> per salvare un campione</li>
              <li>• Potrai <strong>ascoltare la registrazione</strong> per verificare la qualità</li>
            </ul>
          </div>
        )}

        {/* Success State */}
        {recordedBlob && audioLevel > 0 && !error && (
          <div className="text-center">
            <Button
              onClick={() => onTestComplete?.(true, selectedDeviceId)}
              className="flex items-center space-x-2 bg-success-600 hover:bg-success-700"
              size="lg"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Test Completato con Successo - Continua</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
