# Docs app

The `docs` workspace is a Vite-powered React single-page app intended as a starting point for project documentation and examples. It currently has a starter screen, with no documentation content system or routing configured.

The entry point is `src/main.tsx`, which renders the shared `Header` and `Counter` components from [@repo/ui](../../packages/ui/README.md). Styles live in `src/app.module.css`, and static assets live in `public/`.

## Responsibilities

- Provide a starting point for documentation and examples.
- Consume reusable components from `@repo/ui`.
- Build and serve the documentation site with Vite.
- Test React behavior with Vitest and Testing Library.

## Common commands

Run these from the repository root:

```sh
pnpm --filter docs dev
pnpm --filter docs build
pnpm --filter docs lint
pnpm --filter docs test
```
