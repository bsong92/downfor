import { expect, test } from "@playwright/test";

test.describe("DownFor smoke tests", () => {
  test("landing page renders the hero and CTA", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/downfor/i);
    await expect(page.getByRole("heading", { name: "Who's down?" })).toBeVisible();
    await expect(page.getByText("Post what you're doing and let people come to you")).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in|see what's happening/i })).toBeVisible();
  });

  test("feed page renders the activity board", async ({ page }) => {
    await page.goto("/feed");

    await expect(page.getByRole("heading", { name: "What's happening" })).toBeVisible();
    await expect(page.getByRole("link", { name: /post activity/i })).toBeVisible();
  });

  test("members page renders the directory", async ({ page }) => {
    await page.goto("/members");

    await expect(page.getByRole("heading", { name: "Members" })).toBeVisible();
  });

  test("calendar page renders the schedule view", async ({ page }) => {
    await page.goto("/calendar");

    await expect(page.getByRole("heading", { name: "Calendar" })).toBeVisible();
    await expect(page.getByText("Next up")).toBeVisible();
  });

  test("create page renders the composer", async ({ page }) => {
    await page.goto("/create");

    await expect(page.getByRole("heading", { name: "What are you doing?" })).toBeVisible();
    await expect(page.getByText("Post something people can actually join")).toBeVisible();
  });
});
