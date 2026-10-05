import { expect, test } from "@playwright/test";
import { expectLandedOn, firstCaseStudyHref, gotoHome } from "./helpers";

test.describe("case study", () => {
  let caseStudy: string;

  test.beforeEach(async ({ page }) => {
    await gotoHome(page);
    caseStudy = await firstCaseStudyHref(page);
  });

  test("opens from the home page", async ({ page }) => {
    await page.locator(`a[href="${caseStudy}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`${caseStudy}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  // The regression: on a fresh load the home sections are not downloaded yet,
  // so the router's hash scroll fell short and stopped around About.
  test("Start a conversation reaches the contact form on a fresh load", async ({ page }) => {
    await page.goto(caseStudy);
    await page.getByRole("link", { name: "Start a conversation" }).click();
    await expect(page).toHaveURL(/\/#contact$/);
    await expectLandedOn(page, "contact");
    await expect(page.locator("#contact form")).toBeInViewport({ ratio: 0.3 });
  });

  test("Start a conversation reaches the contact form after client navigation", async ({ page }) => {
    await page.locator(`a[href="${caseStudy}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`${caseStudy}$`));
    await page.getByRole("link", { name: "Start a conversation" }).click();
    await expect(page).toHaveURL(/\/#contact$/);
    await expectLandedOn(page, "contact");
    await expect(page.locator("#contact form")).toBeInViewport({ ratio: 0.3 });
  });

  test("a deep link to a home section scrolls there on first load", async ({ page }) => {
    await page.goto("/#experience");
    await expectLandedOn(page, "experience");
  });
});
