export interface ComicPanel {
  panel: number;
  title: string;
  image_path: string;
  text: string;
  scene_description: string;
  image_prompt: string;
  caption?: string;
  narration?: string;
  dialogue?: string;
}

export interface ComicData {
  id: string;
  prompt: string;
  character_name: string;
  setting: string;
  tone: string;
  art_style: string;
  layout: ComicPanel[];
  pdf_path: string;
  createdAt: string;
}

export interface FormInputs {
  prompt: string;
  character_name: string;
  setting: string;
  tone: string;
  art_style: string;
}
