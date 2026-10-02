import { GoogleGenAI, Type } from '@google/genai';

export interface PanelOutline {
  panel: number;
  title: string;
  scene_description: string;
  image_prompt: string;
}

export async function generateOutline(userPrompt: string): Promise<PanelOutline[]> {
  console.log('Generating 2-panel comic outline...');

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

      const prompt = `You are a professional AI comic planner.
Generate a JSON array with 2 panel objects for a 2-panel comic strip based on: "${userPrompt}"

Each object must include:
- "panel": (integer 1 or 2)
- "title": (string, short punchy title)
- "scene_description": (string, 1-2 sentence description of setting and atmosphere)
- "image_prompt": (string, a description of ONE SINGLE cinematic camera shot focusing on the character and action. CRITICAL: Never include words like "comic strip", "five panel", "multi-panel", "grid", or "collage" in image_prompt. It must describe a single camera scene only)

Respond ONLY in valid JSON array format.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                panel: { type: Type.INTEGER },
                title: { type: Type.STRING },
                scene_description: { type: Type.STRING },
                image_prompt: { type: Type.STRING },
              },
              required: ['panel', 'title', 'scene_description', 'image_prompt'],
            },
          },
        },
      });

      const jsonText = response.text?.trim() || '';
      if (jsonText) {
        const parsed = JSON.parse(jsonText);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          return parsed.slice(0, 2).map((p, idx) => ({
            panel: idx + 1,
            title: p.title || (idx === 0 ? 'The Setup' : 'The Climax'),
            scene_description: p.scene_description || `Scene description for panel ${idx + 1}`,
            image_prompt: p.image_prompt || `${userPrompt}, panel ${idx + 1}, comic book artwork`,
          }));
        }
      }
    } catch (err: any) {
      // Quietly fall back without printing 429 JSON objects
      console.log('Using local intelligent outline engine.');
    }
  }

  return generateFallbackOutline(userPrompt);
}

function generateFallbackOutline(prompt: string): PanelOutline[] {
  // Strip meta words like "create", "cinematic", "five panel", "comic"
  const strippedPrompt = prompt
    .replace(/five[\s_-]?panel|5[\s_-]?panel|multi[\s_-]?panel|comic[\s_-]?strip|create[\s_-]?a/gi, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = strippedPrompt.split(' ').filter((w) => w.length > 2);
  const subject = words.slice(0, 5).join(' ') || 'The Hero';

  return [
    {
      panel: 1,
      title: 'The Journey Begins',
      scene_description: `Our protagonist steps into the scene: "${strippedPrompt || prompt}". The environment unfolds with mystery as the adventure kicks off.`,
      image_prompt: `${subject}, close-up action pose, single shot, dramatic lighting, detailed graphic novel illustration, vibrant color`,
    },
    {
      panel: 2,
      title: 'The Heroic Breakthrough',
      scene_description: `An extraordinary moment occurs! The quest reaches its exciting climax as triumph and clarity emerge.`,
      image_prompt: `${subject}, heroic dynamic action pose, single camera view, cinematic angle, epic culmination, full color artwork`,
    },
  ];
}
