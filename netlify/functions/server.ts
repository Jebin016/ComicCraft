import serverless from 'serverless-http';
import { app } from '../../src/server/app';

// Export the serverless handler for Netlify Functions with binary support
export const handler = serverless(app, {
  binary: ['image/*', 'application/pdf', 'application/octet-stream'],
});
