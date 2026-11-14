import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests: a real browser clicking through the running app.
 *
 *   npm run test:e2e          run them (starts `npm run dev` if it isn't running)
 *   npm run test:e2e:ui       Playwright's visual runner, to watch and debug
 *
 * Needs the same setup as `npm run dev`: a local Postgres (.env) and Clerk's
 * development keys (.env.local). Tests that need a signed-in user also need
 * E2E_CLERK_USER_EMAIL in .env.local: the email of a test user you created in
 * the Clerk DEVELOPMENT instance (see README "Testing"). Without it those
 * tests are skipped and everything else still runs.
 */

// Next.js reads these files itself; Playwright and the Clerk helpers don't.
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // Missing file: fine, e.g. in CI where variables come from the environment.
  }
}

const PORT = 3000;

export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    // Signs the test user in once and saves the session for the other projects.
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
    {
      // An Android phone (Chromium), the first mobile target.
      name: "phone",
      use: { ...devices["Pixel 7"] },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "npm run dev",
    // Waits for the health check, so tests start once the database and Clerk keys work.
    url: `http://localhost:${PORT}/api/health`,
    // Reuse the dev server you already have open; CI always starts a fresh one.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
