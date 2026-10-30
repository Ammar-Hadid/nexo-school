import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { TaalScreen } from './taal-screen';
import { TaalReview } from './taal-review';
import { scenarios } from './taal-preview';

const meta = {
  title: 'Practice/Taal',
  tags: ['approved'],
  component: TaalScreen,
  parameters: {
    docs: {
      description: {
        component:
          'Taal revision 1, Approved on 19 October 2026. Same shared composition as approved Rekenen 4.1, with synthetic Dutch verb-identification questions. Contract: docs/design/taal-task.md.',
      },
    },
  },
  args: { scenario: 'question', messageVariant: -1 },
  argTypes: {
    scenario: { control: 'select', options: Object.keys(scenarios) },
  },
  render: (args) => <TaalScreen key={args.scenario} {...args} />,
} satisfies Meta<typeof TaalScreen>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReviewPage: Story = {
  render: () => <TaalReview />,
  parameters: { controls: { disable: true } },
};
export const Screen: Story = {};
export const Correct: Story = { args: { scenario: 'correct' } };
export const FirstMistake: Story = {
  args: { scenario: 'incorrect' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.getByRole('heading', { name: 'Mila fietst naar school.' }),
    ).toBeVisible();
    await expect(c.queryByText(/Het juiste antwoord/)).not.toBeInTheDocument();
    await expect(canvasElement.querySelector('svg[data-pose]')).toHaveAttribute(
      'data-pose',
      'encourage-2',
    );
    await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    await expect(
      c.getByRole('heading', { name: 'De vogel zingt in de boom.' }),
    ).toBeVisible();
    await expect(c.getByLabelText('Jouw antwoord')).toHaveFocus();
  },
};
export const Retry: Story = { args: { scenario: 'retry' } };
export const RetryCorrect: Story = {
  args: { scenario: 'retryCorrect' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Op naar de volgende vraag!')).toBeVisible();
    await expect(
      c.queryByRole('heading', { name: 'Zo vind je het werkwoord' }),
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
    await userEvent.type(exercise.getByLabelText('Jouw antwoord'), 'slaapt');
    await expect(exercise.getByRole('status')).toHaveTextContent(
      'Ik kijk mee. Neem je tijd.',
    );
    await userEvent.selectOptions(c.getByLabelText('Berichtvariant'), '1');
    await expect(exercise.getByRole('status')).toHaveTextContent(
      'Ik ben benieuwd naar jouw antwoord.',
    );
    await expect(exercise.getByLabelText('Jouw antwoord')).toHaveValue(
      'slaapt',
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
      exercise.getByRole('heading', { name: 'Zo vind je het werkwoord' }),
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
    await userEvent.type(input(), 'de kat');
    await userEvent.keyboard('{Enter}');
    await expect(c.getByRole('alert')).toHaveTextContent(
      'Typ één woord uit de zin.',
    );
    await expect(
      c.getByRole('img', {
        name: 'Voortgang: vraag 1 van 10, 0 van 10 afgerond.',
      }),
    ).toBeVisible();
    await userEvent.clear(input());
    // Independent gold answers: eight first correct, one corrected retry, one final miss.
    const answers = [
      ' SLAAPT ',
      'leest',
      'rent',
      'school',
      'zingt',
      'tekent',
      'lacht',
      'danst',
      'vijver',
      'bouwt',
    ];
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
      c.getByRole('heading', { name: 'Mila fietst naar school.' }),
    ).toBeVisible();
    await expect(
      c.queryByText(/tweede kans|Nog een kans/i),
    ).not.toBeInTheDocument();
    await expect(input()).toHaveFocus();
    await userEvent.type(input(), 'fietst');
    await userEvent.keyboard('{Enter}');
    await expect(
      c.queryByRole('heading', { name: 'Zo vind je het werkwoord' }),
    ).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    await expect(
      c.getByRole('heading', { name: 'De vis zwemt in de vijver.' }),
    ).toBeVisible();
    await userEvent.type(input(), 'vijver');
    await userEvent.keyboard('{Enter}');
    await expect(
      c.getByRole('heading', { name: 'Zo vind je het werkwoord' }),
    ).toBeVisible();
    await expect(
      c.getByText('Jouw antwoord was vijver. Het juiste antwoord is zwemt.'),
    ).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    await expect(c.getByLabelText('9 van de 10 vragen goed')).toBeVisible();
    await expect(c.getByText('8 vragen')).toBeVisible();
    await expect(c.getAllByText('1 vraag')).toHaveLength(2);
    await expect(canvasElement.querySelector('svg[data-pose]')).toHaveAttribute(
      'data-pose',
      'proud-2',
    );
    await userEvent.click(
      c.getByRole('button', { name: 'Voorbeeld opnieuw proberen' }),
    );
    await expect(
      c.getByRole('heading', { name: 'De kat slaapt op de bank.' }),
    ).toBeVisible();
    await expect(input()).toHaveValue('');
    await expect(input()).toHaveFocus();
  },
};
