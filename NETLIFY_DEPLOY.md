# Deploying ComicCraft to Netlify

This project is pre-configured for **1-click automated deployment to Netlify** using Netlify Serverless Functions and Vite static hosting.

---

## Quick Deploy Steps

### Method 1: Git Repository (Recommended)
1. Push this project to your GitHub, GitLab, or Bitbucket account.
2. Log into [Netlify](https://app.netlify.com).
3. Click **"Add new site"** > **"Import an existing project"**.
4. Select your repository.
5. Netlify will automatically detect settings from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
6. (Optional) In **Site configuration > Environment variables**, add:
   - `GEMINI_API_KEY`: *(Optional)* Your Gemini API Key from Google AI Studio.
   - `NODE_VERSION`: `20`
7. Click **"Deploy site"**.

---

### Method 2: Netlify CLI
1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
2. Login to Netlify:
   ```bash
   netlify login
   ```
3. Initialize and deploy:
   ```bash
   netlify init
   netlify deploy --prod
   ```

---

## How It Works on Netlify
- **Frontend**: Vite compiles the React single-page app into the `dist` folder, served through Netlify's global CDN.
- **Backend**: The Express server runs as a serverless function (`netlify/functions/server.ts`) via `serverless-http`.
- **Dynamic Routing**: `netlify.toml` automatically proxies `/generate`, `/api/*`, `/static/*`, and `/download-pdf/*` to the serverless function.
- **File System Handling**: Automatically uses `/tmp` storage in serverless environments to prevent read-only filesystem errors.
