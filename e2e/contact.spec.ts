import { expect, test, type Page } from "@playwright/test";
import { BUDGETS, PROJECT_TYPES } from "../lib/contact/form";
import { renderEnquiry } from "../lib/contact/mailer";
import { gotoHome } from "./helpers";

/** The action rejects anything faster than this as a bot (MIN_FILL_MS). */
const HUMAN_FILL_MS = 3000;

// The action rate-limits per IP; give each test its own so reruns never trip it.
test.beforeEach(async ({ page }, testInfo) => {
  await page.setExtraHTTPHeaders({
    "x-forwarded-for": `10.${testInfo.workerIndex}.${Date.now() % 250}.${Math.floor(Math.random() * 250)}`,
  });
});

async function openForm(page: Page) {
  await gotoHome(page, "#contact");
  const form = page.locator("#contact form");
  await expect(form).toBeVisible();
  return form;
}

test("budget options are in rupees", async ({ page }) => {
  const form = await openForm(page);
  const options = await form.locator("#budget option").allTextContents();
  expect(options).toEqual(["Prefer not to say", ...BUDGETS]);
  for (const budget of BUDGETS.filter((b) => b !== "Not sure yet")) expect(budget).toContain("₹");
});

test("empty submit shows every required-field error", async ({ page }) => {
  const form = await openForm(page);
  await form.getByRole("button", { name: /send message/i }).click();
  await expect(form.getByText("Please tell me your name.")).toBeVisible();
  await expect(form.getByText("Please enter a valid email so I can reply.")).toBeVisible();
  await expect(form.getByText("Please choose what you need help with.")).toBeVisible();
  await expect(form.getByText(/at least \d+ characters/)).toBeVisible();
});

test("a failed submit keeps what the visitor typed", async ({ page }) => {
  const form = await openForm(page);
  await form.getByLabel("Name").fill("Test Visitor");
  await form.getByLabel("Tell me about the project").fill("too short");
  await form.getByRole("button", { name: /send message/i }).click();
  await expect(form.getByText(/at least \d+ characters/)).toBeVisible();
  await expect(page.locator("#contact form").getByLabel("Name")).toHaveValue("Test Visitor");
  await expect(page.locator("#contact form").getByLabel("Tell me about the project")).toHaveValue("too short");
});

test("a valid enquiry is sent", async ({ page }) => {
  const form = await openForm(page);
  await form.getByLabel("Name").fill("E2E Test");
  await form.getByLabel("Email").fill("e2e@example.com");
  await form.locator("#projectType").selectOption(PROJECT_TYPES[1]);
  await form.locator("#budget").selectOption(BUDGETS[2]);
  await form.getByLabel("Tell me about the project").fill("Automated end-to-end test enquiry — please ignore.");
  await page.waitForTimeout(HUMAN_FILL_MS);
  await form.getByRole("button", { name: /send message/i }).click();
  await expect(page.getByRole("status")).toContainText("Thanks — your message is on its way.");
});

test.describe("enquiry email", () => {
  // Pure rendering — run once, not per device.
  test.skip(({ isMobile }) => isMobile, "rendering does not depend on the device");

  const enquiry = {
    name: "Ada <Lovelace>",
    email: "ada@example.com",
    projectType: "Web application",
    budget: BUDGETS[2],
    message: 'Hi <script>alert("x")</script>\nSecond line',
  };

  test("escapes visitor input", () => {
    const { html, text } = renderEnquiry(enquiry);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("Ada &lt;Lovelace&gt;");
    expect(text).toContain("Budget: " + BUDGETS[2]);
  });

  test("uses the light theme and renders cleanly", async ({ page }) => {
    const { html } = renderEnquiry(enquiry);
    expect(html).toContain('content="light only"');
    await page.setContent(html);
    await expect(page.getByText("Web application.")).toBeVisible();
    await expect(page.getByText(BUDGETS[2], { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /reply to ada/i })).toHaveAttribute(
      "href",
      /^mailto:ada@example\.com\?subject=/,
    );
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe("rgb(250, 248, 242)");
  });
});
