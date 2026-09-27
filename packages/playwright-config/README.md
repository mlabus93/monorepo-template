# `@repo/playwright-config`

This package provides shared [Playwright](https://playwright.dev) defaults for end-to-end tests. It contains configuration only; each app keeps its own specs in `e2e/` and its own `playwright.config.ts`, so Turbo caches and reruns every app's suite independently, as it does for unit tests.

The configuration is `index.ts`, loaded as TypeScript by Playwright and checked by this package's `tsconfig.json` and `check-types` script. Root `pnpm check-types` runs that task through Turbo.

## Usage

Each app passes its name and a preview port that no other app uses:

```ts
import { createPlaywrightConfig } from "@repo/playwright-config";

export default createPlaywrightConfig({ name: "web", port: 4173 });
```

The name labels the preview server's log lines and the CI HTML report. The port lets both apps' suites run at the same time without competing for Vite's default. `web` uses 4173 and `docs` uses 4174.

## Defaults

- **Specs** are `*.spec.ts` and `*.test.ts` files under `e2e/`, run fully in parallel.
- **Server.** Playwright starts `vite preview --port <port> --strictPort` from the app directory and waits for it to respond. Preview serves the production build in `dist/`, so the suite tests what ships; the Turbo `test:e2e` task depends on the app's `build` task to produce it. Running `playwright test` directly, or from the Playwright VS Code extension, skips that step and tests whatever `dist/` holds, so rebuild the app after changing it. `--strictPort` fails fast instead of silently moving to another port.
- **Server reuse.** Outside CI, a server already listening on the port is reused, which keeps reruns fast. It is used as is, so a preview you started by hand from an older build is what gets tested. In CI, an occupied port is an error.
- **Browsers.** `chromium`, `firefox`, and `webkit` projects are defined. The app scripts pass `--project=chromium`, including UI mode, where the others can still be enabled, which is the only browser CI installs; add another project to a run to opt in to it locally after installing that browser.
- **CI behavior.** When `CI` is set, `test.only` fails the run, failed tests retry twice, and a trace is recorded on the first retry. Reporting switches from the `list` reporter to an HTML report in `playwright-report/` plus GitHub annotations.

Vite serves `index.html` with status 200 for any unknown path, including a missing image or script. The starter smoke suites therefore treat an HTML response to a non-navigation request as a missing asset, in addition to checking for HTTP errors, failed requests, and console errors.

## Testing a deployed environment

Set `PLAYWRIGHT_BASE_URL` to run a suite against an existing server, such as a preview deployment:

```sh
PLAYWRIGHT_BASE_URL=https://staging.example.com pnpm turbo run test:e2e --filter web --force
```

When it is set, no local preview server starts, although Turbo still builds the app first. Every app reads the same variable, so filter to the app deployed at that URL; another app's suite would fail against it. The cache key includes the URL but not what it serves, so pass `--force` to test the deployment as it is now rather than replaying an earlier result for the same URL.

## Caching with Turbo

In [turbo.json](../../turbo.json), `test:e2e` declares `CI` and `PLAYWRIGHT_BASE_URL` in `env`, which puts them in the cache key and passes them through Turbo's strict environment mode. A run against a deployment never replays a local result, and a local run never replays a CI result. A second run against the same deployment URL can still replay the first, as described above. Any new variable the configuration reads must be declared the same way, or Turbo hides it from the task. `PLAYWRIGHT_BROWSERS_PATH` is passed through without affecting the key, since it only says where browsers are installed.

`playwright-report/**` and `test-results/**` are declared outputs, so a cache hit restores the HTML report and any traces along with the logs. The task keeps Turbo's default inputs, every Git-tracked file in the app, which already includes `e2e/` and the Playwright configuration. The `build` task excludes those two from its own inputs so that editing a spec reruns the suite without rebuilding the app.

Browser binaries, fonts, and the operating system are not part of the cache key. That is fine for behavioral assertions, but pixel screenshot comparisons would replay results produced on a different machine; mark such a task uncached or include the platform in its key before adding them. A retried pass is cached like any other, so a flaky test stays green until its inputs change. Fix flakiness rather than relying on retries, and set `"cache": false` on the task if it becomes a problem.

`test:e2e:ui` and `test:e2e:headed` are uncached and also depend on `build`. The UI task is persistent because the UI stays open.

## Adding end-to-end tests to a workspace

1. Add `@repo/playwright-config` as a workspace development dependency and `@playwright/test` from the catalog.
2. Create `playwright.config.ts` with `createPlaywrightConfig`, a name, and a port no other workspace uses. The workspace needs a `vite preview` that serves its build.
3. Add `test:e2e`, `test:e2e:ui`, and `test:e2e:headed` scripts following an existing app. The Turbo tasks already exist and apply to any workspace with those scripts.
4. Add a `tsconfig.e2e.json` that extends `@repo/typescript-config/node.json`, adds the `DOM` library, and includes `e2e` and `playwright.config.ts`. Reference it from the workspace's solution `tsconfig.json` and add `tsc -p tsconfig.e2e.json --noEmit` to its `check-types` script. Type-aware ESLint rejects files that no project includes, so linting needs this too.
5. Put specs in `e2e/`. The shared ESLint configuration applies Playwright's recommended rules and Node globals there, and the shared Vitest configuration excludes it, so no other configuration changes are needed.
6. Run `pnpm test:e2e` twice and confirm the second run is a cache hit, then run `pnpm knip`. Knip's Playwright plugin reads each `playwright.config.ts` and treats the specs as entry files.

CI runs root `pnpm test:e2e`, so a new workspace's suite joins the End-to-end check automatically.
