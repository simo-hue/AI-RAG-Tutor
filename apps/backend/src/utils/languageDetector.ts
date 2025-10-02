import logger from './logger';

export interface LanguageInfo {
  code: string;
  name: string;
  confidence?: number;
  detectionMethod: 'automatic' | 'manual' | 'whisper';
}

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  whisperCode: string;
  flag: string;
}

// Lingue supportate con codici per Whisper e visualizzazione
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    whisperCode: 'it',
    flag: '🇮🇹'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    whisperCode: 'en',
    flag: '🇬🇧'
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    whisperCode: 'es',
    flag: '🇪🇸'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    whisperCode: 'fr',
    flag: '🇫🇷'
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    whisperCode: 'de',
    flag: '🇩🇪'
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    whisperCode: 'pt',
    flag: '🇵🇹'
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    whisperCode: 'zh',
    flag: '🇨🇳'
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    whisperCode: 'ja',
    flag: '🇯🇵'
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    whisperCode: 'ru',
    flag: '🇷🇺'
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    whisperCode: 'ar',
    flag: '🇸🇦'
  }
];

export class LanguageDetector {
  /**
   * Get supported language by code
   */
  static getLanguageByCode(code: string): SupportedLanguage | undefined {
    return SUPPORTED_LANGUAGES.find(
      lang => lang.code === code || lang.whisperCode === code
    );
  }

  /**
   * Detect language from text using simple heuristics
   * This is a basic implementation - you could integrate with a proper language detection library
   */
  static detectFromText(text: string): LanguageInfo {
    const sample = text.substring(0, 500).toLowerCase();

    // Italian indicators
    const italianWords = ['il', 'la', 'di', 'è', 'che', 'per', 'una', 'gli', 'delle', 'degli'];
    const italianCount = italianWords.filter(word =>
      sample.includes(` ${word} `) || sample.startsWith(`${word} `)
    ).length;

    // English indicators
    const englishWords = ['the', 'is', 'are', 'and', 'of', 'to', 'a', 'in', 'that', 'for'];
    const englishCount = englishWords.filter(word =>
      sample.includes(` ${word} `) || sample.startsWith(`${word} `)
    ).length;

    // Spanish indicators
    const spanishWords = ['el', 'la', 'de', 'es', 'y', 'que', 'en', 'los', 'las', 'del'];
    const spanishCount = spanishWords.filter(word =>
      sample.includes(` ${word} `) || sample.startsWith(`${word} `)
    ).length;

    // French indicators
    const frenchWords = ['le', 'la', 'de', 'est', 'et', 'que', 'les', 'un', 'une', 'dans'];
    const frenchCount = frenchWords.filter(word =>
      sample.includes(` ${word} `) || sample.startsWith(`${word} `)
    ).length;

    // German indicators
    const germanWords = ['der', 'die', 'das', 'und', 'ist', 'von', 'den', 'zu', 'mit', 'ein'];
    const germanCount = germanWords.filter(word =>
      sample.includes(` ${word} `) || sample.startsWith(`${word} `)
    ).length;

    const scores = [
      { code: 'it', count: italianCount },
      { code: 'en', count: englishCount },
      { code: 'es', count: spanishCount },
      { code: 'fr', count: frenchCount },
      { code: 'de', count: germanCount }
    ];

    const detected = scores.sort((a, b) => b.count - a.count)[0];
    const totalWords = scores.reduce((sum, s) => sum + s.count, 0);
    const confidence = totalWords > 0 ? (detected.count / totalWords) : 0;

    const language = this.getLanguageByCode(detected.code);

    logger.info('Language detected from text', {
      detected: detected.code,
      confidence: confidence.toFixed(2),
      scores
    });

    return {
      code: detected.code,
      name: language?.name || detected.code,
      confidence,
      detectionMethod: 'automatic'
    };
  }

  /**
   * Detect language using Ollama
   */
  static async detectWithOllama(text: string): Promise<LanguageInfo> {
    try {
      const sample = text.substring(0, 1000);

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3.2:3b',
          prompt: `Detect the language of this text and respond ONLY with the ISO 639-1 language code (e.g., 'it' for Italian, 'en' for English, 'es' for Spanish, etc.). Do not add any explanation, just the 2-letter code.\n\nText: "${sample}"`,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error('Ollama detection failed');
      }

      const data = await response.json();
      const detectedCode = data.response.trim().toLowerCase().substring(0, 2);

      const language = this.getLanguageByCode(detectedCode);

      if (language) {
        logger.info('Language detected with Ollama', {
          detected: detectedCode,
          language: language.name
        });

        return {
          code: detectedCode,
          name: language.name,
          confidence: 0.9,
          detectionMethod: 'automatic'
        };
      }

      // Fallback to heuristic detection
      return this.detectFromText(text);
    } catch (error) {
      logger.warn('Ollama language detection failed, using heuristic method', { error });
      return this.detectFromText(text);
    }
  }

  /**
   * Compare two languages and check if they match
   */
  static areLanguagesCompatible(lang1: string, lang2: string): boolean {
    return lang1 === lang2;
  }

  /**
   * Get confidence level description
   */
  static getConfidenceLevel(confidence: number): string {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  }

  /**
   * Validate language compatibility between document and transcription
   */
  static validateLanguageMatch(
    documentLanguage: string,
    transcriptionLanguage: string,
    documentConfidence: number,
    transcriptionConfidence: number
  ): {
    compatible: boolean;
    warning?: string;
    recommendation?: string;
  } {
    const compatible = this.areLanguagesCompatible(documentLanguage, transcriptionLanguage);

    if (!compatible) {
      const docLang = this.getLanguageByCode(documentLanguage);
      const transLang = this.getLanguageByCode(transcriptionLanguage);

      return {
        compatible: false,
        warning: `Lingua del documento (${docLang?.name}) diversa dalla trascrizione (${transLang?.name})`,
        recommendation: 'La valutazione potrebbe essere inaccurata. Assicurati che documento e audio siano nella stessa lingua.'
      };
    }

    // Check confidence levels
    if (documentConfidence < 0.5 || transcriptionConfidence < 0.5) {
      return {
        compatible: true,
        warning: 'Bassa confidenza nel rilevamento della lingua',
        recommendation: 'Considera di selezionare manualmente la lingua per risultati più accurati.'
      };
    }

    return {
      compatible: true
    };
  }
}

export default LanguageDetector;
