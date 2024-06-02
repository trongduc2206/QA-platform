const { test, expect } = require("@playwright/test");

test("Course page shows questions", async ({ page }) => {
    await page.goto("http://localhost:7800/");
    await page.locator(`a >> text=Web Software Development`).click();
    await expect(page.locator(`a >> text=What is the command for starting an application with Docker compose?`)).toBeVisible();
});

test("Clicking on question opens the question page", async ({ page }) => {
    await page.goto("http://localhost:7800/courses/1");
    await page.locator(`a >> text=What is the command for starting an application with Docker compose?`).click();
    await expect(page.locator(`h3 >> text=Question: What is the command for starting an application with Docker compose?`)).toBeVisible();
});

test("Adding question", async ({ page }) => {
    await page.goto("http://localhost:7800/courses/1");
    const question = `Question ${Math.random()}`;
    await page.locator("input").fill(question);
    await page.locator(`button >> text=Add`).click();
    await expect(page.locator(`a >> text=${question}`)).toBeVisible();
});

