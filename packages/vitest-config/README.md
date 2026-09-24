# `@repo/vitest-config`

This package provides shared Vitest defaults and combines test and coverage results from independently cached Turborepo tasks. It contains configuration and report scripts, not a test suite of its own.

The configuration, setup, and report scripts use TypeScript and are checked by this package's `tsconfig.json` and `check-types` script. Root `pnpm check-types` runs that task through Turbo. The report scripts run directly with Node's built-in type stripping using the repository's required Node version.

## Shared project configuration

`sharedProjectConfig` sets `environment: "jsdom"` for DOM-based tests and `restoreMocks: true` to restore spied-on implementations before each test. Its shared [setup file](setup.ts) explicitly registers React Testing Library's `cleanup` with Vitest's `afterEach`, so components mounted with Testing Library are unmounted between tests without enabling Vitest globals. Roots created directly with React's `createRoot` still need their own teardown when reused within a test file.

The setup file is resolved relative to this package, so it works in both workspace and root project runs. React and React DOM are peer dependencies; consumers should use the workspace catalog versions. When adding workspace-specific setup files, preserve the shared `setupFiles` entry. Each workspace imports these defaults and supplies a unique project name:

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

## Coverage scope

Workspace runs measure only JavaScript and TypeScript source under their own `src/`, including files no test imports. Source imported from sibling workspaces is not counted, so shared components must be covered by their own package's tests rather than by app tests that happen to render them. The root configuration includes `apps/*/src/` and `packages/*/src/` using the same extensions and exclusions. Explicit inclusion also reports files that no test imports, as described in the [Vitest coverage guide](https://vitest.dev/guide/coverage.html).

Both configurations preserve Vitest's default exclusions and explicitly exclude type declarations, `*.test.*`/`*.spec.*` files, and `__tests__`, `__mocks__`, `test`, and `tests` directories. Configuration and tooling outside `src/` are outside this application coverage scope. Application `src/main.*` entry points, which only mount the app into the DOM, are also excluded. Re-export-only barrels remain in scope but contribute no executable statements.

The baseline is 80% statements, lines, and functions, and 75% branches, exported as `coverageThresholds`. Every workspace must meet it in its own test run, so a poorly tested workspace fails even when the others are well covered. The root configuration used by `pnpm report` reapplies the same thresholds to the merged total, which also counts source from any workspace that has no tests. The merged report includes HTML, text, and `coverage-summary.json` output in `mergedReportsDirectory` (`coverage/report` in this package).

Native blob merging combines coverage maps already collected by workspace runs; root inclusion rules cannot recover files omitted from those blobs. Keep workspace collection and root scope aligned when changing these rules. After changing coverage collection, use root `pnpm report` to refresh the blobs and verify the report's source files and covered/total counts.

## DOM assertions and user interactions

The shared setup imports `@testing-library/jest-dom/vitest`, making DOM matchers such as `toBeInTheDocument` and `toHaveTextContent` available to every test. Each testable workspace includes a `src/test-env.d.ts` file importing the same entry point so TypeScript recognizes the matchers within its source include paths. Vitest globals remain disabled.

Use `@testing-library/user-event` for user interactions. Create a fresh instance with `userEvent.setup()` inside each test before rendering, then await interactions such as `user.click(button)` and `user.type(input, "hello")`. The starter tests demonstrate this alongside DOM assertions. React Testing Library's `fireEvent` remains available for low-level events when needed.

When adding a workspace, include `@testing-library/jest-dom` and `@testing-library/user-event` as development dependencies using the catalog, and add the matcher declaration file within its TypeScript include paths. Also list that file as an `entry` for the workspace in the root `knip.json`: knip reads entries from `tsconfig.json`, and a solution-style `tsconfig.json` lists no files itself, so without the entry knip reports `@testing-library/jest-dom` as unused.

## Why merging is needed with Turborepo

The root `pnpm test` command delegates to `turbo run test`. Each testable workspace runs its own Vitest process, which lets Turbo cache and restore results separately. For example, after a change isolated to `web`, Turbo can rerun its tests while reusing the `docs` and `ui` results, provided their inputs and dependencies are unchanged.

Those processes produce separate reports. Turbo restores task output files and replays logs; it does not combine Vitest results or coverage. A single repository-wide coverage report therefore needs an aggregation step in this workflow. For test runs without caching or coverage, use `pnpm test:projects`.

