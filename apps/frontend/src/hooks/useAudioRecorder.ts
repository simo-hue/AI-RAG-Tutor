'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { audioService } from '../services/audioService';

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
  isSupported: boolean;
  hasPermission: boolean | null;
  isUploading: boolean;
  isTranscribing: boolean;
  transcription: string | null;
  audioRecordingId: string | null;
}

export interface AudioAnalyzerData {
  volume: number;
  frequencies: number[];
}

export const useAudioRecorder = () => {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
    error: null,
    isSupported: typeof navigator !== 'undefined' && 'mediaDevices' in navigator,
    hasPermission: null,
    isUploading: false,
    isTranscribing: false,
    transcription: null,
    audioRecordingId: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Initialize audio context and analyzer
  const initializeAudioAnalyzer = useCallback((stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyzer = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyzer.fftSize = 256;
      analyzer.smoothingTimeConstant = 0.8;
      source.connect(analyzer);

      audioContextRef.current = audioContext;
      analyzerRef.current = analyzer;
      dataArrayRef.current = new Uint8Array(analyzer.frequencyBinCount) as Uint8Array;

      return { audioContext, analyzer };
    } catch (error) {
      console.warn('Could not initialize audio analyzer:', error);
      return null;
    }
  }, []);

  // Get audio analyzer data
  const getAnalyzerData = useCallback((): AudioAnalyzerData | null => {
    if (!analyzerRef.current || !dataArrayRef.current) return null;

    analyzerRef.current.getByteFrequencyData(dataArrayRef.current as any);

    // Calculate average volume
    const sum = dataArrayRef.current.reduce((acc, value) => acc + value, 0);
    const volume = sum / dataArrayRef.current.length / 255; // Normalize to 0-1

    return {
      volume,
      frequencies: Array.from(dataArrayRef.current) as number[],
    };
  }, []);

  // Request microphone permission and start recording
  const startRecording = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Audio recording not supported in this browser' }));
      return;
    }

    try {
      setState(prev => ({ ...prev, error: null }));

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Initialize audio analyzer
      initializeAudioAnalyzer(stream);

      // Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);

        setState(prev => ({
          ...prev,
          audioBlob,
          audioUrl,
          isRecording: false,
          isPaused: false,
        }));

        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
          streamRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      mediaRecorderRef.current = mediaRecorder;

      setState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        hasPermission: true,
        duration: 0,
      }));

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          duration: prev.duration + 0.1,
        }));
      }, 100);

    } catch (error: any) {
      let errorMessage = 'Failed to start recording';

      if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Microphone is being used by another application.';
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        hasPermission: false,
      }));
    }
  }, [state.isSupported, initializeAudioAnalyzer]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
      mediaRecorderRef.current.pause();
      setState(prev => ({ ...prev, isPaused: true }));

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [state.isRecording, state.isPaused]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && state.isPaused) {
      mediaRecorderRef.current.resume();
      setState(prev => ({ ...prev, isPaused: false }));

      // Resume duration timer
      intervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          duration: prev.duration + 0.1,
        }));
      }, 100);
    }
  }, [state.isRecording, state.isPaused]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [state.isRecording]);

  // Upload and transcribe audio
  const uploadAndTranscribe = useCallback(async (documentId: string) => {
    if (!state.audioBlob) {
      setState(prev => ({ ...prev, error: 'No audio recording to upload' }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isUploading: true, error: null }));

      // Upload audio
      const uploadResult = await audioService.uploadAudio(
        state.audioBlob,
        documentId,
        state.duration
      );

      setState(prev => ({
        ...prev,
        isUploading: false,
        isTranscribing: true,
        audioRecordingId: uploadResult.audioRecording.id,
      }));

      // Transcribe audio
      const transcriptionResult = await audioService.transcribeAudio(
        uploadResult.audioRecording.id
      );

      setState(prev => ({
        ...prev,
        isTranscribing: false,
        transcription: transcriptionResult.transcription,
      }));

      return {
        audioRecording: uploadResult.audioRecording,
        transcription: transcriptionResult,
      };
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isUploading: false,
        isTranscribing: false,
        error: error.message || 'Failed to upload and transcribe audio',
      }));
    }
  }, [state.audioBlob, state.duration]);

  // Clear recording
  const clearRecording = useCallback(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

    setState(prev => ({
      ...prev,
      audioBlob: null,
      audioUrl: null,
      duration: 0,
      error: null,
      transcription: null,
      audioRecordingId: null,
      isUploading: false,
      isTranscribing: false,
    }));

    chunksRef.current = [];
  }, [state.audioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }
    };
  }, [state.audioUrl]);

  return {
    ...state,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearRecording,
    uploadAndTranscribe,
    getAnalyzerData,
  };
};