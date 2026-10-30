import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('D08 route fails closed and shows recoverable unavailability without identity configuration', async ({
  page,
  request,
}) => {
  const response = await request.get('/api/guardian/results');
  expect(response.status()).toBe(503);
  expect(response.headers()['cache-control']).toBe('no-store');
  await page.goto('/guardian/results');
  await expect(
    page.getByText(
      'Aanmelden is nu niet beschikbaar. Controleer of de lokale app en database actief zijn.',
    ),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Opnieuw proberen' }).click();
  await expect(
    page.getByText(
      'Aanmelden is nu niet beschikbaar. Controleer of de lokale app en database actief zijn.',
    ),
  ).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('D08 signed-out, empty and disconnected states show honest availability', async ({
  page,
}) => {
  let status = 401;
  await page.route('**/api/auth/portal-session', (route) =>
    route.fulfill(
      status === 401
        ? { status: 401, json: {} }
        : {
            status: 200,
            json: {
              role: 'guardian',
              name: 'Testouder',
              fresh: true,
              freshUntil: Date.now() + 300000,
              operator: true,
            },
          },
    ),
  );
  await page.route('**/api/guardian/results', async (route) => {
    if (status === 0) return route.abort();
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: status === 200 ? '[]' : '{}',
    });
  });
  await page.goto('/guardian/results');
  await expect(
    page.getByRole('button', { name: 'Aanmelden als ouder' }),
  ).toBeVisible();
  status = 200;
  await page.reload();
  await expect(page.getByText('Nog geen sessie om te bekijken')).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Bekijk sessie:/ }),
  ).toHaveCount(0);
  status = 0;
  await page.reload();
  await expect(
    page.getByText(
      'Sessieresultaten zijn nu niet beschikbaar. Probeer het opnieuw.',
    ),
  ).toBeVisible();
});
