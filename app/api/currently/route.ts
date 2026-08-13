import { NextRequest, NextResponse } from "next/server";

import { getCurrently, saveCurrently } from "@/server/currently-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getCurrently());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Currently fetch failed.";
    return NextResponse.json({ error: "Currently fetch failed.", message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = (await request.json()) as { body?: unknown };
    if (typeof payload.body !== "string") {
      return NextResponse.json({ error: "Currently save failed.", message: "Body must be a string." }, { status: 400 });
    }

    return NextResponse.json(await saveCurrently(payload.body));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Currently save failed.";
    return NextResponse.json({ error: "Currently save failed.", message }, { status: 500 });
  }
}
