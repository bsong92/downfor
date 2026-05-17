import { expect, test } from "@playwright/test";

test.describe("DownFor smoke tests", () => {
  test("landing page renders the hero and CTA", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/downfor/i);
    await expect(page.getByRole("heading", { name: "Who's down?" })).toBeVisible();
    await expect(page.getByText("Post what you're doing and let people come to you")).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in with Google →" })).toBeVisible();
  });

  test("feed page renders the activity board", async ({ page }) => {
    await page.goto("/feed");

    await expect(page.getByRole("heading", { name: "What's happening" })).toBeVisible();
    await expect(page.getByRole("link", { name: "+ Post activity" })).toBeVisible();
  });

  test("members page renders the directory", async ({ page }) => {
    await page.goto("/members");

    await expect(page.getByRole("heading", { name: "Members" })).toBeVisible();
  });

  test("calendar page renders the schedule view", async ({ page }) => {
    await page.goto("/calendar");

    await expect(page.getByRole("heading", { name: "Plan ahead by date" })).toBeVisible();
    await expect(page.getByText("Next up")).toBeVisible();
  });

  test("calendar month controls navigate without crashing", async ({ page }) => {
    await page.goto("/calendar");

    const initialUrl = page.url();
    await page.getByLabel("Next month").click();
    await expect(page).not.toHaveURL(initialUrl);
    await expect(page).toHaveURL(/\/calendar\?month=/);
    await expect(page.getByRole("heading", { name: /20\d{2}/ })).toBeVisible();
  });

  test("members page opens a public member profile", async ({ page }) => {
    await page.goto("/members");

    await page.locator('a[href^="/members/"]').first().click();
    await expect(page).toHaveURL(/\/members\/[0-9a-f-]+/);
    await expect(page.getByText("Public member")).toBeVisible();
    await expect(page.getByRole("link", { name: /back to members/i })).toBeVisible();
  });

  test("create page renders the composer", async ({ page }) => {
    await page.goto("/create");

    await expect(page.getByRole("heading", { name: "What are you doing?" })).toBeVisible();
    await expect(page.getByText("Post something people can actually join")).toBeVisible();
  });
});
