from pydantic import BaseModel

class QueryRequest(BaseModel):
    question: str
    company: str | None = None
    year: int | None = None
    top_k: int = 5