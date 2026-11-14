import { sql } from "kysely";
import { afterAll, describe, expect, it } from "vitest";
import { db, getPool } from "./index";

/**
 * Round-trips values through the real local Postgres, to prove the pool uses
 * the parsers in ./pg-types.ts. Read-only: it selects literals and touches no
 * tables. Skipped when DATABASE_URL isn't set.
 */
describe.skipIf(!process.env.DATABASE_URL)("database type parsing", () => {
  afterAll(async () => {
    await getPool().end();
    global._pgPool = undefined;
  });

  it("returns BIGINT as a number, DATE as text and TIMESTAMPTZ as a Date", async () => {
    const { rows } = await sql<{
      big: number;
      day: string;
      bigs: number[];
      days: string[];
      at: Date;
    }>`
      SELECT
        9007199254740991::bigint            AS big,
        '2026-11-14'::date                   AS day,
        ARRAY[1, 2]::bigint[]                AS bigs,
        ARRAY['2026-01-01', '2026-02-01']::date[] AS days,
        now()                                AS at
    `.execute(db);

    const row = rows[0];
    expect(row.big).toBe(Number.MAX_SAFE_INTEGER);
    expect(row.day).toBe("2026-11-14");
    expect(row.bigs).toEqual([1, 2]);
    expect(row.days).toEqual(["2026-01-01", "2026-02-01"]);
    expect(row.at).toBeInstanceOf(Date);
  });

  it("rejects a BIGINT too large for JavaScript instead of rounding it", async () => {
    await expect(sql`SELECT 9007199254740993::bigint AS too_big`.execute(db)).rejects.toThrow(
      RangeError,
    );
  });
});
