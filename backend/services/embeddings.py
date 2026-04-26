from sentence_transformers import SentenceTransformer
from config import settings
from utils.logger import logger

# load model once at startup — not on every request
_model = None

def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
        _model = SentenceTransformer(settings.EMBEDDING_MODEL)
        logger.info("Embedding model loaded")
    return _model

def embed_texts(texts: list[str]) -> list:
    """
    Takes list of strings, returns list of embedding vectors.
    """
    model = get_model()
    embeddings = model.encode(texts, show_progress_bar=False)
    return embeddings.tolist()

def embed_query(query: str) -> list:
    """
    Embeds a single query string for similarity search.
    """
    model = get_model()
    embedding = model.encode([query], show_progress_bar=False)
    return embedding[0].tolist()