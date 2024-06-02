const { test, expect } = require("@playwright/test");

test("Main page show available courses", async ({ page }) => {
  await page.goto("http://localhost:7800/");
  await expect(page.locator(`a >> text=Web Software Development`)).toHaveText("Web Software Development")
});

test("Clicking on the course name opens the course page", async ({ page }) => {
  await page.goto("http://localhost:7800/");
  await page.locator(`a >> text=Web Software Development`).click();
  await expect(page.locator(`h3 >> text=Course: Web Software Development`)).toBeVisible();
});


