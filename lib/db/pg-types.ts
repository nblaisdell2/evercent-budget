import { types, type CustomTypesConfig } from "pg";

/**
 * How Postgres values become JavaScript values. Two of pg's defaults are wrong
 * for this app, so the pool in ./index.ts uses these parsers instead:
 *
 *  - BIGINT (int8) normally arrives as a STRING, because a 64-bit integer can
 *    exceed JavaScript's safe range. Money is stored as BIGINT cents and ids
 *    are BIGSERIAL, so both would show up as "123456". Here they become
 *    numbers, and a value too large to represent exactly throws instead of
 *    silently losing precision (2^53 cents is about $90 trillion).
 *
 *  - DATE normally becomes a JS Date at midnight in the SERVER's timezone,
 *    which then shifts by a day when shown in another timezone. Paydays and
 *    due dates are calendar days, not instants, so they stay "2026-11-14".
 *
 * TIMESTAMPTZ keeps pg's default (a Date). That is correct: it is an instant.
 * Use TIMESTAMPTZ, never TIMESTAMP (without time zone), for instants.
 *
 * kysely-codegen is configured to match (.kysely-codegenrc.json), so the
 * generated types in ./schema.ts agree with what these parsers return.
 */

/** Postgres type ids (OIDs) for the types handled here. */
export const PG_TYPE = {
  INT8: 20,
  DATE: 1082,
  TEXT_ARRAY: 1009,
  INT8_ARRAY: 1016,
  DATE_ARRAY: 1182,
} as const;

/** BIGINT text -> number, refusing values JavaScript can't hold exactly. */
export function parseInt8(value: string): number {
  const n = Number(value);
  if (!Number.isSafeInteger(n)) {
    throw new RangeError(`BIGINT value ${value} is outside JavaScript's safe integer range.`);
  }
  return n;
}

/** DATE text is already "YYYY-MM-DD"; keep it exactly as Postgres sent it. */
export function parseDate(value: string): string {
  return value;
}

/** pg's own parser lookup, typed to accept any OID (its typings list only scalar types). */
const builtinParser = types.getTypeParser as (
  oid: number,
  format?: "text" | "binary",
) => (value: string) => unknown;

const parseTextArray = builtinParser(PG_TYPE.TEXT_ARRAY) as (value: string) => (string | null)[];

export function parseInt8Array(value: string): (number | null)[] {
  return parseTextArray(value).map((item) => (item === null ? null : parseInt8(item)));
}

export function parseDateArray(value: string): (string | null)[] {
  return parseTextArray(value);
}

/** Passed to `new Pool({ types })`, so the overrides apply to this app's pool only. */
export const pgTypes: CustomTypesConfig = {
  getTypeParser: ((oid: number, format?: "text" | "binary") => {
    switch (oid) {
      case PG_TYPE.INT8:
        return parseInt8;
      case PG_TYPE.DATE:
        return parseDate;
      case PG_TYPE.INT8_ARRAY:
        return parseInt8Array;
      case PG_TYPE.DATE_ARRAY:
        return parseDateArray;
      default:
        return builtinParser(oid, format);
    }
  }) as CustomTypesConfig["getTypeParser"],
};
