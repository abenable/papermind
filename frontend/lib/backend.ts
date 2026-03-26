import "server-only";

function readBackendUrl() {
  const backendUrl = process.env.BACKEND_URL?.trim();

  if (!backendUrl) {
    throw new Error(
      "BACKEND_URL is not configured. Set it in frontend/.env or frontend/.env.local.",
    );
  }

  return backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl;
}

export function getBackendUrl(path: string) {
  return `${readBackendUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
