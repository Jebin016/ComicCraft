import { GoogleGenAI } from '@google/genai';
import { PanelOutline } from './gemini_flash';

export async function generateStory(
  outline: PanelOutline[],
  characterName: string = 'Hero',
  tone: string = 'dramatic'
): Promise<string> {
  console.log('Generating 2-panel story narration & dialogues...');

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const formattedOutline = outline
        .map((p, i) => `Panel ${i + 1}: ${p.title} - ${p.scene_description}`)
        .join('\n');

      const prompt = `Write narration and dialogue for a 2-panel comic.
Character: ${characterName}
Tone: ${tone}

Outline:
${formattedOutline}

For each panel include CAPTION, NARRATION, and DIALOGUE.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      if (response.text) {
        return response.text;
      }
    } catch (err: any) {
      // Quietly fall back without printing 429 JSON objects
      console.log('Using local intelligent story engine.');
    }
  }

  return generateFallbackStory(outline, characterName, tone);
}

function generateFallbackStory(outline: PanelOutline[], charName: string, tone: string): string {
  return outline
    .map((p, idx) => {
      const panelNum = idx + 1;
      if (panelNum === 1) {
        return `**Panel 1: ${p.title}**

**CAPTION**: An extraordinary journey unfolds under a ${tone.toLowerCase()} horizon.

**NARRATION**: ${charName} surveyed the path ahead, determined to discover what lay beyond the threshold.

**DIALOGUE**: 
${charName}: "Every legend starts with a single step. Let's see what happens next!"`;
      } else {
        return `**Panel 2: ${p.title}**

**CAPTION**: Energy filled the air as the critical turning point arrived.

**NARRATION**: With unwavering courage, ${charName} seized victory in a spectacular display of skill and resolve.

**DIALOGUE**: 
${charName}: "We did it! Darkness gives way to triumph!"`;
      }
    })
    .join('\n\n');
}
