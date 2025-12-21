/**
 * File Upload Middleware
 * Handles image uploads with validation and processing
 */

import multer from 'multer';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errorClasses';
import { ErrorMessages } from '../constants/errorMessages';
import { logger } from '../config/logger.config';

/**
 * Multer configuration
 * Store files in memory for processing with Sharp
 */
const storage = multer.memoryStorage();

/**
 * File filter - only allow images
 */
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept images only
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ValidationError(ErrorMessages.INVALID_FILE_TYPE, {
        receivedType: file.mimetype,
        allowedTypes: allowedMimeTypes,
      })
    );
  }
};

/**
 * Multer upload instance
 * Max file size: 10MB
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1, // Maximum 1 file per request
  },
});

/**
 * Image processing options
 */
export interface ImageProcessOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Process uploaded image
 * Compresses and resizes image using Sharp
 */
export const processImage = (options: ImageProcessOptions = {}) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.file) {
      return next();
    }

    try {
      const { maxWidth = 2048, maxHeight = 2048, quality = 85, format = 'jpeg' } = options;

      logger.info('Processing uploaded image', {
        originalSize: req.file.size,
        mimetype: req.file.mimetype,
        fieldname: req.file.fieldname,
      });

      // Process image with Sharp
      let pipeline = sharp(req.file.buffer);

      // Get metadata
      const metadata = await pipeline.metadata();

      // Resize if needed
      if (
        (metadata.width && metadata.width > maxWidth) ||
        (metadata.height && metadata.height > maxHeight)
      ) {
        pipeline = pipeline.resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Convert and compress
      let processedBuffer: Buffer;

      if (format === 'jpeg') {
        processedBuffer = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
      } else if (format === 'png') {
        processedBuffer = await pipeline.png({ quality, compressionLevel: 9 }).toBuffer();
      } else {
        processedBuffer = await pipeline.webp({ quality }).toBuffer();
      }

      // Convert to base64
      const base64Image = processedBuffer.toString('base64');
      const mimeType = `image/${format}`;

      // Attach processed image to request
      (req as any).processedImage = {
        buffer: processedBuffer,
        base64: base64Image,
        mimeType,
        size: processedBuffer.length,
        originalSize: req.file.size,
        width: metadata.width,
        height: metadata.height,
      };

      logger.info('Image processed successfully', {
        originalSize: req.file.size,
        processedSize: processedBuffer.length,
        compressionRatio: ((1 - processedBuffer.length / req.file.size) * 100).toFixed(2) + '%',
      });

      next();
    } catch (error) {
      logger.error('Image processing failed', {
        error: (error as Error).message,
        stack: (error as Error).stack,
      });

      throw new ValidationError(ErrorMessages.INVALID_IMAGE, {
        reason: 'Không thể xử lý hình ảnh',
      });
    }
  };
};

/**
 * Validate base64 image from request body
 * For requests that send base64 directly (no file upload)
 */
export const validateBase64Image = (fieldName: string = 'image') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const imageData = req.body[fieldName];

    if (!imageData) {
      throw new ValidationError(`Thiếu trường ${fieldName}`);
    }

    // Check if it's a data URL or raw base64
    let base64Data: string;
    let mimeType: string;

    if (imageData.startsWith('data:image/')) {
      // Extract from data URL: data:image/png;base64,iVBORw0...
      const matches = imageData.match(/^data:image\/([a-z]+);base64,(.+)$/);

      if (!matches) {
        throw new ValidationError(ErrorMessages.INVALID_IMAGE, {
          reason: 'Format data URL không hợp lệ',
        });
      }

      mimeType = `image/${matches[1]}`;
      base64Data = matches[2];
    } else {
      // Assume raw base64
      base64Data = imageData;
      mimeType = 'image/jpeg'; // Default
    }

    // Validate base64 string
    const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
    if (!base64Regex.test(base64Data)) {
      throw new ValidationError(ErrorMessages.INVALID_IMAGE, {
        reason: 'Chuỗi base64 không hợp lệ',
      });
    }

    // Check size (rough estimate: base64 is ~1.33x larger than binary)
    const estimatedSize = (base64Data.length * 3) / 4;
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (estimatedSize > maxSize) {
      throw new ValidationError(ErrorMessages.FILE_TOO_LARGE, {
        size: estimatedSize,
        maxSize,
      });
    }

    // Attach to request
    (req as any).base64Image = {
      base64: base64Data,
      mimeType,
      size: estimatedSize,
    };

    logger.debug('Base64 image validated', {
      field: fieldName,
      mimeType,
      size: estimatedSize,
    });

    next();
  };
};

/**
 * Combined upload middleware
 * Upload + Process in one step
 *
 * Usage:
 * router.post('/upload',
 *   uploadAndProcess('image', { maxWidth: 1024 }),
 *   controller
 * )
 */
export const uploadAndProcess = (fieldName: string, options?: ImageProcessOptions) => {
  return [upload.single(fieldName), processImage(options)];
};
