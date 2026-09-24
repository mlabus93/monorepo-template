# `@repo/eslint-config`

This package provides the shared ESLint flat configuration for the monorepo. Apps and packages import it from their local `eslint.config.*` files so linting rules stay consistent across workspaces.

The implementation is `index.ts`, exported as an ES module and checked by this package's `tsconfig.json` and `check-types` script. Root `pnpm check-types` runs that task through Turbo. Node's built-in type stripping loads this local workspace package using the repository's required Node version. The small `eslint.config.js` entry files remain JavaScript so ESLint does not need a TypeScript configuration loader or feature flag.

The configuration combines ESLint's recommended JavaScript rules, the recommended TypeScript ESLint rules, React Hooks' recommended rules, and Prettier compatibility. TypeScript rules apply only to TypeScript files; JavaScript tooling and Node configuration files receive Node globals, while `src` and `components` directories receive browser globals. Non-null assertions remain allowed.

Generated build output, coverage, dependency directories, and tool caches are ignored. The root flat configuration applies this preset to the whole repository, including shared tooling scripts. `pnpm lint` checks all maintained JavaScript and TypeScript; app and UI package lint commands check their own workspace. Staged code uses the same preset.

## Usage

```js
import config from "@repo/eslint-config";

export default config;
```

The package aliases TypeScript 6 for TypeScript ESLint's compiler integration; application builds and editor tooling use the repository's primary TypeScript version.
