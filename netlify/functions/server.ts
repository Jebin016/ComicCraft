import serverless from 'serverless-http';
import { app } from '../../src/server/app';

// Export the serverless handler for Netlify Functions
export const handler = serverless(app);
