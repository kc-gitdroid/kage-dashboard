import { NextRequest, NextResponse } from "next/server";

import { deleteHostedProject, listHostedProjects, upsertHostedProject } from "@/server/project-store";
import { ProjectItem } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function parseProjectBody(request: NextRequest) {
  return (await request.json()) as { project?: ProjectItem };
}

export async function GET() {
  try {
    const response = await listHostedProjects();
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Project fetch failed.";
    return NextResponse.json({ error: "Project fetch failed.", message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseProjectBody(request);
    if (!body.project?.id) {
      return NextResponse.json({ error: "Project create failed.", message: "Project id is required." }, { status: 400 });
    }

    const response = await upsertHostedProject(body.project);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Project create failed.";
    return NextResponse.json({ error: "Project create failed.", message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await parseProjectBody(request);
    if (!body.project?.id) {
      return NextResponse.json({ error: "Project update failed.", message: "Project id is required." }, { status: 400 });
    }

    const response = await upsertHostedProject(body.project);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Project update failed.";
    return NextResponse.json({ error: "Project update failed.", message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as { id?: string };
    if (!body.id) {
      return NextResponse.json({ error: "Project delete failed.", message: "Project id is required." }, { status: 400 });
    }

    const response = await deleteHostedProject(body.id);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Project delete failed.";
    return NextResponse.json({ error: "Project delete failed.", message }, { status: 500 });
  }
}
