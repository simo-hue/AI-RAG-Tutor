import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
export class WhisperService {
    openai;
    constructor(apiKey) {
        this.openai = new OpenAI({
            apiKey: apiKey,
        });
    }
    /**
     * Transcribe audio file using OpenAI Whisper API
     */
    async transcribeAudio(audioPath, options = {}) {
        try {
            if (!fs.existsSync(audioPath)) {
                throw new Error(`Audio file not found: ${audioPath}`);
            }
            const audioFile = fs.createReadStream(audioPath);
            const transcription = await this.openai.audio.transcriptions.create({
                file: audioFile,
                model: options.model || 'whisper-1',
                language: options.language || undefined,
                temperature: options.temperature || 0,
                response_format: options.response_format || 'verbose_json',
            });
            // Handle different response formats
            if (typeof transcription === 'string') {
                return {
                    text: transcription,
                };
            }
            // For verbose_json format
            if (transcription && typeof transcription === 'object' && 'text' in transcription) {
                const verboseTranscription = transcription;
                return {
                    text: verboseTranscription.text,
                    language: verboseTranscription.language,
                    duration: verboseTranscription.duration,
                    segments: verboseTranscription.segments?.map((segment) => ({
                        start: segment.start,
                        end: segment.end,
                        text: segment.text,
                    })),
                };
            }
            throw new Error('Unexpected transcription response format');
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Transcription failed: ${error.message}`);
            }
            throw new Error('Transcription failed: Unknown error');
        }
    }
    /**
     * Transcribe audio buffer using OpenAI Whisper API
     */
    async transcribeBuffer(audioBuffer, filename, options = {}) {
        const tempDir = process.env.TEMP_DIR || '/tmp';
        const tempPath = path.join(tempDir, `temp-${Date.now()}-${filename}`);
        try {
            // Write buffer to temporary file
            fs.writeFileSync(tempPath, audioBuffer);
            // Transcribe the temporary file
            const result = await this.transcribeAudio(tempPath, options);
            // Clean up temporary file
            fs.unlinkSync(tempPath);
            return result;
        }
        catch (error) {
            // Ensure cleanup even if transcription fails
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
            throw error;
        }
    }
    /**
     * Get supported languages for Whisper
     */
    getSupportedLanguages() {
        return [
            'af', 'am', 'ar', 'as', 'az', 'ba', 'be', 'bg', 'bn', 'bo', 'br', 'bs',
            'ca', 'cs', 'cy', 'da', 'de', 'el', 'en', 'es', 'et', 'eu', 'fa', 'fi',
            'fo', 'fr', 'gl', 'gu', 'ha', 'haw', 'he', 'hi', 'hr', 'ht', 'hu', 'hy',
            'id', 'is', 'it', 'ja', 'jw', 'ka', 'kk', 'km', 'kn', 'ko', 'la', 'lb',
            'ln', 'lo', 'lt', 'lv', 'mg', 'mi', 'mk', 'ml', 'mn', 'mr', 'ms', 'mt',
            'my', 'ne', 'nl', 'nn', 'no', 'oc', 'pa', 'pl', 'ps', 'pt', 'ro', 'ru',
            'sa', 'sd', 'si', 'sk', 'sl', 'sn', 'so', 'sq', 'sr', 'su', 'sv', 'sw',
            'ta', 'te', 'tg', 'th', 'tk', 'tl', 'tr', 'tt', 'uk', 'ur', 'uz', 'vi',
            'yi', 'yo', 'zh'
        ];
    }
    /**
     * Detect language from audio
     */
    async detectLanguage(audioPath) {
        try {
            const result = await this.transcribeAudio(audioPath, {
                response_format: 'verbose_json',
                temperature: 0,
            });
            return result.language || null;
        }
        catch (error) {
            console.warn('Language detection failed:', error);
            return null;
        }
    }
}
