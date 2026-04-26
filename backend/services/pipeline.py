from utils.pdf_parser import parse_pdf
from utils.chunker import chunk_text
from utils.metadata import attach_metadata_to_chunks
from utils.helpers import save_extraction, load_extraction
from services.embeddings import embed_texts
from services.retriever import retrieve
from db.vector_store import upsert_chunks
from services.llm import generate_answer
from config import settings
from utils.logger import logger

def ingest_document(file_path: str, filename: str) -> dict:
    logger.info(f"Starting ingestion: {filename}")

    cached = load_extraction(filename)
    if cached:
        logger.info(f"Cache hit for {filename} — skipping parse")
        parsed = cached
    else:
        parsed = parse_pdf(file_path)
        save_extraction(filename, parsed)

    chunks = chunk_text(
        pages=parsed["pages"],
        chunk_size=settings.CHUNK_SIZE,
        overlap=settings.CHUNK_OVERLAP
    )

    chunks = attach_metadata_to_chunks(chunks, filename)
    texts = [c["text"] for c in chunks]
    embeddings = embed_texts(texts)
    upsert_chunks(chunks, embeddings)

    logger.info(f"Ingested {len(chunks)} chunks from {filename}")
    return {
        "filename": filename,
        "total_pages": parsed["total_pages"],
        "chunks_stored": len(chunks)
    }

def query_pipeline(question: str, company: str = None, year: int = None, top_k: int = None) -> dict:
    logger.info(f"Query: {question} | company={company} | year={year}")
    chunks = retrieve(question, company=company, year=year, top_k=top_k)
    return generate_answer(question, chunks)