import { defineConfig, devices } from '@playwright/test';

const IS_CI = !!process.env.CI;
const BASE_URL = process.env.BASE_URL ?? 'https://www.saucedemo.com';

export default defineConfig({
  testDir: './tests',

  outputDir: './test-results',

  fullyParallel: true,

  // this fails the CI build if someone accidentally commits `test.only`.
  forbidOnly: IS_CI,

  retries: IS_CI ? 1 : 0,

  workers: IS_CI ? 2 : undefined,

  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: BASE_URL,

    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',

    actionTimeout: 15_000,
    navigationTimeout: 15_000,

    launchOptions: {
      slowMo: Number(process.env.SLOWMO) || 0,
    },
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/standard_user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: '.auth/standard_user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
