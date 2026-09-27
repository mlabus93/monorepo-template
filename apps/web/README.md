# Web app

The `web` workspace is the template's main browser application. It is a React and TypeScript single-page app built and served with Vite, ready to become the primary user-facing experience for a new project.

The app currently displays a starter screen with the shared `Header` and `Counter` components from [@repo/ui](../../packages/ui/README.md). Start editing in `src/main.tsx`; styles live in `src/app.module.css`, and static assets live in `public/`. Product features and routing are not yet implemented.

## Responsibilities

- Provide the starting point for the project's primary user-facing experience.
- Compose reusable components from `@repo/ui`.
- Build and serve the browser application with Vite.
- Test React behavior with Vitest and Testing Library.
- Test the built app in a real browser with Playwright.

## Common commands

Run these from the repository root:

```sh
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web lint
pnpm --filter web test
pnpm turbo run test:e2e --filter web
```

## End-to-end tests

Playwright specs live in `e2e/`, and `playwright.config.ts` applies the shared defaults from [@repo/playwright-config](../../packages/playwright-config/README.md) with this app's name and preview port, 4173. Run them through Turbo, as above, so the app is built first: the suite serves `dist/` with `vite preview` rather than the dev server. Use the `test:e2e:ui` task for Playwright's UI mode and `test:e2e:headed` to watch a run in a visible browser. If something else is already listening on port 4173, Playwright tests that server instead of starting its own, except in CI.

`tsconfig.e2e.json` type-checks the specs and the Playwright configuration with Node types plus the DOM library for `page.evaluate()` callbacks; `check-types` includes it.
