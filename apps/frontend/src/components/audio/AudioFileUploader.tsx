'use client';

import { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { cn } from '@/utils/cn';

interface AudioFileUploaderProps {
  onFileSelect: (file: File) => void;
  onTranscriptionComplete?: (transcription: string) => void;
  onError?: (error: string) => void;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
  className?: string;
  language?: string;
}

const DEFAULT_ACCEPTED_FORMATS = [
  // WAV formats
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  // MP3 formats
  'audio/mp3',
  'audio/mpeg',
  'audio/mpeg3',
  'audio/x-mpeg-3',
  // OGG formats
  'audio/ogg',
  'audio/vorbis',
  'audio/opus',
  // WebM
  'audio/webm',
  // M4A/AAC formats
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
  'audio/aac',
  'audio/aacp',
  'audio/x-aac',
  // FLAC
  'audio/flac',
  'audio/x-flac',
  // Other formats
  'audio/amr',
  'audio/3gpp',
  'audio/3gpp2',
  'application/octet-stream',
];

const ACCEPTED_EXTENSIONS = '.wav,.mp3,.ogg,.opus,.webm,.m4a,.aac,.flac,.amr,.3gp';

export const AudioFileUploader = ({
  onFileSelect,
  onTranscriptionComplete,
  onError,
  maxSize = 100, // 100MB default
  acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
  className,
  language = 'it'
}: AudioFileUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }
    const kb = bytes / 1024;
    return `${kb.toFixed(2)} KB`;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateFile = (file: File): boolean => {
    // Log file details for debugging
    console.log('🔍 File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString()
    });

    // Check file extension (more reliable than MIME type)
    const fileName = file.name.toLowerCase();
    const hasValidExtension = fileName.match(/\.(wav|mp3|ogg|opus|webm|m4a|aac|flac|amr|3gp)$/i);

    // Check MIME type (as fallback)
    const hasValidMimeType = acceptedFormats.includes(file.type);

    console.log('✓ Validation:', {
      extension: hasValidExtension ? hasValidExtension[0] : 'none',
      extensionValid: !!hasValidExtension,
      mimeType: file.type || 'empty',
      mimeTypeValid: hasValidMimeType
    });

    // Accept if either extension or MIME type is valid
    if (!hasValidExtension && !hasValidMimeType) {
      const errorMsg = `Formato file non supportato: ${file.type || 'sconosciuto'}. Usa: ${ACCEPTED_EXTENSIONS}`;
      console.log('❌ Validation failed:', errorMsg);
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return false;
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const errorMsg = `File troppo grande. Dimensione massima: ${maxSize}MB`;
      console.log('❌ File too large:', { size: file.size, maxSize: maxSizeBytes });
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return false;
    }

    console.log('✅ File validation passed');
    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setTranscription(null);

    if (!validateFile(file)) {
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);

    // Auto-upload and transcribe
    uploadAndTranscribe(file);
  };

  const uploadAndTranscribe = async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      // Step 1: Upload file
      const formData = new FormData();
      formData.append('audio', file);

      const uploadResponse = await fetch('/api/audio/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(50);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Errore durante l\'upload del file');
      }

      const uploadData = await uploadResponse.json();
      console.log('📦 Upload response:', uploadData);

      // Fix: The ID is in uploadData.data.audioRecording.id, not uploadData.data.id
      const audioId = uploadData.data?.audioRecording?.id;

      if (!audioId) {
        console.error('❌ No audio ID in response:', uploadData);
        throw new Error('ID audio non ricevuto dal server');
      }

      console.log('✅ Audio ID received:', audioId);

      setUploadProgress(100);
      setIsUploading(false);

      // Step 2: Transcribe
      setIsTranscribing(true);

      const transcribeResponse = await fetch(`/api/audio/${audioId}/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest', // CSRF protection header
        },
        body: JSON.stringify({ language }),
      });

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json();
        throw new Error(errorData.error || 'Errore durante la trascrizione');
      }

      const transcribeData = await transcribeResponse.json();
      const transcriptionText = transcribeData.data?.transcription;

      if (!transcriptionText) {
        throw new Error('Trascrizione non ricevuta dal server');
      }

      setTranscription(transcriptionText);
      setIsTranscribing(false);
      onTranscriptionComplete?.(transcriptionText);

    } catch (err) {
      console.error('Error uploading/transcribing audio:', err);
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(errorMessage);
      onError?.(errorMessage);
      setIsUploading(false);
      setIsTranscribing(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setTranscription(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const isProcessing = isUploading || isTranscribing;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      {!selectedFile && (
        <div
          onClick={handleClick}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
            'hover:border-primary-400 hover:bg-primary-50/50',
            error ? 'border-error-300 bg-error-50' : 'border-secondary-300 bg-secondary-50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center space-y-3">
            <div className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center',
              error ? 'bg-error-100' : 'bg-primary-100'
            )}>
              <Upload className={cn('w-8 h-8', error ? 'text-error-600' : 'text-primary-600')} />
            </div>
            <div>
              <p className="text-base font-semibold text-secondary-900 mb-1">
                Carica File Audio
              </p>
              <p className="text-sm text-secondary-600">
                Clicca per selezionare o trascina qui il file
              </p>
              <p className="text-xs text-secondary-500 mt-2">
                Formati supportati: WAV, MP3, M4A, AAC, OGG, Opus, WebM, FLAC, AMR, 3GP
              </p>
              <p className="text-xs text-secondary-500">
                Dimensione massima: {maxSize}MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected File Display */}
      {selectedFile && (
        <Card className={cn(
          'border-2',
          transcription && !isProcessing ? 'border-success-200 bg-success-50' : 'border-primary-200 bg-primary-50'
        )}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* File Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    transcription && !isProcessing ? 'bg-success-100' : 'bg-primary-100'
                  )}>
                    <File className={cn(
                      'w-5 h-5',
                      transcription && !isProcessing ? 'text-success-600' : 'text-primary-600'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-secondary-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-secondary-600">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                {!isProcessing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Processing Status */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                    <span className="text-sm font-medium text-primary-700">
                      Upload in corso... {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-primary-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {isTranscribing && (
                <div className="flex items-center space-x-2 p-3 bg-primary-100 rounded-lg">
                  <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                  <span className="text-sm font-medium text-primary-700">
                    Trascrizione in corso con Whisper locale...
                  </span>
                </div>
              )}

              {/* Success */}
              {transcription && !isProcessing && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 p-3 bg-success-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-success-600" />
                    <span className="text-sm font-medium text-success-700">
                      Trascrizione completata con successo!
                    </span>
                  </div>

                  {/* Transcription Preview */}
                  <div className="p-4 bg-white border border-success-200 rounded-lg">
                    <p className="text-xs font-medium text-secondary-700 mb-2">
                      Trascrizione:
                    </p>
                    <p className="text-sm text-secondary-800 leading-relaxed">
                      {transcription}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-secondary-200">
                      <span className="text-xs text-secondary-600">
                        {transcription.split(' ').length} parole
                      </span>
                      <Badge variant="success" size="sm">
                        Pronto per valutazione
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start space-x-2 p-3 bg-error-50 border border-error-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-error-700 font-medium">
                      {error}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
