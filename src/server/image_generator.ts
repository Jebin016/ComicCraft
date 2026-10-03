import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';
import { getPanelsDir, storeImageInMemory } from './storage';

export interface PanelSequenceResult {
  paths: string[];
  dataUrls: string[];
}

function ensurePanelsDir(): string {
  return getPanelsDir();
}

function sanitizeFilename(prompt: string, prefix = 'panel'): string {
  const clean = prompt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 15);
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 6);
  return `${prefix}_${clean}_${timestamp}_${randomStr}.png`;
}

/**
 * Removes watermarks and logos (e.g., pollinations.ai) by cropping the bottom 40px
 * from any image buffer (JPEG or PNG).
 */
export function cropWatermark(buffer: Buffer): Buffer {
  if (!buffer || buffer.length < 500) return buffer;

  // 1. Process JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    try {
      const decoded = jpeg.decode(buffer);
      // Crop bottom 40 pixels where watermarks/logos appear
      const cropH = Math.max(100, decoded.height - 40);
      const width = decoded.width;
      const croppedData = Buffer.alloc(width * cropH * 4);

      for (let y = 0; y < cropH; y++) {
        for (let x = 0; x < width; x++) {
          const srcIdx = (width * y + x) << 2;
          const dstIdx = (width * y + x) << 2;
          croppedData[dstIdx] = decoded.data[srcIdx];
          croppedData[dstIdx + 1] = decoded.data[srcIdx + 1];
          croppedData[dstIdx + 2] = decoded.data[srcIdx + 2];
          croppedData[dstIdx + 3] = 255;
        }
      }

      const dstPng = new PNG({ width, height: cropH });
      croppedData.copy(dstPng.data);
      return PNG.sync.write(dstPng);
    } catch (e) {
      console.warn('Could not crop JPEG watermark:', (e as Error).message);
    }
  }

  // 2. Process PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e) {
    try {
      const srcPng = PNG.sync.read(buffer);
      const cropH = Math.max(100, srcPng.height - 40);
      const width = srcPng.width;
      const dstPng = new PNG({ width, height: cropH });

      for (let y = 0; y < cropH; y++) {
        for (let x = 0; x < width; x++) {
          const srcIdx = (width * y + x) << 2;
          const dstIdx = (width * y + x) << 2;
          dstPng.data[dstIdx] = srcPng.data[srcIdx];
          dstPng.data[dstIdx + 1] = srcPng.data[srcIdx + 1];
          dstPng.data[dstIdx + 2] = srcPng.data[srcIdx + 2];
          dstPng.data[dstIdx + 3] = srcPng.data[srcIdx + 3];
        }
      }

      return PNG.sync.write(dstPng);
    } catch (e) {
      console.warn('Could not crop PNG watermark:', (e as Error).message);
    }
  }

  return buffer;
}

function cleanPromptForSinglePanel(rawPrompt: string, style: string): string {
  const stripped = rawPrompt
    .replace(/five[\s_-]?panel|5[\s_-]?panel|multi[\s_-]?panel|comic[\s_-]?strip|multiple[\s_-]?panels|grid|collage|split[\s_-]?screen/gi, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);

  const cleanStyle = style.replace(/[^\w\s]/g, '').trim().slice(0, 20) || 'comic book';
  return `${stripped}, ${cleanStyle} style, single camera shot, focused hero in action, cinematic composition, graphic novel illustration, detailed art, no collage, no split screen`;
}

/**
 * Generates Panel 1 and Panel 2 as a sequence:
 * Panel 1 generates the base comic artwork without watermark.
 * Panel 2 takes Panel 1's clean image and applies a slight dynamic variation (zoom & action grade).
 */
