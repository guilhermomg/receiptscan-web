import imageCompression from 'browser-image-compression';
import type { UploadConfig } from '../types/receipt';
import { DEFAULT_UPLOAD_CONFIG } from '../types/receipt';

/**
 * Validates if a file is an allowed image type
 */
export const validateImageType = (
  file: File,
  config: UploadConfig = DEFAULT_UPLOAD_CONFIG
): boolean => {
  return config.allowedFormats.includes(file.type);
};

/**
 * Validates if a file size is within the allowed limit
 */
export const validateImageSize = (
  file: File,
  config: UploadConfig = DEFAULT_UPLOAD_CONFIG
): boolean => {
  return file.size <= config.maxSizeBytes;
};

/**
 * Validates an image file (type and size)
 */
export const validateImage = (
  file: File,
  config: UploadConfig = DEFAULT_UPLOAD_CONFIG
): { valid: boolean; error?: string } => {
  if (!validateImageType(file, config)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed formats: ${config.allowedFormats.join(', ')}`,
    };
  }

  if (!validateImageSize(file, config)) {
    return {
      valid: false,
      error: `File size exceeds ${config.maxSizeBytes / (1024 * 1024)}MB limit`,
    };
  }

  return { valid: true };
};

/**
 * Compresses an image file to target size
 */
export const compressImage = async (
  file: File,
  config: UploadConfig = DEFAULT_UPLOAD_CONFIG
): Promise<File> => {
  try {
    // If file is already smaller than target, return original
    if (file.size <= config.targetSizeBytes) {
      return file;
    }

    const options = {
      maxSizeMB: config.targetSizeBytes / (1024 * 1024),
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type,
    };

    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image');
  }
};

/**
 * Generates a preview URL for an image file
 */
export const generatePreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Revokes a preview URL to free memory
 */
export const revokePreviewUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};

/**
 * Generates a unique ID for a receipt
 */
export const generateReceiptId = (): string => {
  // Use crypto.randomUUID if available, fallback to timestamp + random
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `receipt-${crypto.randomUUID()}`;
  }
  // Fallback for environments without crypto.randomUUID
  return `receipt-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};
