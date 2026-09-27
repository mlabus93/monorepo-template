import type { PlaywrightTestConfig } from "@playwright/test";
import { defineConfig, devices } from "@playwright/test";

interface PlaywrightConfigOptions {
  // Labels the preview server's log lines and the HTML report.
  name: string;
  // Each app needs its own port so their suites can run at the same time.
  port: number;
}

export function createPlaywrightConfig({
  name,
  port,
}: PlaywrightConfigOptions): PlaywrightTestConfig {
  const isCI = Boolean(process.env.CI);
  // Point the suite at an already running deployment instead of a local
  // preview. Turbo declares this variable in `env` so the task can read it.
  const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;
  const baseURL = externalBaseURL ?? `http://localhost:${port}`;

  return defineConfig({
    testDir: "e2e",
    fullyParallel: true,
    // Fail CI if a focused test.only slipped into a commit.
    forbidOnly: isCI,
    // Retries absorb one-off flakes in CI, but a pass on retry hides the
    // flake, so treat a flaky test as a bug rather than relying on this.
    retries: isCI ? 2 : 0,
    reporter: isCI
      ? [["html", { open: "never", title: `${name} end-to-end` }], ["github"]]
      : [["list"]],
    use: {
      baseURL,
      trace: "on-first-retry",
    },
    // Scripts select Chromium; pass --project=firefox or --project=webkit to
    // opt in to the others after installing those browsers.
    projects: [
      { name: "chromium", use: { ...devices["Desktop Chrome"] } },
      { name: "firefox", use: { ...devices["Desktop Firefox"] } },
      { name: "webkit", use: { ...devices["Desktop Safari"] } },
    ],
    // Serve the production build from `dist/`; Turbo runs `build` first.
    // Outside CI an already running server on this port is reused as is, even
    // if it serves an older build.
    ...(externalBaseURL === undefined && {
      webServer: {
        name: `${name} preview`,
        command: `pnpm exec vite preview --port ${port} --strictPort`,
        url: baseURL,
        reuseExistingServer: !isCI,
      },
    }),
  });
}
