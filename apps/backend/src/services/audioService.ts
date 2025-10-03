import fs from 'fs/promises';
import path from 'path';
import { AudioRecording } from '@ai-speech-evaluator/shared';
import { WhisperService } from './whisperService';
import { AppError } from '../middleware/errorHandler';
import { config } from '../config';
import { logger } from '../utils/logger';

// Temporary in-memory storage (replace with database in production)
const audioRecordings: AudioRecording[] = [];

export const audioService = {
  async uploadAudio(file: Express.Multer.File, documentId: string | null, duration: number) {
    try {
      // Create audio recording object
      const audioRecording: AudioRecording = {
        id: generateId(),
        documentId: documentId || undefined,
        audioUrl: `/uploads/audio/${file.filename}`,
        duration,
        recordedAt: new Date(),
      };

      // Store audio recording
      audioRecordings.push(audioRecording);

      return {
        audioRecording,
      };
    } catch (error) {
      throw new AppError('Failed to process uploaded audio', 500);
    }
  },

  async transcribeAudio(audioRecordingId: string) {
    const audioRecording = audioRecordings.find(ar => ar.id === audioRecordingId);
    if (!audioRecording) {
      throw new AppError('Audio recording not found', 404);
    }

    const startTime = Date.now();

    try {
      // Initialize local Whisper service
      const whisperService = await WhisperService.getInstance();

      // Get audio file path
      const audioPath = path.join(config.storage.uploadDir, 'audio', path.basename(audioRecording.audioUrl));

      // Check if file exists
      try {
        await fs.access(audioPath);
      } catch {
        throw new AppError('Audio file not found on disk', 404);
      }

      logger.info('Starting audio transcription', {
        audioRecordingId,
        audioPath: path.basename(audioPath),
        duration: audioRecording.duration
      });

      // Transcribe audio using local Whisper
      const transcriptionResult = await whisperService.transcribeAudio(audioPath, {
        language: 'it', // Italian for this project
        task: 'transcribe',
        format: 'json'
      });

      // Update audio recording with transcription
      audioRecording.transcription = transcriptionResult.text;

      const processingTime = Date.now() - startTime;

      logger.info('Audio transcription completed', {
        audioRecordingId,
        transcriptionLength: transcriptionResult.text.length,
        detectedLanguage: transcriptionResult.language,
        processingTime: `${processingTime}ms`
      });

      return {
        transcription: transcriptionResult.text,
        language: transcriptionResult.language || 'it',
        duration: transcriptionResult.duration || audioRecording.duration,
        segments: transcriptionResult.segments || [],
        processingTime
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error('Audio transcription failed', {
        audioRecordingId,
        processingTime: `${processingTime}ms`,
        error: error.message
      });

      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Transcription failed: ${error.message}`, 500);
    }
  },

  async getAudioRecording(id: string) {
    const audioRecording = audioRecordings.find(ar => ar.id === id);
    if (!audioRecording) {
      throw new AppError('Audio recording not found', 404);
    }
    return audioRecording;
  },

  async deleteAudioRecording(id: string) {
    const index = audioRecordings.findIndex(ar => ar.id === id);
    if (index === -1) {
      throw new AppError('Audio recording not found', 404);
    }

    const audioRecording = audioRecordings[index];

    // Delete file from disk
    try {
      const audioPath = path.join(config.storage.uploadDir, 'audio', path.basename(audioRecording.audioUrl));
      await fs.unlink(audioPath);
    } catch (error) {
      console.warn('Failed to delete audio file:', error);
    }

    // Remove from memory
    audioRecordings.splice(index, 1);
  },

  async getAudioRecordingsForDocument(documentId: string) {
    return audioRecordings.filter(ar => ar.documentId === documentId);
  },

  async getProcessingStatus(audioRecordingId: string) {
    const audioRecording = audioRecordings.find(ar => ar.id === audioRecordingId);
    if (!audioRecording) {
      throw new AppError('Audio recording not found', 404);
    }

    return {
      id: audioRecordingId,
      status: audioRecording.transcription ? 'completed' : 'processing',
      transcription: audioRecording.transcription,
    };
  },
};

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}