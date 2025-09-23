import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { ParsedDocument, SupportedFileType } from './types';

export class DocumentParser {
  private static readonly SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.txt'];

  static isSupported(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return this.SUPPORTED_EXTENSIONS.includes(ext);
  }

  static getFileType(filename: string): SupportedFileType {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
      case '.pdf':
        return 'pdf';
      case '.docx':
        return 'docx';
      case '.txt':
        return 'txt';
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  async parseDocument(filePath: string, documentId?: string): Promise<ParsedDocument> {
    const filename = path.basename(filePath);
    const fileType = DocumentParser.getFileType(filename);

    if (!DocumentParser.isSupported(filename)) {
      throw new Error(`File type not supported: ${filename}`);
    }

    try {
      const buffer = await fs.readFile(filePath);
      let content: string;
      let metadata: any = {
        extractedAt: new Date(),
      };

      switch (fileType) {
        case 'pdf':
          const pdfData = await pdfParse(buffer);
          content = pdfData.text;
          metadata = {
            ...metadata,
            pageCount: pdfData.numpages,
            title: pdfData.info?.Title,
            author: pdfData.info?.Author,
          };
          break;

        case 'docx':
          const docxResult = await mammoth.extractRawText({ buffer });
          content = docxResult.value;
          break;

        case 'txt':
          content = buffer.toString('utf-8');
          break;

        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Pulisci e normalizza il testo
      content = this.cleanText(content);

      // Calcola statistiche
      metadata.wordCount = this.countWords(content);

      return {
        id: documentId || this.generateId(),
        filename,
        content,
        metadata,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to parse document ${filename}: ${errorMessage}`);
    }
  }

  private cleanText(text: string): string {
    return text
      // Rimuovi caratteri di controllo
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Normalizza spazi multipli
      .replace(/\s+/g, ' ')
      // Normalizza line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Rimuovi linee vuote multiple
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Trim
      .trim();
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private generateId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async parseMultipleDocuments(filePaths: string[]): Promise<ParsedDocument[]> {
    const results: ParsedDocument[] = [];

    for (const filePath of filePaths) {
      try {
        const parsed = await this.parseDocument(filePath);
        results.push(parsed);
      } catch (error) {
        console.error(`Failed to parse ${filePath}:`, error);
        // Continua con gli altri file
      }
    }

    return results;
  }

  async validateDocument(filePath: string): Promise<{ isValid: boolean; error?: string }> {
    try {
      const filename = path.basename(filePath);

      if (!DocumentParser.isSupported(filename)) {
        return { isValid: false, error: `File type not supported: ${filename}` };
      }

      const stats = await fs.stat(filePath);
      const maxSize = 50 * 1024 * 1024; // 50MB

      if (stats.size > maxSize) {
        return { isValid: false, error: `File too large: ${(stats.size / 1024 / 1024).toFixed(1)}MB (max: 50MB)` };
      }

      // Prova a leggere il file
      await fs.access(filePath);

      return { isValid: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { isValid: false, error: `Cannot access file: ${errorMessage}` };
    }
  }
}