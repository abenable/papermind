# PaperMind Backend

This is the FastAPI backend for PaperMind. It accepts uploaded PDF and DOCX files, validates them, sends them to Gemini for analysis, and returns a structured summary response.

## Requirements

- Python 3.10+
- [uv](https://github.com/astral-sh/uv)

## Environment

Copy the example env file:

```bash
cp .env.example .env
```

Supported variables:

```env
GEMINI_API_KEY=your-gemini-api-key
BACKEND_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

`GEMINI_API_KEY` is required.

## Local Development

1. Install dependencies:
   ```bash
   uv sync
   ```

2. Start the API:
   ```bash
   uv run fastapi dev main.py
   ```

3. Health check:
   ```bash
   curl http://127.0.0.1:8000/health
   ```

## Responsibilities

The backend is responsible for:

- validating upload MIME types
- enforcing the 15MB upload limit
- parsing DOCX files into text
- forwarding content to Gemini
- mapping failures into consistent JSON error responses
- returning metadata about the analyzed document

## API Endpoints

### `POST /api/v1/documents/analyze`
Upload a PDF or DOCX file for analysis.

Parameters:
- `file`: The document file to upload.
- `prompt` (optional): Instructions for the LLM (default: "Please summarize this document comprehensively.").

Successful response:
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

Possible error responses:
- `400` for empty files, invalid prompts, or unreadable DOCX content
- `413` for files above 15MB
- `415` for unsupported file types
- `502` for upstream Gemini failures

### `GET /health`

Returns:

```json
{
  "status": "ok"
}
```
