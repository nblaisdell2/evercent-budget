import path from "node:path";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { configDefaults, defineConfig } from "vitest/config";

/**
 * Vitest runs the fast tests: `npm test` (once) or `npm run test:watch`.
 * End-to-end browser tests are Playwright's job (e2e/, `npm run test:e2e`).
 *
 * Three groups, picked by file name:
 *   *.test.ts       logic (lib/domain, reducers, formatting): plain Node, fastest
 *   *.test.tsx      React components, rendered into a simulated browser (jsdom)
 *   *.db.test.ts    talks to the real local Postgres from .env; skipped when
 *                   DATABASE_URL isn't set
 */
export default defineConfig(({ mode }) => {
  // Only the database settings from .env, so tests never see the Clerk keys.
  const env = loadEnv(mode, process.cwd(), "");
  const dbEnv = Object.fromEntries(
    ["DATABASE_URL", "DATABASE_SSL"]
      .filter((key) => env[key] !== undefined && process.env[key] === undefined)
      .map((key) => [key, env[key]]),
  );

  return {
    plugins: [react()],
    resolve: { alias: { "@": path.resolve(import.meta.dirname, ".") } },
    test: {
      env: dbEnv,
      exclude: [...configDefaults.exclude, "e2e/**", ".next/**"],
      projects: [
        {
          extends: true,
          test: {
            name: "unit",
            environment: "node",
            include: ["**/*.test.ts"],
            exclude: [...configDefaults.exclude, "**/*.db.test.ts", "e2e/**", ".next/**"],
          },
        },
        {
          extends: true,
          test: {
            name: "components",
            environment: "jsdom",
            include: ["**/*.test.tsx"],
            exclude: [...configDefaults.exclude, "e2e/**", ".next/**"],
            setupFiles: ["./vitest.setup.ts"],
          },
        },
        {
          extends: true,
          test: {
            name: "db",
            environment: "node",
            include: ["**/*.db.test.ts"],
            exclude: [...configDefaults.exclude, "e2e/**", ".next/**"],
          },
        },
      ],
    },
  };
});
