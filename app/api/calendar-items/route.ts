import { NextRequest, NextResponse } from "next/server";

import { deleteHostedCalendarItem, listHostedCalendarItems, upsertHostedCalendarItem } from "@/server/calendar-store";
import { CalendarItem } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function parseCalendarBody(request: NextRequest) {
  return (await request.json()) as { calendarItem?: CalendarItem };
}

export async function GET() {
  try {
    const response = await listHostedCalendarItems();
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Calendar fetch failed.";
    return NextResponse.json({ error: "Calendar fetch failed.", message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseCalendarBody(request);
    if (!body.calendarItem?.id) {
      return NextResponse.json({ error: "Calendar create failed.", message: "Calendar item id is required." }, { status: 400 });
    }

    const response = await upsertHostedCalendarItem(body.calendarItem);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Calendar create failed.";
    return NextResponse.json({ error: "Calendar create failed.", message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await parseCalendarBody(request);
    if (!body.calendarItem?.id) {
      return NextResponse.json({ error: "Calendar update failed.", message: "Calendar item id is required." }, { status: 400 });
    }

    const response = await upsertHostedCalendarItem(body.calendarItem);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Calendar update failed.";
    return NextResponse.json({ error: "Calendar update failed.", message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as { id?: string };
    if (!body.id) {
      return NextResponse.json({ error: "Calendar delete failed.", message: "Calendar item id is required." }, { status: 400 });
    }

    const response = await deleteHostedCalendarItem(body.id);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Calendar delete failed.";
    return NextResponse.json({ error: "Calendar delete failed.", message }, { status: 500 });
  }
}
