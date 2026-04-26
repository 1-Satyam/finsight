from fastapi import APIRouter, HTTPException
from schemas.request import QueryRequest
from schemas.response import QueryResponse, ChunkSource
from services.pipeline import query_pipeline
from utils.logger import logger

router = APIRouter()

@router.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    try:
        result = query_pipeline(
            question=request.question,
            company=request.company,
            year=request.year,
            top_k=request.top_k
        )

        sources = [
            ChunkSource(
                document=s["document"],
                page=s["page"],
                section=s["section"],
                chunk_index=s["chunk_index"]
            )
            for s in result["sources"]
        ]

        return QueryResponse(
            answer=result["answer"],
            sources=sources,
            model=result["model"]
        )

    except Exception as e:
        logger.error(f"Query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))