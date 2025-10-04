'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { Globe, Check, AlertTriangle, Zap, Info } from 'lucide-react';

interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  whisperCode: string;
  flag: string;
}

interface LanguageInfo {
  code: string;
  name: string;
  confidence?: number;
  detectionMethod: 'automatic' | 'manual' | 'whisper';
}

interface LanguageSelectorProps {
  onLanguageSelect?: (language: string) => void;
  defaultLanguage?: string;
  autoDetect?: boolean;
  documentText?: string;
  showAutoDetection?: boolean;
  className?: string;
}

export const LanguageSelector = ({
  onLanguageSelect,
  defaultLanguage = 'it',
  autoDetect = true,
  documentText,
  showAutoDetection = true,
  className
}: LanguageSelectorProps) => {
  const [languages, setLanguages] = useState<SupportedLanguage[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(defaultLanguage);
  const [detectedLanguage, setDetectedLanguage] = useState<LanguageInfo | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [mode, setMode] = useState<'auto' | 'manual'>('manual'); // Default manuale per migliore visibilità

  useEffect(() => {
    loadLanguages();
  }, []);

  useEffect(() => {
    if (autoDetect && documentText && mode === 'auto') {
      detectLanguage(documentText);
    }
  }, [documentText, autoDetect, mode]);

  const loadLanguages = async () => {
    try {
      console.log('🌍 Loading languages from API...');
      const response = await fetch('/api/languages', {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      console.log('📡 Language API response status:', response.status);
      const data = await response.json();
      console.log('📦 Language API data:', data);

      if (data.success) {
        setLanguages(data.data.languages);
        console.log('✅ Languages loaded:', data.data.languages.length);
      } else {
        console.error('❌ Language API returned success=false:', data);
      }
    } catch (error) {
      console.error('❌ Failed to load languages:', error);
    }
  };

  const detectLanguage = async (text: string) => {
    if (!text || text.length < 50) return;

    try {
      setIsDetecting(true);

      const response = await fetch('/api/languages/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          text: text.substring(0, 2000),
          method: 'heuristic'
        })
      });

      const data = await response.json();

      if (data.success) {
        setDetectedLanguage(data.data);
        if (mode === 'auto') {
          setSelectedLanguage(data.data.code);
          onLanguageSelect?.(data.data.code);
        }
      }
    } catch (error) {
      console.error('Language detection failed:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLanguage(langCode);
    setMode('manual');
    onLanguageSelect?.(langCode);
  };

  const handleModeToggle = () => {
    if (mode === 'manual' && detectedLanguage) {
      setMode('auto');
      setSelectedLanguage(detectedLanguage.code);
      onLanguageSelect?.(detectedLanguage.code);
    } else {
      setMode('manual');
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-secondary-500';
    if (confidence >= 0.8) return 'text-success-600';
    if (confidence >= 0.5) return 'text-warning-600';
    return 'text-error-600';
  };

  const getConfidenceLabel = (confidence?: number) => {
    if (!confidence) return 'Sconosciuta';
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.5) return 'Media';
    return 'Bassa';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-primary-600" />
              <span>Lingua del Documento e Audio</span>
            </CardTitle>
            <p className="text-sm text-secondary-600 mt-1">
              Seleziona la lingua per la trascrizione e valutazione
            </p>
          </div>
          {showAutoDetection && (
            <div className="flex flex-col items-end space-y-1">
              <Button
                variant={mode === 'auto' ? 'primary' : 'outline'}
                size="sm"
                onClick={handleModeToggle}
                disabled={!detectedLanguage}
                className="min-w-[120px]"
              >
                <Zap className="w-4 h-4 mr-2" />
                {mode === 'auto' ? 'Automatico' : 'Manuale'}
              </Button>
              {detectedLanguage && (
                <Badge variant={mode === 'auto' ? 'success' : 'default'} size="sm">
                  {mode === 'auto' ? 'Rilevamento attivo' : 'Rilevata: ' + detectedLanguage.name}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Auto-detection info */}
          {mode === 'auto' && detectedLanguage && (
            <div className="p-3 bg-info-50 border border-info-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-info-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-info-900 font-medium">
                    Lingua rilevata automaticamente: {detectedLanguage.name}
                  </p>
                  <div className="flex items-center space-x-3 mt-1 text-xs text-info-700">
                    <span>
                      Confidenza: <span className={getConfidenceColor(detectedLanguage.confidence)}>
                        {getConfidenceLabel(detectedLanguage.confidence)}
                      </span>
                      {detectedLanguage.confidence && ` (${Math.round(detectedLanguage.confidence * 100)}%)`}
                    </span>
                  </div>
                  <p className="text-xs text-info-700 mt-1">
                    Puoi selezionare manualmente una lingua diversa se il rilevamento non è corretto
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {isDetecting && (
            <div className="flex items-center space-x-2 text-sm text-secondary-600 p-3 bg-secondary-50 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
              <span>Rilevamento lingua in corso...</span>
            </div>
          )}

          {/* Warning for low confidence */}
          {detectedLanguage && detectedLanguage.confidence && detectedLanguage.confidence < 0.5 && (
            <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-warning-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-warning-900 font-medium">
                    Bassa confidenza nel rilevamento
                  </p>
                  <p className="text-xs text-warning-700 mt-1">
                    Ti consigliamo di selezionare manualmente la lingua per risultati ottimali
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Language selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-secondary-900">
                {mode === 'manual' ? 'Seleziona Lingua' : 'Lingue Disponibili'}
              </h4>
              <span className="text-xs text-secondary-500">
                {languages.length} lingue supportate
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {languages.map((lang) => {
                const isSelected = selectedLanguage === lang.code;
                const isDetected = detectedLanguage?.code === lang.code;

                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 shadow-lg scale-105'
                        : isDetected && mode === 'auto'
                        ? 'border-success-300 bg-success-50'
                        : 'border-secondary-200 hover:border-primary-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl">{lang.flag}</span>
                      {isSelected && (
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-secondary-900 mb-1">
                      {lang.nativeName}
                    </div>
                    <div className="text-xs text-secondary-500">
                      {lang.name}
                    </div>
                    {isDetected && (
                      <Badge
                        variant={mode === 'auto' ? 'success' : 'default'}
                        size="sm"
                        className="absolute -top-2 -right-2"
                      >
                        {mode === 'auto' ? 'Auto' : 'Rilevata'}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected language info */}
          {selectedLanguage && languages.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-success-50 to-primary-50 border-2 border-success-300 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-success-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-success-900 flex items-center space-x-2">
                    <span>{languages.find(l => l.code === selectedLanguage)?.flag}</span>
                    <span>{languages.find(l => l.code === selectedLanguage)?.nativeName}</span>
                    <Badge variant="success" size="sm">Attiva</Badge>
                  </p>
                  <p className="text-sm text-success-700 mt-1">
                    Questa lingua verrà utilizzata per la <strong>trascrizione audio</strong> (Whisper) e la <strong>valutazione AI</strong>
                  </p>
                  {mode === 'manual' && (
                    <p className="text-xs text-success-600 mt-2 italic">
                      ✓ Selezione manuale confermata
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Important note */}
          <div className="p-3 bg-secondary-50 border border-secondary-200 rounded-lg">
            <p className="text-xs text-secondary-700">
              <strong>📌 Importante:</strong> Assicurati che documento e registrazione audio siano nella stessa lingua.
              Se sono in lingue diverse, la valutazione potrebbe essere inaccurata.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
