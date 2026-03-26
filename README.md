# PaperMind

PaperMind is a full-stack application that transforms PDF and DOCX documents into actionable insights using Google's Gemini models.

It uses a Next.js frontend and a FastAPI backend.

## 🌟 Features

- **Beautiful UI:** A refined, editorial aesthetic built with Next.js, Tailwind CSS v4, and Framer Motion.
- **Smart Document Processing:** Drag-and-drop support for `.pdf` and `.docx` files with pre-flight size validation (<15MB).
- **Custom Directives:** Instruct the AI exactly how you want your document analyzed (e.g., summarize, extract tables, translate).
- **Real-time Health Monitoring:** The frontend continuously polls the backend and provides a dynamic system status indicator.
- **Production-Ready Architecture:**
  - FastAPI handles validation, parsing, and Gemini requests.
  - Next.js proxies browser traffic through server-side route handlers, so the browser never needs to know the backend host.

## 🏗️ Architecture & Deployment

The application is containerized and orchestrated with Docker Compose.

- **Frontend:** Next.js 16 (React 19) built on a minimal multi-stage Bun Alpine image.
- **Backend:** Python 3.10 FastAPI built with Astral's `uv` package manager for ultra-fast dependency resolution.
- **Networking:** The backend stays on the internal Docker network. The frontend proxies `/api` and `/health` requests to it with `BACKEND_URL` from `frontend/.env`.

## 🚀 Getting Started Locally

### Prerequisites
- Docker & Docker Compose
- A Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/papermind.git
   cd papermind
   ```

2. **Configure the backend environment**
   ```bash
   cp backend/.env.example backend/.env
   ```
   Open `backend/.env` and insert your real Gemini API key:
   ```env
   GEMINI_API_KEY=AIzaSyYourRealApiKeyHere
   ```

3. **Configure the frontend environment for Docker**
   ```bash
   cp frontend/.env.example frontend/.env
   ```

4. **Spin up the stack**
   ```bash
   docker compose up --build -d
   ```

5. **Access the application**
   Open your browser and navigate to: **http://localhost:3000**

### Local Development Without Docker

1. Start the backend from [backend/main.py](/home/able/Projects/feyti/papermind/backend/main.py).
2. Copy the frontend example env for local development:
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```
3. Change `BACKEND_URL` in `frontend/.env.local` to `http://127.0.0.1:8000`.
4. Run the frontend with `bun run dev` inside `frontend/`.

## 🌐 Production Deployment

If you are deploying this to a VPS (e.g., DigitalOcean, Hetzner, AWS EC2):

1. Point your domain (**papermind.byte10x.dev**) to your server's IP address.
2. Clone the repository onto your server.
3. Configure `backend/.env` and `frontend/.env` for that server.
4. Run `docker compose up --build -d`.
5. Set up a reverse proxy (Nginx, Caddy, or Traefik) to route incoming HTTPS traffic on port 443 to the frontend container on `localhost:3000`.

Because the frontend proxies the backend over Docker's internal network, only the frontend needs to be exposed to the reverse proxy. The FastAPI backend stays private.

## 🛠️ Built With

- [Next.js 16](https://nextjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Google Gemini API](https://aistudio.google.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Bun](https://bun.sh/) & [uv](https://github.com/astral-sh/uv)
