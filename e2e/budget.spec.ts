import { expect, test } from "@playwright/test";
import { AUTH_FILE } from "./auth-file";

/** The signed-in app. Skipped unless E2E_CLERK_USER_EMAIL is set (see auth.setup.ts). */

test.skip(!process.env.E2E_CLERK_USER_EMAIL, "Needs E2E_CLERK_USER_EMAIL for a signed-in user.");
test.use({ storageState: AUTH_FILE });

test("the budget page shows the budget table", async ({ page }) => {
  await page.goto("/budget");
  const table = page.getByRole("treegrid", { name: "Budget" });
  await expect(table).toBeVisible();
  await expect(table.getByText("Rent")).toBeVisible();
});

test("editing a Budgeted amount updates it", async ({ page }) => {
  await page.goto("/budget");
  await page.getByRole("button", { name: "Budgeted for Rent" }).click();
  await page.keyboard.type("2000");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Budgeted for Rent" })).toHaveText("$2,000.00");
});

test("collapsing a group hides its categories", async ({ page }) => {
  await page.goto("/budget");
  await page.getByRole("button", { name: "Collapse Monthly Bills" }).click();
  await expect(page.getByText("Rent")).toBeHidden();
  await page.getByRole("button", { name: "Expand Monthly Bills" }).click();
  await expect(page.getByText("Rent")).toBeVisible();
});
