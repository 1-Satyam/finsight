from pydantic_settings import BaseSettings
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    # LLM
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    LLM_PROVIDER: str = "groq"

    # Embeddings
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # Chunking
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50

    # Retrieval
    TOP_K: int = 5

    # ChromaDB
    CHROMA_DB_PATH: str = str(BASE_DIR / "db" / "chroma")

    # Storage
    DOCUMENTS_PATH: str = str(BASE_DIR / "storage" / "documents")
    EXTRACTIONS_PATH: str = str(BASE_DIR / "storage" / "extractions")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# single instance imported everywhere
settings = Settings()