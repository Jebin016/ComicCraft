import fs from 'fs';
import path from 'path';

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
