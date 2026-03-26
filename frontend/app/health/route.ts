import { NextResponse } from "next/server";

import { getBackendUrl } from "@/lib/backend";

export const runtime = "nodejs";

const HEALTH_TIMEOUT_MS = 5000;

export async function GET() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

  try {
    const upstreamResponse = await fetch(getBackendUrl("/health"), {
      cache: "no-store",
      signal: controller.signal,
    });
    const responseBody = await upstreamResponse.text();

    return new NextResponse(responseBody, {
      status: upstreamResponse.status,
      headers: {
        "content-type":
          upstreamResponse.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    const detail =
      error instanceof Error && error.name === "AbortError"
        ? "The health check timed out."
        : error instanceof Error
          ? error.message
          : "Could not reach the backend service.";

    return NextResponse.json({ status: "error", detail }, { status: 503 });
  } finally {
    clearTimeout(timeoutId);
  }
}
