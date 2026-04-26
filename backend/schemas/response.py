from pydantic import BaseModel
from typing import List

class ChunkSource(BaseModel):
    document: str
    page: int
    section: str
    chunk_index: int

class QueryResponse(BaseModel):
    answer: str
    sources: List[ChunkSource]
    model: str = "gemini"

class UploadResponse(BaseModel):
    filename: str
    pages: int
    chunks_stored: int
    status: str = "success"