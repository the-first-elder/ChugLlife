import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 5173);

export default defineConfig({
  testDir: "e2e",
  timeout: 180_000,
  expect: { timeout: 30_000 },
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  webServer: {
    command: "npm run dev",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
