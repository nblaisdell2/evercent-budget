import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { pgTypes } from "./pg-types";
import type { DB } from "./schema";

/**
 * The app's only connection to Postgres.
 *
 *   import { db } from "@/lib/db";
 *   const user = await db.selectFrom("users").select(["id"]).where("clerk_user_id", "=", id).executeTakeFirst();
 *
 * `db` is a Kysely query builder: you write queries that read like SQL, and
 * TypeScript checks table names, column names and result types against
 * ./schema.ts, which `npm run db:types` generates from the real database.
 * Kysely always sends parameterized SQL, so values can't inject SQL. For the
 * rare query the builder can't express, use its `sql` template tag
 * (`import { sql } from "kysely"`), which is parameterized too.
 *
 * The pool behind it is created lazily, on the first query. That matters:
 * Next.js imports route modules at build time to collect metadata, and the
 * build must not require DATABASE_URL just to import this file.
 *
 * In development, Next.js hot-reloads modules, which would otherwise create a
 * new pool on every reload and exhaust connections, so the pool is stashed on
 * the Node global to survive reloads.
 *
 * Connection config comes entirely from environment variables:
 *   DATABASE_URL  locally: from .env (written by `npm run setup`)
 *                 on Railway: a reference to the Postgres service's
 *                 DATABASE_URL, declared in .railway/railway.ts
 *   DATABASE_SSL  "disable" (default) or "require"; see buildSsl() below
 */

declare global {
  var _pgPool: Pool | undefined;
}

/**
 * Remove the `sslmode` query param from a connection string. pg's
 * connection-string parser turns sslmode into its own TLS settings (recent
 * versions treat sslmode=require as full certificate verification), which
 * would silently override the decision made in buildSsl(). DATABASE_SSL is
 * the single switch, so sslmode is stripped.
 */
function stripSslmode(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    url.searchParams.delete("sslmode");
    return url.toString();
  } catch {
    return connectionString;
  }
}

/**
 * Decide TLS behaviour from DATABASE_SSL:
 *  - "disable" (or unset) -> no TLS. Correct for a local Postgres and for
 *    Railway's private network (postgres.railway.internal), which is already
 *    isolated to your project, so TLS adds nothing there.
 *  - "require" -> encrypted, certificate not verified. Use this only when
 *    connecting through a Railway public TCP proxy (see README),
 *    whose certificate is self-signed.
 */
function buildSsl(): false | { rejectUnauthorized: false } {
  const mode = (process.env.DATABASE_SSL ?? "disable").toLowerCase();
  if (mode === "require") return { rejectUnauthorized: false };
  if (mode !== "disable") {
    console.warn(
      `[db] Unknown DATABASE_SSL="${process.env.DATABASE_SSL}"; expected "disable" or "require". Using "disable".`,
    );
  }
  return false;
}

function createPool(): Pool {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error(
      "DATABASE_URL is not set. Locally, run `npm run setup` (or copy .env.example to .env). " +
        "On Railway it is injected from the Postgres service (see .railway/railway.ts).",
    );
  }

  return new Pool({
    connectionString: stripSslmode(raw),
    ssl: buildSsl(),
    // BIGINT -> number and DATE -> "YYYY-MM-DD"; see ./pg-types.ts.
    types: pgTypes,
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

/** The shared pool, created on first call. Prefer `db`; this is for shutdown and tests. */
export function getPool(): Pool {
  if (!global._pgPool) {
    global._pgPool = createPool();
  }
  return global._pgPool;
}

/**
 * Typed query builder. Creating it opens nothing: Kysely asks for the pool
 * (and getPool() creates it) only when the first query runs.
 */
export const db = new Kysely<DB>({
  dialect: new PostgresDialect({ pool: async () => getPool() }),
});
