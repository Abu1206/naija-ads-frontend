import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// `@/` is the project-wide import alias (tsconfig paths). Vitest does not read
// tsconfig paths on its own, and type-only imports are stripped before
// resolution — so the first *value* import through `@/` fails without this.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: /^@\/(.*)$/, replacement: `${path.resolve(__dirname)}/$1` }],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
  },
});
