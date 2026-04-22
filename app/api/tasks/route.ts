import { NextRequest, NextResponse } from "next/server";

import { deleteHostedTask, listHostedTasks, upsertHostedTask } from "@/server/task-store";
import { TaskItem } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await listHostedTasks();
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Task fetch failed.";
    return NextResponse.json({ error: "Task fetch failed.", message }, { status: 500 });
  }
}

async function parseTaskBody(request: NextRequest) {
  return (await request.json()) as { task?: TaskItem };
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseTaskBody(request);
    if (!body.task?.id) {
      return NextResponse.json({ error: "Task create failed.", message: "Task id is required." }, { status: 400 });
    }

    const response = await upsertHostedTask(body.task);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Task create failed.";
    return NextResponse.json({ error: "Task create failed.", message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await parseTaskBody(request);
    if (!body.task?.id) {
      return NextResponse.json({ error: "Task update failed.", message: "Task id is required." }, { status: 400 });
    }

    const response = await upsertHostedTask(body.task);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Task update failed.";
    return NextResponse.json({ error: "Task update failed.", message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as { id?: string };
    if (!body.id) {
      return NextResponse.json({ error: "Task delete failed.", message: "Task id is required." }, { status: 400 });
    }

    const response = await deleteHostedTask(body.id);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Task delete failed.";
    return NextResponse.json({ error: "Task delete failed.", message }, { status: 500 });
  }
}
