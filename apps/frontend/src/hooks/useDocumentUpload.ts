'use client';

import { useState, useCallback } from 'react';
import { documentService } from '@/services/documentService';
import { Document, UploadProgress } from '@ai-speech-evaluator/shared';

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  document: Document | null;
}

export const useDocumentUpload = () => {
  const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({});

  const uploadDocument = useCallback(async (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;

    // Initialize upload state
    setUploadStates(prev => ({
      ...prev,
      [fileId]: {
        isUploading: true,
        progress: 0,
        error: null,
        document: null,
      }
    }));

    try {
      const result = await documentService.uploadDocument(
        file,
        (progress: number) => {
          setUploadStates(prev => ({
            ...prev,
            [fileId]: {
              ...prev[fileId],
              progress,
            }
          }));
        }
      );

      // Update state with successful upload
      setUploadStates(prev => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          isUploading: false,
          progress: 100,
          document: result.document,
        }
      }));

      // Start processing
      await documentService.processDocument(result.document.id);

      return result.document;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore durante il caricamento';

      setUploadStates(prev => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          isUploading: false,
          error: errorMessage,
        }
      }));

      throw error;
    }
  }, []);

  const removeUpload = useCallback((fileId: string) => {
    setUploadStates(prev => {
      const newState = { ...prev };
      delete newState[fileId];
      return newState;
    });
  }, []);

  const clearAll = useCallback(() => {
    setUploadStates({});
  }, []);

  return {
    uploadStates,
    uploadDocument,
    removeUpload,
    clearAll,
  };
};