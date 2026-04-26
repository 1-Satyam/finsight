from fastapi import APIRouter, UploadFile, File, HTTPException
from schemas.response import UploadResponse
from services.pipeline import ingest_document
from utils.logger import logger
from config import settings
import shutil
import os

router = APIRouter()

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB
ALLOWED_TYPES = ["application/pdf"]
ALLOWED_EXTENSIONS = [".pdf"]

@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    # validate content type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # validate extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="File must have .pdf extension")

    # validate file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is 20MB. Your file: {len(contents) // (1024*1024)}MB"
        )

    # save to storage
    save_path = os.path.join(settings.DOCUMENTS_PATH, file.filename)
    try:
        with open(save_path, "wb") as buffer:
            buffer.write(contents)
        logger.info(f"Saved PDF: {file.filename} ({len(contents) // 1024}KB)")
    except Exception as e:
        logger.error(f"Failed to save file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save file")

    # run ingestion pipeline
    try:
        result = ingest_document(file_path=save_path, filename=file.filename)
    except Exception as e:
        logger.error(f"Ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

    return UploadResponse(
        filename=result["filename"],
        pages=result["total_pages"],
        chunks_stored=result["chunks_stored"],
        status="success"
    )