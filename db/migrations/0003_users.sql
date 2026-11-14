-- EverCent's own record of each person who signs in.
--
-- Clerk owns the account itself (email, password, social logins, sessions).
-- This table is the bridge: one row per Clerk user, created the first time
-- they open the app (see ensureUser() in lib/data/users.ts). Budgets and
-- everything else should reference users.id, not the Clerk id, so the app's
-- data never depends on the auth provider's id format.

CREATE TABLE IF NOT EXISTS users (
  id             BIGSERIAL PRIMARY KEY,
  clerk_user_id  TEXT NOT NULL UNIQUE,
  email          TEXT,
  name           TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
