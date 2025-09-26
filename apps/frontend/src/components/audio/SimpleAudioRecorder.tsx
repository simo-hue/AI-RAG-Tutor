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
  Settings,
  ChevronDown,
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Progress } from '@/components/ui';
import { useSimpleAudioRecorder, AudioDevice } from '@/hooks/useSimpleAudioRecorder';
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

  // Test microfono separato con fallback multipli
  const testMicrophone = async () => {
    try {
      console.log('🧪 Test microfono in corso...');

      // Test 1: Usa constraints vuoti per Safari
      let stream: MediaStream;

      try {
        console.log('Test 1: getUserMedia con audio: true');
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (error) {
        console.log('Test 1 fallito, provo con constraints vuoti...');

        try {
          // Test 2: Safari a volte funziona meglio con constraints più specifici
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false
            }
          });
          console.log('Test 2: Riuscito con constraints specifici');
        } catch (error2) {
          console.log('Test 2 fallito, provo con default device...');

          // Test 3: Prova a specificare il device di default
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioInputs = devices.filter(d => d.kind === 'audioinput');

          if (audioInputs.length > 0) {
            stream = await navigator.mediaDevices.getUserMedia({
              audio: { deviceId: audioInputs[0].deviceId }
            });
            console.log('Test 3: Riuscito con device specifico');
          } else {
            throw error; // Re-lancia l'errore originale
          }
        }
      }

      console.log('✅ Test microfono RIUSCITO!');
      console.log('Stream info:', {
        id: stream.id,
        active: stream.active,
        tracks: stream.getAudioTracks().length
      });

      // Ferma immediatamente il test
      stream.getTracks().forEach(track => track.stop());

      alert('✅ Test microfono riuscito! Il microfono è accessibile.');

    } catch (testError: any) {
      console.error('❌ Test microfono FALLITO:', testError);

      // Mostra guida dettagliata basata sull'errore
      let guide = `❌ Test fallito: ${testError.message || testError.name}\n\n`;

      if (testError.name === 'NotFoundError') {
        guide += `🔧 SOLUZIONI SPECIFICHE PER SAFARI/MAC:\n\n`;
        guide += `1. 🎤 VERIFICA HARDWARE:\n`;
        guide += `   - Apri "Memo Vocali" e prova a registrare\n`;
        guide += `   - Se non funziona, il problema è hardware/sistema\n\n`;
        guide += `2. 🛠️ SAFARI SETTINGS:\n`;
        guide += `   - Safari > Impostazioni > Siti web > Microfono\n`;
        guide += `   - Trova "localhost" o questo sito\n`;
        guide += `   - Cambia da "Nega" a "Chiedi" o "Consenti"\n\n`;
        guide += `3. 🔒 PRIVACY MACOS:\n`;
        guide += `   - Preferenze Sistema > Privacy e Sicurezza > Microfono\n`;
        guide += `   - Verifica che Safari sia selezionato\n\n`;
        guide += `4. 🔄 RIPROVA:\n`;
        guide += `   - Ricarica completamente la pagina (Cmd+R)\n`;
        guide += `   - Chiudi e riapri Safari`;
      } else if (testError.name === 'NotAllowedError') {
        guide += `🚫 PERMESSI NEGATI - Risoluzione:\n`;
        guide += `- Clicca sull'icona del microfono nella barra indirizzi\n`;
        guide += `- Seleziona "Consenti sempre"\n`;
        guide += `- Ricarica la pagina`;
      }

      alert(guide);
    }
  };

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

          {/* Test Microfono Button */}
          {!isRecording && error && (
            <div className="text-center">
              <Button
                onClick={testMicrophone}
                variant="outline"
                size="sm"
                className="text-warning-600 border-warning-600 hover:bg-warning-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Test Microfono
              </Button>
              <p className="text-xs text-secondary-500 mt-2">
                Clicca per testare rapidamente l'accesso al microfono
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center space-x-3">
            {!isRecording ? (
              <>
                <Button
                  onClick={startRecording}
                  className="flex items-center space-x-2"
                  size="lg"
                >
                  <Mic className="w-5 h-5" />
                  <span>Inizia Registrazione</span>
                </Button>
                {/* Pulsante test sempre disponibile */}
                {!error && (
                  <Button
                    onClick={testMicrophone}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Test
                  </Button>
                )}
              </>
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

          {/* Transcription Display - Show during and after recording */}
          {(transcription || isRecording) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-secondary-800 flex items-center space-x-2">
                  <span>Trascrizione in tempo reale</span>
                  {isRecording && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
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
              <div className="p-4 bg-info-50 border border-info-200 rounded-lg min-h-[80px]">
                <p className="text-sm text-info-800 leading-relaxed">
                  {transcription || (isRecording ? 'In attesa di parlato... Inizia a parlare in italiano.' : 'Nessuna trascrizione disponibile')}
                </p>
                {(isTranscribing || isRecording) && (
                  <div className="flex items-center space-x-2 mt-3">
                    <div className="w-2 h-2 bg-info-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-info-600">
                      {isTranscribing ? 'Elaborazione audio in corso...' : 'In ascolto...'}
                    </span>
                  </div>
                )}
                {transcription && !isRecording && (
                  <div className="flex items-center space-x-2 mt-3">
                    <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                    <span className="text-xs text-success-600">
                      Trascrizione completata • {transcription.split(' ').length} parole
                    </span>
                  </div>
                )}
              </div>
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
        </div>
      </CardContent>
    </Card>
  );
};