# `@repo/typescript-config`

This package contains the shared TypeScript compiler configurations used throughout the monorepo. Centralizing these defaults keeps strictness, module resolution, and target settings aligned while allowing each workspace to add its own `include`, environment types, or overrides.

## Configurations

- `base.json` supplies strict, no-emit, bundler-oriented defaults for any workspace.
- `react-library.json` extends the base configuration with the React JSX transform and the same ES2023/browser library baseline as the Vite apps.
- `vite.json` extends the base configuration with browser libraries, an ES2023 target, JSON module support, and additional unused-code and return checks for Vite apps.

## Usage

Extend the configuration that best matches the workspace:

```json
{
  "extends": "@repo/typescript-config/vite.json",
  "include": ["src"],
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

As in the apps, React consumers of `vite.json` must add the JSX setting locally. The apps use a separate `tsconfig.node.json` extending `base.json` for their Node-based Vite and Vitest configuration files. These presets only configure type checking; Vite handles app output.

Vite-loaded configurations keep bundler module resolution and use ES2024/Node types. The ESLint and Vitest tooling packages own their `tsconfig.json` files and use NodeNext resolution for code loaded directly by Node. The Vitest tooling package also includes DOM types for its React Testing Library setup. Root `tsconfig.tools.json` covers only root tooling. Each package's `check-types` script is run by Turbo.
