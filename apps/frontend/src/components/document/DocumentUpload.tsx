'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button, Card, Progress, Badge } from '@/components/ui';
import { cn } from '@/utils/cn';

interface UploadedFile {
  file: File;
  id: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface DocumentUploadProps {
  onFileUpload?: (files: File[]) => void;
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
  maxFiles = 5,
  maxSize = 50,
  className
}: DocumentUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach((rejected) => {
        const error = rejected.errors[0];
        console.error('File rejected:', rejected.file.name, error.message);
      });
    }

    // Process accepted files
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploading',
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate upload process
    newFiles.forEach((uploadedFile) => {
      simulateUpload(uploadedFile.id);
    });

    onFileUpload?.(acceptedFiles);
  }, [onFileUpload]);

  const simulateUpload = (fileId: string) => {
    const interval = setInterval(() => {
      setUploadedFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          const newProgress = Math.min(file.progress + Math.random() * 30, 100);

          if (newProgress >= 100) {
            clearInterval(interval);
            return {
              ...file,
              progress: 100,
              status: 'processing'
            };
          }

          return {
            ...file,
            progress: newProgress
          };
        }
        return file;
      }));
    }, 500);

    // Simulate processing after upload
    setTimeout(() => {
      setUploadedFiles(prev => prev.map(file =>
        file.id === fileId
          ? { ...file, status: 'completed' }
          : file
      ));
    }, 3000);
  };

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
      case 'uploading': return 'warning';
      case 'processing': return 'info';
      case 'completed': return 'success';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return 'Caricamento in corso...';
      case 'processing': return 'Analisi del contenuto...';
      case 'completed': return 'Pronto per l\'analisi';
      case 'error': return 'Errore durante il caricamento';
      default: return 'In attesa';
    }
  };

  const getDetailedStatusDescription = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return 'Trasferimento del file in corso';
      case 'processing': return 'Estrazione e indicizzazione del testo per l\'analisi RAG';
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

                    {(uploadedFile.status === 'uploading' || uploadedFile.status === 'processing') && (
                      <Progress
                        value={uploadedFile.progress}
                        size="sm"
                        color={uploadedFile.status === 'processing' ? 'primary' : 'warning'}
                      />
                    )}

                    {uploadedFile.error && (
                      <p className="text-xs text-error-600 mt-1">{uploadedFile.error}</p>
                    )}

                    {/* Detailed status description */}
                    {uploadedFile.status !== 'error' && (
                      <p className="text-xs text-secondary-500 mt-1 leading-relaxed">
                        {getDetailedStatusDescription(uploadedFile.status)}
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
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setUploadedFiles([])}
          >
            Rimuovi Tutti
          </Button>

          <Button
            disabled={uploadedFiles.some(f => f.status !== 'completed')}
          >
            Procedi al Passaggio Successivo
          </Button>
        </div>
      )}
    </div>
  );
};