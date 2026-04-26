import pdfplumber
import os
from utils.logger import logger

def parse_pdf(file_path: str) -> dict:
    """
    Extracts text and tables from each page using pdfplumber.
    Preserves layout — critical for financial tables and multi-column reports.
    Returns dict with total pages and list of {page_num, text}.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"PDF not found: {file_path}")

    pages = []
    total_pages = 0

    with pdfplumber.open(file_path) as pdf:
        total_pages = len(pdf.pages)

        for i, page in enumerate(pdf.pages):
            page_num = i + 1
            parts = []

            # extract tables first — preserve structure as pipe-delimited text
            tables = page.extract_tables()
            for table in tables:
                if not table:
                    continue
                rows = []
                for row in table:
                    clean = [str(cell).strip() if cell else "" for cell in row]
                    rows.append(" | ".join(clean))
                table_text = "\n".join(rows)
                if table_text.strip():
                    parts.append(f"[TABLE]\n{table_text}\n[/TABLE]")

            # extract regular text (excluding table regions)
            text = page.extract_text(layout=True)
            if text and text.strip():
                parts.append(text.strip())

            combined = "\n\n".join(parts)
            if combined.strip():
                pages.append({
                    "page_num": page_num,
                    "text": combined
                })

    logger.info(f"Parsed {file_path} — {total_pages} pages, {len(pages)} non-empty")

    return {
        "total_pages": total_pages,
        "pages": pages,
        "filename": os.path.basename(file_path)
    }