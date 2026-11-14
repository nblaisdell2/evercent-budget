import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// Never cache: Railway calls this during every deploy (healthcheck in
// .railway/railway.ts) and only switches traffic over once it returns 200.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Every page needs Clerk's keys: without them the build still succeeds, but
 * each page answers 500 at runtime. Failing the health check here makes
 * Railway reject that deploy and keep the previous version serving, instead of
 * switching traffic to a broken site. Only checks the keys are present; the
 * values stay out of the response.
 */
function missingClerkKeys(): string[] {
  return ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"].filter(
    (name) => !process.env[name],
  );
}

export async function GET() {
  const started = Date.now();

  const missing = missingClerkKeys();
  if (missing.length > 0) {
    console.error(`[health] Clerk keys missing: ${missing.join(", ")}`);
    return NextResponse.json(
      { status: "misconfigured", auth: "missing keys", missing },
      { status: 503 }
    );
  }

  try {
    const rows = await query<{ now: string }>("SELECT now() AS now");
    return NextResponse.json({
      status: "ok",
      db: "up",
      auth: "configured",
      dbTime: rows[0]?.now ?? null,
      latencyMs: Date.now() - started,
    });
  } catch (err) {
    // Log so the failure shows up in `railway logs`, not just the HTTP response.
    console.error("[health] DB check failed:", err);
    return NextResponse.json(
      {
        status: "degraded",
        db: "down",
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 503 }
    );
  }
}
