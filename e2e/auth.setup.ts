import { clerk } from "@clerk/testing/playwright";
import { expect, test as setup } from "@playwright/test";
import { AUTH_FILE } from "./auth-file";

/**
 * Signs in the test user once and saves the session to e2e/.auth (gitignored),
 * so signed-in tests start already logged in.
 *
 * Uses Clerk's sign-in token for the user with E2E_CLERK_USER_EMAIL, so no
 * password is involved. Skipped when that variable isn't set.
 */
setup("sign in the test user", async ({ page }) => {
  const email = process.env.E2E_CLERK_USER_EMAIL;
  setup.skip(!email, "Set E2E_CLERK_USER_EMAIL in .env.local to run signed-in tests.");

  await page.goto("/");
  await clerk.signIn({ page, emailAddress: email! });
  await page.goto("/budget");
  await expect(page.getByRole("treegrid", { name: "Budget" })).toBeVisible();
  await page.context().storageState({ path: AUTH_FILE });
});
