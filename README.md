# PaperMind

PaperMind is an elegant, full-stack application that transforms complex PDF and DOCX documents into actionable insights using Google's state-of-the-art Gemini 2.5 Flash AI model.

Built with a sophisticated, editorial-style React frontend and a lightning-fast, highly scalable FastAPI backend.

## 🌟 Features

- **Beautiful UI:** A refined, editorial aesthetic built with Next.js, Tailwind CSS v4, and Framer Motion.
- **Smart Document Processing:** Drag-and-drop support for `.pdf` and `.docx` files with pre-flight size validation (<15MB).
- **Custom Directives:** Instruct the AI exactly how you want your document analyzed (e.g., summarize, extract tables, translate).
- **Real-time Health Monitoring:** The frontend continuously polls the backend and provides a dynamic system status indicator.
- **Production-Ready Architecture:** 
  - FastAPI backend handles asynchronous LLM streaming and strict error logging.
  - Next.js acts as a seamless reverse proxy for internal Docker routing, eliminating CORS and exposing only the frontend to the public internet.

## 🏗️ Architecture & Deployment

The application is fully containerized and orchestrated via Docker Compose.

- **Frontend:** Next.js 16 (React 19) built on a minimal multi-stage Bun Alpine image.
- **Backend:** Python 3.10 FastAPI built with Astral's `uv` package manager for ultra-fast dependency resolution.
- **Networking:** The backend runs on a private Docker bridge network. The frontend securely proxies `/api` and `/health` requests directly to the backend container, meaning port `8000` is never exposed to the outside world.

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

2. **Configure Environment Variables**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and insert your real Gemini API key:
   ```env
   GEMINI_API_KEY=AIzaSyYourRealApiKeyHere
   ```

3. **Spin up the stack**
   ```bash
   docker compose up --build -d
   ```

4. **Access the application**
   Open your browser and navigate to: **http://localhost:3000**

## 🌐 Production Deployment

If you are deploying this to a VPS (e.g., DigitalOcean, Hetzner, AWS EC2):

1. Point your domain (**papermind.byte10x.dev**) to your server's IP address.
2. Clone the repository onto your server.
3. Configure your `.env` file with your `GEMINI_API_KEY`.
4. Run `docker compose up --build -d`.
5. Set up a reverse proxy (like Nginx, Caddy, or Traefik) to route incoming HTTPS traffic on port 443 to the frontend container running on `localhost:3000`.

Because the frontend internally proxies the backend via Docker's bridge network, **you only need to expose port 3000 to your reverse proxy.** The FastAPI backend remains entirely shielded from the public internet.

## 🛠️ Built With

- [Next.js 16](https://nextjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Google Gemini API](https://aistudio.google.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Bun](https://bun.sh/) & [uv](https://github.com/astral-sh/uv)
