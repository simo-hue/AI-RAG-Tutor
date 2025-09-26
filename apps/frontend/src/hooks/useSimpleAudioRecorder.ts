'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioDevice {
  deviceId: string;
  label: string;
}

export interface SimpleRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  transcription: string;
  error: string | null;
  isTranscribing: boolean;
  isSupported: boolean;
  confidence: number;
  availableDevices: AudioDevice[];
  selectedDeviceId: string;
}

export const useSimpleAudioRecorder = () => {
  const [state, setState] = useState<SimpleRecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    transcription: '',
    error: null,
    isTranscribing: false,
    isSupported: false,
    confidence: 0,
    availableDevices: [],
    selectedDeviceId: '',
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const finalTranscriptRef = useRef<string>('');

  // Utility per convertire errori in stringhe sicure
  const getErrorMessage = useCallback((error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.message) return `Errore: ${error.message}`;
    if (error?.error) return `Errore: ${error.error}`;
    return 'Si è verificato un errore sconosciuto';
  }, []);

  // Enumerazione dispositivi audio
  const enumerateAudioDevices = useCallback(async () => {
    try {
      // Prima tenta senza richiedere permessi per vedere se sono già stati concessi
      let devices;
      try {
        devices = await navigator.mediaDevices.enumerateDevices();
      } catch {
        // Se non riesce, richiedi permessi
        await navigator.mediaDevices.getUserMedia({ audio: true });
        devices = await navigator.mediaDevices.enumerateDevices();
      }

      const audioInputs = devices
        .filter(device => device.kind === 'audioinput' && device.deviceId !== 'default')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microfono ${device.deviceId.slice(0, 5)}`
        }));

      console.log('Dispositivi enumerati:', audioInputs);

      // Verifica se il dispositivo selezionato è ancora disponibile
      const currentDeviceId = state.selectedDeviceId;
      const isCurrentDeviceAvailable = audioInputs.some(device => device.deviceId === currentDeviceId);

      // Se non c'è dispositivo selezionato, seleziona il primo disponibile
      const newSelectedDeviceId = isCurrentDeviceAvailable
        ? currentDeviceId
        : audioInputs[0]?.deviceId || '';

      setState(prev => ({
        ...prev,
        availableDevices: audioInputs,
        selectedDeviceId: newSelectedDeviceId,
        // Non mostrare errore durante l'inizializzazione o refresh
        error: currentDeviceId && !isCurrentDeviceAvailable && audioInputs.length > 0
          ? 'Il dispositivo audio selezionato non è più disponibile. Selezionato automaticamente un altro dispositivo.'
          : null
      }));

    } catch (error) {
      console.warn('Errore durante l\'enumerazione dispositivi:', error);
      setState(prev => ({
        ...prev,
        error: getErrorMessage(error),
        availableDevices: [],
        selectedDeviceId: ''
      }));
    }
  }, [getErrorMessage, state.selectedDeviceId]);

  // Selezione dispositivo audio
  const selectAudioDevice = useCallback((deviceId: string) => {
    setState(prev => ({ ...prev, selectedDeviceId: deviceId, error: null }));
  }, []);

  // Validazione dispositivo selezionato
  const validateSelectedDevice = useCallback(() => {
    if (state.selectedDeviceId && state.availableDevices.length > 0) {
      const deviceExists = state.availableDevices.some(device => device.deviceId === state.selectedDeviceId);
      if (!deviceExists) {
        // Reset al primo dispositivo disponibile
        const firstDevice = state.availableDevices[0];
        if (firstDevice) {
          setState(prev => ({
            ...prev,
            selectedDeviceId: firstDevice.deviceId,
            error: 'Il dispositivo selezionato non è più disponibile. Selezionato automaticamente un altro dispositivo.'
          }));
        }
      }
    }
  }, [state.selectedDeviceId, state.availableDevices]);

  // Inizializzazione
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const isSupported = !!SpeechRecognition && !!navigator.mediaDevices && !!window.MediaRecorder;

    console.log('🔍 Controllo supporto browser:', {
      SpeechRecognition: !!SpeechRecognition,
      webkitSpeechRecognition: !!window.webkitSpeechRecognition,
      mediaDevices: !!navigator.mediaDevices,
      MediaRecorder: !!window.MediaRecorder,
      isSupported,
      isSecureContext: window.isSecureContext,
      protocol: window.location.protocol,
      userAgent: navigator.userAgent.substring(0, 100)
    });

    if (!SpeechRecognition) {
      console.error('❌ SpeechRecognition non supportato in questo browser');
    }
    if (!window.isSecureContext) {
      console.error('❌ Contesto non sicuro - serve HTTPS per SpeechRecognition');
    }

    setState(prev => ({ ...prev, isSupported }));

    // Enumera i dispositivi audio se supportato
    if (isSupported) {
      enumerateAudioDevices();

      // Listener per cambiamenti nei dispositivi
      const handleDeviceChange = () => {
        enumerateAudioDevices();
      };

      navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange);

      // Cleanup del listener
      return () => {
        navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange);
      };
    }

    if (isSupported && SpeechRecognition) {
      const recognition = new SpeechRecognition();

      // Configurazione per italiano
      recognition.lang = 'it-IT';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Event handlers
      recognition.onstart = () => {
        console.log('🎤 Riconoscimento vocale avviato');
        setState(prev => ({ ...prev, isTranscribing: true, error: null }));
      };

      recognition.onresult = (event) => {
        console.log('📝 Evento riconoscimento ricevuto:', event.results.length, 'risultati');

        let interimTranscript = '';
        let finalTranscript = finalTranscriptRef.current;
        let confidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          confidence = event.results[i][0].confidence || 0;

          console.log(`Risultato ${i}:`, {
            transcript,
            isFinal: event.results[i].isFinal,
            confidence
          });

          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            finalTranscriptRef.current = finalTranscript;
          } else {
            interimTranscript += transcript;
          }
        }

        const displayTranscript = (finalTranscript + interimTranscript).trim();

        console.log('📄 Trascrizione aggiornata:', {
          final: finalTranscript,
          interim: interimTranscript,
          display: displayTranscript
        });

        setState(prev => ({
          ...prev,
          transcription: displayTranscript,
          confidence: Math.round(confidence * 100)
        }));
      };

      recognition.onerror = (event) => {
        console.error('❌ Errore riconoscimento vocale:', event.error, event);

        let errorMessage = 'Errore di riconoscimento vocale';

        switch (event.error) {
          case 'no-speech':
            console.log('⚠️ No speech detected');
            errorMessage = 'Nessun parlato rilevato. Prova a parlare più chiaramente.';
            break;
          case 'audio-capture':
            console.log('⚠️ Audio capture error');
            errorMessage = 'Problema con il microfono. Controlla le impostazioni audio.';
            break;
          case 'not-allowed':
            console.log('⚠️ Permission denied');
            errorMessage = 'Permesso microfono negato. Abilita l\'accesso al microfono.';
            break;
          case 'network':
            console.log('⚠️ Network error');
            errorMessage = 'Errore di rete durante il riconoscimento vocale.';
            break;
          case 'aborted':
            console.log('ℹ️ Recognition aborted by user');
            // Non mostrare errore se l'utente ha fermato volontariamente
            return;
        }

        setState(prev => ({ ...prev, error: errorMessage, isTranscribing: false }));
      };

      recognition.onend = () => {
        console.log('🔚 Riconoscimento vocale terminato');
        setState(prev => ({ ...prev, isTranscribing: false }));
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (isSupported) {
        navigator.mediaDevices?.removeEventListener('devicechange', () => {
          enumerateAudioDevices();
        });
      }
    };
  }, [getErrorMessage, enumerateAudioDevices]);

  // Avvia registrazione
  const startRecording = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Registrazione audio non supportata in questo browser. Usa Chrome, Firefox o Safari più recenti.'
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, error: null }));
      finalTranscriptRef.current = '';

      console.log('=== AVVIO REGISTRAZIONE AUDIO ===');
      console.log('Tentativo di ottenere accesso audio con metodo ultra-semplificato');

      // PRIMA: Diagnostica completa dei dispositivi disponibili
      console.log('🔍 DIAGNOSTICA DISPOSITIVI AUDIO:');
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log('Tutti i dispositivi trovati:', devices);

        // Debug completo di tutti i dispositivi
        devices.forEach((device, index) => {
          console.log(`Dispositivo ${index + 1}:`, {
            kind: device.kind,
            label: device.label || 'Label non disponibile',
            deviceId: device.deviceId || 'ID non disponibile',
            groupId: device.groupId || 'Group non disponibile'
          });
        });

        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        console.log(`📱 Dispositivi audio input trovati: ${audioInputs.length}`);

        // IMPORTANTE: Su molti browser, i dispositivi non mostrano label e dettagli
        // fino a quando l'utente non concede i permessi espliciti
        if (audioInputs.length === 0) {
          console.warn('⚠️ Nessun dispositivo audioinput trovato nella prima scansione');
          console.log('🔄 TENTATIVO DI FORZARE LA RICHIESTA PERMESSI...');

          // Non lanciare errore immediatamente, tenta prima la richiesta audio
          // Questo è normale behavior prima che l'utente conceda i permessi
        } else {
          console.log('✅ Dispositivi audio trovati nella prima scansione');
          audioInputs.forEach((device, index) => {
            console.log(`  ${index + 1}. ${device.label || 'Dispositivo sconosciuto'} (ID: ${device.deviceId})`);
          });
        }

      } catch (enumError) {
        console.warn('⚠️ Impossibile enumerare dispositivi (normale prima dei permessi):', enumError);
      }

      let stream: MediaStream;

      // METODO ULTRA-SEMPLIFICATO: Usa SOLO la sintassi più basilare possibile
      try {
        console.log('🎤 Tentando getUserMedia con { audio: true } - metodo più basilare possibile');

        // Prima verifica se i permessi sono già stati concessi
        try {
          const permissions = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          console.log('Stato permessi microfono:', permissions.state);

          if (permissions.state === 'denied') {
            throw new Error(`PERMESSI MICROFONO ESPLICITAMENTE NEGATI

🚫 DIAGNOSI: L'utente ha esplicitamente negato l'accesso al microfono.

📋 SOLUZIONI:
1. 🔧 SAFARI: Safari > Impostazioni > Siti web > Microfono > Trova questo sito > Cambia da "Nega" a "Consenti"
2. 🔄 Ricarica la pagina completamente
3. 🎤 Nella barra degli indirizzi, cerca l'icona del microfono e clicca "Consenti"
4. 🗑️ Cancella i dati del sito: Safari > Sviluppo > Svuota cache e riprova`);
          }
        } catch (permissionError) {
          console.warn('Impossibile verificare i permessi (normale su alcuni browser):', permissionError);
        }

        // Usa la sintassi più semplice possibile senza nessun constraint
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        console.log('✅ SUCCESS: Stream audio ottenuto con successo!');
        console.log('Stream details:', {
          id: stream.id,
          active: stream.active,
          audioTracks: stream.getAudioTracks().length
        });

        if (stream.getAudioTracks().length > 0) {
          const track = stream.getAudioTracks()[0];
          console.log('Audio track details:', {
            label: track.label,
            enabled: track.enabled,
            kind: track.kind,
            readyState: track.readyState,
            settings: track.getSettings ? track.getSettings() : 'getSettings not supported'
          });
        }

      } catch (error: any) {
        console.error('❌ ERRORE durante getUserMedia:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });

        // Prova anche con la sintassi ancora più antica
        try {
          console.log('Tentando con navigator.getUserMedia (metodo legacy)...');

          // @ts-ignore - Usa l'API legacy se disponibile
          const legacyGetUserMedia = navigator.getUserMedia ||
                                   navigator.webkitGetUserMedia ||
                                   navigator.mozGetUserMedia;

          if (legacyGetUserMedia) {
            stream = await new Promise<MediaStream>((resolve, reject) => {
              legacyGetUserMedia.call(navigator,
                { audio: true },
                resolve,
                reject
              );
            });
            console.log('✅ SUCCESS: Stream ottenuto con API legacy');
          } else {
            throw error; // Re-throw l'errore originale
          }
        } catch (legacyError: any) {
          console.error('❌ Anche il metodo legacy è fallito:', legacyError);

          // Messaggi di errore ultra-specifici
          let errorMessage = 'Errore critico: impossibile accedere al microfono';

          if (error.name === 'NotAllowedError') {
            errorMessage = `PERMESSI NEGATI: Il browser ha bloccato l'accesso al microfono.

SOLUZIONI:
1. Cerca l'icona del microfono 🎤 nella barra degli indirizzi
2. Clicca su di essa e seleziona "Consenti sempre"
3. Ricarica la pagina (F5)
4. Se non vedi l'icona, vai nelle Impostazioni del browser > Privacy e sicurezza > Impostazioni sito > Microfono`;

          } else if (error.name === 'NotFoundError') {
            errorMessage = `MICROFONO NON TROVATO: Safari/browser non riesce ad accedere ai dispositivi audio.

🔧 DIAGNOSI SPECIFICA:
Il browser ha visto ${state.availableDevices?.length || 0} dispositivi ma nessuno classificato come "audioinput".

📋 SOLUZIONI IMMEDIATE:
1. 🎤 SAFARI: Vai su Safari > Impostazioni > Siti web > Microfono
2. 🔍 Trova questo sito e imposta su "Consenti"
3. 🔄 Ricarica completamente la pagina (Cmd+R)
4. 🎛️ MACOS: Sistema > Privacy e sicurezza > Microfono > Verifica che Safari sia abilitato
5. 🔌 Verifica fisicamente che un microfono sia collegato (cuffie/microfono esterno)
6. 🎧 Se usi AirPods/cuffie Bluetooth, verifica che siano connesse
7. 🔊 VERIFICA SISTEMA: Vai in Preferenze Sistema > Suono > Input

💡 SUGGERIMENTO: Prova a registrare un memo vocale con l'app "Memo Vocali" per verificare che il microfono funzioni a livello sistema.`;

          } else if (error.name === 'NotReadableError') {
            errorMessage = `MICROFONO OCCUPATO: Un'altra applicazione sta usando il microfono.

SOLUZIONI:
1. Chiudi Zoom, Teams, Discord, o altre app di videochiamata
2. Chiudi altre schede del browser che usano il microfono
3. Riavvia il browser`;

          } else if (error.name === 'OverconstrainedError') {
            errorMessage = `CONFIGURAZIONE INCOMPATIBILE: Le impostazioni richieste non sono supportate.

DETTAGLIO TECNICO: Anche la configurazione più basilare ({ audio: true }) è fallita.
Questo indica un problema serio con il browser o il sistema.`;

          } else if (error.name === 'SecurityError') {
            errorMessage = `ERRORE DI SICUREZZA: Problema con il protocollo di rete.

SOLUZIONI:
1. Verifica che l'URL inizi con https:// (non http://)
2. Se stai testando in locale, usa localhost (non file://)`;

          } else {
            errorMessage = `ERRORE SCONOSCIUTO: ${error.message || 'Nessun dettaglio disponibile'}

NOME ERRORE: ${error.name || 'Sconosciuto'}`;
          }

          throw new Error(errorMessage);
        }
      }

      // Dopo aver ottenuto lo stream, aggiorna la lista dispositivi
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const currentAudioInputs = devices
          .filter(device => device.kind === 'audioinput' && device.deviceId !== 'default')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Microfono ${device.deviceId.slice(0, 5)}`
          }));

        console.log('Dispositivi audio disponibili dopo acquisizione stream:', currentAudioInputs);

        // Aggiorna lo stato dei dispositivi disponibili
        setState(prev => ({
          ...prev,
          availableDevices: currentAudioInputs,
          // Se non c'è dispositivo selezionato, usa il primo disponibile come riferimento
          selectedDeviceId: prev.selectedDeviceId || currentAudioInputs[0]?.deviceId || ''
        }));
      } catch (enumError) {
        console.warn('Errore durante enumerazione dispositivi post-stream:', enumError);
        // Non interrompere la registrazione per errori di enumerazione
      }

      streamRef.current = stream;

      // Setup MediaRecorder per salvare l'audio
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        setState(prev => ({ ...prev, audioBlob }));
      };

      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;

      // Avvia il riconoscimento vocale
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (recognitionRef.current) {
        console.log('🚀 Avvio riconoscimento vocale esistente...');
        try {
          recognitionRef.current.start();
          console.log('✅ Riconoscimento vocale avviato con successo');
        } catch (recognitionError) {
          console.error('❌ Errore avvio riconoscimento vocale:', recognitionError);
        }
      } else if (SpeechRecognition) {
        console.log('🔧 Creazione nuovo riconoscimento vocale durante registrazione...');

        // Crea e configura il riconoscimento vocale ora
        const recognition = new SpeechRecognition();
        recognition.lang = 'it-IT';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        // Event handlers
        recognition.onstart = () => {
          console.log('🎤 Riconoscimento vocale avviato (creato runtime)');
          setState(prev => ({ ...prev, isTranscribing: true, error: null }));
        };

        recognition.onresult = (event) => {
          console.log('📝 Evento riconoscimento ricevuto (runtime):', event.results.length, 'risultati');

          let interimTranscript = '';
          let finalTranscript = finalTranscriptRef.current;
          let confidence = 0;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            confidence = event.results[i][0].confidence || 0;

            console.log(`Risultato ${i} (runtime):`, {
              transcript,
              isFinal: event.results[i].isFinal,
              confidence
            });

            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
              finalTranscriptRef.current = finalTranscript;
            } else {
              interimTranscript += transcript;
            }
          }

          const displayTranscript = (finalTranscript + interimTranscript).trim();

          console.log('📄 Trascrizione aggiornata (runtime):', {
            final: finalTranscript,
            interim: interimTranscript,
            display: displayTranscript
          });

          setState(prev => ({
            ...prev,
            transcription: displayTranscript,
            confidence: Math.round(confidence * 100)
          }));
        };

        recognition.onerror = (event) => {
          console.error('❌ Errore riconoscimento vocale (runtime):', event.error, event);

          if (event.error !== 'aborted') {
            let errorMessage = `Errore riconoscimento vocale: ${event.error}`;
            setState(prev => ({ ...prev, error: errorMessage, isTranscribing: false }));
          }
        };

        recognition.onend = () => {
          console.log('🔚 Riconoscimento vocale terminato (runtime)');
          setState(prev => ({ ...prev, isTranscribing: false }));
        };

        recognitionRef.current = recognition;

        try {
          recognition.start();
          console.log('✅ Riconoscimento vocale runtime avviato con successo');
        } catch (recognitionError) {
          console.error('❌ Errore avvio riconoscimento vocale runtime:', recognitionError);
        }
      } else {
        console.warn('⚠️ SpeechRecognition non supportato - riconoscimento vocale non disponibile');
      }

      // Timer per la durata
      const startTime = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setState(prev => ({ ...prev, duration: elapsed / 1000 }));
      }, 100);

      setState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        duration: 0,
        transcription: '',
        confidence: 0
      }));

    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, [state.isSupported, state.selectedDeviceId, getErrorMessage]);

  // Ferma registrazione
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isRecording: false,
      isPaused: false,
      isTranscribing: false
    }));
  }, [state.isRecording]);

  // Pausa/riprendi (solo audio, non riconoscimento)
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
      mediaRecorderRef.current.pause();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setState(prev => ({ ...prev, isPaused: true }));
    }
  }, [state.isRecording, state.isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && state.isPaused) {
      mediaRecorderRef.current.resume();

      const startTime = Date.now() - (state.duration * 1000);
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setState(prev => ({ ...prev, duration: elapsed / 1000 }));
      }, 100);

      setState(prev => ({ ...prev, isPaused: false }));
    }
  }, [state.isRecording, state.isPaused, state.duration]);

  // Reset
  const clearRecording = useCallback(() => {
    stopRecording();
    setState(prev => ({
      ...prev,
      duration: 0,
      audioBlob: null,
      transcription: '',
      error: null,
      confidence: 0
    }));
    finalTranscriptRef.current = '';
    chunksRef.current = [];
  }, [stopRecording]);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    selectAudioDevice,
    enumerateAudioDevices,
    validateSelectedDevice,
  };
};