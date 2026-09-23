from pathlib import Path

from pypdf import PdfReader


def extract_text_from_pdf(file_path: Path) -> str:
    reader = PdfReader(file_path)

    extracted_pages = []

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            extracted_pages.append(page_text)

    return "\n".join(extracted_pages).strip()