export async function generatePanelSequence(
  panel1Prompt: string,
  panel2Prompt: string,
  artStyle: string = 'comic book',
  panel1Desc: string = '',
  panel2Desc: string = ''
): Promise<PanelSequenceResult> {
  const panelsDir = ensurePanelsDir();

  const baseSeed = Math.floor(Math.random() * 800000) + Date.now() % 10000;

  // 1. Generate Panel 1 Image (Single cinematic camera shot)
  const prompt1 = cleanPromptForSinglePanel(panel1Prompt, artStyle);
  const p1Clean = panel1Prompt.replace(/[^\w\s]/g, '_').slice(0, 15);
  const filename1 = sanitizeFilename(p1Clean, 'panel_1');
  const filePath1 = path.join(panelsDir, filename1);
  const webPath1 = `/static/panels/${filename1}`;

  let p1Success = await fetchPollinationsImage(prompt1, baseSeed, filePath1);

  if (!p1Success) {
    const fallbackPng = createThemedComicIllustration(panel1Prompt, artStyle, 1);
    fs.writeFileSync(filePath1, fallbackPng);
    console.log('Created rich comic panel 1 illustration:', webPath1);
  }

  const p1Buffer = fs.readFileSync(filePath1);
  storeImageInMemory(filename1, p1Buffer);
  const p1DataUrl = `data:image/png;base64,${p1Buffer.toString('base64')}`;

  // 2. Generate Panel 2: Slightly transformed variation of Panel 1
  const p2Clean = panel2Prompt.replace(/[^\w\s]/g, '_').slice(0, 15);
  const filename2 = sanitizeFilename(p2Clean, 'panel_2');
  const filePath2 = path.join(panelsDir, filename2);
  const webPath2 = `/static/panels/${filename2}`;

  let p2Buffer: Buffer;
  try {
    p2Buffer = createPanel2VariationFromPanel1(p1Buffer);
    fs.writeFileSync(filePath2, p2Buffer);
    console.log('Successfully created clean Panel 2 variation from Panel 1:', webPath2);
  } catch (err: any) {
    console.error('Error creating Panel 2 from Panel 1:', err);
    p2Buffer = p1Buffer;
    fs.writeFileSync(filePath2, p2Buffer);
  }

  storeImageInMemory(filename2, p2Buffer);
  const p2DataUrl = `data:image/png;base64,${p2Buffer.toString('base64')}`;

  return {
    paths: [webPath1, webPath2],
    dataUrls: [p1DataUrl, p2DataUrl],
  };
}

export async function generateImage(
  prompt: string,
  artStyle: string = 'comic book',
  panelNumber: number = 1,
  sceneDescription: string = ''
): Promise<string> {
  const result = await generatePanelSequence(prompt, prompt, artStyle, sceneDescription, sceneDescription);
  return panelNumber === 1 ? result.paths[0] : result.paths[1];
}

async function fetchPollinationsImage(prompt: string, seed: number, outputPath: string): Promise<boolean> {
  const endpoints = [
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600&nologo=true&seed=${seed}&model=flux`,
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600&nologo=true&seed=${seed}&model=turbo`,
    `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?width=800&height=600&seed=${seed}`,
  ];

  for (let i = 0; i < endpoints.length; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const res = await fetch(endpoints[i], {
        headers: { 'User-Agent': 'Mozilla/5.0 ComicCraftApp/8.0' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer && buffer.length > 500) {
          // Crop any watermark/logo immediately before saving
          const cleanBuffer = cropWatermark(buffer);
          fs.writeFileSync(outputPath, cleanBuffer);
          console.log(`Saved watermark-free AI image to ${outputPath}`);
          return true;
        }
      }
    } catch (err) {
      // Try next endpoint
    }
  }
  return false;
}

/**
 * Takes Panel 1's image buffer (already watermark-free) and slightly changes it for Panel 2:
 * 1. Zooms in 1.15x into the action center
 * 2. Applies an action color grade (boosts warmth and golden tones for climax)
 * 3. Draws subtle comic speed/action lines radiating from the borders
 */
