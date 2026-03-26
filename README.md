# PaperMind

PaperMind is a full-stack document analysis app for PDF and DOCX files. Users upload a document, provide an optional analysis prompt, and receive a structured AI-generated summary in the browser.

The stack uses a Next.js frontend and a FastAPI backend, with Gemini handling the document analysis.

## Features

- Drag-and-drop upload for `.pdf` and `.docx` files
- Custom analysis prompts
- Health status indicator in the frontend
- Server-side proxying from Next.js to FastAPI
- Env-based configuration for local and Docker setups
- Improved validation and clearer request failure messages

## Architecture

The app has two services:

- `frontend/`: Next.js 16 on Bun
- `backend/`: FastAPI on Python 3.10 with `uv`

Browser requests never call the backend host directly. The frontend sends requests to its own route handlers at `/api/v1/documents/analyze` and `/health`, and those route handlers proxy the request to the backend using the server-side `BACKEND_URL` env var. That keeps backend addresses out of browser code and makes Docker networking simpler.

In Docker, the frontend should use `http://backend:8000`. For local development, the frontend should use `http://127.0.0.1:8000`.

## Prerequisites

- Docker & Docker Compose
- Bun
- Python 3.10+
- `uv`
- A Google Gemini API Key

## Run With Docker

1. Clone the repository:
   ```bash
   git clone git@github.com:abenable/papermind.git
   cd papermind
   ```

2. Create the backend env file:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Set your Gemini API key in `backend/.env`:
   ```env
   GEMINI_API_KEY=your-gemini-api-key
   ```

3. Create the frontend env file:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

4. Start the stack:
   ```bash
   docker compose up --build -d
   ```

5. Open `http://localhost:3000`.

The backend is only exposed on the internal Docker network. The only public port in this setup is the frontend on `3000`.

## Run Locally Without Docker

1. Set up the backend env:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Start the backend:
   ```bash
   cd backend
   uv sync
   uv run fastapi dev main.py
   ```

3. Set up frontend env for local development:
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```
   Then set:
   ```env
   BACKEND_URL=http://127.0.0.1:8000
   ```

4. Start the frontend:
   ```bash
   cd frontend
   bun install
   bun run dev
   ```

5. Open `http://localhost:3000`.

## Environment Variables

### `backend/.env`

```env
GEMINI_API_KEY=your-gemini-api-key
BACKEND_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### `frontend/.env` for Docker

```env
BACKEND_URL=http://backend:8000
```

### `frontend/.env.local` for local frontend development

```env
BACKEND_URL=http://127.0.0.1:8000
```

## Error Handling

- The frontend validates supported file types and file size before upload.
- Next.js proxy routes return `503` or `504` when the backend is unavailable or times out.
- The backend validates MIME type, file size, empty files, unreadable DOCX files, and empty extracted text.
- Backend errors are converted into consistent JSON responses with a `detail` message.

## Verification

The current setup has been verified with:

- `bun run lint`
- `bun run build`
- `uv run python -m compileall app main.py`

## Stack

- [Next.js 16](https://nextjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Google Gemini API](https://aistudio.google.com/)
- [Bun](https://bun.sh/) & [uv](https://github.com/astral-sh/uv)
