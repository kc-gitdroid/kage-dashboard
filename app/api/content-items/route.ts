import { NextRequest, NextResponse } from "next/server";

import { deleteHostedContentItem, listHostedContentItems, upsertHostedContentItem } from "@/server/content-store";
import { ContentItem } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function parseContentBody(request: NextRequest) {
  return (await request.json()) as { contentItem?: ContentItem };
}

export async function GET() {
  try {
    const response = await listHostedContentItems();
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Content fetch failed.";
    return NextResponse.json({ error: "Content fetch failed.", message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseContentBody(request);
    if (!body.contentItem?.id) {
      return NextResponse.json({ error: "Content create failed.", message: "Content item id is required." }, { status: 400 });
    }

    const response = await upsertHostedContentItem(body.contentItem);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Content create failed.";
    return NextResponse.json({ error: "Content create failed.", message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await parseContentBody(request);
    if (!body.contentItem?.id) {
      return NextResponse.json({ error: "Content update failed.", message: "Content item id is required." }, { status: 400 });
    }

    const response = await upsertHostedContentItem(body.contentItem);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Content update failed.";
    return NextResponse.json({ error: "Content update failed.", message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as { id?: string };
    if (!body.id) {
      return NextResponse.json({ error: "Content delete failed.", message: "Content item id is required." }, { status: 400 });
    }

    const response = await deleteHostedContentItem(body.id);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Content delete failed.";
    return NextResponse.json({ error: "Content delete failed.", message }, { status: 500 });
  }
}
