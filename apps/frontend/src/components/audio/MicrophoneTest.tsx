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
  AlertCircle
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Progress } from '@/components/ui';
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
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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

  // Analizza il livello audio
  const analyzeAudioLevel = useCallback(() => {
    if (!analyserRef.current) {
      console.log('❌ No analyser available');
      return;
    }

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const average = sum / bufferLength;
    const normalizedLevel = Math.min(100, (average / 255) * 100 * 3); // Amplifica la sensibilità

    // Debug ogni 30 frame (~0.5 secondi)
    if (Math.random() < 0.03) {
      console.log('🎵 Audio level:', {
        raw: average,
        normalized: normalizedLevel,
        isTestingMic,
        bufferLength
      });
    }

    setAudioLevel(normalizedLevel);

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

      // Richiedi stream audio
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

      // Resume AudioContext se sospeso (richiesto dai browser moderni)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      source.connect(analyserRef.current);

      console.log('🎤 Audio context created:', {
        state: audioContextRef.current.state,
        sampleRate: audioContextRef.current.sampleRate,
        fftSize: analyserRef.current.fftSize
      });

      // Avvia analisi audio
      analyzeAudioLevel();

    } catch (err: any) {
      setIsTestingMic(false);
      if (err.name === 'NotAllowedError') {
        setError('Permessi del microfono negati.');
      } else if (err.name === 'NotFoundError') {
        setError('Dispositivo audio non trovato.');
      } else {
        setError(`Errore test microfono: ${err.message}`);
      }
    }
  }, [selectedDeviceId, analyzeAudioLevel]);

  // Ferma test microfono
  const stopMicrophoneTest = useCallback(() => {
    setIsTestingMic(false);
    setAudioLevel(0);

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
  }, []);

  // Reset test
  const resetTest = useCallback(() => {
    stopMicrophoneTest();
    setError(null);
  }, [stopMicrophoneTest]);

  // Determina stato test
  const getTestStatus = () => {
    if (error) return { text: 'Errore', color: 'error' };
    if (!hasPermission) return { text: 'Permessi Richiesti', color: 'warning' };
    if (isTestingMic) return { text: 'Test in Corso', color: 'warning' };
    return { text: 'Pronto', color: 'default' };
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
                ? 'bg-warning-100 text-warning-600'
                : hasPermission
                ? 'bg-success-100 text-success-600'
                : 'bg-error-100 text-error-600'
            )}>
              {hasPermission ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </div>
            <div>
              <CardTitle>Test Microfono</CardTitle>
              <p className="text-sm text-secondary-600">
                Verifica il funzionamento del tuo microfono
              </p>
            </div>
          </div>
          <div className={cn(
            'px-3 py-1 rounded-full text-xs font-medium',
            status.color === 'error' && 'bg-error-100 text-error-700',
            status.color === 'warning' && 'bg-warning-100 text-warning-700',
            status.color === 'success' && 'bg-success-100 text-success-700',
            status.color === 'default' && 'bg-secondary-100 text-secondary-700'
          )}>
            {status.text}
          </div>
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
                  Per testare il microfono, dobbiamo accedere ai tuoi dispositivi audio.
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

        {/* Audio Level Indicator */}
        {hasPermission && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-secondary-700">
                Livello Audio
              </span>
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-secondary-400" />
                <span className="text-sm text-secondary-600">
                  {Math.round(audioLevel)}%
                </span>
                {isTestingMic && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">LIVE</span>
                  </div>
                )}
              </div>
            </div>

            {/* Visual level meter */}
            <div className="relative h-8 bg-secondary-100 rounded-lg overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-100 ease-out",
                  audioLevel < 20 && "bg-red-400",
                  audioLevel >= 20 && audioLevel < 60 && "bg-yellow-400",
                  audioLevel >= 60 && "bg-green-400"
                )}
                style={{ width: `${Math.min(audioLevel, 100)}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-secondary-700">
                  {isTestingMic ? 'Parla nel microfono' : 'Avvia test per vedere il livello'}
                </span>
              </div>
            </div>

            {/* Level indicator bars */}
            <div className="flex space-x-1">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-3 w-3 rounded-sm transition-colors duration-100",
                    audioLevel > (i * 5)
                      ? i < 8
                        ? "bg-green-500"
                        : i < 16
                        ? "bg-yellow-500"
                        : "bg-red-500"
                      : "bg-secondary-200"
                  )}
                />
              ))}
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
                  className="flex items-center space-x-2"
                >
                  <Mic className="w-4 h-4" />
                  <span>Inizia Test Audio</span>
                </Button>
              ) : (
                <Button
                  onClick={stopMicrophoneTest}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Square className="w-4 h-4" />
                  <span>Ferma Test</span>
                </Button>
              )}

              {isTestingMic && (
                <Button
                  onClick={resetTest}
                  variant="ghost"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4" />
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
        {isTestingMic && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              💡 Suggerimenti per il test:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Parla a voce normale verso il microfono</li>
              <li>• Il livello ideale è nel verde (20-80%)</li>
              <li>• Se il livello è troppo basso, avvicinati al microfono</li>
              <li>• Se è troppo alto, allontanati o riduci il volume</li>
              <li>• Una volta che vedi il livello audio, il test è completato</li>
            </ul>
          </div>
        )}

        {/* Success State */}
        {isTestingMic && audioLevel > 0 && !error && (
          <div className="text-center">
            <Button
              onClick={() => onTestComplete?.(true, selectedDeviceId)}
              className="flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Test Completato - Continua</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};