import { expect, test } from "@playwright/test";
import fs from "node:fs";

const authStatePath = process.env.PLAYWRIGHT_AUTH_STATE ?? ".auth/user.json";
const hasAuthState = fs.existsSync(authStatePath);

test.describe("authenticated smoke tests", () => {
  test.skip(!hasAuthState, `Missing auth state file at ${authStatePath}`);
  test.use({ storageState: authStatePath });

  test("signed-in user can access private pages", async ({ page }) => {
    await page.goto("/requests");
    await expect(page).toHaveURL(/\/requests/);
    await expect(page.getByRole("heading", { name: "Requests", exact: true })).toBeVisible();
    await expect(page.getByText("Requests you sent")).toBeVisible();

    await page.goto("/profile");
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
  });
});
