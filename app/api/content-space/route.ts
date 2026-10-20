import { NextRequest, NextResponse } from "next/server";

import { getContentSpace, saveContentSpace } from "@/server/content-space-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getContentSpace());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Content space fetch failed.";
    return NextResponse.json({ error: "Content space fetch failed.", message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = (await request.json()) as { body?: unknown };
    if (typeof payload.body !== "string") {
      return NextResponse.json({ error: "Content space save failed.", message: "Body must be a string." }, { status: 400 });
    }

    return NextResponse.json(await saveContentSpace(payload.body));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Content space save failed.";
    return NextResponse.json({ error: "Content space save failed.", message }, { status: 500 });
  }
}
