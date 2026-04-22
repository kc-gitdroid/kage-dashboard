import { NextRequest, NextResponse } from "next/server";

import { deleteHostedNote, listHostedNotes, upsertHostedNote } from "@/server/note-store";
import { NoteItem } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function parseNoteBody(request: NextRequest) {
  return (await request.json()) as { note?: NoteItem };
}

export async function GET() {
  try {
    const response = await listHostedNotes();
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Note fetch failed.";
    return NextResponse.json({ error: "Note fetch failed.", message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseNoteBody(request);
    if (!body.note?.id) {
      return NextResponse.json({ error: "Note create failed.", message: "Note id is required." }, { status: 400 });
    }

    const response = await upsertHostedNote(body.note);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Note create failed.";
    return NextResponse.json({ error: "Note create failed.", message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await parseNoteBody(request);
    if (!body.note?.id) {
      return NextResponse.json({ error: "Note update failed.", message: "Note id is required." }, { status: 400 });
    }

    const response = await upsertHostedNote(body.note);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Note update failed.";
    return NextResponse.json({ error: "Note update failed.", message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as { id?: string };
    if (!body.id) {
      return NextResponse.json({ error: "Note delete failed.", message: "Note id is required." }, { status: 400 });
    }

    const response = await deleteHostedNote(body.id);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Note delete failed.";
    return NextResponse.json({ error: "Note delete failed.", message }, { status: 500 });
  }
}
