import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { FamilyReviewDemo } from './family-review-demo';
const meta = {
  title: 'Content/Family certification',
  component: FamilyReviewDemo,
  tags: ['in-review'],
  parameters: {
    docs: {
      description: {
        component:
          'D14-S2 synthetic family workflow. Story decisions are simulations, never independent human approval. Package-owned examples and judgments; automatic publication stays disabled.',
      },
    },
  },
} satisfies Meta<typeof FamilyReviewDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReviewFamily: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.getByRole('heading', {
        name: 'Optellen · cijfers 0–9 · nieuwe uitleg',
      }),
    ).toBeVisible();
    await expect(c.getByText(/100 sommen · 0 rekenafwijkingen/)).toBeVisible();
  },
};
async function completeExamples(canvasElement: HTMLElement) {
  const c = within(canvasElement);
  await userEvent.click(
    c.getByRole('button', { name: 'Bekijk de 9 voorbeelden' }),
  );
  for (let n = 0; n < 9; n++)
    await userEvent.click(
      c.getByRole('button', {
        name:
          n === 8
            ? 'Bekeken · naar mijn oordeel'
            : 'Bekeken · volgend voorbeeld',
      }),
    );
  return c;
}
async function judgments(c: ReturnType<typeof within>) {
  for (const title of [
    'Bereik en voorkennis',
    'Vraag en toegankelijkheid',
    'Uitleg en terugkoppeling',
    'Antwoordregels en herhaling',
  ])
    await userEvent.selectOptions(
      c.getByLabelText(`Oordeel: ${title}`),
      'accept',
    );
  await userEvent.selectOptions(
    c.getByLabelText('Basis van mijn oordeel'),
    'independent-human',
  );
  await userEvent.type(
    c.getByLabelText(/Toelichting bij mijn oordeel/),
    'Synthetische testbeoordeling van de hele familie.',
  );
}
export const GuardianFeedback: Story = {
  play: async ({ canvasElement }) => {
    const c = await completeExamples(canvasElement);
    await judgments(c);
    await expect(
      c.getByRole('button', { name: 'Beoordeling vastleggen' }),
    ).toBeDisabled();
    await userEvent.click(c.getByRole('checkbox'));
    await userEvent.click(
      c.getByRole('button', { name: 'Beoordeling vastleggen' }),
    );
    await expect(
      c.getByRole('heading', {
        name: 'Ouderfeedback vastgelegd · certificering blijft open',
      }),
    ).toBeVisible();
  },
};
export const EducatorDecision: Story = {
  play: async ({ canvasElement }) => {
    const c = await completeExamples(canvasElement);
    await judgments(c);
    await userEvent.selectOptions(
      c.getByLabelText('Ik beoordeel als'),
      'educator',
    );
    await userEvent.type(
      c.getByLabelText(/Relevante deskundigheid/),
      'Synthetische deskundigheidsverklaring, geen echte persoon.',
    );
    await userEvent.click(c.getByRole('checkbox'));
    await userEvent.click(
      c.getByRole('button', { name: 'Beoordeling vastleggen' }),
    );
    await expect(
      c.getByRole('heading', {
        name: 'Onderwijskundige goedkeuring vastgelegd · publicatie blijft geblokkeerd',
      }),
    ).toBeVisible();
  },
};
export const NeedsChanges: Story = {
  play: async ({ canvasElement }) => {
    const c = await completeExamples(canvasElement);
    await judgments(c);
    await userEvent.click(c.getByRole('checkbox'));
    await userEvent.selectOptions(
      c.getByLabelText('Oordeel: Uitleg en terugkoppeling'),
      'change',
    );
    await expect(c.getByRole('checkbox')).not.toBeChecked();
    await userEvent.click(c.getByRole('checkbox'));
    await userEvent.click(
      c.getByRole('button', { name: 'Beoordeling vastleggen' }),
    );
    await expect(
      c.getByRole('heading', { name: 'Aanpassing nodig · geen certificaat' }),
    ).toBeVisible();
  },
};
export const Resume: Story = {
  args: { resume: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('article', { name: 'Voorbeeld 3' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: '3. Mijn oordeel' }));
    await expect(c.getByLabelText(/Toelichting bij mijn oordeel/)).toHaveValue(
      'Opgeslagen voorbeeldnotitie.',
    );
    await expect(
      c.getByRole('button', { name: 'Beoordeling vastleggen' }),
    ).toBeDisabled();
  },
};
export const SaveFailure: Story = {
  args: { fail: true, resume: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Voortgang opslaan' }));
    await expect(c.getByRole('alert')).toHaveTextContent('Niet opgeslagen.');
  },
};

export const StopEarly: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: '3. Mijn oordeel' }));
    await userEvent.selectOptions(
      c.getByLabelText('Oordeel: Uitleg en terugkoppeling'),
      'change',
    );
    await userEvent.selectOptions(
      c.getByLabelText('Basis van mijn oordeel'),
      'independent-human',
    );
    await userEvent.type(
      c.getByLabelText(/Toelichting bij mijn oordeel/),
      'Ik wil eerst een uitgewerkte rekenstrategie zien.',
    );
    await userEvent.click(c.getByRole('checkbox'));
    await userEvent.click(
      c.getByRole('button', { name: 'Beoordeling vastleggen' }),
    );
    await expect(
      c.getByRole('heading', { name: 'Aanpassing nodig · geen certificaat' }),
    ).toBeVisible();
  },
};

export const TwoDigitFamily: Story = {
  args: { twoDigit: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText(/3321 sommen · 0 rekenafwijkingen/)).toBeVisible();
    await userEvent.click(
      c.getByRole('button', { name: 'Bekijk de 8 voorbeelden' }),
    );
    await expect(c.getByText('10 + 10 =')).toBeVisible();
  },
};
