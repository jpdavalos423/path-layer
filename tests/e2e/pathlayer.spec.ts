import { expect, test } from "@playwright/test";

test("core flow renders ranking, path details, and graph", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("PathLayer")).toBeVisible();
  await expect(page.getByTestId("ranking-table")).toBeVisible();

  const rankingRows = page.locator("[data-testid='ranking-table'] tbody tr");
  await expect(rankingRows.first()).toBeVisible();

  await rankingRows.first().click();
  await expect(page.getByTestId("path-details")).toContainText("Weighted Best Path");
  await expect(page.getByTestId("graph-canvas")).toBeVisible();
  await expect(page.getByText("System Metrics")).toBeVisible();
});
