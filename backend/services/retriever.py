from db.vector_store import similarity_search
from services.embeddings import embed_query
from config import settings
from utils.logger import logger

def retrieve(question: str, company: str = None, year: int = None, top_k: int = None) -> list:
    """
    Embeds query and retrieves top-k chunks with optional filters.
    """
    top_k = top_k or settings.TOP_K

    query_embedding = embed_query(question)

    filters = {}
    if company:
        filters["company"] = company
    if year:
        filters["year"] = str(year)

    chunks = similarity_search(
        query_embedding=query_embedding,
        top_k=top_k,
        filters=filters if filters else None
    )

    logger.info(f"Retrieved {len(chunks)} chunks for: '{question}'")
    return chunks