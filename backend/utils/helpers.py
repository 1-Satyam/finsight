import os
import json
from config import settings

def ensure_dirs():
    """Create storage dirs if they don't exist."""
    os.makedirs(settings.DOCUMENTS_PATH, exist_ok=True)
    os.makedirs(settings.EXTRACTIONS_PATH, exist_ok=True)
    os.makedirs(settings.CHROMA_DB_PATH, exist_ok=True)

def save_extraction(filename: str, data: dict):
    """Cache extracted text to extractions/ as JSON."""
    name = os.path.splitext(filename)[0]
    out_path = os.path.join(settings.EXTRACTIONS_PATH, f"{name}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return out_path

def load_extraction(filename: str) -> dict | None:
    """Load cached extraction if it exists."""
    name = os.path.splitext(filename)[0]
    out_path = os.path.join(settings.EXTRACTIONS_PATH, f"{name}.json")
    if os.path.exists(out_path):
        with open(out_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return None