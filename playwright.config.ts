import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4319',
    browserName: 'chromium',
    locale: 'nl-NL',
    timezoneId: 'Europe/Amsterdam',
    colorScheme: 'light',
    reducedMotion: 'reduce',
    trace: 'off',
  },
  webServer: [
    {
      command: 'npm run start',
      // Root E2E must not inherit an operator's local identity database opt-in.
      env: { PORT: '4319', NEXO_LOCAL_IDENTITY: '' },
      url: 'http://127.0.0.1:4319',
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command:
        'npx --no-install serve storybook-static -c ../.storybook/serve.json -l tcp://127.0.0.1:4320 --no-clipboard --no-port-switching',
      url: 'http://127.0.0.1:4320',
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
});
