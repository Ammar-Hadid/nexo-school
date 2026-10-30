import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const url =
  'http://127.0.0.1:4320/iframe.html?id=practice-automatic-learning-path--review-page&viewMode=story';
for (const width of [320, 390, 768, 1024, 1440]) {
  test(`automatic learning path navigation and responsive review at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 950 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto(url);
    await expect(
      page.getByRole('heading', { name: 'Mijn blokken voor vandaag' }),
    ).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath('today.png'),
      fullPage: true,
    });
    await page.getByRole('link', { name: 'Bekijk taken' }).focus();
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('heading', { name: 'Jouw taken' }),
    ).toBeFocused();
    await page
      .getByRole('button', {
        name: 'Start taak: Rekenen · Redactiesommen · Dagelijkse toepassing',
      })
      .click();
    await expect(
      page.getByRole('textbox', { name: 'Jouw antwoord in potten' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(0);
    await page.getByRole('link', { name: '← Mijn taken' }).click();
    await page
      .getByRole('button', {
        name: 'Start taak: Rekenen · Getalbegrip · Nieuwe check',
      })
      .click();
    await expect(page.getByRole('textbox')).toBeFocused();
    await page.getByRole('textbox').fill('17');
    expect(
      (await new AxeBuilder({ page }).include('#storybook-root').analyze())
        .violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath('category-exercise.png'),
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Naar ouderpreview' }).click();
    await expect(
      page.getByRole('heading', { name: 'Automatisch klaar voor vandaag' }),
    ).toBeFocused();
    if (width <= 688) {
      const nav = page.getByRole('navigation', {
        name: 'Mobiele navigatie — Leerroutepreview',
      });
      await expect(nav).toBeVisible();
      await nav.getByRole('link', { name: 'Voortgang', exact: true }).click();
    } else {
      await page.getByRole('button', { name: 'Navigatie openen' }).click();
      await page.keyboard.press('Escape');
      await expect(
        page.getByRole('button', { name: 'Navigatie openen' }),
      ).toBeFocused();
      await page.keyboard.press('Enter');
      await page.getByRole('link', { name: 'Voortgang', exact: true }).click();
    }
    await expect(
      page.getByRole('heading', { name: 'Bewijs en voortgang' }),
    ).toBeFocused();
    await page
      .getByText('Bekijk bewijs en ingediende antwoorden', { exact: true })
      .first()
      .click();
    expect(
      (await new AxeBuilder({ page }).include('#storybook-root').analyze())
        .violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath('guardian-path-evidence.png'),
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Naar leerlingpreview' }).click();
    await expect(page.getByRole('textbox')).toHaveValue('17');
    await page.getByRole('link', { name: '← Mijn taken' }).click();
    await expect(
      page.getByRole('button', {
        name: 'Ga verder: Rekenen · Getalbegrip · Nieuwe check',
      }),
    ).toBeFocused();
    await page
      .getByRole('button', { name: 'Doorloop open taken foutloos (demo)' })
      .click();
    await page.getByRole('button', { name: 'Volgende previewdag' }).click();
    await page.getByRole('link', { name: 'Bekijk taken' }).click();
    await expect(
      page.getByRole('button', {
        name: 'Start taak: Rekenen · Optellen · Startcheck',
      }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Mijn blokken voor vandaag' }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('complementary', { name: 'Previewbediening' })
        .getByRole('status'),
    ).toContainText('Previewdag 1 van 7');
    expect(errors).toEqual([]);
  });
}
test('weekend daily assignment, retention and same-day reopening stay inside capacity', async ({
  page,
}) => {
  await page.goto(url);
  for (let day = 0; day < 6; day += 1) {
    await page.getByRole('link', { name: 'Bekijk taken' }).click();
    const starts = page.getByRole('button', { name: /^Start taak: / });
    expect(await starts.count()).toBeLessThanOrEqual(4);
    await expect(
      page.getByRole('button', {
        name: 'Start taak: Rekenen · Redactiesommen · Dagelijkse toepassing',
      }),
    ).toBeVisible();
    if (day === 2) {
      await expect(
        page
          .getByRole('complementary', { name: 'Previewbediening' })
          .getByRole('status'),
      ).toContainText('zaterdag');
      await expect(
        page.getByRole('button', {
          name: 'Start taak: Rekenen · Getalbegrip · Even terugkijken',
        }),
      ).toBeVisible();
    }
    if (day === 3)
      await expect(
        page
          .getByRole('complementary', { name: 'Previewbediening' })
          .getByRole('status'),
      ).toContainText('zondag');
    await page
      .getByRole('button', { name: 'Doorloop open taken foutloos (demo)' })
      .click();
    await expect(
      page.getByRole('button', { name: /^Start taak: / }),
    ).toHaveCount(0);
    await page.getByRole('link', { name: '← Terug naar mijn blokken' }).click();
    await page.getByRole('link', { name: 'Bekijk taken' }).click();
    await expect(
      page.getByRole('button', { name: /^Start taak: / }),
    ).toHaveCount(0);
    await page.getByRole('button', { name: 'Volgende previewdag' }).click();
  }
  await expect(
    page.getByRole('button', { name: 'Volgende previewdag' }),
  ).toBeDisabled();
});

test('numeric equivalence is accepted in the visible exercise and raw input remains visible', async ({
  page,
}) => {
  for (const value of ['29', '029']) {
    await page.goto(url);
    await page.getByRole('link', { name: 'Bekijk taken' }).click();
    await page
      .getByRole('button', {
        name: 'Start taak: Rekenen · Redactiesommen · Dagelijkse toepassing',
      })
      .click();
    const input = page.getByRole('textbox', {
      name: 'Jouw antwoord in potten',
    });
    await input.fill(value);
    await page.getByRole('button', { name: 'Controleer antwoord' }).click();
    await expect(page.getByText('✓ Goed!', { exact: true })).toBeVisible();
    await expect(input).toHaveValue(value);
    await page.getByRole('link', { name: '← Mijn taken' }).click();
    await page
      .getByRole('button', {
        name: 'Ga verder: Rekenen · Redactiesommen · Dagelijkse toepassing',
      })
      .click();
    await expect(input).toHaveValue(value);
    await expect(page.getByText('✓ Goed!', { exact: true })).toBeVisible();
  }
});

test('the audited wording/position shortcut fails and shuffled retry content survives resume', async ({
  page,
}) => {
  await page.goto(url);
  await page.getByRole('link', { name: 'Bekijk taken' }).click();
  await page
    .getByRole('button', {
      name: 'Start taak: Taal · Woordenschat · Startcheck',
    })
    .click();
  const originals: string[] = [];
  let firstCorrect = 0;
  for (let attempt = 0; attempt < 8; attempt++) {
    if (await page.getByRole('heading', { name: 'Taak klaar!' }).isVisible())
      break;
    const prompt = (await page
      .getByRole('heading', { level: 2 })
      .textContent())!;
    if (attempt < 4) originals.push(prompt);
    else expect(originals).toContain(prompt);
    const choices = prompt.split(': ').at(-1)!.replace(/\?$/, '').split(' of ');
    await page
      .getByRole('textbox')
      .fill(choices[prompt.startsWith('Kies') ? 1 : 0]!);
    await page.getByRole('button', { name: 'Controleer antwoord' }).click();
    if (
      attempt < 4 &&
      (await page.getByText('✓ Goed!', { exact: true }).isVisible())
    )
      firstCorrect++;
    await page.getByRole('link', { name: '← Mijn taken' }).click();
    await page
      .getByRole('button', {
        name: 'Ga verder: Taal · Woordenschat · Startcheck',
      })
      .click();
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(prompt);
    await page.getByRole('button', { name: 'Verder', exact: true }).click();
  }
  expect(firstCorrect).toBeLessThan(4);
  await expect(
    page.getByRole('heading', { name: 'Taak klaar!' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Naar ouderpreview' }).click();
  await expect(
    page.getByRole('region', { name: 'Taal leerroute' }),
  ).toContainText('Gericht oefenen');
  await expect(
    page.getByRole('region', { name: 'Taal leerroute' }),
  ).not.toContainText('Bevestigd binnen de demo');
});

test('a vocabulary gap can practise but cannot advance without appropriate assessment content', async ({
  page,
}) => {
  async function open(title: string) {
    await page.getByRole('link', { name: 'Bekijk taken' }).click();
    await page.getByRole('button', { name: `Start taak: ${title}` }).click();
  }
  async function answers(values: string[]) {
    for (const value of values) {
      await page.getByRole('textbox').fill(value);
      await page.getByRole('button', { name: 'Controleer antwoord' }).click();
      await page.getByRole('button', { name: 'Verder', exact: true }).click();
    }
    await expect(
      page.getByRole('heading', { name: 'Taak klaar!' }),
    ).toBeVisible();
  }
  await page.goto(url);
  await open('Taal · Woordenschat · Startcheck');
  // Independently supplied expected words for this fixed review history, not the runtime answer key.
  await answers(['anders', 'koud', 'rustig', 'droog', 'vrolijk']);
  await page.getByRole('button', { name: 'Volgende previewdag' }).click();
  await open('Taal · Woordenschat · Gericht oefenen');
  await answers([
    'plezierig',
    'kapot',
    'moedig',
    'eenvoudig',
    'lastig',
    'aardig',
    'woning',
    'rijwiel',
    'bedroefd',
    'vermoeid',
  ]);
  await page.getByRole('button', { name: 'Volgende previewdag' }).click();
  await page.getByRole('link', { name: 'Bekijk taken' }).click();
  await expect(
    page.getByRole('button', { name: /Start taak: Taal/ }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Naar ouderpreview' }).click();
  await expect(
    page.getByText(/Taal: passende ongeziene vragen ontbreken/),
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Taal leerroute' }),
  ).toContainText('Aanvullend bewijs nodig');
  await expect(
    page.getByRole('region', { name: 'Taal leerroute' }),
  ).not.toContainText('Voorlopig verder');
});

test('a conceptual gap receives one fresh confirmation after practice, with provisional advancement visible', async ({
  page,
}) => {
  await page.goto(url);
  await page.getByRole('link', { name: 'Bekijk taken' }).click();
  await page
    .getByRole('button', {
      name: 'Start taak: Rekenen · Getalbegrip · Nieuwe check',
    })
    .click();
  for (const answer of ['99999', '373', '412', '444', '34']) {
    await page.getByRole('textbox').fill(answer);
    await page.getByRole('button', { name: 'Controleer antwoord' }).click();
    await page.getByRole('button', { name: 'Verder', exact: true }).click();
  }
  await expect(
    page.getByRole('heading', { name: 'Taak klaar!' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Volgende previewdag' }).click();
  await page.getByRole('link', { name: 'Bekijk taken' }).click();
  await expect(
    page.getByRole('button', {
      name: 'Start taak: Rekenen · Getalbegrip · Gericht oefenen',
    }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Doorloop open taken foutloos (demo)' })
    .click();
  await page.getByRole('button', { name: 'Volgende previewdag' }).click();
  await page.getByRole('link', { name: 'Bekijk taken' }).click();
  await page
    .getByRole('button', {
      name: 'Start taak: Rekenen · Getalbegrip · Nieuwe check',
    })
    .click();
  await expect(page.getByRole('heading', { level: 2 })).toContainText(
    '423 eenheden',
  );
  await page.getByRole('textbox').fill('42');
  await page.getByRole('button', { name: 'Controleer antwoord' }).click();
  await page.getByRole('button', { name: 'Verder', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Taak klaar!' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Naar ouderpreview' }).click();
  await expect(
    page.getByRole('region', { name: 'Rekenen leerroute' }),
  ).toContainText('Voorlopig verder');
  await expect(
    page.getByRole('region', { name: 'Taal leerroute' }),
  ).not.toContainText('Voorlopig verder');
});
