# `@repo/eslint-config`

This package provides the shared ESLint flat configuration for the monorepo. Apps and packages import it from their local `eslint.config.*` files so linting rules stay consistent across workspaces.

The configuration combines ESLint's recommended JavaScript rules, the recommended TypeScript ESLint rules, and Prettier compatibility. It also defines browser globals for TypeScript files, ignores generated `dist` output, and allows non-null assertions.

## Usage

```js
import config from "@repo/eslint-config";

export default config;
```

The package aliases TypeScript 6 for TypeScript ESLint's compiler integration; application builds and editor tooling use the repository's primary TypeScript version.
