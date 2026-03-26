import { NextResponse } from "next/server";

import { getBackendUrl } from "@/lib/backend";

export const runtime = "nodejs";

const ANALYZE_TIMEOUT_MS = 60_000;

function jsonError(detail: string, status: number) {
  return NextResponse.json({ detail }, { status });
}

export async function POST(request: Request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ANALYZE_TIMEOUT_MS);

  try {
    const formData = await request.formData();
    const upstreamResponse = await fetch(
      getBackendUrl("/api/v1/documents/analyze"),
      {
        method: "POST",
        body: formData,
        cache: "no-store",
        signal: controller.signal,
      },
    );
    const responseBody = await upstreamResponse.text();

    return new NextResponse(responseBody, {
      status: upstreamResponse.status,
      headers: {
        "content-type":
          upstreamResponse.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return jsonError("The analysis service timed out.", 504);
    }

    if (error instanceof Error) {
      return jsonError(error.message, 503);
    }

    return jsonError("Could not reach the analysis service.", 503);
  } finally {
    clearTimeout(timeoutId);
  }
}
