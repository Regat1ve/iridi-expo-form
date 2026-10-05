import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "e2e",
  workers: 1,
  use: { ...devices["iPad (gen 7)"], browserName: "chromium", locale: "ru-RU", baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `pnpm start -p ${PORT}`,
    port: PORT,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "postgres://test@localhost:5433/iridi",
      ADMIN_KEY: "test-key",
    },
  },
});
