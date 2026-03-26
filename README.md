# PaperMind

PaperMind is a full-stack document analysis app for PDF and DOCX files. Users upload a document, provide an optional analysis prompt, and receive a structured AI-generated summary in the browser.

The stack uses a Next.js frontend and a FastAPI backend, with Gemini handling the document analysis.

## Features

- Drag-and-drop upload for `.pdf` and `.docx` files
- Custom analysis prompts
- Health status indicator in the frontend
- Direct browser-to-API communication
- Env-based configuration for local and Docker setups
- Improved validation and clearer request failure messages

## Architecture

The app has two services:

- `frontend/`: Next.js 16 on Bun
- `backend/`: FastAPI on Python 3.10 with `uv`

The browser calls the backend directly using `NEXT_PUBLIC_API_URL`. In production, that should be the public API domain, such as `https://api-papermind.byte10x.dev`. In local development, it can point to `http://127.0.0.1:8000`.

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
   Set the public API origin in `frontend/.env`:
   ```env
   NEXT_PUBLIC_API_URL=https://api-papermind.byte10x.dev
   ```

4. Start the stack:
   ```bash
   docker compose up --build -d
   ```

5. Open `http://localhost:3000`.

Because `NEXT_PUBLIC_API_URL` is embedded into the frontend bundle, changing `frontend/.env` requires rebuilding the frontend image.

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
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
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
BACKEND_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://papermind.byte10x.dev
```

### `frontend/.env` for Docker

```env
NEXT_PUBLIC_API_URL=https://api-papermind.byte10x.dev
```

### `frontend/.env.local` for local frontend development

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## Error Handling

- The frontend validates supported file types and file size before upload.
- The frontend surfaces backend `detail` messages when the API returns an error.
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
