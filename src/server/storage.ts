import fs from 'fs';
import path from 'path';

export const memoryImageCache = new Map<string, Buffer>();
export const memoryPdfCache = new Map<string, Buffer>();

export function storeImageInMemory(filename: string, buffer: Buffer): void {
  if (memoryImageCache.size > 50) {
    const firstKey = memoryImageCache.keys().next().value;
    if (firstKey) memoryImageCache.delete(firstKey);
  }
  memoryImageCache.set(filename, buffer);
}

export function getImageFromMemory(filename: string): Buffer | undefined {
  return memoryImageCache.get(filename);
}

export function storePdfInMemory(filename: string, buffer: Buffer): void {
  if (memoryPdfCache.size > 50) {
    const firstKey = memoryPdfCache.keys().next().value;
    if (firstKey) memoryPdfCache.delete(firstKey);
  }
  memoryPdfCache.set(filename, buffer);
}

export function getPdfFromMemory(filename: string): Buffer | undefined {
  return memoryPdfCache.get(filename);
}

/**
 * Returns a writable directory for panel images.
 * In local development, uses static/panels.
 * In Netlify Serverless Functions / AWS Lambda, uses /tmp/panels to prevent read-only filesystem errors.
 */
export function getPanelsDir(): string {
  const isServerless = !!process.env.NETLIFY || !!process.env.AWS_LAMBDA_FUNCTION_NAME || !!process.env.LAMBDA_TASK_ROOT;
  const primaryDir = isServerless ? path.join('/tmp', 'panels') : path.join(process.cwd(), 'static', 'panels');

  try {
    if (!fs.existsSync(primaryDir)) {
      fs.mkdirSync(primaryDir, { recursive: true });
    }
    return primaryDir;
  } catch (err) {
    const fallbackDir = path.join('/tmp', 'panels');
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    return fallbackDir;
  }
}

/**
 * Returns a writable directory for exported PDF documents.
 * In local development, uses static/exports.
 * In Netlify Serverless Functions / AWS Lambda, uses /tmp/exports.
 */
export function getExportsDir(): string {
  const isServerless = !!process.env.NETLIFY || !!process.env.AWS_LAMBDA_FUNCTION_NAME || !!process.env.LAMBDA_TASK_ROOT;
  const primaryDir = isServerless ? path.join('/tmp', 'exports') : path.join(process.cwd(), 'static', 'exports');

  try {
    if (!fs.existsSync(primaryDir)) {
      fs.mkdirSync(primaryDir, { recursive: true });
    }
    return primaryDir;
  } catch (err) {
    const fallbackDir = path.join('/tmp', 'exports');
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    return fallbackDir;
  }
}
