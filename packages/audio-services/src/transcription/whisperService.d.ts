export interface TranscriptionOptions {
    language?: string;
    model?: 'whisper-1';
    temperature?: number;
    response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
}
export interface TranscriptionResult {
    text: string;
    language?: string;
    duration?: number;
    segments?: Array<{
        start: number;
        end: number;
        text: string;
    }>;
}
export declare class WhisperService {
    private openai;
    constructor(apiKey: string);
    /**
     * Transcribe audio file using OpenAI Whisper API
     */
    transcribeAudio(audioPath: string, options?: TranscriptionOptions): Promise<TranscriptionResult>;
    /**
     * Transcribe audio buffer using OpenAI Whisper API
     */
    transcribeBuffer(audioBuffer: Buffer, filename: string, options?: TranscriptionOptions): Promise<TranscriptionResult>;
    /**
     * Get supported languages for Whisper
     */
    getSupportedLanguages(): string[];
    /**
     * Detect language from audio
     */
    detectLanguage(audioPath: string): Promise<string | null>;
}
