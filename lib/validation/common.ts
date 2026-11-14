import { z } from "zod";

/**
 * Zod schemas for the values that show up all over EverCent. Build the input
 * schema for each server action or API route from these, so "what is a valid
 * amount / month / date / id" is decided once.
 *
 * Plain TypeScript with no Next.js or database imports, so a future Expo app
 * can validate forms with the exact same rules before sending them.
 */

/** Money: whole cents, never fractional dollars. 2^53 cents is about $90 trillion. */
export const centsSchema = z.int({ error: "Amount must be a whole number of cents." });

/** Money that can't be negative, such as a goal or a transaction amount. */
export const nonNegativeCentsSchema = centsSchema.nonnegative({
  error: "Amount can't be negative.",
});

/** "2026-11": the month a budget belongs to (MonthKey in lib/domain/types.ts). */
export const monthKeySchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, { error: "Expected a month like 2026-11." });

/** "2026-11-14": a calendar day such as a payday or due date (a Postgres DATE). */
export const isoDateSchema = z.iso.date({ error: "Expected a date like 2026-11-14." });

/**
 * A database id (BIGSERIAL). Accepts the number or its string form, because
 * ids that come from a URL or form field arrive as text.
 */
export const idSchema = z.coerce
  .number({ error: "Expected an id." })
  .pipe(z.int().positive({ error: "Expected an id." }));

/** Trimmed, non-empty text such as a category or payee name. */
export const nameSchema = z
  .string()
  .trim()
  .min(1, { error: "Name can't be empty." })
  .max(100, { error: "Name is too long." });
