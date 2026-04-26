from fastapi import APIRouter, HTTPException
from db.vector_store import list_documents, delete_document
from utils.logger import logger
import os
from config import settings

router = APIRouter()

@router.get("/documents")
def get_documents():
    """List all ingested documents."""
    try:
        docs = list_documents()
        return {"documents": docs, "total": len(docs)}
    except Exception as e:
        logger.error(f"Failed to list documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/documents/{filename}")
def remove_document(filename: str):
    """Delete a document from vector store and storage."""
    try:
        # remove from ChromaDB
        delete_document(filename)

        # remove PDF from storage
        pdf_path = os.path.join(settings.DOCUMENTS_PATH, filename)
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

        # remove cached extraction
        name = os.path.splitext(filename)[0]
        extraction_path = os.path.join(settings.EXTRACTIONS_PATH, f"{name}.json")
        if os.path.exists(extraction_path):
            os.remove(extraction_path)

        logger.info(f"Deleted document: {filename}")
        return {"status": "deleted", "filename": filename}

    except Exception as e:
        logger.error(f"Failed to delete {filename}: {e}")
        raise HTTPException(status_code=500, detail=str(e))