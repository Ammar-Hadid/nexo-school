import { expect, test } from '@playwright/test';

// Baselines require review; this explicit command is not part of `check` until approval.
test('foundation visual contract', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'nexo School' }),
  ).toBeVisible();
  await expect(page).toHaveScreenshot(
    `foundation-${testInfo.project.name}.png`,
    {
      fullPage: true,
      animations: 'disabled',
    },
  );
});
