import io
from docx import Document


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extracts text from a DOCX file byte stream."""
    doc = Document(io.BytesIO(file_bytes))
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return "\n".join(full_text)
