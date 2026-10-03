import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

import { generateOutline } from './gemini_flash';
import { generateStory } from './gemini_pro';
import { generatePanelSequence } from './image_generator';
import { buildComicLayout, ComicPanelLayout } from './layout_builder';
import { savePdf } from './exporters';
import { getPanelsDir, getExportsDir } from './storage';

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure directories exist
getPanelsDir();
getExportsDir();

// Smart static handler for panel images with automatic MIME detection & serverless fallback
app.get('/static/panels/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;
  const panelsDir = getPanelsDir();
  let filePath = path.join(panelsDir, filename);

  if (!fs.existsSync(filePath)) {
    const cwdPath = path.join(process.cwd(), 'static', 'panels', filename);
    if (fs.existsSync(cwdPath)) {
      filePath = cwdPath;
    }
  }

  if (fs.existsSync(filePath)) {
    try {
      const buffer = fs.readFileSync(filePath);
      if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else {
        res.setHeader('Content-Type', 'image/png');
      }
      res.setHeader('Content-Length', buffer.length.toString());
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.end(buffer);
    } catch (e) {
      console.error('Error serving panel image:', e);
    }
  }
  return res.status(404).send('Panel image not found');
});

// Explicit handler for PDF downloads & viewing
app.get('/static/exports/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;
  const exportsDir = getExportsDir();
  let filePath = path.join(exportsDir, filename);

  if (!fs.existsSync(filePath)) {
    const cwdPath = path.join(process.cwd(), 'static', 'exports', filename);
    if (fs.existsSync(cwdPath)) {
      filePath = cwdPath;
    }
  }

  if (fs.existsSync(filePath)) {
    try {
      const buffer = fs.readFileSync(filePath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length.toString());
      return res.end(buffer);
    } catch (e) {
      console.error('Error serving export PDF:', e);
    }
  }
  return res.status(404).send('PDF document not found');
});

// Dedicated PDF download route
app.get('/download-pdf/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;
  const exportsDir = getExportsDir();
  let filePath = path.join(exportsDir, filename);

  if (!fs.existsSync(filePath)) {
    const cwdPath = path.join(process.cwd(), 'static', 'exports', filename);
    if (fs.existsSync(cwdPath)) {
      filePath = cwdPath;
    }
  }

  if (fs.existsSync(filePath)) {
    try {
      const buffer = fs.readFileSync(filePath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length.toString());
      return res.end(buffer);
    } catch (e) {
      console.error('Error serving PDF download:', e);
    }
  }
  return res.status(404).send('PDF document not found');
});

// In-memory store for generated comics
export interface ComicRecord {
  id: string;
  prompt: string;
  character_name: string;
  setting: string;
  tone: string;
  art_style: string;
  layout: ComicPanelLayout[];
  pdf_path: string;
  createdAt: string;
}

const comicsStore: ComicRecord[] = [];

// API Endpoint: /generate (Form Submission & Direct Call)
app.post('/generate', async (req: Request, res: Response) => {
  try {
    const prompt = (req.body.prompt || req.body.story_prompt || '').toString();
    const character_name = (req.body.character_name || 'Free').toString();
    const setting = (req.body.setting || 'forest').toString();
    const tone = (req.body.tone || 'dramatic').toString();
    const art_style = (req.body.art_style || req.body.style || 'comic book').toString();

    if (!prompt.trim()) {
      return res.status(400).json({ error: 'Story prompt is required' });
    }

    console.log(`Starting comic generation pipeline for prompt: "${prompt}"`);

    const fullPrompt = `${prompt}\nMain character: ${character_name}\nSetting: ${setting}\nTone: ${tone}\nArt Style: ${art_style}`;

    // Step 1: Generate 2-panel outline using Gemini Flash
    const outline = await generateOutline(fullPrompt);

    // Step 2: Generate narration & character dialogues using Gemini Pro
    const fullStory = await generateStory(outline, character_name, tone);

    // Step 3: Generate sequential panel image pair with visual continuity
    const p1Outline = outline[0];
    const p2Outline = outline[1] || outline[0];

    const imagePaths = await generatePanelSequence(
      p1Outline.image_prompt,
      p2Outline.image_prompt,
      art_style,
      p1Outline.scene_description,
      p2Outline.scene_description
    );

    // Step 4: Build comic layout
    const layout = buildComicLayout(imagePaths, fullStory, outline);

    // Step 5: Export to PDF
    const comicTitle = outline[0]?.title || `${character_name}'s Adventure in ${setting}`;
    const pdfPath = await savePdf(layout, comicTitle, character_name);

    const record: ComicRecord = {
      id: `comic_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      prompt,
      character_name,
      setting,
      tone,
      art_style,
      layout,
      pdf_path: pdfPath,
      createdAt: new Date().toISOString(),
    };

    comicsStore.unshift(record);

    return res.json({
      status: 'success',
      comic: record,
      pdf_path: pdfPath,
    });
  } catch (err: any) {
    console.error('Error in /generate route:', err);
    return res.status(500).json({ error: 'Comic generation failed', detail: err?.message || String(err) });
  }
});

// API Endpoint: /generate-comic/json (JSON API for programmatic clients)
app.post('/generate-comic/json', async (req: Request, res: Response) => {
  try {
    const { prompt, character_name = 'Hero', setting = 'Fantasy', tone = 'dramatic', style = 'comic book' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt field is required in JSON payload' });
    }

    const fullPrompt = `${prompt}\nMain character: ${character_name}\nSetting: ${setting}\nTone: ${tone}\nArt Style: ${style}`;

    const outline = await generateOutline(fullPrompt);
    const fullStory = await generateStory(outline, character_name, tone);

    const p1Outline = outline[0];
    const p2Outline = outline[1] || outline[0];

    const imagePaths = await generatePanelSequence(
      p1Outline.image_prompt,
      p2Outline.image_prompt,
      style,
      p1Outline.scene_description,
      p2Outline.scene_description
    );

    const layout = buildComicLayout(imagePaths, fullStory, outline);
    const pdfPath = await savePdf(layout, outline[0]?.title || 'Comic Story', character_name);

    const record: ComicRecord = {
      id: `comic_${Date.now()}`,
      prompt,
      character_name,
      setting,
      tone,
      art_style: style,
      layout,
      pdf_path: pdfPath,
      createdAt: new Date().toISOString(),
    };

    comicsStore.unshift(record);

    return res.json({
      status: 'success',
      comic_id: record.id,
      layout,
      pdf_path: pdfPath,
    });
  } catch (err: any) {
    console.error('Error in /generate-comic/json:', err);
    return res.status(500).json({ error: 'Failed to process JSON comic generation', detail: err.message });
  }
});

// API Endpoint: /export-success
app.get('/export-success', (req: Request, res: Response) => {
  const pdf_path = req.query.pdf_path || '';
  return res.json({
    message: 'Comic Export Confirmed',
    pdf_path,
    status: 'success',
  });
});

// History & Retrieval APIs
app.get('/api/comics', (req: Request, res: Response) => {
  return res.json({ comics: comicsStore });
});

app.get('/api/comics/:id', (req: Request, res: Response) => {
  const comic = comicsStore.find((c) => c.id === req.params.id);
  if (!comic) return res.status(404).json({ error: 'Comic not found' });
  return res.json(comic);
});

// Health check endpoint for deployment validation
app.get('/api/health', (req: Request, res: Response) => {
  return res.json({ status: 'ok', service: 'ComicCraft', timestamp: new Date().toISOString() });
});
