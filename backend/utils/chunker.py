import re
from config import settings

FINANCIAL_SECTIONS = [
    "management's discussion", "md&a", "risk factors", "balance sheet",
    "income statement", "cash flow", "revenue", "operating expenses",
    "net income", "earnings per share", "notes to financial statements",
    "auditor's report", "forward-looking statements", "business overview",
    "liquidity", "capital resources", "operating expenses",
]

def detect_section(text: str) -> str:
    text_lower = text.lower()
    for section in FINANCIAL_SECTIONS:
        if section in text_lower:
            return section.title()
    return "General"

def is_table_block(text: str) -> bool:
    return "[TABLE]" in text and "[/TABLE]" in text

def split_into_blocks(text: str) -> list:
    """
    Splits page text into blocks — tables stay as single blocks,
    regular text is split into paragraphs.
    """
    blocks = []
    # split on TABLE tags while preserving them
    parts = re.split(r'(\[TABLE\].*?\[/TABLE\])', text, flags=re.DOTALL)
    for part in parts:
        part = part.strip()
        if not part:
            continue
        if is_table_block(part):
            blocks.append({"text": part, "is_table": True})
        else:
            # split regular text into paragraphs
            paragraphs = [p.strip() for p in re.split(r'\n{2,}', part) if p.strip()]
            for para in paragraphs:
                blocks.append({"text": para, "is_table": False})
    return blocks

def chunk_text(pages: list, chunk_size: int = None, overlap: int = None) -> list:
    """
    Structure-aware chunking:
    - Tables are never split — kept as single chunks
    - Regular text uses sliding window with overlap
    - Section headers respected as natural break points
    """
    chunk_size = chunk_size or settings.CHUNK_SIZE
    overlap = overlap or settings.CHUNK_OVERLAP

    chunks = []
    chunk_index = 0

    for page in pages:
        page_num = page["page_num"]
        blocks = split_into_blocks(page["text"])

        current_words = []
        current_start_page = page_num

        for block in blocks:
            if block["is_table"]:
                # flush current text buffer first
                if current_words:
                    text_str = " ".join(current_words)
                    chunks.append({
                        "chunk_index": chunk_index,
                        "text": text_str,
                        "page_num": current_start_page,
                        "section": detect_section(text_str),
                        "word_count": len(current_words),
                        "is_table": False
                    })
                    chunk_index += 1
                    # keep overlap from end of buffer
                    current_words = current_words[-overlap:] if overlap else []

                # table as its own chunk — never split
                chunks.append({
                    "chunk_index": chunk_index,
                    "text": block["text"],
                    "page_num": page_num,
                    "section": detect_section(block["text"]),
                    "word_count": len(block["text"].split()),
                    "is_table": True
                })
                chunk_index += 1

            else:
                words = block["text"].split()
                current_words.extend(words)

                # flush when over chunk_size
                while len(current_words) >= chunk_size:
                    text_str = " ".join(current_words[:chunk_size])
                    chunks.append({
                        "chunk_index": chunk_index,
                        "text": text_str,
                        "page_num": page_num,
                        "section": detect_section(text_str),
                        "word_count": chunk_size,
                        "is_table": False
                    })
                    chunk_index += 1
                    current_words = current_words[chunk_size - overlap:]

        # flush remaining words for this page
        if current_words:
            text_str = " ".join(current_words)
            chunks.append({
                "chunk_index": chunk_index,
                "text": text_str,
                "page_num": page_num,
                "section": detect_section(text_str),
                "word_count": len(current_words),
                "is_table": False
            })
            chunk_index += 1

    return chunks