function createPanel2VariationFromPanel1(rawBuffer: Buffer): Buffer {
  let width = 800;
  let height = 600;
  let rgbaData: Buffer;

  // Check if buffer is JPEG
  if (rawBuffer[0] === 0xff && rawBuffer[1] === 0xd8) {
    const decoded = jpeg.decode(rawBuffer);
    width = decoded.width;
    height = decoded.height;
    rgbaData = decoded.data;
  } else if (rawBuffer[0] === 0x89 && rawBuffer[1] === 0x50) {
    const png = PNG.sync.read(rawBuffer);
    width = png.width;
    height = png.height;
    rgbaData = png.data;
  } else {
    return rawBuffer;
  }

  const outData = Buffer.alloc(width * height * 4);

  // Slight zoom (1.15x) into action center
  const zoom = 1.15;
  const cropW = width / zoom;
  const cropH = height / zoom;
  const startX = (width - cropW) / 2;
  const startY = (height - cropH) / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dstIdx = (width * y + x) << 2;

      // Sample zoomed pixel from Panel 1
      const srcX = Math.floor(startX + (x / width) * cropW);
      const srcY = Math.floor(startY + (y / height) * cropH);
      const srcIdx = (width * Math.min(height - 1, Math.max(0, srcY)) + Math.min(width - 1, Math.max(0, srcX))) << 2;

      let r = rgbaData[srcIdx];
      let g = rgbaData[srcIdx + 1];
      let b = rgbaData[srcIdx + 2];

      // Climax action color grade
      r = Math.min(255, Math.floor(r * 1.08 + 8));
      g = Math.min(255, Math.floor(g * 1.02 + 2));
      b = Math.min(255, Math.floor(b * 0.96));

      // Subtle dynamic comic action speed lines radiating from edges
      const dx = x - width / 2;
      const dy = y - height / 2;
      const angle = Math.atan2(dy, dx);
      const distSq = dx * dx + dy * dy;

      if (distSq > 70000 && Math.sin(angle * 24) > 0.93) {
        r = Math.min(255, r + 45);
        g = Math.min(255, g + 45);
        b = Math.min(255, b + 45);
      }

      outData[dstIdx] = r;
      outData[dstIdx + 1] = g;
      outData[dstIdx + 2] = b;
      outData[dstIdx + 3] = 255;
    }
  }

  // Encode as standard PNG
  const outPng = new PNG({ width, height });
  outData.copy(outPng.data);
  return PNG.sync.write(outPng);
}

function createThemedComicIllustration(prompt: string, artStyle: string, panelNumber: number): Buffer {
  const width = 800;
  const height = 600;
  const png = new PNG({ width, height });

  const pLower = prompt.toLowerCase();

  let rTop = 20, gTop = 30, bTop = 70;
  let rBot = 230, gBot = 120, bBot = 40;
  let rGround = 15, gGround = 80, bGround = 50;

  if (pLower.includes('cyber') || pLower.includes('city') || pLower.includes('robot')) {
    rTop = 30; gTop = 10; bTop = 60;
    rBot = 220; gBot = 40; bBot = 140;
    rGround = 15; gGround = 23; bGround = 42;
  } else if (pLower.includes('space') || pLower.includes('star')) {
    rTop = 5; gTop = 10; bTop = 25;
    rBot = 50; gBot = 40; bBot = 120;
    rGround = 20; gGround = 25; bGround = 45;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;

      // Outer comic border
      if (x < 10 || x >= width - 10 || y < 10 || y >= height - 10) {
        png.data[idx] = 255; png.data[idx + 1] = 255; png.data[idx + 2] = 255; png.data[idx + 3] = 255;
        continue;
      }

      // Sky gradient
      const factor = y / 440;
      let r = Math.floor(rTop * (1 - factor) + rBot * factor);
      let g = Math.floor(gTop * (1 - factor) + gBot * factor);
      let b = Math.floor(bTop * (1 - factor) + bBot * factor);

      // Mountain landscape
      const mountainY = 320 + Math.sin(x / 35) * 40 + Math.cos(x / 70) * 30;
      if (y > mountainY && y < 440) {
        r = rGround; g = gGround; b = bGround;
      }

      // Foreground terrain
      if (y >= 440) {
        r = 15; g = 23; b = 42;
      }

      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = 255;
    }
  }

  return PNG.sync.write(png);
}
