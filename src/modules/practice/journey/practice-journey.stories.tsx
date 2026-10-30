import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { PracticeJourney } from './practice-journey';

const meta = {
  title: 'Practice/Connected journey',
  tags: ['approved'],
  component: PracticeJourney,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          'Approved · connected synthetic practice journey revision 1 (19 October 2026). Temporary in-memory state only; reload resets all tasks. Existing approved subject screens, exact fixtures/messages and deferred retries. No gaming-pass eligibility or production learning.',
      },
    },
  },
} satisfies Meta<typeof PracticeJourney>;
export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = ReturnType<typeof within>;
const sums = ['42', '37', '56', '63', '47', '54', '8', '83', '44', '63'];

async function openTask(c: Canvas, title: string) {
  await userEvent.click(c.getByRole('link', { name: 'Bekijk taken' }));
  await userEvent.click(
    c.getByRole('button', { name: `Start taak: ${title}` }),
  );
  await expect(c.getByRole('heading', { level: 1, name: title })).toBeVisible();
}
async function resume(c: Canvas, title: string) {
  await userEvent.click(c.getByRole('link', { name: '← Mijn taken' }));
  const action = c.getByRole('button', { name: `Ga verder: ${title}` });
  await expect(action).toHaveFocus();
  await userEvent.keyboard('{Enter}');
}
async function answer(c: Canvas, value: string, choice = false) {
  if (choice) {
    await userEvent.click(
      c.getAllByRole('radio')[['a', 'b', 'c', 'd'].indexOf(value)]!,
    );
  } else {
    const input = c.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, value);
  }
  await userEvent.click(c.getByRole('button', { name: 'Controleer antwoord' }));
}
async function next(c: Canvas) {
  await userEvent.click(c.getByRole('button', { name: 'Verder' }));
}
async function verifyResult(
  c: Canvas,
  title: string,
  solved: number,
  noun: string,
) {
  await expect(c.getByRole('heading', { name: 'Taak klaar!' })).toBeVisible();
  await expect(
    c.getByLabelText(`${solved} van de 10 ${noun} goed`),
  ).toBeVisible();
  await expect(
    c.queryByRole('button', { name: 'Voorbeeld opnieuw proberen' }),
  ).not.toBeInTheDocument();
  await userEvent.click(
    c.getByRole('link', { name: '← Terug naar mijn taken' }),
  );
  const result = c.getByRole('button', { name: `Bekijk resultaat: ${title}` });
  await expect(result).toHaveFocus();
  await expect(result.closest('li')).toHaveTextContent('Klaar!');
  await userEvent.keyboard('{Enter}');
  await expect(
    c.getByLabelText(`${solved} van de 10 ${noun} goed`),
  ).toBeVisible();
}

