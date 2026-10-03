import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';
import { ComicPanelLayout } from './layout_builder';
import { cropWatermark } from './image_generator';
import { getExportsDir, getPanelsDir, storePdfInMemory, getImageFromMemory } from './storage';

export interface SavePdfResult {
  pdfPath: string;
  pdfBase64: string;
}

function ensureExportsDir(): string {
  return getExportsDir();
}

/**
 * Splits text into wrapped lines that fit within a maximum width in points.
 */
function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  if (!text) return [];
  const clean = sanitizeText(text);
  const words = clean.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!word) continue;
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

export async function savePdf(
  layout: ComicPanelLayout[],
  comicTitle: string = 'ComicCraft Story',
  characterName: string = 'Hero'
): Promise<SavePdfResult> {
  const exportsDir = ensureExportsDir();

  const timestamp = Date.now();
  const filename = `comic_${timestamp}.pdf`;
  const filePath = path.join(exportsDir, filename);
  const webPath = `/static/exports/${filename}`;

  console.log('Generating 2-panel PDF export for comic:', comicTitle, 'at path:', filePath);

  try {
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // ==========================================
    // Page 1: Cover Page
    // ==========================================
    const coverPage = pdfDoc.addPage([600, 800]);
    coverPage.drawRectangle({
      x: 0,
      y: 0,
      width: 600,
      height: 800,
      color: rgb(0.06, 0.09, 0.16),
    });

    // Cover Outer Border
    coverPage.drawRectangle({
      x: 20,
      y: 20,
      width: 560,
      height: 760,
      borderColor: rgb(0.96, 0.62, 0.04),
      borderWidth: 4,
    });

    coverPage.drawText('COMICCRAFT PRESENTS', {
      x: 200,
      y: 710,
      size: 16,
      font: helveticaBold,
      color: rgb(0.96, 0.62, 0.04),
    });

    const sanitizedTitle = sanitizeText(comicTitle).toUpperCase().slice(0, 32);
    coverPage.drawText(sanitizedTitle, {
      x: 50,
      y: 640,
      size: 26,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });

    const sanitizedChar = sanitizeText(characterName).toUpperCase();
    coverPage.drawText(`FEATURING: ${sanitizedChar}`, {
      x: 50,
      y: 590,
      size: 16,
      font: helveticaBold,
      color: rgb(0.38, 0.82, 0.98),
    });

    // Cover Image
    if (layout.length > 0 && layout[0].image_path) {
      await tryEmbedImageOnPage(pdfDoc, coverPage, layout[0].image_path, 100, 200, 400, 320, layout[0].image_data);
    }

    coverPage.drawText('2-PANEL AI GENERATED COMIC STRIP', {
      x: 170,
      y: 110,
      size: 13,
      font: helveticaOblique,
      color: rgb(0.8, 0.8, 0.8),
    });

    coverPage.drawText(`Created on ${new Date().toLocaleDateString()}`, {
      x: 210,
      y: 70,
      size: 11,
      font: helveticaFont,
      color: rgb(0.6, 0.6, 0.6),
    });

    // ==========================================
    // Individual Panel Pages (Panel 1 & Panel 2)
    // ==========================================
    for (const panel of layout) {
      const page = pdfDoc.addPage([600, 800]);

      // Page Background
      page.drawRectangle({
        x: 0,
        y: 0,
        width: 600,
        height: 800,
        color: rgb(0.98, 0.98, 0.98),
      });

      // Page Outer Border
      page.drawRectangle({
        x: 20,
        y: 20,
        width: 560,
        height: 760,
        borderColor: rgb(0.1, 0.1, 0.1),
        borderWidth: 3,
      });

      // Top Panel Header Bar
      page.drawRectangle({
        x: 20,
        y: 720,
        width: 560,
        height: 60,
        color: rgb(0.1, 0.15, 0.25),
      });

      const panelTitleText = sanitizeText(panel.title);
      page.drawText(panelTitleText, {
        x: 40,
        y: 742,
        size: 18,
        font: helveticaBold,
        color: rgb(1, 0.8, 0.2),
      });

      // Panel Badge (Right)
      page.drawText(`PANEL ${panel.panel} OF ${layout.length}`, {
        x: 460,
        y: 744,
        size: 11,
        font: helveticaBold,
        color: rgb(0.8, 0.85, 0.95),
      });

      // ==========================================
      // Panel Image Area (x: 50, y: 390, w: 500, h: 320)
      // ==========================================
      const imgX = 50;
      const imgY = 390;
      const imgW = 500;
      const imgH = 320;

      const embeddedSuccess = await tryEmbedImageOnPage(pdfDoc, page, panel.image_path, imgX, imgY, imgW, imgH, panel.image_data);

      if (!embeddedSuccess) {
        page.drawRectangle({
          x: imgX,
          y: imgY,
          width: imgW,
          height: imgH,
          color: rgb(0.9, 0.92, 0.95),
        });
        page.drawText(`[Comic Panel ${panel.panel}: ${panelTitleText}]`, {
          x: imgX + 80,
          y: imgY + 150,
          size: 14,
          font: helveticaBold,
          color: rgb(0.3, 0.3, 0.3),
        });
      }

      // Draw high-contrast Comic Image Border
      page.drawRectangle({
        x: imgX,
        y: imgY,
        width: imgW,
        height: imgH,
        borderColor: rgb(0.1, 0.1, 0.1),
        borderWidth: 3,
      });

      // ==========================================
      // Scene Description Box (x: 50, y: 295, w: 500, h: 80)
      // ==========================================
      const maxTextWidth = 470; // 500 width - 30pt padding
      const descBoxX = 50;
      const descBoxY = 295;
      const descBoxW = 500;
      const descBoxH = 80;

      page.drawRectangle({
        x: descBoxX,
        y: descBoxY,
        width: descBoxW,
        height: descBoxH,
        color: rgb(0.94, 0.96, 0.99),
        borderColor: rgb(0.2, 0.35, 0.6),
        borderWidth: 1.5,
      });

      page.drawText('SCENE DESCRIPTION:', {
        x: descBoxX + 14,
        y: descBoxY + descBoxH - 18,
        size: 9.5,
        font: helveticaBold,
        color: rgb(0.18, 0.3, 0.58),
      });

      // Word-wrapped Scene Description Text
      const rawDesc = sanitizeText(panel.scene_description || '');
      const wrappedDescLines = wrapText(rawDesc, maxTextWidth, helveticaOblique, 9);
      let descTextY = descBoxY + descBoxH - 34;

      for (const line of wrappedDescLines.slice(0, 3)) {
        page.drawText(line, {
          x: descBoxX + 14,
          y: descTextY,
          size: 9,
          font: helveticaOblique,
          color: rgb(0.15, 0.18, 0.22),
        });
        descTextY -= 13;
      }

      // ==========================================
      // Story & Dialogue Box (x: 50, y: 65, w: 500, h: 215)
      // ==========================================
      const storyBoxX = 50;
      const storyBoxY = 65;
      const storyBoxW = 500;
      const storyBoxH = 215;

      page.drawRectangle({
        x: storyBoxX,
        y: storyBoxY,
        width: storyBoxW,
        height: storyBoxH,
        color: rgb(1, 1, 1),
        borderColor: rgb(0.1, 0.1, 0.1),
        borderWidth: 2,
      });

      page.drawText('STORY & DIALOGUE:', {
        x: storyBoxX + 14,
        y: storyBoxY + storyBoxH - 20,
        size: 10.5,
        font: helveticaBold,
        color: rgb(0.1, 0.1, 0.1),
      });

      let currentStoryY = storyBoxY + storyBoxH - 38;

      // 1. Caption (with proper word wrap)
      if (panel.caption) {
        const rawCaption = sanitizeText(panel.caption);
        const captionPrefix = 'CAPTION: ';
        const prefixWidth = helveticaBold.widthOfTextAtSize(captionPrefix, 9.5);
        const wrappedCaption = wrapText(rawCaption, maxTextWidth - prefixWidth, helveticaBold, 9.5);

        if (wrappedCaption.length > 0) {
          page.drawText(captionPrefix, {
            x: storyBoxX + 14,
            y: currentStoryY,
            size: 9.5,
            font: helveticaBold,
            color: rgb(0.85, 0.45, 0),
          });

          page.drawText(wrappedCaption[0], {
            x: storyBoxX + 14 + prefixWidth,
            y: currentStoryY,
            size: 9.5,
            font: helveticaBold,
            color: rgb(0.85, 0.45, 0),
          });
          currentStoryY -= 14;

          for (const line of wrappedCaption.slice(1, 2)) {
            page.drawText(line, {
              x: storyBoxX + 14,
              y: currentStoryY,
              size: 9.5,
              font: helveticaBold,
              color: rgb(0.85, 0.45, 0),
            });
            currentStoryY -= 14;
          }
        }
        currentStoryY -= 4;
      }

      // 2. Narration (with proper word wrap)
      if (panel.narration && currentStoryY > storyBoxY + 80) {
        const rawNarration = sanitizeText(panel.narration);
        const narrationPrefix = 'NARRATION: ';
        const prefixWidth = helveticaBold.widthOfTextAtSize(narrationPrefix, 9);
        const wrappedNarration = wrapText(rawNarration, maxTextWidth - prefixWidth, helveticaOblique, 9);

        if (wrappedNarration.length > 0) {
          page.drawText(narrationPrefix, {
            x: storyBoxX + 14,
            y: currentStoryY,
            size: 9,
            font: helveticaBold,
            color: rgb(0.2, 0.2, 0.25),
          });

          page.drawText(wrappedNarration[0], {
            x: storyBoxX + 14 + prefixWidth,
            y: currentStoryY,
            size: 9,
            font: helveticaOblique,
            color: rgb(0.2, 0.25, 0.3),
          });
          currentStoryY -= 13;

          for (const line of wrappedNarration.slice(1, 3)) {
            if (currentStoryY < storyBoxY + 60) break;
            page.drawText(line, {
              x: storyBoxX + 14,
              y: currentStoryY,
              size: 9,
              font: helveticaOblique,
              color: rgb(0.2, 0.25, 0.3),
            });
            currentStoryY -= 13;
          }
        }
        currentStoryY -= 5;
      }

      // 3. Dialogue (with proper word wrap)
      if (panel.dialogue && currentStoryY > storyBoxY + 40) {
        page.drawText('DIALOGUE:', {
          x: storyBoxX + 14,
          y: currentStoryY,
          size: 9,
          font: helveticaBold,
          color: rgb(0.1, 0.4, 0.8),
        });
        currentStoryY -= 14;

        const rawDialogueLines = panel.dialogue.split('\n').filter((l) => l.trim().length > 0);
        for (const dLine of rawDialogueLines) {
          const wrappedDLine = wrapText(dLine, maxTextWidth - 10, helveticaFont, 9);
          for (const subLine of wrappedDLine) {
            if (currentStoryY < storyBoxY + 20) break;
            page.drawText(subLine, {
              x: storyBoxX + 24,
              y: currentStoryY,
              size: 9,
              font: helveticaFont,
              color: rgb(0.08, 0.08, 0.08),
            });
            currentStoryY -= 13;
          }
          currentStoryY -= 3;
        }
      }

      // Page Footer
      page.drawText(`ComicCraft  Page ${panel.panel + 1} of ${layout.length + 1}`, {
        x: 230,
        y: 35,
        size: 9,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
    const pdfBuffer = Buffer.from(pdfBytes);
    fs.writeFileSync(filePath, pdfBuffer);
    const pdfBase64 = pdfBuffer.toString('base64');
    storePdfInMemory(filename, pdfBuffer);
    console.log(`Successfully saved 2-panel PDF (${pdfBytes.length} bytes) to ${filePath}`);
    return { pdfPath: webPath, pdfBase64 };
  } catch (err) {
    console.error('Error generating PDF:', err);
    const fallbackPdf = await PDFDocument.create();
    const p = fallbackPdf.addPage([600, 800]);
    p.drawText('ComicCraft AI Comic Book', { x: 50, y: 700, size: 24 });
    p.drawText(sanitizeText(comicTitle), { x: 50, y: 650, size: 18 });
    const bytes = await fallbackPdf.save({ useObjectStreams: false });
    const fallbackBuffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, fallbackBuffer);
    const pdfBase64 = fallbackBuffer.toString('base64');
    storePdfInMemory(filename, fallbackBuffer);
    return { pdfPath: webPath, pdfBase64 };
  }
}

async function tryEmbedImageOnPage(
  pdfDoc: PDFDocument,
  page: any,
  imagePath: string,
  x: number,
  y: number,
  w: number,
  h: number,
  imageData?: string
): Promise<boolean> {
  // 1. Try embedding from in-memory Data URL if available (ideal for Netlify/serverless)
  if (imageData && imageData.includes('base64,')) {
    try {
      const base64Str = imageData.split('base64,')[1];
      const rawBuf = Buffer.from(base64Str, 'base64');
      if (rawBuf && rawBuf.length > 50) {
        const croppedBuf = Buffer.from(cropWatermark(rawBuf));
        const pngBuffer = convertToStandardPng(croppedBuf);
        const embeddedImage = await pdfDoc.embedPng(pngBuffer);
        page.drawImage(embeddedImage, { x, y, width: w, height: h });
        return true;
      }
    } catch (e) {
      console.warn('Failed embedding from imageData base64:', e);
    }
  }

  // 2. Try embedding from memory cache
  const filename = path.basename(imagePath || '');
  const cachedBuf = getImageFromMemory(filename);
  if (cachedBuf && cachedBuf.length > 50) {
    try {
      const croppedBuf = Buffer.from(cropWatermark(cachedBuf));
      const pngBuffer = convertToStandardPng(croppedBuf);
      const embeddedImage = await pdfDoc.embedPng(pngBuffer);
      page.drawImage(embeddedImage, { x, y, width: w, height: h });
      return true;
    } catch (e) {
      console.warn('Failed embedding from memory cache:', e);
    }
  }

  // 3. Fallback to reading from filesystem
  if (!imagePath) return false;

  const cleanRelPath = imagePath.replace(/^\//, '');
  let absPath = path.join(process.cwd(), cleanRelPath);

  if (!fs.existsSync(absPath)) {
    const serverlessPath = path.join(getPanelsDir(), filename);
    if (fs.existsSync(serverlessPath)) {
      absPath = serverlessPath;
    } else {
      return false;
    }
  }

  try {
    const rawBuf = fs.readFileSync(absPath);
    if (!rawBuf || rawBuf.length < 8) return false;

    // Crop watermark
    const croppedBuf: Buffer = Buffer.from(cropWatermark(rawBuf));

    // Convert cleanly to standard PNG buffer to ensure 100% Adobe Acrobat compatibility
    const pngBuffer = convertToStandardPng(croppedBuf);
    const embeddedImage = await pdfDoc.embedPng(pngBuffer);

    page.drawImage(embeddedImage, { x, y, width: w, height: h });
    return true;
  } catch (err) {
    console.warn(`Failed to embed image ${imagePath} in PDF:`, (err as Error).message);
  }

  return false;
}

/**
 * Converts any image buffer (JPEG or PNG) into a standard, clean PNG buffer
 * that embeds seamlessly into Adobe Acrobat Reader with zero DCTDecode errors.
 */
function convertToStandardPng(buffer: Buffer): Buffer {
  // If it's already a valid PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return buffer;
  }

  // If it's JPEG, decode pixels and write clean PNG
  try {
    const decoded = jpeg.decode(buffer);
    const png = new PNG({ width: decoded.width, height: decoded.height });
    decoded.data.copy(png.data);
    return PNG.sync.write(png);
  } catch (e) {
    console.error('Error converting buffer to PNG:', e);
    return buffer;
  }
}

function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
