import google.generativeai as genai
from groq import Groq
from config import settings
from utils.logger import logger

SYSTEM_PROMPT = """You are FinSight, an expert financial analyst assistant.
You answer questions strictly based on the provided context from financial documents.

Rules:
- Only use information from the provided context
- Always cite which document and section your answer comes from
- If the context doesn't contain enough information, say so clearly
- Format numbers and percentages clearly
- Be concise but complete
- Never hallucinate financial figures
"""

def build_prompt(question: str, context_chunks: list) -> str:
    context_parts = []
    for i, chunk in enumerate(context_chunks):
        meta = chunk["metadata"]
        context_parts.append(
            f"[Source {i+1}: {meta.get('company')} {meta.get('year')} "
            f"— {meta.get('section')} — Page {meta.get('page_num')}]\n"
            f"{chunk['text']}"
        )
    context_str = "\n\n".join(context_parts)
    return f"""CONTEXT:
{context_str}

QUESTION: {question}

ANSWER:"""

def _call_gemini(prompt: str) -> str:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=SYSTEM_PROMPT
    )
    response = model.generate_content(prompt)
    return response.text

def _call_groq(prompt: str) -> str:
    client = Groq(api_key=settings.GROQ_API_KEY)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )
    return response.choices[0].message.content

def generate_answer(question: str, context_chunks: list) -> dict:
    if not context_chunks:
        return {
            "answer": "No relevant documents found. Please upload financial reports first.",
            "model": settings.LLM_PROVIDER,
            "sources": []
        }

    prompt = build_prompt(question, context_chunks)

    try:
        if settings.LLM_PROVIDER == "gemini":
            answer = _call_gemini(prompt)
            model_used = "gemini-2.0-flash"
        else:
            answer = _call_groq(prompt)
            model_used = "llama-3.3-70b-versatile"

        sources = [
            {
                "document": c["metadata"].get("filename"),
                "page": c["metadata"].get("page_num"),
                "section": c["metadata"].get("section"),
                "chunk_index": c["metadata"].get("chunk_index"),
                "score": round(c.get("score", 0), 4)
            }
            for c in context_chunks
        ]

        logger.info(f"[{model_used}] answered with {len(sources)} sources")
        return {
            "answer": answer,
            "model": model_used,
            "sources": sources
        }

    except Exception as e:
        logger.error(f"LLM error ({settings.LLM_PROVIDER}): {e}")
        raise