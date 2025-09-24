import fs from 'fs/promises';
import { logger } from './logger';

/**
 * Safely cleanup a single file without throwing errors
 */
export async function safeCleanupFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
    logger.debug('File cleaned up successfully', { filePath });
  } catch (error) {
    // Log the error but don't throw - cleanup failures shouldn't break the app
    logger.warn('Failed to cleanup file', {
      filePath,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Safely cleanup multiple files concurrently
 */
export async function safeCleanupFiles(filePaths: string[]): Promise<void> {
  if (!filePaths.length) return;

  try {
    await Promise.allSettled(
      filePaths.map(filePath => safeCleanupFile(filePath))
    );
    logger.debug('Bulk file cleanup completed', { fileCount: filePaths.length });
  } catch (error) {
    // This should never happen with Promise.allSettled, but just in case
    logger.error('Unexpected error during bulk file cleanup', {
      fileCount: filePaths.length,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Cleanup multer files (either single file or array)
 */
export async function cleanupMulterFiles(files: Express.Multer.File | Express.Multer.File[] | undefined): Promise<void> {
  if (!files) return;

  const fileArray = Array.isArray(files) ? files : [files];
  const filePaths = fileArray.map(file => file.path);

  await safeCleanupFiles(filePaths);
}