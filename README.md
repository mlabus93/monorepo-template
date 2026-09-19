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
- `pnpm --filter @repo/ui check-types`: type-check the shared UI package.
- `pnpm format`: format TypeScript and Markdown files with Prettier.

## Testing

- `pnpm test` runs the `web`, `docs`, and `ui` suites through Turborepo, reusing cached results when inputs are unchanged. Each workspace writes a blob report and prints coverage to the terminal.
- `pnpm test:projects` runs all suites once through the root Vitest Projects configuration.
- `pnpm test:projects:watch` watches all projects in one Vitest process.
- `pnpm report` runs or restores the workspace suites, then merges their native Vitest blob reports into one coverage report at `packages/vitest-config/coverage/report/index.html`.

The `test:projects` commands bypass Turbo and do not collect coverage by default. Run `pnpm test:projects --coverage` to generate coverage at `coverage/projects/index.html` in a single Vitest invocation.

Each testable workspace's `vitest.config.ts` defines that test project; the root configuration references those files directly. See the [Vitest package overview](packages/vitest-config/README.md) for the caching and report-merging workflow and instructions for adding a test project.
