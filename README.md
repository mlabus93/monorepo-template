# Monorepo Template

A reusable React, Vite, and Turborepo foundation for quickly starting new projects.

## Getting started

Clone this repository for your new project, then update the root package name, the copyright holder in `LICENSE`, and the owners in `.github/CODEOWNERS`, and replace the starter screens. Use Node.js 24.20.0 or newer and pnpm 12.1.0, as declared in `package.json`.

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
- `pnpm lint`: lint application code, workspace packages, and root configuration with ESLint. Each app and the UI package also supports a filtered `lint` command.
- `pnpm check-types`: type-check root tooling with `tsconfig.tools.json`, then run each app and package's own `check-types` task through Turbo.
- `pnpm lint-staged`: fix supported staged files with ESLint and Prettier.
- `pnpm format`: format all supported source, configuration, and documentation files with Prettier, excluding generated output and the lockfile via `.prettierignore`.
- `pnpm format:check`: check formatting without modifying files.
- `pnpm check`: run lint, formatting checks, type checks, production builds, and tests with merged coverage, stopping at the first failure. This runs the same checks as CI.

Husky runs `pnpm lint-staged` before each commit, and [commitlint](commitlint.config.ts) checks that each commit message follows [Conventional Commits](https://www.conventionalcommits.org/) (for example, `fix: handle empty input`). Root and workspace lint-staged configurations fix staged JavaScript and TypeScript with ESLint and Prettier, and format other supported files with Prettier. Each staged file uses its nearest lint-staged configuration, and tasks run from that configuration's directory. Workspace tasks therefore do not automatically use the root `.prettierignore`. Generated directories such as `dist` and `coverage` are Git-ignored and are not normally staged. The root `pnpm format` and `pnpm format:check` commands use the root `.prettierignore`.

## Environment variables

Keep app-specific environment files inside their app directory, such as `apps/web/.env.local`. Environment files matching `.env*` are ignored by Git, except `.env.example` and `.env.*.example`. Each app ships a commented `.env.example`; when introducing variables, add them there with placeholder values and document what each variable controls; copy it to an ignored environment file for local use.

Vite exposes variables prefixed with `VITE_` to browser code, so these values must be safe to make public. Keep secrets in server-side systems. No environment file is required by the starter apps.

The build task includes `.env*` files in its cache inputs and declares `VITE_*` variables in its `env` configuration, so changing either invalidates cached builds. Declare any additional environment variables that affect task output in the relevant task's `env` configuration in `turbo.json`.

All workspace packages are private by default. Remove `private` and add an explicit publishing setup only when a package is intended for distribution.

## Continuous integration

[GitHub Actions](.github/workflows/ci.yml) runs on every pull request, pushes to `main`, merge queue updates, and manual dispatches. Five independent checks verify lint, formatting, TypeScript, production builds, and tests with merged coverage. Installs use the frozen pnpm lockfile and the minimum supported Node.js version (24.20.0); update the workflow when changing the Node.js minimum in `package.json`. pnpm's version is read from `package.json`.

The test job uploads a `coverage` artifact containing the HTML coverage report and workspace blob reports, retained for 14 days. Failed tests, or coverage below 80% of statements, lines, and functions or 75% of branches in any workspace or in the merged total, fail CI. Dependency downloads are cached, and newer commits cancel obsolete runs. Dependabot proposes weekly GitHub Actions updates.

To enforce these checks before merging, configure a branch ruleset or branch protection rule for `main` in GitHub repository settings: require pull requests, require the **CI passed** status check, and require branches to be up to date before merging (or use a merge queue). Run the workflow once so GitHub can offer the check in settings. `CI passed` fails if any check fails or is cancelled/skipped. The workflow alone does not prevent merging; the repository rule must be enabled separately. If your default branch has another name, update the workflow's push filter and protect that branch instead.

## Testing

Tests use React Testing Library to render and query components, `@testing-library/user-event` for interactions, and `@testing-library/jest-dom` for DOM assertions. The shared Vitest setup registers matchers and cleans up rendered components between tests.

- `pnpm test` runs the `web`, `docs`, and `ui` suites through Turborepo, reusing cached results when inputs are unchanged. Each workspace writes a blob report and prints coverage to the terminal.
- `pnpm test:projects` runs all suites once through the root Vitest Projects configuration.
- `pnpm test:projects:watch` watches all projects in one Vitest process.
- `pnpm report` runs or restores the workspace suites, then merges their native Vitest blob reports into one coverage report at `packages/vitest-config/coverage/report/index.html`.

The `test:projects` commands run tests without Turbo caching or coverage. Use `pnpm report` for coverage.

The coverage report includes application and shared-package source, including untested files. `src/main.*` entry points, which only mount the app, are excluded, as are declarations, tests, test support directories, and Vitest's default exclusions. Each workspace is measured only by its own tests, so shared components need tests in their package. HTML and `coverage-summary.json` reports are written to `packages/vitest-config/coverage/report/`.

Each testable workspace's `vitest.config.ts` defines that test project; the root configuration references those files directly. See the [Vitest package overview](packages/vitest-config/README.md) for the caching and report-merging workflow and instructions for adding a test project.
