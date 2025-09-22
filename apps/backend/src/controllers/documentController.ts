import { Request, Response, NextFunction } from 'express';
import { documentService } from '../services/documentService';
import { AppError } from '../middleware/errorHandler';

export const documentController = {
  async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      const result = await documentService.uploadDocument(req.file);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Document uploaded successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async getDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const documents = await documentService.getDocuments();

      res.json({
        success: true,
        data: documents,
      });
    } catch (error) {
      next(error);
    }
  },

  async getDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const document = await documentService.getDocument(id);

      if (!document) {
        throw new AppError('Document not found', 404);
      }

      res.json({
        success: true,
        data: document,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await documentService.deleteDocument(id);

      res.json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async getProcessingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const status = await documentService.getProcessingStatus(id);

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  },

  async processDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await documentService.processDocument(id);

      res.json({
        success: true,
        message: 'Document processing started',
      });
    } catch (error) {
      next(error);
    }
  },
};