from services.retriever import retrieve
from services.llm import generate_answer
import google.generativeai as genai
from groq import Groq
from config import settings
from utils.logger import logger
import json
import os

QUESTIONS = [
    "What was the total revenue?",
    "What are the main risk factors?",
    "What is the net income?",
    "Describe the cash flow from operations.",
    "What are the main business segments?",
    "What was the operating expense?",
    "What dividends were paid?",
    "What are the forward-looking statements?",
    "What is the balance sheet total?",
    "Who are the auditors?"
]

def zero_shot_answer(question: str) -> str:
    """Ask the LLM without any context — pure zero-shot."""
    try:
        if settings.LLM_PROVIDER == "groq":
            client = Groq(api_key=settings.GROQ_API_KEY)
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": question}],
                temperature=0.2
            )
            return response.choices[0].message.content
        else:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-2.0-flash")
            return model.generate_content(question).text
    except Exception as e:
        return f"Error: {e}"

def rag_answer(question: str) -> str:
    """Ask the LLM with RAG context."""
    chunks = retrieve(question)
    result = generate_answer(question, chunks)
    return result["answer"]

def run_benchmark():
    """
    Runs all questions through both zero-shot and RAG.
    Saves results to eval/benchmark_results.json.
    """
    results = []
    logger.info("Starting benchmark...")

    for q in QUESTIONS:
        logger.info(f"Benchmarking: {q}")
        zs = zero_shot_answer(q)
        rag = rag_answer(q)

        results.append({
            "question": q,
            "zero_shot": zs,
            "rag": rag,
        })

    out_path = os.path.join(os.path.dirname(__file__), "benchmark_results.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    logger.info(f"Benchmark complete. Results saved to {out_path}")
    return results

if __name__ == "__main__":
    run_benchmark()