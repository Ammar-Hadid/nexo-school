import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [320, 768, 1024, 1440]) {
  test(`shared student sign-in is usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    // Synthetic signed-out response; the real passkey flow is covered by test:saved.
    await page.route('**/api/auth/portal-session', (route) =>
      route.fulfill({ status: 401, json: {} }),
    );
    await page.route('**/api/practice/assignments', (route) =>
      route.fulfill({ status: 401, json: { error: 'UNAUTHORIZED' } }),
    );
    await page.goto('/student');
    await expect(
      page.getByRole('heading', { name: 'Welkom terug.' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Aanmelden', exact: true }),
    ).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('link', { name: 'Naar aanmelden' }),
    ).toBeFocused();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('button', { name: 'Aanmelden', exact: true }),
    ).toBeFocused();
    await page.getByText('Hulp nodig bij aanmelden?').click();
    await expect(
      page.getByText(/Gebruik de browser die je ouder/),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('disabled identity shows availability and retries without launching passkey', async ({
  page,
}) => {
  let reads = 0;
  page.on('request', (request) => {
    if (request.url().endsWith('/api/auth/portal-session')) reads++;
  });
  await page.goto('/student');
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: 'Aanmelden is nu niet beschikbaar' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Aanmelden', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Opnieuw proberen' }).click();
  await expect.poll(() => reads).toBe(2);
  await expect(
    page.getByRole('button', { name: 'Opnieuw proberen' }),
  ).toBeVisible();
});
