# Monorepo Template

A reusable React, Vite, and Turborepo foundation for quickly starting new projects.

## Getting started

Clone this repository for your new project, then update the root package name and replace the starter screens. Use Node.js 24.20.0 or newer and pnpm 12.1.0, as declared in `package.json`.

```sh
pnpm install
pnpm dev
```

`pnpm dev` starts both Vite apps; use the URLs printed in the terminal. To start only one app, run `pnpm --filter web dev` or `pnpm --filter docs dev`.

## Apps and packages

- [web](apps/web/README.md): the starting point for the main React application.
- [docs](apps/docs/README.md): a second React app intended for project documentation and examples.
- [@repo/ui](packages/ui/README.md): React components shared by both apps.
- [@repo/eslint-config](packages/eslint-config/README.md): shared ESLint rules.
- [@repo/typescript-config](packages/typescript-config/README.md): shared TypeScript compiler settings.
- [@repo/vitest-config](packages/vitest-config/README.md): shared test defaults and scripts for combining coverage from Turbo tasks.

Both apps currently display starter screens with a shared heading and counter. Application and component source is TypeScript; supporting configuration also uses JavaScript and JSON.

## Development commands

Run these from the repository root:

- `pnpm build`: type-check and build the apps into their respective `dist/` directories through Turbo.
- `pnpm lint`: run workspace ESLint checks through Turbo.
- `pnpm check-types`: type-check both apps, their Vite/Vitest configurations, and the shared UI package.
- `pnpm format`: format TypeScript and Markdown files with Prettier.
- `pnpm format:check`: check formatting without modifying files.

## Continuous integration

[GitHub Actions](.github/workflows/ci.yml) runs on every pull request, pushes to `main`, merge queue updates, and manual dispatches. Five independent checks verify lint, formatting, TypeScript, production builds, and tests with merged coverage. Installs use the frozen pnpm lockfile and the minimum supported Node.js version (24.20.0); update the workflow when changing the Node.js minimum in `package.json`. pnpm's version is read from `package.json`.

The test job uploads a `coverage` artifact containing the HTML coverage report and workspace blob reports, retained for 14 days. Failed tests fail CI; coverage is reported without a minimum percentage gate. Dependency downloads are cached, and newer commits cancel obsolete runs. Dependabot proposes weekly GitHub Actions updates.

To enforce these checks before merging, configure a branch ruleset or branch protection rule for `main` in GitHub repository settings: require pull requests, require the **CI passed** status check, and require branches to be up to date before merging (or use a merge queue). Run the workflow once so GitHub can offer the check in settings. `CI passed` fails if any check fails or is cancelled/skipped. The workflow alone does not prevent merging; the repository rule must be enabled separately. If your default branch has another name, update the workflow's push filter and protect that branch instead.

## Testing

- `pnpm test` runs the `web`, `docs`, and `ui` suites through Turborepo, reusing cached results when inputs are unchanged. Each workspace writes a blob report and prints coverage to the terminal.
- `pnpm test:projects` runs all suites once through the root Vitest Projects configuration.
- `pnpm test:projects:watch` watches all projects in one Vitest process.
- `pnpm report` runs or restores the workspace suites, then merges their native Vitest blob reports into one coverage report at `packages/vitest-config/coverage/report/index.html`.

The `test:projects` commands bypass Turbo and do not collect coverage by default. Run `pnpm test:projects --coverage` to generate coverage at `coverage/projects/index.html` in a single Vitest invocation.

Each testable workspace's `vitest.config.ts` defines that test project; the root configuration references those files directly. See the [Vitest package overview](packages/vitest-config/README.md) for the caching and report-merging workflow and instructions for adding a test project.
