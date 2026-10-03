export interface ComicPanel {
  panel: number;
  title: string;
  image_path: string;
  image_data?: string; // Base64 Data URL (data:image/png;base64,...) for serverless resilience
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
  pdf_base64?: string; // Base64 PDF data for instant serverless download
  createdAt: string;
}

export interface FormInputs {
  prompt: string;
  character_name: string;
  setting: string;
  tone: string;
  art_style: string;
}
