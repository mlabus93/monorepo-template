import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const appName = "Docs";

// Records console errors, uncaught exceptions, and failed or unsuccessful
// responses so a test can assert that none occurred. Vite serves index.html
// with status 200 for unknown paths, so a missing asset shows up as an HTML
// response to a request that is not a page navigation.
function collectPageProblems(page: Page) {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      problems.push(`console error: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    problems.push(`uncaught exception: ${error.message}`);
  });
  page.on("requestfailed", (request) => {
    problems.push(
      `request failed: ${request.url()} (${request.failure()?.errorText ?? "unknown error"})`,
    );
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      problems.push(`HTTP ${response.status()}: ${response.url()}`);
    } else if (
      response.request().resourceType() !== "document" &&
      response.headers()["content-type"]?.startsWith("text/html")
    ) {
      problems.push(`HTML fallback instead of asset: ${response.url()}`);
    }
  });
  return problems;
}

test("shows the app name in the heading", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: appName }),
  ).toBeVisible();
});

test("counter starts at zero and increments on click", async ({ page }) => {
  await page.goto("/");
  const counter = page.getByRole("button");

  await expect(counter).toHaveText("0");
  await counter.click();
  await expect(counter).toHaveText("1");
});

for (const { name, href } of [
  { name: "Vite logo", href: "https://vitejs.dev" },
  { name: "TypeScript logo", href: "https://www.typescriptlang.org/" },
]) {
  test(`${name} links to ${href} in a new tab`, async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name });

    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noreferrer");
  });
}

test("loads without console errors or failed requests", async ({ page }) => {
  const problems = collectPageProblems(page);

  // goto resolves on the load event, after the script, styles, and images.
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: appName }),
  ).toBeVisible();

  expect(problems).toEqual([]);
});
