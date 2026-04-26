import chromadb
from chromadb.config import Settings as ChromaSettings
from config import settings
from utils.logger import logger

# persistent client — survives restarts, no recomputation
_client = None
_collection = None

COLLECTION_NAME = "finsight_docs"

def get_client():
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(
            path=settings.CHROMA_DB_PATH,
        )
        logger.info(f"ChromaDB client initialized at {settings.CHROMA_DB_PATH}")
    return _client

def get_collection():
    global _collection
    if _collection is None:
        client = get_client()
        _collection = client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}  # cosine similarity for semantic search
        )
        logger.info(f"Collection '{COLLECTION_NAME}' ready — {_collection.count()} chunks")
    return _collection

def upsert_chunks(chunks: list, embeddings: list):
    """
    Stores chunks + embeddings into ChromaDB.
    Uses filename + chunk_index as unique ID to avoid duplicates.
    """
    collection = get_collection()

    ids = []
    documents = []
    metadatas = []

    for chunk, embedding in zip(chunks, embeddings):
        chunk_id = f"{chunk['filename']}__chunk_{chunk['chunk_index']}"
        ids.append(chunk_id)
        documents.append(chunk["text"])
        metadatas.append({
            "filename": chunk["filename"],
            "company": chunk.get("company", "Unknown"),
            "year": str(chunk.get("year", "Unknown")),
            "page_num": chunk["page_num"],
            "section": chunk["section"],
            "chunk_index": chunk["chunk_index"]
        })

    collection.upsert(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas
    )
    logger.info(f"Upserted {len(ids)} chunks into ChromaDB")

def similarity_search(query_embedding: list, top_k: int = None, filters: dict = None) -> list:
    collection = get_collection()
    top_k = top_k or settings.TOP_K

    where = None
    if filters:
        conditions = {k: v for k, v in filters.items() if v is not None}
        if len(conditions) == 1:
            # single filter — ChromaDB accepts directly
            where = conditions
        elif len(conditions) > 1:
            # multiple filters — must use $and operator
            where = {"$and": [{k: {"$eq": v}} for k, v in conditions.items()]}

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where=where,
        include=["documents", "metadatas", "distances"]
    )

    chunks = []
    for i in range(len(results["documents"][0])):
        chunks.append({
            "text": results["documents"][0][i],
            "metadata": results["metadatas"][0][i],
            "score": 1 - results["distances"][0][i]
        })

    return chunks

def delete_document(filename: str):
    """Remove all chunks for a given document."""
    collection = get_collection()
    collection.delete(where={"filename": filename})
    logger.info(f"Deleted all chunks for: {filename}")

def list_documents() -> list:
    """Return list of unique documents in the collection."""
    collection = get_collection()
    if collection.count() == 0:
        return []
    results = collection.get(include=["metadatas"])
    seen = set()
    docs = []
    for meta in results["metadatas"]:
        fname = meta["filename"]
        if fname not in seen:
            seen.add(fname)
            docs.append({
                "filename": fname,
                "company": meta.get("company"),
                "year": meta.get("year")
            })
    return docs