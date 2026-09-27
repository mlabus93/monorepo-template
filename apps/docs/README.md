# Docs app

The `docs` workspace is a Vite-powered React single-page app intended as a starting point for project documentation and examples. It currently has a starter screen, with no documentation content system or routing configured.

The entry point is `src/main.tsx`, which renders the shared `Header` and `Counter` components from [@repo/ui](../../packages/ui/README.md). Styles live in `src/app.module.css`, and static assets live in `public/`.

## Responsibilities

- Provide a starting point for documentation and examples.
- Consume reusable components from `@repo/ui`.
- Build and serve the documentation site with Vite.
- Test React behavior with Vitest and Testing Library.
- Test the built app in a real browser with Playwright.

## Common commands

Run these from the repository root:

```sh
pnpm --filter docs dev
pnpm --filter docs build
pnpm --filter docs lint
pnpm --filter docs test
pnpm turbo run test:e2e --filter docs
```

## End-to-end tests

Playwright specs live in `e2e/`, and `playwright.config.ts` applies the shared defaults from [@repo/playwright-config](../../packages/playwright-config/README.md) with this app's name and preview port, 4174. Run them through Turbo, as above, so the app is built first: the suite serves `dist/` with `vite preview` rather than the dev server. Use the `test:e2e:ui` task for Playwright's UI mode and `test:e2e:headed` to watch a run in a visible browser. If something else is already listening on port 4174, Playwright tests that server instead of starting its own, except in CI.

`tsconfig.e2e.json` type-checks the specs and the Playwright configuration with Node types plus the DOM library for `page.evaluate()` callbacks; `check-types` includes it.
