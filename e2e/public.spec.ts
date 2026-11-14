import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";

/** Pages anyone can see, signed in or not. */

test("the landing page explains EverCent and offers both ways in", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Six months ahead on every bill.",
  );
  // The hero and the closing call to action both offer it.
  const createLinks = page.getByRole("link", { name: "Create your budget" });
  await expect(createLinks).toHaveCount(2);
  for (const link of await createLinks.all()) {
    await expect(link).toHaveAttribute("href", "/sign-up");
  }
  const account = page.getByRole("navigation", { name: "Account" });
  await expect(account.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/sign-in");
});

test("the health check reports the database and sign-in are working", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);
  expect(await response.json()).toMatchObject({ status: "ok", db: "up", auth: "configured" });
});

test("signed-out visitors to the budget are sent to log in, then back", async ({ page }) => {
  await page.goto("/budget");
  await expect(page).toHaveURL(/\/sign-in\?redirect_url=.*%2Fbudget/);
});

test("the log-in page shows EverCent's sign-in card", async ({ page }) => {
  await setupClerkTestingToken({ page });
  await page.goto("/sign-in");
  await expect(page.getByRole("heading", { name: "Log in to EverCent" })).toBeVisible();
});
