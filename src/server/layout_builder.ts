import { PanelOutline } from './gemini_flash';

export interface ComicPanelLayout {
  panel: number;
  title: string;
  image_path: string;
  image_data?: string;
  text: string;
  scene_description: string;
  image_prompt: string;
  caption?: string;
  narration?: string;
  dialogue?: string;
}

export function buildComicLayout(
  imagePaths: string[],
  fullStory: string,
  outline: PanelOutline[],
  imageDataList?: string[]
): ComicPanelLayout[] {
  console.log('Building comic layout with', imagePaths.length, 'images');

  // Split story text by Panel markers if present
  let storyPanels: string[] = [];

  if (fullStory.includes('Panel')) {
    const rawSegments = fullStory.split(/(?=\*\*Panel|\bPanel \d+)/i);
    storyPanels = rawSegments.filter((seg) => seg.trim().length > 0);
  }

  const layout: ComicPanelLayout[] = [];

  for (let idx = 0; idx < outline.length; idx++) {
    const panelInfo = outline[idx];
    const panelNum = idx + 1;
    const imagePath = imagePaths[idx] || (imagePaths[0] ?? '/static/panels/default.png');
    const imageData = imageDataList ? imageDataList[idx] : undefined;
    const panelStoryRaw = storyPanels[idx] || `**Panel ${panelNum}: ${panelInfo.title}**\n\n${panelInfo.scene_description}`;

    // Extract detailed parts if available
    const captionMatch = panelStoryRaw.match(/\*\*CAPTION\*\*:\s*([^\n]+)/i);
    const narrationMatch = panelStoryRaw.match(/\*\*NARRATION\*\*:\s*([^\n]+)/i);
    const dialogueMatch = panelStoryRaw.match(/\*\*DIALOGUE\*\*:\s*([\s\S]+?)(?=\*\*|$)/i);

    const caption = captionMatch ? captionMatch[1].trim() : `Whispers of adventure in ${panelInfo.title}`;
    const narration = narrationMatch ? narrationMatch[1].trim() : panelInfo.scene_description;
    const dialogue = dialogueMatch ? dialogueMatch[1].trim() : '';

    layout.push({
      panel: panelNum,
      title: panelInfo.title.startsWith('Panel') ? panelInfo.title : `Panel ${panelNum}: ${panelInfo.title}`,
      image_path: imagePath,
      image_data: imageData,
      text: panelStoryRaw,
      scene_description: panelInfo.scene_description,
      image_prompt: panelInfo.image_prompt,
      caption,
      narration,
      dialogue,
    });
  }

  return layout;
}
