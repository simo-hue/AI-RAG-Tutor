'use client';

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button, Card, Progress, Badge } from '@/components/ui';
import { cn } from '@/utils/cn';
import { documentService } from '@/services/documentService';

interface UploadedFile {
  file: File;
  id: string;
  documentId?: string;
  status: 'uploading' | 'processing-chunks' | 'processing-embeddings' | 'completed' | 'error';
  progress: number;
  error?: string;
  wordCount?: number;
  chunkCount?: number;
  processingStartTime?: number;
}

export interface ProcessedDocument {
  file: File;
  documentId: string;
  wordCount?: number;
  chunkCount?: number;
}

interface DocumentUploadProps {
  onFileUpload?: (files: File[]) => void;
  onDocumentProcessed?: (document: ProcessedDocument) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  className?: string;
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const DocumentUpload = ({
  onFileUpload,
  onDocumentProcessed,
  maxFiles = 5,
  maxSize = 50,
  className
}: DocumentUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Update timer for processing files every second
  useEffect(() => {
    const hasProcessingFiles = uploadedFiles.some(
      file => file.status === 'processing-embeddings' && file.processingStartTime
    );

    if (!hasProcessingFiles) return;

    const interval = setInterval(() => {
      setUploadedFiles(prev => [...prev]); // Force re-render to update timer
    }, 1000);

    return () => clearInterval(interval);
  }, [uploadedFiles]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('onDrop called with:', { acceptedFiles: acceptedFiles.length, rejectedFiles: rejectedFiles.length });
    }

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach((rejected) => {
        const error = rejected.errors[0];
        if (process.env.NODE_ENV === 'development') {
          console.error('File rejected:', rejected.file.name, error.message);
        }
      });
    }

