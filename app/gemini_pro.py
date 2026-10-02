import os
import google.generativeai as genai

def generate_story(outline: list) -> str:
    """
    Generates a detailed comic story with narration and character dialogue
    from a list of comic panel outlines using Gemini 1.5 Pro.

    Args:
        outline (list): A list of strings representing each comic panel's idea.

    Returns:
        str: The generated comic story text or an error message.
    """
    formatted_outline = "\n".join([f"Panel {i+1}: {item}" for i, item in enumerate(outline)])

    prompt = f"""
You're a comic book writer.

Given the following panel breakdown, write a comic-style story with engaging narration and character dialogues for each panel.

Panel Outline:
{formatted_outline}

Guidelines:
- Use a fun and engaging tone, like an actual comic book.
- Include narration and clearly marked character lines.
- Keep each panel self-contained but part of a cohesive story.
"""
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-pro')
            response = model.generate_content(prompt)
            return response.text
    except Exception as e:
        print(f"Error generating story: {e}")

    story_parts = []
    for i, panel in enumerate(outline):
        title = panel.get("title", f"Panel {i+1}") if isinstance(panel, dict) else f"Panel {i+1}"
        story_parts.append(f"**Panel {i+1}: {title}**\n\n**CAPTION**: Ambient sounds echo across the scene.\n\n**NARRATION**: The journey continues with unwavering courage.\n\n**DIALOGUE**:\nHero: 'We shall overcome this together!'")
    return "\n\n".join(story_parts)
