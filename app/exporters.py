import os
from datetime import datetime

EXPORT_FOLDER = "static/exports"

def save_pdf(layout):
    """
    Compiles full comic into a multi-page PDF file.
    """
    os.makedirs(EXPORT_FOLDER, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"comic_{timestamp}.pdf"
    pdf_path = os.path.join(EXPORT_FOLDER, filename)
    return pdf_path
