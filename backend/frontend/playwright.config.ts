import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  use: {
    // Changement ici : on pointe vers le vrai site
    baseURL: 'https://emploiplus-group.com', 
    headless: true,
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true,
    actionTimeout: 10_000,
  },
  projects: [
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
});