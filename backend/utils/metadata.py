import re
import os

def extract_metadata_from_filename(filename: str) -> dict:
    """
    Extracts company and year from filename.
    Expected formats:
      - apple_2023.pdf
      - TSLA_annual_report_2022.pdf
      - microsoft-10k-2021.pdf
    """
    name = os.path.splitext(filename)[0].lower()
    name = re.sub(r'[-_]', ' ', name)

    # extract year
    year_match = re.search(r'\b(20\d{2})\b', name)
    year = int(year_match.group(1)) if year_match else None

    # extract company (first word before year)
    company_match = re.match(r'^([a-z]+)', name)
    company = company_match.group(1).title() if company_match else "Unknown"

    return {
        "company": company,
        "year": year,
        "filename": filename
    }

def attach_metadata_to_chunks(chunks: list, filename: str) -> list:
    """
    Attaches company, year, filename to every chunk.
    """
    meta = extract_metadata_from_filename(filename)

    for chunk in chunks:
        chunk["company"] = meta["company"]
        chunk["year"] = meta["year"]
        chunk["filename"] = meta["filename"]

    return chunks