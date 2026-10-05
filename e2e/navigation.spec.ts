import { expect, test } from "@playwright/test";
import {
  NAV_LABELS,
  SECTIONS,
  activeNavItem,
  expectLandedOn,
  firstCaseStudyHref,
  gotoHome,
  isMobile,
  navLink,
  scrollSectionIntoPlace,
} from "./helpers";

test.describe("desktop nav highlight", () => {
  test.skip(({ page }) => isMobile(page), "the pill nav is desktop-only");

  test("starts on Home", async ({ page }) => {
    await gotoHome(page);
    await expect(activeNavItem(page)).toHaveText(NAV_LABELS.home);
  });

  test("clicking each link lands on its section and highlights it — not the previous one", async ({
    page,
  }) => {
    await gotoHome(page);
    // Visit in an order that goes both down and back up the page.
    for (const section of ["about", "experience", "contact", "stack", "work", "home"] as const) {
      await navLink(page, section).click();
      // Lit immediately, and held while the smooth scroll passes other sections.
      await expect(activeNavItem(page)).toHaveText(NAV_LABELS[section]);
      if (section !== "home") await expectLandedOn(page, section);
      await expect(activeNavItem(page)).toHaveText(NAV_LABELS[section]);
      await expect(page).toHaveURL(new RegExp(`/#${section}$`));
    }
  });

  test("scrolling by hand moves the highlight", async ({ page }) => {
    await gotoHome(page);
    for (const section of SECTIONS.filter((s) => s !== "home" && s !== "contact")) {
      await scrollSectionIntoPlace(page, section);
      await expect(activeNavItem(page)).toHaveText(NAV_LABELS[section]);
    }
    // Contact is too short to reach the top; the page bottom counts as Contact.
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
    await expect(activeNavItem(page)).toHaveText(NAV_LABELS.contact);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(activeNavItem(page)).toHaveText(NAV_LABELS.home);
  });

  test("still works after visiting a case study and coming back", async ({ page }) => {
    await gotoHome(page);
    await page.locator(`a[href="${await firstCaseStudyHref(page)}"]`).first().click();
    await expect(page).toHaveURL(/\/work\/[^/]+$/);
    // Every case study keeps "Work" lit.
    await expect(activeNavItem(page)).toHaveText(NAV_LABELS.work);

    await navLink(page, "about").click();
    await expect(page).toHaveURL(/\/#about$/);
    await expectLandedOn(page, "about");
    await expect(activeNavItem(page)).toHaveText(NAV_LABELS.about);

    await scrollSectionIntoPlace(page, "experience");
    await expect(activeNavItem(page)).toHaveText(NAV_LABELS.experience);
  });

  test("logo and Get in touch jump to Home and Contact", async ({ page }) => {
    await gotoHome(page);
    await page.getByRole("banner").getByRole("link", { name: "Get in touch" }).click();
    await expectLandedOn(page, "contact");
    await expect(activeNavItem(page)).toHaveText(NAV_LABELS.contact);

    await page.locator('header a[href="/#home"]').first().click();
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 10_000 }).toBeLessThan(10);
    await expect(activeNavItem(page)).toHaveText(NAV_LABELS.home);
  });
});

test.describe("mobile menu", () => {
  test.skip(({ page }) => !isMobile(page), "the overlay menu replaces the pill nav on small screens");

  test("opens, navigates to a section and closes", async ({ page }) => {
    await gotoHome(page);
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeVisible();

    await menu.getByRole("link", { name: "Experience" }).click();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/\/#experience$/);
    await expectLandedOn(page, "experience");
  });

  test("Escape closes the menu", async ({ page }) => {
    await gotoHome(page);
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.locator("#mobile-menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#mobile-menu")).toBeHidden();
  });
});
