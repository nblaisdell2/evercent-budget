import { describe, expect, it } from "vitest";
import { PG_TYPE, parseDate, parseInt8, parseInt8Array, pgTypes } from "./pg-types";

describe("parseInt8 (BIGINT)", () => {
  it("returns a number, not a string", () => {
    expect(parseInt8("123456")).toBe(123_456);
    expect(parseInt8("-5")).toBe(-5);
    expect(parseInt8("0")).toBe(0);
  });

  it("refuses a value JavaScript can't hold exactly", () => {
    expect(parseInt8(String(Number.MAX_SAFE_INTEGER))).toBe(Number.MAX_SAFE_INTEGER);
    expect(() => parseInt8("9007199254740993")).toThrow(RangeError);
  });
});

describe("parseDate (DATE)", () => {
  it("keeps the calendar day as text, never a Date", () => {
    expect(parseDate("2026-11-14")).toBe("2026-11-14");
  });
});

describe("parseInt8Array (BIGINT[])", () => {
  it("parses each element, keeping NULLs", () => {
    expect(parseInt8Array("{1,2,NULL}")).toEqual([1, 2, null]);
  });
});

describe("pgTypes", () => {
  const parser = (oid: number) => pgTypes.getTypeParser(oid, "text") as (v: string) => unknown;

  it("uses the app's parsers for BIGINT and DATE", () => {
    expect(parser(PG_TYPE.INT8)("42")).toBe(42);
    expect(parser(PG_TYPE.DATE)("2026-02-01")).toBe("2026-02-01");
    expect(parser(PG_TYPE.DATE_ARRAY)("{2026-01-01,2026-02-01}")).toEqual([
      "2026-01-01",
      "2026-02-01",
    ]);
  });

  it("leaves every other type to pg's defaults", () => {
    const INT4 = 23;
    const BOOL = 16;
    expect(parser(INT4)("7")).toBe(7);
    expect(parser(BOOL)("t")).toBe(true);
  });
});
