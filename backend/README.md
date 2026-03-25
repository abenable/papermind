# PaperMind Backend

This is the FastAPI backend for PaperMind. It provides endpoints for analyzing documents (PDF and DOCX) using the Google Gemini API.

## Requirements

- Python 3.10+
- [uv](https://github.com/astral-sh/uv) (recommended) or `pip`

## Setup

1. Install dependencies:
   ```bash
   uv sync
   # OR: pip install -r requirements.txt (if exported)
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your Gemini API key.
   ```bash
   cp .env.example .env
   ```

3. Run the development server:
   ```bash
   uv run fastapi dev main.py
   ```

## API Endpoints

### `POST /api/v1/documents/analyze`
Upload a PDF or DOCX file to be analyzed by Gemini.

**Parameters:**
- `file`: The document file to upload.
- `prompt` (optional): Instructions for the LLM (default: "Please summarize this document comprehensively.").

**Response:**
```json
{
  "summary": "The generated summary text...",
  "metadata": {
    "filename": "document.pdf",
    "content_type": "application/pdf",
    "size_bytes": 102450
  }
}
```
