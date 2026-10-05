import { expect, test } from "@playwright/test";
import { SECTIONS, firstCaseStudyHref, gotoHome } from "./helpers";

test("home renders every section without page errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await gotoHome(page);
  for (const id of SECTIONS) await expect(page.locator(`section#${id}`)).toBeAttached();
  expect(errors).toEqual([]);
});

test("work index and a case study load", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  const work = await page.goto("/work");
  expect(work?.status()).toBe(200);

  await gotoHome(page);
  const href = await firstCaseStudyHref(page);
  const caseStudy = await page.goto(href);
  expect(caseStudy?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Start a conversation" })).toBeVisible();
  expect(errors).toEqual([]);
});

// Known issue: the root app/loading.tsx makes /work/[slug] stream, so the
// response commits 200 before notFound() runs. Visitors see the 404 page and
// it carries <meta name="robots" content="noindex">, but the status is wrong.
// Remove .fixme once the route answers 404.
test.fixme("unknown case study is a 404", async ({ page }) => {
  const response = await page.goto("/work/does-not-exist");
  expect(response?.status()).toBe(404);
});

for (const [from, to] of [
  ["/contact", "/#contact"],
  ["/about", "/#about"],
  ["/skills", "/#stack"],
  ["/projects", "/work"],
] as const) {
  test(`old URL ${from} redirects to ${to}`, async ({ page }) => {
    await page.goto(from);
    await expect(page).toHaveURL(new RegExp(`${to.replace("#", "\\#")}$`));
  });
}

test("light/dark toggle switches the theme", async ({ page }) => {
  await gotoHome(page);
  const html = page.locator("html");
  await expect(html).toHaveClass(/\bdark\b/);
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(html).not.toHaveClass(/\bdark\b/);
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(html).toHaveClass(/\bdark\b/);
});
