# `@repo/ui`

This package is the shared React component library for the template's apps. It keeps reusable presentation and interaction code in one workspace so `web`, `docs`, and future React consumers can share a consistent UI foundation.

## Current components

- `Header` renders a heading from a supplied `title`.
- `Counter` provides a small stateful button used by the starter apps and component tests.

Consumers can import from the package root:

```tsx
import { Counter, Header } from "@repo/ui";
```

The component-specific paths `@repo/ui/Counter` and `@repo/ui/Header` are also exported. All exports point directly to TypeScript source under `src`, which the consuming app processes; this package has no separate build step or compiled distribution.

## Source and configuration

`src/index.ts` is the package entry point. Components and their tests live in `src/components`, and `src/test-env.d.ts` supplies DOM matcher types. ESLint and Vitest configuration files stay at the package root.

`tsconfig.json` checks `src` using the shared React library preset. `tsconfig.node.json` checks `vitest.config.ts` with Node settings, matching the apps' separation of source and tooling. The `check-types` command runs both configurations.

## Common commands

Run these from the repository root:

```sh
pnpm --filter @repo/ui check-types
pnpm --filter @repo/ui lint
pnpm --filter @repo/ui test
```
