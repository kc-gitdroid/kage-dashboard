import { NextRequest, NextResponse } from "next/server";

import { deleteHostedPrompt, listHostedPrompts, upsertHostedPrompt } from "@/server/prompt-store";
import { PromptItem } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function parsePromptBody(request: NextRequest) {
  return (await request.json()) as { promptItem?: PromptItem };
}

export async function GET() {
  try {
    const response = await listHostedPrompts();
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Prompt fetch failed.";
    return NextResponse.json({ error: "Prompt fetch failed.", message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parsePromptBody(request);
    if (!body.promptItem?.id) {
      return NextResponse.json({ error: "Prompt create failed.", message: "Prompt id is required." }, { status: 400 });
    }

    const response = await upsertHostedPrompt(body.promptItem);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Prompt create failed.";
    return NextResponse.json({ error: "Prompt create failed.", message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await parsePromptBody(request);
    if (!body.promptItem?.id) {
      return NextResponse.json({ error: "Prompt update failed.", message: "Prompt id is required." }, { status: 400 });
    }

    const response = await upsertHostedPrompt(body.promptItem);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Prompt update failed.";
    return NextResponse.json({ error: "Prompt update failed.", message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as { id?: string };
    if (!body.id) {
      return NextResponse.json({ error: "Prompt delete failed.", message: "Prompt id is required." }, { status: 400 });
    }

    const response = await deleteHostedPrompt(body.id);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Prompt delete failed.";
    return NextResponse.json({ error: "Prompt delete failed.", message }, { status: 500 });
  }
}
