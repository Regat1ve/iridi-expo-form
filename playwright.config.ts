import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "e2e",
  workers: 1,
  use: { locale: "ru-RU", baseURL: `http://localhost:${PORT}` },
  // WebKit = the engine of Safari on a real iPad; Chromium covers Android phones scanning the QR.
  projects: [
    { name: "ipad-safari", use: { ...devices["iPad (gen 7)"] } },
    { name: "chromium", use: { ...devices["iPad (gen 7)"], browserName: "chromium" } },
  ],
  webServer: {
    command: `pnpm start -p ${PORT}`,
    port: PORT,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "postgres://test@localhost:5433/iridi",
      ADMIN_KEY: "test-key",
    },
  },
});
