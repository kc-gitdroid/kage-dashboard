import { NextRequest, NextResponse } from "next/server";

import { deleteHostedTask, listHostedTasks, upsertHostedTask } from "@/server/task-store";
import { TaskItem } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await listHostedTasks();
    console.log("[tasks-api] task list returned", {
      count: response.tasks.length,
      canonicalUpdatedAt: response.canonicalUpdatedAt,
    });
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

    console.log("[tasks-api] create request received", {
      taskId: body.task.id,
      title: body.task.title,
    });
    const response = await upsertHostedTask(body.task);
    console.log("[tasks-api] task persisted", {
      taskId: response.task?.id ?? body.task.id,
      count: response.tasks.length,
      canonicalUpdatedAt: response.canonicalUpdatedAt,
    });
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

    console.log("[tasks-api] update request received", {
      taskId: body.task.id,
      title: body.task.title,
    });
    const response = await upsertHostedTask(body.task);
    console.log("[tasks-api] task persisted", {
      taskId: response.task?.id ?? body.task.id,
      count: response.tasks.length,
      canonicalUpdatedAt: response.canonicalUpdatedAt,
    });
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

    console.log("[tasks-api] delete request received", {
      taskId: body.id,
    });
    const response = await deleteHostedTask(body.id);
    console.log("[tasks-api] task persisted", {
      taskId: body.id,
      count: response.tasks.length,
      canonicalUpdatedAt: response.canonicalUpdatedAt,
    });
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Task delete failed.";
    return NextResponse.json({ error: "Task delete failed.", message }, { status: 500 });
  }
}
