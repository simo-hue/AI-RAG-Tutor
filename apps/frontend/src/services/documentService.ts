import api from './api';
import { Document, UploadProgress, APIResponse } from '@ai-speech-evaluator/shared';

export interface DocumentUploadResponse {
  document: Document;
  uploadProgress: UploadProgress;
}

export const documentService = {
  /**
   * Upload a document file
   */
  async uploadDocument(file: File, onProgress?: (progress: number) => void): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('document', file);

    const response = await api.post<APIResponse<DocumentUploadResponse>>('/documents/upload', formData, {
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
   * Get document by ID
   */
  async getDocument(documentId: string): Promise<Document> {
    const response = await api.get<APIResponse<Document>>(`/documents/${documentId}`);
    return response.data.data!;
  },

  /**
   * Get all user documents
   */
  async getDocuments(): Promise<Document[]> {
    const response = await api.get<APIResponse<Document[]>>('/documents');
    return response.data.data!;
  },

  /**
   * Delete document
   */
  async deleteDocument(documentId: string): Promise<void> {
    await api.delete(`/documents/${documentId}`);
  },

  /**
   * Get document processing status
   */
  async getProcessingStatus(documentId: string): Promise<UploadProgress> {
    const response = await api.get<APIResponse<UploadProgress>>(`/documents/${documentId}/status`);
    return response.data.data!;
  },

  /**
   * Process document for RAG (chunking and embedding)
   */
  async processDocument(documentId: string): Promise<void> {
    await api.post(`/documents/${documentId}/process`);
  },
};

export default documentService;