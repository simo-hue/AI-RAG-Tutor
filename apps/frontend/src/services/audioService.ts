import api from './api';
import { AudioRecording, APIResponse } from '@ai-speech-evaluator/shared';

export interface AudioUploadResponse {
  audioRecording: AudioRecording;
  transcription?: string;
}

export const audioService = {
  /**
   * Upload audio recording
   */
  async uploadAudio(
    audioBlob: Blob,
    documentId: string,
    duration: number,
    onProgress?: (progress: number) => void
  ): Promise<AudioUploadResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('documentId', documentId);
    formData.append('duration', duration.toString());

    const response = await api.post<APIResponse<AudioUploadResponse>>('/audio/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data.data!;
  },

  /**
   * Transcribe audio recording
   */
  async transcribeAudio(audioRecordingId: string): Promise<{
    transcription: string;
    language?: string;
    duration?: number;
    segments?: Array<{
      start: number;
      end: number;
      text: string;
    }>;
  }> {
    const response = await api.post<APIResponse<{
      transcription: string;
      language?: string;
      duration?: number;
      segments?: Array<{
        start: number;
        end: number;
        text: string;
      }>;
    }>>(
      `/audio/${audioRecordingId}/transcribe`
    );
    return response.data.data!;
  },

  /**
   * Get audio recording by ID
   */
  async getAudioRecording(audioRecordingId: string): Promise<AudioRecording> {
    const response = await api.get<APIResponse<AudioRecording>>(`/audio/${audioRecordingId}`);
    return response.data.data!;
  },

  /**
   * Delete audio recording
   */
  async deleteAudioRecording(audioRecordingId: string): Promise<void> {
    await api.delete(`/audio/${audioRecordingId}`);
  },

  /**
   * Get all audio recordings for a document
   */
  async getAudioRecordingsForDocument(documentId: string): Promise<AudioRecording[]> {
    const response = await api.get<APIResponse<AudioRecording[]>>(`/audio/document/${documentId}`);
    return response.data.data!;
  },
};

export default audioService;