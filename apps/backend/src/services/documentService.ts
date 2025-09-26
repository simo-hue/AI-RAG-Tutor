import fs from 'fs/promises';
import path from 'path';
import { Document, UploadProgress } from '@ai-speech-evaluator/shared';
import { AppError } from '../middleware/errorHandler';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

// Temporary in-memory storage (replace with database in production)
const documents: Document[] = [];
const uploadProgresses: Record<string, UploadProgress> = {};

export const documentService = {
  async uploadDocument(file: Express.Multer.File) {
    try {
      // Extract content based on file type
      const content = await extractContent(file);

      // Create document object
      const document: Document = {
        id: generateId(),
        name: file.originalname,
        content,
        type: getFileType(file.mimetype),
        uploadedAt: new Date(),
      };

      // Store document
      documents.push(document);

      // Create upload progress
      const uploadProgress: UploadProgress = {
        documentId: document.id,
        stage: 'complete',
        progress: 100,
        message: 'Document uploaded successfully',
      };

      uploadProgresses[document.id] = uploadProgress;

      // Clean up uploaded file
      await fs.unlink(file.path);

      return {
        document,
        uploadProgress,
      };
    } catch (error) {
      throw new AppError('Failed to process uploaded document', 500);
    }
  },

  async getDocuments() {
    return documents;
  },

  async getDocument(id: string) {
    return documents.find(doc => doc.id === id);
  },

  async deleteDocument(id: string) {
    const index = documents.findIndex(doc => doc.id === id);
    if (index === -1) {
      throw new AppError('Document not found', 404);
    }

    documents.splice(index, 1);
    delete uploadProgresses[id];
  },

  async getProcessingStatus(id: string) {
    const progress = uploadProgresses[id];
    if (!progress) {
      throw new AppError('Processing status not found', 404);
    }
    return progress;
  },

  async processDocument(id: string) {
    const document = documents.find(doc => doc.id === id);
    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Update progress to processing
    uploadProgresses[id] = {
      documentId: id,
      stage: 'processing',
      progress: 50,
      message: 'Processing document for RAG...',
    };

    // Simulate processing delay
    setTimeout(() => {
      uploadProgresses[id] = {
        documentId: id,
        stage: 'complete',
        progress: 100,
        message: 'Document processed successfully',
      };
    }, 3000);
  },
};

function generateId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `doc_${timestamp}_${random}`;
}

async function extractContent(file: Express.Multer.File): Promise<string> {
  const fileType = getFileType(file.mimetype);

  try {
    let content = '';

    switch (fileType) {
      case 'pdf':
        const pdfBuffer = await fs.readFile(file.path);
        const pdfData = await pdfParse(pdfBuffer);
        content = pdfData.text;
        break;

      case 'docx':
        const docxResult = await mammoth.extractRawText({ path: file.path });
        content = docxResult.value;
        break;

      case 'txt':
      default:
        content = await fs.readFile(file.path, 'utf-8');
        break;
    }

    // Validazione del contenuto estratto
    if (!content || content.trim().length === 0) {
      throw new Error('Document appears to be empty or corrupted');
    }

    // Limite di caratteri per evitare file troppo grandi
    const maxContentLength = 1000000; // 1MB di testo
    if (content.length > maxContentLength) {
      throw new Error('Document content is too large');
    }

    return content.trim();

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to extract content from ${fileType.toUpperCase()} file: ${error.message}`);
    }
    throw new Error(`Failed to extract content from ${fileType.toUpperCase()} file`);
  }
}

function getFileType(mimetype: string): 'pdf' | 'docx' | 'txt' {
  if (mimetype.includes('pdf')) return 'pdf';
  if (mimetype.includes('word') || mimetype.includes('docx')) return 'docx';
  return 'txt';
}