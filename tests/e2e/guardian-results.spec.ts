import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const story = (name: string) =>
  `http://127.0.0.1:4320/iframe.html?id=practice-guardian-task-results--${name}&viewMode=story`;
for (const width of [320, 390, 768, 1024, 1440]) {
  test(`guardian task review and approved navigation at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 950 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto(story('review-page'));
    await expect(
      page.getByRole('heading', { name: 'Taakresultaten', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^Bekijk taak:/ }),
    ).toHaveCount(6);
    await expect(page.getByText('2 van 6 taken afgerond')).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath('guardian-list.png'),
      fullPage: true,
    });
    const open = page.getByRole('button', {
      name: 'Bekijk taak: Begrijpend Lezen · taak 1',
    });
    await open.focus();
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Begrijpend Lezen · taak 1',
      }),
    ).toBeFocused();
    await expect(page.getByText('8,5 / 10')).toBeVisible();
    await expect(page.getByText('9 / 10')).toBeVisible();
    await page
      .getByText('Volledige leestekst · Een tuin voor iedereen')
      .click();
    await expect(
      page
        .getByRole('article', { name: 'Een tuin voor iedereen' })
        .locator('p'),
    ).toHaveCount(6);
    const summary = page.locator('summary').filter({ hasText: /^Vraag 9/ });
    await summary.focus();
    await page.keyboard.press('Enter');
    const question = summary.locator('..');
    await expect(question.getByText('Tweede poging · Niet goed')).toBeVisible();
    await expect(
      question.getByRole('heading', { name: 'Antwoordmodel' }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (await new AxeBuilder({ page }).include('#storybook-root').analyze())
        .violations,
    ).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath('guardian-reading-detail.png'),
      fullPage: true,
    });
    await page.getByRole('button', { name: '← Alle taakresultaten' }).click();
    await expect(open).toBeFocused();
    if (width <= 688) {
      const bottom = page.getByRole('navigation', {
        name: 'Mobiele navigatie — Taakresultatenpreview',
      });
      await expect(bottom).toBeVisible();
      await bottom.getByRole('button', { name: 'Meer' }).click();
      await page.getByRole('link', { name: 'Beheer', exact: true }).click();
    } else {
      await page.getByRole('button', { name: 'Navigatie openen' }).click();
      await expect(
        page.getByRole('link', { name: 'Overzicht', exact: true }),
      ).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(
        page.getByRole('button', { name: 'Navigatie openen' }),
      ).toBeFocused();
      await page.keyboard.press('Enter');
      await page.getByRole('link', { name: 'Beheer', exact: true }).click();
    }
    await expect(
      page.getByText(/Dit onderdeel valt buiten deze preview/),
    ).toBeVisible();
    await page
      .getByRole('button', { name: 'Terug naar taakresultaten' })
      .click();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Taakresultaten' }),
    ).toBeFocused();
    expect(errors).toEqual([]);
  });
}

test('live guardian review preserves drafts, retry queue, completion and independent tasks; reload resets', async ({
  page,
}) => {
  await page.goto(story('empty-block'));
  await page.getByRole('button', { name: 'Naar leerlingpreview' }).click();
  await page
    .getByRole('button', { name: 'Start taak: Rekenen · taak 1' })
    .click();
  const answers = ['42', '37', '56', '63', '47', '54', '8', '83', '44', '63'];
  for (const [index, value] of answers.entries()) {
    await page
      .getByRole('textbox')
      .fill(index === 3 || index === 8 ? '1' : value);
    await page.getByRole('button', { name: 'Controleer antwoord' }).click();
    await page.getByRole('button', { name: 'Verder' }).click();
  }
  await expect(
    page.getByRole('heading', { name: '36 + 27 = ?' }),
  ).toBeVisible();
  await page.getByRole('textbox').fill('63');
  await page.getByRole('button', { name: 'Naar ouderpreview' }).click();
  await page
    .getByRole('button', { name: 'Bekijk taak: Rekenen · taak 1' })
    .click();
  await expect(page.getByText('Nog geen eindresultaat')).toBeVisible();
  await expect(
    page.getByText(/2 tweede pogingen staan nog open/),
  ).toBeVisible();
  await expect(page.getByText('Gewogen score')).toHaveCount(0);
  await page.getByText('Vraag 4', { exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Antwoordmodel' }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Naar leerlingpreview' }).click();
  await expect(page.getByRole('textbox')).toBeFocused();
  await expect(page.getByRole('textbox')).toHaveValue('63');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Verder' }).click();
  await expect(
    page.getByRole('heading', { name: '72 − 28 = ?' }),
  ).toBeVisible();
  await page.getByRole('textbox').fill('1');
  await page.getByRole('button', { name: 'Controleer antwoord' }).click();
  await expect(page.getByText(/Het juiste antwoord is 44/)).toBeVisible();
  await page.getByRole('button', { name: 'Naar ouderpreview' }).click();
  await page.getByText('Vraag 9', { exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Antwoordmodel' }),
  ).toBeVisible();
  await expect(page.getByText('Gewogen score')).toHaveCount(0);
  await page.getByRole('button', { name: 'Naar leerlingpreview' }).click();
  await expect(page.getByText(/Het juiste antwoord is 44/)).toBeVisible();
  await page.getByRole('button', { name: 'Verder' }).click();
  await expect(page.getByLabel('9 van de 10 sommen goed')).toBeVisible();
  await page.getByRole('button', { name: 'Naar ouderpreview' }).click();
  await expect(page.getByText('8,5 / 10')).toBeVisible();
  await expect(page.getByText('9 / 10')).toBeVisible();
  await page.getByRole('button', { name: '← Alle taakresultaten' }).click();
  await expect(page.getByText('1 van 6 taken afgerond')).toBeVisible();
  await page
    .getByRole('button', { name: 'Bekijk taak: Rekenen · taak 2' })
    .click();
  await expect(
    page.getByText('Nog niet gestart', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Naar leerlingpreview' }).click();
  await page.getByRole('link', { name: '← Terug naar mijn taken' }).click();
  await page
    .getByRole('button', { name: 'Start taak: Begrijpend Lezen · taak 1' })
    .click();
  await page.getByRole('radio').nth(1).check();
  const passage = await page
    .getByRole('article', { name: 'Een tuin voor iedereen' })
    .textContent();
  await page.getByRole('button', { name: 'Naar ouderpreview' }).click();
  await page.getByRole('button', { name: 'Naar leerlingpreview' }).click();
  await expect(page.getByRole('radio').nth(1)).toBeChecked();
  expect(
    await page
      .getByRole('article', { name: 'Een tuin voor iedereen' })
      .textContent(),
  ).toBe(passage);
  await page.reload();
  await expect(page.getByText('0 van 6 taken afgerond')).toBeVisible();
});
