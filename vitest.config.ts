import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "__tests__/",
        "*.config.*",
      ],
    },
    include: ["**/?(*.)+(spec|test).+(ts|tsx|js)"],
    // Exclude integration tests that require live environment variables and real API credentials
    // client.test.ts contains integration tests that would fail in CI without proper credentials
    exclude: ["__tests__/client.test.ts", "dist/", "node_modules/"],
  },
})