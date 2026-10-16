import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
]) {
  test(`foundation renders accessibly at ${viewport.width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    expect(response?.headers()['x-content-type-options']).toBe('nosniff');
    await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
    await expect(
      page.getByRole('heading', { name: 'nexo School', level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByText(/Dit is een ontwikkelomgeving/),
    ).not.toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.locator('summary')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText(/Dit is een ontwikkelomgeving/)).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath('foundation.png'),
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });
}

test('built Storybook serves the same accessible notice with shared styles', async ({
  page,
}) => {
  await page.goto('/');
  const applicationFont = await page
    .locator('main')
    .evaluate((element) => getComputedStyle(element).fontFamily);
  await page.goto(
    'http://127.0.0.1:4320/iframe.html?id=foundation-development-notice--default&viewMode=story',
  );
  await expect(
    page.getByRole('heading', { name: 'nexo School' }),
  ).toBeVisible();
  expect(
    await page
      .locator('main')
      .evaluate((element) => getComputedStyle(element).fontFamily),
  ).toBe(applicationFont);
  await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
  expect(
    (await new AxeBuilder({ page }).include('main').analyze()).violations,
  ).toEqual([]);
});
