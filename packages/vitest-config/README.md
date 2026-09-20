# `@repo/vitest-config`

This package provides shared Vitest defaults and combines test and coverage results from independently cached Turborepo tasks. It contains configuration and report scripts, not a test suite of its own.

## Shared project configuration

`sharedProjectConfig` sets `environment: "jsdom"` for DOM-based tests and `restoreMocks: true` to restore spied-on implementations before each test. Each workspace imports these defaults and supplies a unique project name:

```ts
import { sharedProjectConfig } from "@repo/vitest-config";
import { defineProject } from "vitest/config";

export default defineProject({
  ...sharedProjectConfig,
  test: {
    ...sharedProjectConfig.test,
    name: "my-workspace",
  },
});
```

Keep both object spreads: assigning a new `test` object replaces the shared one unless its settings are spread into it. The [root Vitest configuration](../../vitest.config.ts) references the `web`, `docs`, and `ui` project files, so direct project runs and report merging use the same project definitions.

## Why merging is needed with Turborepo

The root `pnpm test` command delegates to `turbo run test`. Each testable workspace runs its own Vitest process, which lets Turbo cache and restore results separately. For example, after a change isolated to `web`, Turbo can rerun its tests while reusing the `docs` and `ui` results, provided their inputs and dependencies are unchanged.

Those processes produce separate reports. Turbo restores task output files and replays logs; it does not combine Vitest results or coverage. A single repository-wide coverage report therefore needs an aggregation step in this workflow. Running all projects in one Vitest invocation is an alternative, but it bypasses Turbo's per-workspace test caching.

Each workspace's `test` script enables coverage and uses both the `default` and `blob` reporters:

```sh
vitest run --coverage --coverage.reporter=text --reporter=default --reporter=blob --outputFile.blob=coverage/blob/report.json
```

The default reporter displays test results, and the text coverage reporter displays local coverage. The native blob report stores the results and coverage data needed for later merging; it is not an HTML report or the ordinary JSON reporter's output. See [Vitest's blob reporter documentation](https://vitest.dev/guide/reporters.html#blob-reporter).

In [turbo.json](../../turbo.json), `test.outputs` includes `coverage/blob/**`. That declaration makes the blob available on cache hits, when Vitest itself does not execute. Replaying terminal logs alone would not provide input for the merge. The `transit` dependency chain also propagates upstream workspace changes into test cache keys without requiring dependent test suites to run in sequence.

## What `pnpm report` does

Run `pnpm report` from the repository root. It runs `pnpm test` first, then invokes this package's `report` command only if testing succeeds:

1. **Clean old workspace blobs.** The root `pretest` hook runs [clean-blob-reports.js](scripts/clean-blob-reports.js). It removes `coverage/blob` from each directory immediately under `apps/` and `packages/`. This prevents a leftover report from a workspace that no longer produces one from entering the next aggregate. It does not remove Turbo's cache or existing HTML reports.
2. **Run or restore tests.** Turbo executes tasks with cache misses and restores `coverage/blob/**` for cache hits. Both paths supply the same kind of report for the next step.
3. **Stage the blobs together.** [merge-blob-reports.js](scripts/merge-blob-reports.js) recreates this package's `coverage/merged-blob/` directory, scans workspace `coverage/blob/` directories, and copies their `.json` files into it. It prefixes filenames with the workspace group and directory name: `apps/web/coverage/blob/report.json` becomes `apps-web-report.json`. This prevents workspaces that all write `report.json` from overwriting one another. Missing blob directories are skipped; finding no reports at all is an error.
4. **Merge with Vitest.** Despite its name, the staging script does not combine JSON or calculate coverage. The package's `report` command then invokes `vitest run --merge-reports`, which reads the staged native blobs and combines their test results and coverage without executing the tests again. Coverage uses the V8 provider and is rendered as terminal text and HTML.

The final HTML report is `packages/vitest-config/coverage/report/index.html`, relative to the repository root. Generated `coverage/` directories are ignored by Git.

The package command runs from `packages/vitest-config`: `--merge-reports coverage/merged-blob` resolves from that working directory, while `--root ../..` loads the repository's root configuration. The explicit coverage output path resolves from that root. Preserve this distinction if moving the package or changing its command.

## Choosing a command

Run all commands below from the repository root:

| Command                                    | Behavior                                                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `pnpm test`                                | Cleans old blobs, then runs or restores workspace tests through Turbo; prints per-workspace coverage. |
| `pnpm report`                              | Runs the full cached test workflow, then builds the combined coverage report.                         |
| `pnpm --filter @repo/vitest-config report` | Rebuilds the aggregate from existing blobs only; does not refresh workspace test results.             |
| `pnpm test:projects`                       | Runs all registered projects directly in Vitest, bypassing Turbo; coverage is off by default.         |
| `pnpm test:projects --coverage`            | Runs all registered projects directly with coverage, writing HTML to `coverage/projects/index.html`.  |
| `pnpm test:projects:watch`                 | Watches all registered projects in one Vitest process.                                                |

Prefer root `pnpm report` when you need a complete, current report. The package-only command merges whatever blobs exist: it detects an empty set, but does not verify that every expected workspace contributed. Running just a filtered workspace's tests is not a replacement for the full refresh. Use matching Vitest versions across workspaces and the merge command; native blobs are version-specific.

## Adding a testable workspace

1. Add `@repo/vitest-config` as a workspace dependency and the test tooling needed by that workspace, following an existing app or UI package.
2. Create `vitest.config.ts` using the shared configuration above and a unique project name.
3. Add its configuration path to `test.projects` in the root `vitest.config.ts`.
4. Add the `test` script shown above so Turbo has a task and a blob output to cache. Add a `test:watch` script if needed.
5. Run root `pnpm report` and verify the new project's results appear.

The cleanup and staging scripts discover directories directly under `apps/` and `packages/`; they do not read pnpm's workspace patterns. Update both scripts if the repository adopts a different workspace layout.
