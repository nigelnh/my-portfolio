import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

// Mirrors the `@/*` -> `./*` path alias in tsconfig.json.
// tsconfig uses `jsx: preserve` (Next compiles JSX), so tell the test
// transformer to compile JSX itself.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "jsdom",
    include: ["**/*.test.{ts,tsx}"],
    exclude: [...configDefaults.exclude, ".next/**", ".claude/**", "coverage/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["lib/**", "components/**", "app/**"],
      exclude: ["**/*.test.{ts,tsx}", "**/*.d.ts"],
    },
  },
});
