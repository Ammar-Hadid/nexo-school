import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', workers: 1, fullyParallel: false, retries: 0,
  timeout: 60_000, reporter: 'list',
  use: { baseURL: 'http://localhost:4318', browserName: 'chromium', trace: 'off', screenshot: 'off', video: 'off' },
  webServer: { command: 'node tests/serve.mjs', url: 'http://localhost:4318/health', reuseExistingServer: false, timeout: 30_000 },
});
