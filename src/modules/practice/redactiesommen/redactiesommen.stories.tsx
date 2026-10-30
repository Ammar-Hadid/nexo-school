import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { RedactiesommenScreen } from './redactiesommen-screen';
import { RedactiesommenReview } from './redactiesommen-review';
import { scenarios } from './redactiesommen-preview';

const meta = {
  title: 'Practice/Redactiesommen',
  tags: ['approved'],
  component: RedactiesommenScreen,
  parameters: {
    docs: {
      description: {
        component:
          'Redactiesommen revision 2, Approved. Same shared composition as approved Rekenen 4.1, with synthetic longer Dutch story passages with numeric answers and units. Contract: docs/design/redactiesommen-task.md.',
      },
    },
  },
  args: { scenario: 'question', messageVariant: -1 },
  argTypes: {
    scenario: { control: 'select', options: Object.keys(scenarios) },
  },
  render: (args) => <RedactiesommenScreen key={args.scenario} {...args} />,
} satisfies Meta<typeof RedactiesommenScreen>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReviewPage: Story = {
  render: () => <RedactiesommenReview />,
  parameters: { controls: { disable: true } },
};
export const Screen: Story = {};
export const PassageLayout: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const passage = c.getByText(
      /Voor een knutselmiddag op school.*Hoeveel stickers heeft Noor nu\?$/,
    );
    await expect(passage.tagName).toBe('P');
    await expect(
      c.queryByRole('heading', { name: /Hoeveel stickers/ }),
    ).not.toBeInTheDocument();
    await expect(
      c.getByLabelText(/Jouw antwoord in/),
    ).toHaveAccessibleDescription(passage.textContent!);
  },
};
export const Correct: Story = { args: { scenario: 'correct' } };
export const FirstMistake: Story = {
  args: { scenario: 'incorrect' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.getByText(/Hoeveel knikkers heeft Mila nu\?$/),
    ).toBeVisible();
    await expect(c.queryByText(/Het juiste antwoord/)).not.toBeInTheDocument();
    await expect(canvasElement.querySelector('svg[data-pose]')).toHaveAttribute(
      'data-pose',
      'encourage-2',
    );
    await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    await expect(
      c.getByText(/Hoeveel boeken blijven in de kast\?$/),
    ).toBeVisible();
    await expect(c.getByLabelText(/Jouw antwoord in/)).toHaveFocus();
  },
};
export const Retry: Story = { args: { scenario: 'retry' } };
export const RetryCorrect: Story = {
  args: { scenario: 'retryCorrect' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Op naar de volgende som!')).toBeVisible();
    await expect(
      c.queryByRole('heading', { name: 'Zo los je de som op' }),
    ).not.toBeInTheDocument();
  },
};
export const RetryExplanation: Story = { args: { scenario: 'retryIncorrect' } };
export const Result: Story = { args: { scenario: 'result' } };
export const Perfect: Story = { args: { scenario: 'perfect' } };
export const NeedsSupport: Story = { args: { scenario: 'support' } };
export const ReviewControls: Story = {
  ...ReviewPage,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const exercise = within(canvasElement.querySelector('#try')!);
    await userEvent.type(exercise.getByLabelText(/Jouw antwoord in/), '42');
    await expect(exercise.getByRole('status')).toHaveTextContent(
      'Ik kijk mee. Neem je tijd.',
    );
    await userEvent.selectOptions(c.getByLabelText('Berichtvariant'), '1');
    await expect(exercise.getByRole('status')).toHaveTextContent(
      'Hmm, wat zou hier uitkomen?',
    );
    await expect(exercise.getByLabelText(/Jouw antwoord in/)).toHaveValue('42');
    for (const frame of canvasElement.querySelectorAll('iframe'))
      await expect(frame).toHaveAttribute(
        'src',
        expect.stringContaining('messageVariant:1'),
      );
    await userEvent.selectOptions(
      c.getByLabelText('Voorbeeldmoment'),
      'retryIncorrect',
    );
    await expect(c.getByLabelText('Berichtvariant')).toHaveValue('-1');
    await expect(
      exercise.getByRole('heading', { name: 'Zo los je de som op' }),
    ).toBeVisible();
  },
};
export const CompleteJourney: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = () => c.getByLabelText(/Jouw antwoord in/);
    await expect(input()).toHaveAttribute('inputmode', 'numeric');
    await expect(input()).toHaveAccessibleDescription(
      'Voor een knutselmiddag op school verzamelt Noor stickers om kaarten te versieren. In haar bewaardoos zitten al 24 stickers. Haar tante geeft haar een nieuw vel met 18 stickers. Noor legt die allemaal bij de stickers in haar doos. Hoeveel stickers heeft Noor nu?',
    );
    await expect(input()).toHaveAccessibleName('Jouw antwoord in stickers');
    await userEvent.click(input());
    await userEvent.keyboard('{Enter}');
    await expect(c.getByRole('alert')).toHaveTextContent(
      'Typ eerst een getal in.',
    );
    await userEvent.type(input(), '42 stickers');
    await userEvent.keyboard('{Enter}');
    await expect(c.getByRole('alert')).toHaveTextContent(
      'Typ eerst een getal in.',
    );
    await expect(
      c.getByRole('img', {
        name: 'Voortgang: vraag 1 van 10, 0 van 10 afgerond.',
      }),
    ).toBeVisible();
    await userEvent.clear(input());
    // Independent gold answers: eight first correct, one corrected retry, one final miss.
    const answers = ['42', '37', '56', '1', '47', '54', '8', '83', '1', '63'];
    for (const [index, answer] of answers.entries()) {
      await userEvent.type(input(), answer);
      await userEvent.keyboard('{Enter}');
      await expect(input()).toHaveAttribute('readonly');
      if (index === 3 || index === 8)
        await expect(
          c.queryByText(/Het juiste antwoord/),
        ).not.toBeInTheDocument();
      // Keyboard reaches the primary action and advances without submitting twice.
      await userEvent.tab();
      await expect(c.getByRole('button', { name: 'Verder' })).toHaveFocus();
      await userEvent.keyboard('{Enter}');
    }
    await expect(
      c.getByText(/Hoeveel knikkers heeft Mila nu\?$/),
    ).toBeVisible();
    await expect(
      c.queryByText(/tweede kans|Nog een kans/i),
    ).not.toBeInTheDocument();
    await expect(input()).toHaveFocus();
    await userEvent.type(input(), '63');
    await userEvent.keyboard('{Enter}');
    await expect(
      c.queryByRole('heading', { name: 'Zo los je de som op' }),
    ).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    await expect(c.getByText(/Hoeveel euro houdt Omar over\?$/)).toBeVisible();
    await expect(input()).toHaveAccessibleName('Jouw antwoord in euro');
    await userEvent.type(input(), '1');
    await userEvent.keyboard('{Enter}');
    await expect(
      c.getByRole('heading', { name: 'Zo los je de som op' }),
    ).toBeVisible();
    await expect(
      c.getByText('Jouw antwoord was 1. Het juiste antwoord is 44 euro.'),
    ).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    await expect(c.getByLabelText('9 van de 10 sommen goed')).toBeVisible();
    await expect(c.getByText('8 sommen')).toBeVisible();
    await expect(c.getAllByText('1 som')).toHaveLength(2);
    await expect(canvasElement.querySelector('svg[data-pose]')).toHaveAttribute(
      'data-pose',
      'proud-2',
    );
    await userEvent.click(
      c.getByRole('button', { name: 'Voorbeeld opnieuw proberen' }),
    );
    await expect(
      c.getByText(/Hoeveel stickers heeft Noor nu\?$/),
    ).toBeVisible();
    await expect(input()).toHaveValue('');
    await expect(input()).toHaveFocus();
  },
};
