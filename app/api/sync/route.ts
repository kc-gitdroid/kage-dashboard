import { NextRequest, NextResponse } from "next/server";

import { processSyncRequest } from "@/server/dashboard-sync-store";
import { DashboardState, SyncOperation } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      deviceId?: string;
      operations?: SyncOperation[];
      state?: DashboardState;
    };

    console.log("[sync] /api/sync request body summary", {
      deviceId: body.deviceId ?? "unknown-device",
      operationCount: body.operations?.length ?? 0,
      operationIds: (body.operations ?? []).map((operation) => `${operation.entity}:${operation.recordId}`).slice(0, 25),
      stateSummary: {
        brands: body.state?.brands?.length ?? 0,
        brandSpaces: body.state?.brandSpaces?.length ?? 0,
        documents: body.state?.documents?.length ?? 0,
        tasks: body.state?.tasks?.length ?? 0,
        notes: body.state?.notes?.length ?? 0,
        calendarItems: body.state?.calendarItems?.length ?? 0,
        projects: body.state?.projects?.length ?? 0,
        contentItems: body.state?.contentItems?.length ?? 0,
        promptItems: body.state?.promptItems?.length ?? 0,
      },
    });

    const response = await processSyncRequest({
      deviceId: body.deviceId ?? "unknown-device",
      operations: body.operations ?? [],
      state: body.state,
    });

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync request failed.";
    const stack = error instanceof Error ? error.stack : undefined;

    console.error("[sync] /api/sync failed", {
      hasUpstashUrl: Boolean(process.env.UPSTASH_REDIS_REST_URL),
      hasUpstashToken: Boolean(process.env.UPSTASH_REDIS_REST_TOKEN),
      message,
      stack,
    });

    return NextResponse.json(
      {
        error: "Sync request failed.",
        message,
      },
      {
        status: 500,
      },
    );
  }
}
