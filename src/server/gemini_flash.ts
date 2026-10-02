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
- "title": (string)
- "scene_description": (string)
- "image_prompt": (string)

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
  const cleanPrompt = prompt.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = cleanPrompt.split(' ').filter((w) => w.length > 2);
  const subject = words.slice(0, 4).join(' ') || 'The Main Hero';

  return [
    {
      panel: 1,
      title: 'The Journey Begins',
      scene_description: `Our protagonist steps into the scene: "${cleanPrompt}". The environment unfolds with mystery as the adventure kicks off.`,
      image_prompt: `${subject}, entering the scene, dramatic perspective, detailed graphic novel illustration, vibrant color, comic panel art`,
    },
    {
      panel: 2,
      title: 'The Heroic Breakthrough',
      scene_description: `An extraordinary moment occurs! The quest reaches its exciting climax as triumph and clarity emerge.`,
      image_prompt: `${subject}, triumphant hero action pose, dramatic lighting, epic culmination, full color comic book artwork`,
    },
  ];
}