export const ReviewPage: Story = {};
export const KeyboardNavigationAndIsolation: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const open = c.getByRole('link', { name: 'Bekijk taken' });
    open.focus();
    await userEvent.keyboard('{Enter}');
    await expect(c.getByRole('heading', { name: 'Jouw taken' })).toHaveFocus();
    await userEvent.click(
      c.getByRole('link', { name: '← Terug naar mijn blokken' }),
    );
    await expect(c.getByRole('link', { name: 'Bekijk taken' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    c.getByRole('button', { name: 'Start taak: Rekenen · taak 1' }).focus();
    await userEvent.keyboard('{Enter}');
    await expect(c.getByRole('textbox')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await resume(c, 'Rekenen · taak 1');
    await expect(c.getByText('Typ eerst een getal in.')).toBeVisible();
    await userEvent.type(c.getByRole('textbox'), '17');
    const message = c.getByRole('status').textContent;
    await userEvent.click(c.getByRole('link', { name: '← Mijn taken' }));
    await userEvent.click(
      c.getByRole('button', { name: 'Start taak: Rekenen · taak 2' }),
    );
    await expect(c.getByRole('textbox')).toHaveValue('');
    await userEvent.type(c.getByRole('textbox'), '42');
    await userEvent.keyboard('{Tab}{Enter}');
    await expect(c.getByText('✓ Goed!')).toBeVisible();
    await userEvent.click(c.getByRole('link', { name: '← Mijn taken' }));
    await userEvent.click(
      c.getByRole('link', { name: '← Terug naar mijn blokken' }),
    );
    await expect(c.getByRole('link', { name: 'Bekijk taken' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(
      c.getByRole('button', { name: 'Ga verder: Rekenen · taak 1' }),
    );
    await expect(c.getByRole('textbox')).toHaveValue('17');
    await expect(c.getByRole('status').textContent).toBe(message);
    await userEvent.keyboard('{Enter}');
    await resume(c, 'Rekenen · taak 1');
    await expect(c.getByRole('textbox')).toHaveValue('17');
    await expect(c.getByRole('textbox')).toHaveAttribute('readonly');
    await expect(c.getByText('Nog niet goed')).toBeVisible();
    await next(c);
    await expect(c.getByText('56 − 19 = ?')).toBeVisible();
    await expect(c.getByRole('textbox')).toHaveFocus();
    await userEvent.click(c.getByRole('link', { name: '← Mijn taken' }));
    await userEvent.click(
      c.getByRole('button', { name: 'Ga verder: Rekenen · taak 2' }),
    );
    await expect(c.getByText('24 + 18 = ?')).toBeVisible();
    await expect(c.getByText('✓ Goed!')).toBeVisible();
  },
};
export const DeferredRetriesAndCompletion: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await openTask(c, 'Rekenen · taak 1');
    for (const [i, value] of sums.entries()) {
      await answer(c, i === 3 || i === 8 ? '1' : value);
      await expect(
        c.queryByText(/Het juiste antwoord/),
      ).not.toBeInTheDocument();
      await next(c);
    }
    await expect(c.getByText('36 + 27 = ?')).toBeVisible();
    await userEvent.type(c.getByRole('textbox'), '63');
    await resume(c, 'Rekenen · taak 1');
    await expect(c.getByRole('textbox')).toHaveValue('63');
    await userEvent.keyboard('{Enter}');
    await expect(c.queryByText(/Het juiste antwoord/)).not.toBeInTheDocument();
    await next(c);
    await expect(c.getByText('72 − 28 = ?')).toBeVisible();
    await answer(c, '1');
    await resume(c, 'Rekenen · taak 1');
    await expect(c.getByText(/Het juiste antwoord is 44/)).toBeVisible();
    await next(c);
    await verifyResult(c, 'Rekenen · taak 1', 9, 'sommen');
    await userEvent.click(c.getByRole('link', { name: '← Mijn taken' }));
    await expect(
      c.getByRole('button', { name: 'Start taak: Rekenen · taak 2' }),
    ).toBeVisible();
    await userEvent.click(
      c.getByRole('link', { name: '← Terug naar mijn blokken' }),
    );
    await expect(c.getByRole('progressbar')).toHaveAttribute('value', '1');
    await expect(c.queryByText(/gamepas|verdiend/i)).not.toBeInTheDocument();
  },
};

function completeTextTask(
  title: string,
  answers: string[],
  noun: string,
): Story {
  return {
    play: async ({ canvasElement }) => {
      const c = within(canvasElement);
      await openTask(c, title);
      for (const value of answers) {
        await answer(c, value);
        await next(c);
      }
      await verifyResult(c, title, 10, noun);
    },
  };
}
export const TaalCompletion: Story = completeTextTask(
  'Taal · taak 1',
  [
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
  'vragen',
);
export const SpellingCompletion: Story = completeTextTask(
  'Spelling · taak 1',
  [
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
  'woorden',
);
export const RedactiesommenCompletion: Story = completeTextTask(
  'Redactiesommen · taak 1',
  sums,
  'sommen',
);
export const ReadingBundleResumeAndCompletion: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await openTask(c, 'Begrijpend Lezen · taak 1');
    const passage = c.getByRole('article', {
      name: 'Een tuin voor iedereen',
    }).textContent;
    const options = c
      .getAllByRole('radio')
      .map((radio) => radio.parentElement?.textContent);
    c.getAllByRole('radio')[0]!.focus();
    await userEvent.keyboard('{ArrowDown}');
    await resume(c, 'Begrijpend Lezen · taak 1');
    await expect(c.getAllByRole('radio')[1]).toBeChecked();
    const gold = ['b', 'd', 'a', 'c', 'a', 'd', 'b', 'c', 'a', 'd'];
    for (const [i, value] of gold.entries()) {
      await expect(
        c.getByRole('article', { name: 'Een tuin voor iedereen' }).textContent,
      ).toBe(passage);
      await answer(c, i === 0 || i === 9 ? 'a' : value, true);
      await next(c);
    }
    await expect(
      c.getAllByRole('radio').map((radio) => radio.parentElement?.textContent),
    ).toEqual(options);
    await resume(c, 'Begrijpend Lezen · taak 1');
    await answer(c, 'b', true);
    await next(c);
    await answer(c, 'a', true);
    await resume(c, 'Begrijpend Lezen · taak 1');
    await expect(
      c.getByRole('article', { name: 'Een tuin voor iedereen' }).textContent,
    ).toBe(passage);
    await expect(c.getByText(/In alinea 1 staat:/)).toBeVisible();
    await next(c);
    await verifyResult(c, 'Begrijpend Lezen · taak 1', 9, 'vragen');
  },
};
