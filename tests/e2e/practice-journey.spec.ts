import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const reviewUrl =
  'http://127.0.0.1:4320/iframe.html?id=practice-connected-journey--review-page&viewMode=story';

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`connected preview preserves reading and navigation at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 950 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto(reviewUrl);
    await expect(
      page.getByRole('heading', { name: 'Mijn blokken' }),
    ).toBeVisible();
    await page.getByRole('link', { name: 'Bekijk taken' }).click();
    await expect(
      page.getByRole('heading', { name: 'Jouw taken' }),
    ).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole('button', { name: 'Start taak: Spelling · taak 1' })
      .click();
    await page.getByRole('textbox').fill('kat ten');
    await page.getByRole('link', { name: '← Mijn taken' }).click();
    await page
      .getByRole('button', { name: 'Start taak: Begrijpend Lezen · taak 1' })
      .click();
    const passage = page.getByRole('article', {
      name: 'Een tuin voor iedereen',
    });
    const text = await passage.textContent();
    const paragraphs = passage.locator('p');
    await expect(paragraphs).toHaveCount(6);
    await expect(
      page.getByRole('link', { name: /Naar de vraag|Terug naar de tekst/ }),
    ).toHaveCount(0);
    const choices = page.getByRole('radio');
    await choices.nth(1).check();
    const articleBox = await passage.boundingBox();
    const questionBox = await page
      .getByRole('heading', { name: 'Waarom wil Noor een tuin maken?' })
      .boundingBox();
    expect(articleBox).not.toBeNull();
    expect(questionBox).not.toBeNull();
    if (width < 944)
      expect(questionBox!.y).toBeGreaterThan(
        articleBox!.y + articleBox!.height,
      );
    else
      expect(questionBox!.x).toBeGreaterThan(articleBox!.x + articleBox!.width);
    await page.getByRole('link', { name: '← Mijn taken' }).click();
    await page.getByRole('link', { name: '← Terug naar mijn blokken' }).click();
    await expect(
      page.getByRole('link', { name: 'Bekijk taken' }),
    ).toBeFocused();
    await page.keyboard.press('Enter');
    await page
      .getByRole('button', { name: 'Ga verder: Spelling · taak 1' })
      .click();
    await expect(page.getByRole('textbox')).toHaveValue('kat ten');
    await page.keyboard.press('Enter');
    await expect(
      page.getByText('Nog niet goed', { exact: true }),
    ).toBeVisible();
    await page.getByRole('link', { name: '← Mijn taken' }).click();
    await page
      .getByRole('button', { name: 'Ga verder: Begrijpend Lezen · taak 1' })
      .click();
    await expect(choices.nth(1)).toBeChecked();
    expect(await passage.textContent()).toBe(text);
    await page.getByRole('button', { name: 'Controleer antwoord' }).click();
    await expect(page.getByText('✓ Goed!')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (await new AxeBuilder({ page }).include('main').analyze()).violations,
    ).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath('reading-feedback.png'),
      fullPage: true,
    });
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Mijn blokken' }),
    ).toBeVisible();
    await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0');
    await page.getByRole('link', { name: 'Bekijk taken' }).click();
    await expect(
      page.getByRole('button', { name: /^Start taak:/ }),
    ).toHaveCount(6);
    await expect(page.getByRole('button', { name: /^Ga verder:/ })).toHaveCount(
      0,
    );
    await expect(
      page.getByText(/Vernieuwen of sluiten wist alle antwoorden/),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('completes all six independent tasks without assigning gaming eligibility', async ({
  page,
}) => {
  await page.goto(reviewUrl);
  await page.getByRole('link', { name: 'Bekijk taken' }).click();
  const sums = ['42', '37', '56', '63', '47', '54', '8', '83', '44', '63'];
  const tasks = [
    { title: 'Rekenen · taak 1', answers: sums },
    { title: 'Rekenen · taak 2', answers: sums },
    {
      title: 'Taal · taak 1',
      answers: [
        'slaapt',
        'leest',
        'rent',
        'fietst',
        'zingt',
        'tekent',
        'lacht',
        'danst',
        'zwemt',
        'bouwt',
      ],
    },
    {
      title: 'Spelling · taak 1',
      answers: [
        'katten',
        'honden',
        'bomen',
        'kippen',
        'ramen',
        'boeken',
        'pennen',
        'boten',
        'vissen',
        'tenten',
      ],
    },
    { title: 'Redactiesommen · taak 1', answers: sums },
    {
      title: 'Begrijpend Lezen · taak 1',
      answers: ['b', 'd', 'a', 'c', 'a', 'd', 'b', 'c', 'a', 'd'],
    },
  ];
  for (const task of tasks) {
    await page
      .getByRole('button', { name: `Start taak: ${task.title}` })
      .click();
    for (const answer of task.answers) {
      if (task.title.startsWith('Begrijpend'))
        await page.locator(`input[type="radio"][value="${answer}"]`).check();
      else await page.getByRole('textbox').fill(answer);
      await page.getByRole('button', { name: 'Controleer antwoord' }).click();
      await page.getByRole('button', { name: 'Verder' }).click();
    }
    await expect(
      page.getByRole('heading', { name: 'Taak klaar!' }),
    ).toBeVisible();
    await page.getByRole('link', { name: '← Terug naar mijn taken' }).click();
  }
  await expect(
    page.getByRole('button', { name: /^Bekijk resultaat:/ }),
  ).toHaveCount(6);
  await expect(page.getByRole('status')).toHaveText(
    'Alle taken zijn klaar! Goed gedaan!',
  );
  await page.getByRole('link', { name: '← Terug naar mijn blokken' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '6');
  await expect(page.getByText(/gamepas|verdiend/i)).toHaveCount(0);
  await page.getByRole('link', { name: 'Bekijk taken' }).click();
  await page
    .getByRole('button', { name: 'Bekijk resultaat: Rekenen · taak 1' })
    .click();
  await expect(page.getByLabel('10 van de 10 sommen goed')).toBeVisible();
});
