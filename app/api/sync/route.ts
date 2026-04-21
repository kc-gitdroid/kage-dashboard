import { NextRequest, NextResponse } from "next/server";

import { processSyncRequest } from "@/server/dashboard-sync-store";
import { SyncOperation } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      deviceId?: string;
      operations?: SyncOperation[];
    };

    const response = await processSyncRequest({
      deviceId: body.deviceId ?? "unknown-device",
      operations: body.operations ?? [],
    });

    return NextResponse.json(response);
  } catch (error) {
    return new NextResponse(error instanceof Error ? error.message : "Sync request failed.", {
      status: 500,
    });
  }
}
