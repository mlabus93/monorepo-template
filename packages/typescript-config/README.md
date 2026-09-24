# `@repo/typescript-config`

This package contains the shared TypeScript compiler configurations used throughout the monorepo. Centralizing these defaults keeps strictness, module resolution, and target settings aligned while allowing each workspace to add its own `include`, environment types, or overrides.

## Configurations

- `base.json` supplies strict, no-emit, bundler-oriented defaults for every workspace, including the unused-code and implicit-return checks. Strictness never varies by workspace: shared packages are consumed as source, so they are type-checked under their consumers' settings anyway.
- `react.json` extends the base configuration with browser libraries, an ES2023 target, and the React JSX transform. Apps and React component packages use it.
- `node.json` extends the base configuration with an ES2024 target and Node types for configuration files and tooling.

## Usage

Extend the configuration that matches the code's runtime environment:

```json
{
  "extends": "@repo/typescript-config/react.json",
  "include": ["src"]
}
```

The apps and the UI package use a separate `tsconfig.node.json` extending `node.json` for their Vite and Vitest configuration files. These presets only configure type checking; Vite handles app output.

Vite-loaded configurations keep the bundler module resolution from `base.json`. The ESLint and Vitest tooling packages and the root `tsconfig.tools.json` also extend `node.json` but switch to NodeNext resolution because Node loads that code directly. Each package's `check-types` script is run by Turbo.
