import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SpellingScreen } from './spelling-screen';
import { SpellingReview } from './spelling-review';
import { scenarios } from './spelling-preview';

const meta = {
  title: 'Practice/Spelling',
  tags: ['approved'],
  component: SpellingScreen,
  parameters: {
    docs: {
      description: {
        component:
          'Spelling revision 1, Approved on 19 October 2026. Same shared composition as approved Rekenen 4.1, with synthetic Dutch plural-word spelling questions. Contract: docs/design/spelling-task.md.',
      },
    },
  },
  args: { scenario: 'question', messageVariant: -1 },
  argTypes: {
    scenario: { control: 'select', options: Object.keys(scenarios) },
  },
  render: (args) => <SpellingScreen key={args.scenario} {...args} />,
} satisfies Meta<typeof SpellingScreen>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReviewPage: Story = {
  render: () => <SpellingReview />,
  parameters: { controls: { disable: true } },
};
export const Screen: Story = {};
export const Correct: Story = { args: { scenario: 'correct' } };
export const FirstMistake: Story = {
  args: { scenario: 'incorrect' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.getByRole('heading', { name: 'één kip → twee …' }),
    ).toBeVisible();
    await expect(c.queryByText(/Het juiste antwoord/)).not.toBeInTheDocument();
    await expect(canvasElement.querySelector('svg[data-pose]')).toHaveAttribute(
      'data-pose',
      'encourage-2',
    );
    await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    await expect(
      c.getByRole('heading', { name: 'één raam → twee …' }),
    ).toBeVisible();
    await expect(c.getByLabelText('Jouw antwoord')).toHaveFocus();
  },
};
export const Retry: Story = { args: { scenario: 'retry' } };
export const RetryCorrect: Story = {
  args: { scenario: 'retryCorrect' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Op naar het volgende woord!')).toBeVisible();
    await expect(
      c.queryByRole('heading', { name: 'Zo schrijf je het woord' }),
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
    await userEvent.type(exercise.getByLabelText('Jouw antwoord'), 'katten');
    await expect(exercise.getByRole('status')).toHaveTextContent(
      'Ik kijk mee. Neem je tijd.',
    );
    await userEvent.selectOptions(c.getByLabelText('Berichtvariant'), '1');
    await expect(exercise.getByRole('status')).toHaveTextContent(
      'Ik ben benieuwd naar jouw antwoord.',
    );
    await expect(exercise.getByLabelText('Jouw antwoord')).toHaveValue(
      'katten',
    );
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
      exercise.getByRole('heading', { name: 'Zo schrijf je het woord' }),
    ).toBeVisible();
  },
};
export const CompleteJourney: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = () => c.getByLabelText('Jouw antwoord');
    await expect(input()).toHaveAttribute('inputmode', 'text');
    await userEvent.click(input());
    await userEvent.keyboard('{Enter}');
    await expect(c.getByRole('alert')).toHaveTextContent(
      'Typ eerst een woord in.',
    );
    await expect(
      c.getByRole('img', {
        name: 'Voortgang: vraag 1 van 10, 0 van 10 afgerond.',
      }),
    ).toBeVisible();
    await expect(input()).toHaveAttribute('spellcheck', 'false');
    await expect(input()).toHaveAttribute('autocorrect', 'off');
    await expect(input()).toHaveAttribute('autocapitalize', 'none');
    // Independent gold answers: eight first correct, one corrected retry, one final miss.
    const answers = [
      ' KATTEN ',
      'honden',
      'bomen',
      'kipen',
      'ramen',
      'boeken',
      'pennen',
      'boten',
      'visen',
      'tenten',
    ];
    for (const [index, answer] of answers.entries()) {
      await userEvent.type(input(), answer);
      await userEvent.keyboard('{Enter}');
      await expect(input()).toHaveAttribute('readonly');
      if (index === 3) await expect(input()).toHaveValue('kipen');
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
      c.getByRole('heading', { name: 'één kip → twee …' }),
    ).toBeVisible();
    await expect(
      c.queryByText(/tweede kans|Nog een kans/i),
    ).not.toBeInTheDocument();
    await expect(input()).toHaveFocus();
    await userEvent.type(input(), 'kippen');
    await userEvent.keyboard('{Enter}');
    await expect(
      c.queryByRole('heading', { name: 'Zo schrijf je het woord' }),
    ).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    await expect(
      c.getByRole('heading', { name: 'één vis → twee …' }),
    ).toBeVisible();
    await userEvent.type(input(), 'visen');
    await userEvent.keyboard('{Enter}');
    await expect(
      c.getByRole('heading', { name: 'Zo schrijf je het woord' }),
    ).toBeVisible();
    await expect(
      c.getByText('Jouw antwoord was visen. Het juiste antwoord is vissen.'),
    ).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    await expect(c.getByLabelText('9 van de 10 woorden goed')).toBeVisible();
    await expect(c.getByText('8 woorden')).toBeVisible();
    await expect(c.getAllByText('1 woord')).toHaveLength(2);
    await expect(canvasElement.querySelector('svg[data-pose]')).toHaveAttribute(
      'data-pose',
      'proud-2',
    );
    await userEvent.click(
      c.getByRole('button', { name: 'Voorbeeld opnieuw proberen' }),
    );
    await expect(
      c.getByRole('heading', { name: 'één kat → twee …' }),
    ).toBeVisible();
    await expect(input()).toHaveValue('');
    await expect(input()).toHaveFocus();
  },
};

export const SpellingError: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByLabelText('Jouw antwoord'), 'kat ten');
    await userEvent.keyboard('{Enter}');
    await expect(c.getByText('Nog niet goed')).toBeVisible();
    await expect(c.getByLabelText('Jouw antwoord')).toHaveValue('kat ten');
    await expect(c.queryByRole('alert')).not.toBeInTheDocument();
    await expect(c.queryByText(/Het juiste antwoord/)).not.toBeInTheDocument();
  },
};