Each workspace's `test` script enables coverage and uses both the `default` and `blob` reporters:

```sh
vitest run --coverage --coverage.reporter=text --reporter=default --reporter=blob --outputFile.blob=coverage/blob/report.json
```

The default reporter displays test results, and the text coverage reporter displays local coverage. The native blob report stores the results and coverage data needed for later merging; it is not an HTML report or the ordinary JSON reporter's output. See [Vitest's blob reporter documentation](https://vitest.dev/guide/reporters.html#blob-reporter).

In [turbo.json](../../turbo.json), `test.outputs` includes `coverage/blob/**`. That declaration makes the blob available on cache hits, when Vitest itself does not execute. Replaying terminal logs alone would not provide input for the merge. The `transit` dependency chain also propagates upstream workspace changes into test cache keys without requiring dependent test suites to run in sequence.

## What `pnpm report` does

Run `pnpm report` from the repository root. It runs `pnpm test` first, then invokes this package's `report` command only if testing succeeds:

1. **Clean old workspace blobs.** The root `pretest` hook runs [clean-blob-reports.ts](scripts/clean-blob-reports.ts). It removes `coverage/blob` from each directory immediately under `apps/` and `packages/`. This prevents a leftover report from a workspace that no longer produces one from entering the next aggregate. It does not remove Turbo's cache or existing HTML reports.
2. **Run or restore tests.** Turbo executes tasks with cache misses and restores `coverage/blob/**` for cache hits. Both paths supply the same kind of report for the next step.
3. **Stage the blobs together.** [merge-blob-reports.ts](scripts/merge-blob-reports.ts) recreates this package's `coverage/merged-blob/` directory, scans workspace `coverage/blob/` directories, and copies their `.json` files into it. It prefixes filenames with the workspace group and directory name: `apps/web/coverage/blob/report.json` becomes `apps-web-report.json`. This prevents workspaces that all write `report.json` from overwriting one another. Missing blob directories are skipped; finding no reports at all is an error.
4. **Merge with Vitest.** Despite its name, the staging script does not combine JSON or calculate coverage. The package's `report` command then invokes `vitest run --merge-reports`, which reads the staged native blobs and combines their test results and coverage without executing the tests again. The root configuration supplies the V8 provider, reporters, report directory, and aggregate thresholds.

The final HTML report is `packages/vitest-config/coverage/report/index.html`, relative to the repository root. Generated `coverage/` directories are ignored by Git.

The package command runs from `packages/vitest-config`: `--merge-reports coverage/merged-blob` resolves from that working directory, while `--root ../..` loads the repository's root configuration. The configured coverage output path resolves from that root. Preserve this distinction if moving the package or changing its command.

## Choosing a command

Run all commands below from the repository root:

| Command                                    | Behavior                                                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `pnpm test`                                | Cleans old blobs, then runs or restores workspace tests through Turbo; prints per-workspace coverage. |
| `pnpm report`                              | Runs the full cached test workflow, then builds the combined coverage report.                         |
| `pnpm --filter @repo/vitest-config report` | Rebuilds the aggregate from existing blobs only; does not refresh workspace test results.             |
| `pnpm test:projects`                       | Runs all registered projects directly in Vitest without Turbo caching or coverage.                    |
| `pnpm test:projects:watch`                 | Watches all registered projects in one Vitest process without Turbo caching or coverage.              |

Prefer root `pnpm report` when you need a complete, current report. The package-only command merges whatever blobs exist: it detects an empty set, but does not verify that every expected workspace contributed. Running just a filtered workspace's tests is not a replacement for the full refresh. Use matching Vitest versions across workspaces and the merge command; native blobs are version-specific.

## Adding a testable workspace

1. Add `@repo/vitest-config` as a workspace dependency and the test tooling needed by that workspace, following an existing app or UI package.
2. Create `vitest.config.ts` using the shared configuration above and a unique project name.
3. Add its configuration path to `test.projects` in the root `vitest.config.ts`.
4. Add the `test` script shown above so Turbo has a task and a blob output to cache. Add a `test:watch` script if needed.
5. Keep application source under `src/`, or update both the shared and root coverage scopes for a different layout. Run root `pnpm report` and verify the new project's source appears in the report.

The cleanup and staging scripts discover directories directly under `apps/` and `packages/`; they do not read pnpm's workspace patterns. Update both scripts if the repository adopts a different workspace layout.
