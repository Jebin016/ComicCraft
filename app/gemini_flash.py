import os
import json
import google.generativeai as genai

def generate_outline(user_prompt: str) -> list:
    """
    Generates a 5-panel comic layout based on the user's story idea using Gemini.

    Args:
        user_prompt (str): The user's comic idea prompt.

    Returns:
        list: A list of dictionaries, one for each panel.
    """
    prompt = f"""
You are a professional AI comic planner.

Your task is to generate a *strictly formatted* JSON array containing 5 panel descriptions for a comic based on the story idea below:

STORY: "{user_prompt}"

Each JSON object must include:
- "panel": (integer)
- "title": (string)
- "scene_description": (string)
- "image_prompt": (string)

Respond ONLY in this valid JSON format, without any explanations or markdown:
[
  {{
    "panel": 1,
    "title": "title here",
    "scene_description": "Scene description here",
    "image_prompt": "Image prompt for Stable Diffusion"
  }}
]
"""
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            output_text = response.text.strip()
            if output_text.startswith("```json"):
                output_text = output_text.replace("```json", "").replace("```", "").strip()
            panel_data = json.loads(output_text)
            if isinstance(panel_data, list):
                return panel_data
    except Exception as e:
        print(f"Error in python gemini_flash: {e}")

    # Fallback outline
    return [
        {
            "panel": 1,
            "title": "The Beginning",
            "scene_description": f"The story opens as our hero explores: {user_prompt}",
            "image_prompt": f"Comic panel of hero starting an adventure in {user_prompt}, comic style"
        },
        {
            "panel": 2,
            "title": "Into the Unknown",
            "scene_description": "A unexpected clue is discovered in the surroundings.",
            "image_prompt": f"Comic panel close-up discovery scene, dramatic comic lighting"
        },
        {
            "panel": 3,
            "title": "The Challenge",
            "scene_description": "An obstacle arises testing the character's resolve.",
            "image_prompt": f"Comic panel action perspective, hero facing a challenge, comic art"
        },
        {
            "panel": 4,
            "title": "Turning Point",
            "scene_description": "A strategic breakthrough leads to victory.",
            "image_prompt": f"Comic panel heroic triumph pose, energetic glow"
        },
        {
            "panel": 5,
            "title": "New Horizons",
            "scene_description": "Resolution and looking forward to future quests.",
            "image_prompt": f"Comic panel landscape vista at sunset, peaceful resolution"
        }
    ]
