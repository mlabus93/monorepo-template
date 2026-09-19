# Web app

The `web` workspace is the template's main browser application. It is a React and TypeScript single-page app built and served with Vite, ready to become the primary user-facing experience for a new project.

The app currently displays a starter screen with the shared `Header` and `Counter` components from [@repo/ui](../../packages/ui/README.md). Start editing in `src/main.tsx`; styles live in `src/app.module.css`, and static assets live in `public/`. Product features and routing are not yet implemented.

## Responsibilities

- Provide the starting point for the project's primary user-facing experience.
- Compose reusable components from `@repo/ui`.
- Build and serve the browser application with Vite.
- Test React behavior with Vitest and Testing Library.

## Common commands

Run these from the repository root:

```sh
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web lint
pnpm --filter web test
```
