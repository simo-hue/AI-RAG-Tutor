import { Request, Response, NextFunction } from 'express';
import { audioService } from '../services/audioService';
import { AppError } from '../middleware/errorHandler';
import { AudioAnalysisService } from '../services/audioAnalysisService';

export const audioController = {
  async uploadAudio(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No audio file uploaded', 400);
      }

      const { documentId, duration } = req.body;

      // documentId is now optional - if not provided, creates a standalone audio record
      // duration is also optional - can be extracted from file metadata
      const parsedDuration = duration ? parseFloat(duration) : 0;

      const result = await audioService.uploadAudio(
        req.file,
        documentId || null,
        parsedDuration
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'Audio uploaded successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async transcribeAudio(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const result = await audioService.transcribeAudio(id);

      res.json({
        success: true,
        data: result,
        message: 'Audio transcribed successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async getAudioRecording(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const audioRecording = await audioService.getAudioRecording(id);

      res.json({
        success: true,
        data: audioRecording,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteAudioRecording(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await audioService.deleteAudioRecording(id);

      res.json({
        success: true,
        message: 'Audio recording deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async getAudioRecordingsForDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.params;
      const audioRecordings = await audioService.getAudioRecordingsForDocument(documentId);

      res.json({
        success: true,
        data: audioRecordings,
      });
    } catch (error) {
      next(error);
    }
  },

  async getProcessingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const status = await audioService.getProcessingStatus(id);

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Analyze audio with advanced metrics
   * POST /api/audio/:id/analyze
   */
  async analyzeAudioMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Get audio recording
      const audioRecording = await audioService.getAudioRecording(id);

      if (!audioRecording.transcription) {
        throw new AppError('Audio must be transcribed before analysis', 400);
      }

      // Initialize analysis service
      const analysisService = new AudioAnalysisService();

      // Perform advanced analysis
      const audioMetrics = await analysisService.analyzeAudio(
        audioRecording.transcription,
        audioRecording.duration,
        undefined, // segments - can be passed from WhisperService if available
        undefined  // audioBuffer - can be added for full audio analysis
      );

      // Store metrics with audio recording
      audioRecording.audioMetrics = audioMetrics;

      res.json({
        success: true,
        data: {
          audioRecordingId: id,
          audioMetrics,
        },
        message: 'Audio analysis completed successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};