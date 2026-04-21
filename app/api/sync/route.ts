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
