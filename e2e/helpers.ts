import { expect, type Page } from "@playwright/test";

export const SECTIONS = ["home", "about", "stack", "experience", "work", "contact"] as const;
export type Section = (typeof SECTIONS)[number];

export const NAV_LABELS: Record<Section, string> = {
  home: "Home",
  about: "About",
  stack: "Stack",
  experience: "Experience",
  work: "Work",
  contact: "Contact",
};

/** Sections land this far below the viewport top (`section[id] { scroll-margin-top }`). */
export function headerOffset(page: Page): number {
  return (page.viewportSize()?.width ?? 1440) < 768 ? 80 : 104;
}

export function isMobile(page: Page): boolean {
  return (page.viewportSize()?.width ?? 1440) < 1024;
}

/** Opens the home page and waits for the lazily loaded sections and web fonts. */
export async function gotoHome(page: Page, hash = "") {
  await page.goto(`/${hash}`);
  await page.locator("#contact").waitFor({ state: "attached" });
  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts.ready);
}

/** The desktop nav item currently marked active. */
export function activeNavItem(page: Page) {
  return page.locator('header nav ul a[aria-current="page"]');
}

export function navLink(page: Page, section: Section) {
  return page.locator(`header nav ul a[href="/#${section}"]`);
}

/** Viewport-relative top of a section; NaN while it has not mounted yet. */
export async function sectionTop(page: Page, section: Section): Promise<number> {
  return page.evaluate((id) => {
    const el = document.getElementById(id);
    return el ? Math.round(el.getBoundingClientRect().top) : Number.NaN;
  }, section);
}

/** Waits until a hash jump has settled with the section just under the header. */
export async function expectLandedOn(page: Page, section: Section) {
  const offset = headerOffset(page);
  await expect
    .poll(() => sectionTop(page, section), { timeout: 10_000, message: `#${section} under the header` })
    .toBeGreaterThanOrEqual(offset - 8);
  await expect.poll(() => sectionTop(page, section), { timeout: 10_000 }).toBeLessThanOrEqual(offset + 8);
}

/** Jumps (no smooth scroll) so a section's top sits just under the header. */
export async function scrollSectionIntoPlace(page: Page, section: Section) {
  await page.evaluate(
    ([id, offset]) => {
      const el = document.getElementById(id as string)!;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (offset as number), behavior: "instant" });
    },
    [section, headerOffset(page)] as const,
  );
}

/** First case-study link on the home page, e.g. "/work/noirly-flow". */
export async function firstCaseStudyHref(page: Page): Promise<string> {
  const href = await page.locator('#work a[href^="/work/"]').first().getAttribute("href");
  expect(href, "home page lists at least one case study").toBeTruthy();
  return href!;
}