    // Process accepted files
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploading',
      progress: 0,
    }));

    if (process.env.NODE_ENV === 'development') {
      console.log('Adding new files to state:', newFiles.map(f => ({ id: f.id, name: f.file.name })));
    }
    setUploadedFiles(prev => {
      const updated = [...prev, ...newFiles];
      if (process.env.NODE_ENV === 'development') {
        console.log('Updated uploadedFiles state:', updated.map(f => ({ id: f.id, name: f.file.name, status: f.status })));
      }
      return updated;
    });

    // Start real upload process for each file immediately with the file object
    newFiles.forEach((newFile) => {
      uploadFileWithData(newFile);
    });

    onFileUpload?.(acceptedFiles);
  }, [onFileUpload]);

  const uploadFileWithData = useCallback(async (uploadedFile: UploadedFile) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('uploadFileWithData called with file:', uploadedFile.file.name);
    }

    try {

      // Update to uploading status
      setUploadedFiles(prev => prev.map(file =>
        file.id === uploadedFile.id
          ? { ...file, status: 'uploading', progress: 0 }
          : file
      ));

      // Upload the file with progress tracking
      if (process.env.NODE_ENV === 'development') {
        console.log('Starting upload for file:', uploadedFile.file.name);
      }
      const result = await documentService.uploadDocument(
        uploadedFile.file,
        (progress) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Upload progress:', progress);
          }
          setUploadedFiles(prev => prev.map(file =>
            file.id === uploadedFile.id
              ? { ...file, progress: Math.min(progress, 95) } // Keep at 95% until processing
              : file
          ));
        }
      );
      if (process.env.NODE_ENV === 'development') {
        console.log('Upload result:', result);
      }

      // File uploaded successfully, now chunking
      setUploadedFiles(prev => prev.map(file =>
        file.id === uploadedFile.id
          ? {
              ...file,
              status: 'processing-chunks',
              progress: 95,
              documentId: result.document.id
            }
          : file
      ));

      // Simulate chunking phase (it happens immediately but we show it)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Now processing embeddings
      const processingStartTime = Date.now();
      setUploadedFiles(prev => prev.map(file =>
        file.id === uploadedFile.id
          ? {
              ...file,
              status: 'processing-embeddings',
              progress: 98,
              processingStartTime
            }
          : file
      ));

      // Start timer for embedding processing
      const timer = setInterval(() => {
        setUploadedFiles(prev => prev.map(file => {
          if (file.id === uploadedFile.id && file.processingStartTime) {
            const elapsed = (Date.now() - file.processingStartTime) / 1000;
            return { ...file, processingStartTime: file.processingStartTime };
          }
          return file;
        }));
      }, 1000);

      // Auto-process the document (chunking and embedding)
      await documentService.processDocument(result.document.id);

      clearInterval(timer);

      // Processing completed
      const processedDocument: ProcessedDocument = {
        file: uploadedFile.file,
        documentId: result.document.id,
        wordCount: result.document.wordCount,
        chunkCount: result.document.chunkCount
      };

      setUploadedFiles(prev => prev.map(file =>
        file.id === uploadedFile.id
          ? {
              ...file,
              status: 'completed',
              progress: 100,
              wordCount: result.document.wordCount,
              chunkCount: result.document.chunkCount
            }
          : file
      ));

      // Notify parent component
      onDocumentProcessed?.(processedDocument);

    } catch (error: any) {
      // Always log errors but less verbosely in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Upload failed:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response,
          status: error.response?.status,
          data: error.response?.data
        });
      } else {
        console.error('Upload failed:', error.message);
      }

      // Check if it's an Ollama-related error
      const isOllamaError = error.message?.includes('Ollama') ||
                           error.response?.status === 503 ||
                           error.message?.includes('service is not available');

      if (isOllamaError) {
        // Try to start Ollama automatically
        setUploadedFiles(prev => prev.map(file =>
          file.id === uploadedFile.id
            ? {
                ...file,
                status: 'processing-chunks',
                progress: 90,
                error: 'Avvio Ollama in corso...'
              }
            : file
        ));

        try {
          if (process.env.NODE_ENV === 'development') {
            console.log('Attempting to start Ollama...');
          }
          const startResponse = await fetch('/api/health/ollama/start', {
            method: 'POST'
          });

          if (startResponse.ok) {
            // Retry the upload after a short delay
            setTimeout(() => {
              setUploadedFiles(prev => prev.map(file =>
                file.id === uploadedFile.id
                  ? {
                      ...file,
                      status: 'uploading',
                      progress: 0,
                      error: undefined
                    }
                  : file
              ));

              // Retry the upload
              uploadFileWithData(uploadedFile);
            }, 3000);
            return;
          }
        } catch (startError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to start Ollama:', startError);
          }
        }
      }

      setUploadedFiles(prev => prev.map(file =>
        file.id === uploadedFile.id
          ? {
              ...file,
              status: 'error',
              error: isOllamaError
                ? 'Servizio AI non disponibile. Assicurati che Ollama sia installato e funzionante.'
                : error.message || 'Upload failed'
            }
          : file
      ));
    }
  }, []);

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles,
    maxSize: maxSize * 1024 * 1024,
    multiple: true,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('docx')) return '📝';
    if (fileType.includes('text')) return '📃';
    return '📄';
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return 'info';
      case 'processing-chunks': return 'warning';
      case 'processing-embeddings': return 'warning';
      case 'completed': return 'success';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return 'Caricamento file...';
      case 'processing-chunks': return 'Analisi contenuto...';
      case 'processing-embeddings': return 'Generazione embeddings...';
      case 'completed': return 'Pronto per l\'analisi';
      case 'error': return 'Errore durante il caricamento';
      default: return 'In attesa';
    }
  };

  const getDetailedStatusDescription = (status: UploadedFile['status'], processingTime?: number) => {
    switch (status) {
      case 'uploading': return 'Trasferimento del file al server in corso...';
      case 'processing-chunks': return 'Estrazione e suddivisione del testo in chunk per il sistema RAG...';
      case 'processing-embeddings': return `Generazione vector embeddings con Ollama${processingTime ? ` - ${Math.round(processingTime)}s trascorsi` : ''} (può richiedere 20-30 secondi)`;
      case 'completed': return 'Il documento è stato processato ed è pronto per essere utilizzato come riferimento';
      case 'error': return 'Si è verificato un problema durante l\'elaborazione del file';
      default: return '';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Upload Zone */}
      <Card className="p-0 overflow-hidden">
        <div
          {...getRootProps()}
          className={cn(
            'p-8 text-center cursor-pointer transition-all duration-300',
            'border-2 border-dashed border-secondary-300 hover:border-primary-400',
            'hover:bg-primary-50/50',
            isDragActive && 'border-primary-500 bg-primary-50'
          )}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center space-y-4">
            <div className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center transition-colors',
              isDragActive
                ? 'bg-primary-100 text-primary-600'
                : 'bg-secondary-100 text-secondary-500'
            )}>
              <Upload className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                {isDragActive ? 'Rilascia i file qui' : 'Carica i tuoi documenti'}
              </h3>
              <p className="text-secondary-600 mb-4">
                Trascina e rilascia i file qui, oppure{' '}
                <span className="text-primary-600 font-medium">clicca per selezionare</span>
              </p>

              <div className="flex flex-wrap justify-center gap-2 text-sm text-secondary-500">
                <Badge variant="default">PDF</Badge>
                <Badge variant="default">DOCX</Badge>
                <Badge variant="default">TXT</Badge>
              </div>

              <p className="text-xs text-secondary-400 mt-2">
                Massimo {maxFiles} file, fino a {maxSize}MB ciascuno
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <div className="space-y-4">
            <h4 className="font-semibold text-secondary-900 flex items-center">
              <File className="w-5 h-5 mr-2" />
              File Caricati ({uploadedFiles.length})
            </h4>

            <div className="space-y-3">
              {uploadedFiles.map((uploadedFile) => (
                <div
                  key={uploadedFile.id}
                  className="flex items-center space-x-4 p-4 bg-secondary-50 rounded-lg"
                >
                  <div className="text-2xl">
                    {getFileIcon(uploadedFile.file.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-secondary-900 truncate">
                        {uploadedFile.file.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusColor(uploadedFile.status)} size="sm">
                          {uploadedFile.status === 'completed' && (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          {uploadedFile.status === 'error' && (
                            <AlertCircle className="w-3 h-3 mr-1" />
                          )}
                          {getStatusText(uploadedFile.status)}
                        </Badge>
                        <button
                          onClick={() => removeFile(uploadedFile.id)}
                          className="text-secondary-400 hover:text-error-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-secondary-500 mb-2">
                      <span>{formatFileSize(uploadedFile.file.size)}</span>
                      {uploadedFile.status === 'uploading' && (
                        <span>{Math.round(uploadedFile.progress)}%</span>
                      )}
                    </div>

                    {(uploadedFile.status === 'uploading' ||
                      uploadedFile.status === 'processing-chunks' ||
                      uploadedFile.status === 'processing-embeddings') && (
                      <Progress
                        value={uploadedFile.progress}
                        size="sm"
                        color={
                          uploadedFile.status === 'uploading' ? 'primary' :
                          uploadedFile.status === 'processing-chunks' ? 'warning' :
                          uploadedFile.status === 'processing-embeddings' ? 'warning' : 'primary'
                        }
                      />
                    )}

                    {uploadedFile.error && (
                      <p className="text-xs text-error-600 mt-1">{typeof uploadedFile.error === 'string' ? uploadedFile.error : 'Errore di caricamento'}</p>
                    )}

                    {/* Detailed status description */}
                    {uploadedFile.status !== 'error' && (
                      <p className="text-xs text-secondary-500 mt-1 leading-relaxed">
                        {getDetailedStatusDescription(
                          uploadedFile.status,
                          uploadedFile.processingStartTime
                            ? (Date.now() - uploadedFile.processingStartTime) / 1000
                            : undefined
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      {uploadedFiles.length > 0 && (
        <div className="flex justify-start">
          <Button
            variant="outline"
            onClick={() => setUploadedFiles([])}
          >
            Rimuovi Tutti
          </Button>
        </div>
      )}
    </div>
  );
};