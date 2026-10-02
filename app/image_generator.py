import os
import re

def sanitize_filename(prompt: str) -> str:
    clean = re.sub(r'[^a-zA-Z0-9]', '_', prompt)[:25]
    return f"{clean}.png"

def generate_image(prompt: str, filename=None) -> str:
    """
    Generates a comic illustration based on the prompt.
    Returns path to saved image.
    """
    if not filename:
        filename = sanitize_filename(prompt)
    
    path = f"static/panels/{filename}"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    return path
