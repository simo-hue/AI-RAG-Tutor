'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

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

  // Inizializzazione
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const isSupported = !!SpeechRecognition && !!navigator.mediaDevices && !!window.MediaRecorder;

    setState(prev => ({ ...prev, isSupported }));

    if (isSupported && SpeechRecognition) {
      const recognition = new SpeechRecognition();

      // Configurazione per italiano
      recognition.lang = 'it-IT';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Event handlers
      recognition.onstart = () => {
        setState(prev => ({ ...prev, isTranscribing: true, error: null }));
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = finalTranscriptRef.current;
        let confidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          confidence = event.results[i][0].confidence || 0;

          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            finalTranscriptRef.current = finalTranscript;
          } else {
            interimTranscript += transcript;
          }
        }

        const displayTranscript = (finalTranscript + interimTranscript).trim();
        setState(prev => ({
          ...prev,
          transcription: displayTranscript,
          confidence: Math.round(confidence * 100)
        }));
      };

      recognition.onerror = (event) => {
        let errorMessage = 'Errore di riconoscimento vocale';

        switch (event.error) {
          case 'no-speech':
            errorMessage = 'Nessun parlato rilevato. Prova a parlare più chiaramente.';
            break;
          case 'audio-capture':
            errorMessage = 'Problema con il microfono. Controlla le impostazioni audio.';
            break;
          case 'not-allowed':
            errorMessage = 'Permesso microfono negato. Abilita l\'accesso al microfono.';
            break;
          case 'network':
            errorMessage = 'Errore di rete durante il riconoscimento vocale.';
            break;
          case 'aborted':
            // Non mostrare errore se l'utente ha fermato volontariamente
            return;
        }

        setState(prev => ({ ...prev, error: errorMessage, isTranscribing: false }));
      };

      recognition.onend = () => {
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
    };
  }, [getErrorMessage]);

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

      // Ottieni accesso al microfono
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

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
      if (recognitionRef.current) {
        recognitionRef.current.start();
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
  }, [state.isSupported, getErrorMessage]);

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
  };
};