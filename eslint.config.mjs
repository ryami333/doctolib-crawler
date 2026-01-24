// @ts-check

import { defineConfig, globalIgnores } from "eslint/config";
import typescriptEslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig([
  globalIgnores(["dist/", ".output/"]),
  ...typescriptEslint.configs.recommended,
  reactHooks.configs.flat.recommended,
]);
