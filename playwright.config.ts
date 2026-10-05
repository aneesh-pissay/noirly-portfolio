import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against a production build, because that is where the
 * bugs live: below-the-fold sections arrive in a lazy chunk, so hash links and
 * the nav highlight behave differently than under `next dev`.
 *
 *   npm run test:e2e              build, serve on :3100, run everything
 *   E2E_BASE_URL=http://localhost:3000 npm run test:e2e
 *                                 test a server you already have running
 *
 * The contact form is submitted for real, with CONTACT_EMAIL_DRY_RUN=1 so the
 * action runs end to end without sending mail.
 */
const PORT = 3100;
const externalBaseURL = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: externalBaseURL ?? `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command: "npm run build && node .next/standalone/server.js",
        url: `http://localhost:${PORT}`,
        timeout: 5 * 60 * 1000,
        reuseExistingServer: !process.env.CI,
        env: {
          PORT: String(PORT),
          HOSTNAME: "localhost",
          CONTACT_EMAIL_DRY_RUN: "1",
        },
      },
});
