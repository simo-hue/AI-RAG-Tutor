import { AudioMetrics } from '@ai-speech-evaluator/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface AudioAnalysisResponse {
  success: boolean;
  data: {
    audioRecordingId: string;
    audioMetrics: AudioMetrics;
  };
  message?: string;
  error?: string;
}

/**
 * Frontend service for advanced audio analysis
 */
export const audioAnalysisService = {
  /**
   * Analyze audio recording with advanced metrics
   * @param audioRecordingId - ID of the audio recording to analyze
   * @returns Audio metrics analysis
   */
  async analyzeAudio(audioRecordingId: string): Promise<AudioMetrics> {
    try {
      const response = await fetch(`${API_BASE_URL}/audio/${audioRecordingId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result: AudioAnalysisResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to analyze audio');
      }

      return result.data.audioMetrics;
    } catch (error) {
      console.error('Audio analysis failed:', error);
      throw error;
    }
  },

  /**
   * Check if audio is ready for analysis (must be transcribed first)
   * @param audioRecordingId - ID of the audio recording
   * @returns Whether audio is ready for analysis
   */
  async isReadyForAnalysis(audioRecordingId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/audio/${audioRecordingId}`);

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.success && result.data?.transcription !== undefined;
    } catch (error) {
      console.error('Failed to check audio status:', error);
      return false;
    }
  },
};

export default audioAnalysisService;
