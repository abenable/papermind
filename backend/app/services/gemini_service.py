from google import genai
from google.genai import types

from app.core.config import settings
from app.services.document_parser import extract_text_from_docx

# Initialize client using API key from settings
client = genai.Client(api_key=settings.GEMINI_API_KEY)


async def analyze_document(
    file_bytes: bytes,
    mime_type: str,
    prompt: str = "Please summarize the following document:",
) -> str:
    """Sends document content to Gemini for analysis."""
    contents = []

    if mime_type == "application/pdf":
        contents.append(
            types.Part.from_bytes(data=file_bytes, mime_type="application/pdf")
        )
    elif (
        mime_type
        == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ):
        text_content = extract_text_from_docx(file_bytes)
        contents.append(text_content)
    else:
        raise ValueError(f"Unsupported file type: {mime_type}")

    contents.append(prompt)

    try:
        response = await client.aio.models.generate_content(
            model="gemini-3.1-flash-lite-preview", contents=contents
        )
        return response.text
    except Exception as e:
        raise RuntimeError(f"Failed to generate content: {str(e)}")
