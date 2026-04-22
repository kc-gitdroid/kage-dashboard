import { NextRequest, NextResponse } from "next/server";

import { processSyncRequest } from "@/server/dashboard-sync-store";
import { DashboardState, SyncOperation } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeOperations(operations: SyncOperation[] | undefined, deviceId: string) {
  const rawOperations = Array.isArray(operations) ? operations : [];

  return rawOperations
    .filter((operation) => operation && typeof operation === "object")
    .map((operation) => {
      const payload =
        operation.payload && typeof operation.payload === "object"
          ? (operation.payload as Record<string, unknown>)
          : {};

      const payloadId = typeof payload.id === "string" ? payload.id : undefined;

      return {
        id: typeof operation.id === "string" ? operation.id : `${deviceId}-op-${Date.now()}`,
        entity: operation.entity,
        action: operation.action === "delete" ? "delete" : "upsert",
        recordId: typeof operation.recordId === "string" ? operation.recordId : payloadId ?? "unknown-record",
        enqueuedAt:
          typeof operation.enqueuedAt === "string" && operation.enqueuedAt.length > 0
            ? operation.enqueuedAt
            : new Date().toISOString(),
        deviceId: typeof operation.deviceId === "string" && operation.deviceId.length > 0 ? operation.deviceId : deviceId,
        attemptCount: Number.isFinite(operation.attemptCount) ? operation.attemptCount : 0,
        payload,
        lastError: typeof operation.lastError === "string" ? operation.lastError : undefined,
      } satisfies SyncOperation;
    });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      deviceId?: string;
      syncMode?: "pull" | "push" | "bootstrap";
      bootstrapAllowed?: boolean;
      operations?: SyncOperation[];
      state?: DashboardState;
    };
    const deviceId = body.deviceId ?? "unknown-device";
    const normalizedOperations = normalizeOperations(body.operations, deviceId);

    console.log("[sync] /api/sync request body summary", {
      deviceId,
      syncMode: body.syncMode ?? "unspecified",
      bootstrapAllowed: body.bootstrapAllowed === true,
      rawOperationCount: body.operations?.length ?? 0,
      normalizedOperationCount: normalizedOperations.length,
      includesStateSnapshot: Boolean(body.state),
      operationIds: normalizedOperations.map((operation) => `${operation.entity}:${operation.recordId}`).slice(0, 25),
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
      deviceId,
      syncMode: body.syncMode,
      bootstrapAllowed: body.bootstrapAllowed === true,
      operations: normalizedOperations,
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
