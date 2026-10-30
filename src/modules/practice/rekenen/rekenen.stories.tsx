import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { RekenenScreen } from './rekenen-screen';
import { RekenenReview } from './rekenen-review';
import { scenarios, questions } from './rekenen-preview';

const meta = {
  title: 'Practice/Rekenen',
  tags: ['approved'],
  parameters: {
    docs: {
      description: {
        component:
          'Approved Rekenen page revision 4.1 (19 October 2026). Reusable practice-page pattern with synthetic questions; contract: docs/design/rekenen-task.md. Production learning integration remains separate.',
      },
    },
  },
  component: RekenenScreen,
  args: { scenario: 'question', messageVariant: -1 },
  argTypes: {
    scenario: { control: 'select', options: Object.keys(scenarios) },
  },
  render: (args) => <RekenenScreen key={args.scenario} {...args} />,
} satisfies Meta<typeof RekenenScreen>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReviewPage: Story = {
  render: () => <RekenenReview />,
  parameters: { controls: { disable: true } },
};
export const ReviewControls: Story = {
  ...ReviewPage,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const exercise = within(canvasElement.querySelector('#try')!);
    await expect(exercise.getByRole('status')).toHaveTextContent(
      'Ik kijk mee. Neem je tijd.',
    );
    await userEvent.type(exercise.getByLabelText('Jouw antwoord'), '42');
    await expect(exercise.getByRole('status')).toHaveTextContent(
      'Ik kijk mee. Neem je tijd.',
    );
    await userEvent.selectOptions(c.getByLabelText('Berichtvariant'), '1');
    await expect(exercise.getByRole('status')).toHaveTextContent(
      'Hmm, wat zou hier uitkomen?',
    );
    await expect(exercise.getByLabelText('Jouw antwoord')).toHaveValue('42');
    for (const frame of canvasElement.querySelectorAll('iframe')) {
      await expect(frame).toHaveAttribute(
        'src',
        expect.stringContaining('messageVariant:1'),
      );
    }
    await userEvent.selectOptions(
      c.getByLabelText('Voorbeeldmoment'),
      'retryIncorrect',
    );
    await expect(c.getByLabelText('Berichtvariant')).toHaveValue('-1');
    await expect(
      within(c.getByLabelText('Berichtvariant')).getAllByRole('option'),
    ).toHaveLength(18);
    await expect(
      exercise.getByRole('heading', { name: 'Zo kun je het uitrekenen' }),
    ).toBeVisible();
  },
};
export const Screen: Story = {};
export const FirstMistake: Story = {
  args: { scenario: 'incorrect' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(canvasElement.querySelector('svg[data-pose]')).toHaveAttribute(
      'data-pose',
      'encourage-2',
    );
    await expect(c.getByText('36 + 27 = ?')).toBeVisible();
    await expect(c.queryByText(/Het juiste antwoord/)).not.toBeInTheDocument();
    await expect(c.queryByText('36 + 20 = 56')).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    await expect(c.getByText('81 − 34 = ?')).toBeVisible();
    await expect(c.getByLabelText('Jouw antwoord')).toHaveFocus();
  },
};
export const RetryCorrect: Story = {
  args: { scenario: 'retryCorrect' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Op naar de volgende som!')).toBeVisible();
    await expect(
      c.queryByRole('heading', { name: 'Zo kun je het uitrekenen' }),
    ).not.toBeInTheDocument();
  },
};
export const RetryExplanation: Story = { args: { scenario: 'retryIncorrect' } };
export const Result: Story = { args: { scenario: 'result' } };
export const Perfect: Story = { args: { scenario: 'perfect' } };
export const NeedsSupport: Story = { args: { scenario: 'support' } };
export const CompleteJourney: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(
      c.getByRole('button', { name: 'Controleer antwoord' }),
    );
    await expect(c.getByRole('alert')).toHaveTextContent(
      'Typ eerst een getal in',
    );
    await expect(
      c.getByRole('img', {
        name: 'Voortgang: vraag 1 van 10, 0 van 10 afgerond.',
      }),
    ).toBeVisible();
    await expect(c.queryByText('Vraag 1 van 10')).not.toBeInTheDocument();
    await expect(c.queryByText('0 van 10 afgerond')).not.toBeInTheDocument();
    await expect(c.getByRole('status')).toHaveTextContent(
      'Ik kijk mee. Neem je tijd.',
    );
    for (const [i, q] of questions.entries()) {
      await userEvent.type(
        c.getByLabelText('Jouw antwoord'),
        i === 3 || i === 8 ? '1' : String(q.answer),
      );
      await userEvent.click(
        c.getByRole('button', { name: 'Controleer antwoord' }),
      );
      if (i === 0)
        await expect(c.getByRole('status')).toHaveTextContent(
          'Ja! Helemaal goed.',
        );
      if (i === 1)
        await expect(c.getByRole('status')).toHaveTextContent(
          'Goed! Pootje erbij.',
        );
      await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    }
    await expect(
      c.queryByRole('button', { name: 'Ik ben er klaar voor' }),
    ).not.toBeInTheDocument();
    await expect(c.getByText('36 + 27 = ?')).toBeVisible();
    await userEvent.type(c.getByLabelText('Jouw antwoord'), '63');
    await userEvent.click(
      c.getByRole('button', { name: 'Controleer antwoord' }),
    );
    await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    await expect(c.getByText('72 − 28 = ?')).toBeVisible();
    await userEvent.type(c.getByLabelText('Jouw antwoord'), '1');
    await userEvent.click(
      c.getByRole('button', { name: 'Controleer antwoord' }),
    );
    await expect(
      c.getByText('Jouw antwoord was 1. Het juiste antwoord is 44.'),
    ).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    await expect(c.getByLabelText('9 van de 10 sommen goed')).toBeVisible();
    await expect(canvasElement.querySelector('svg[data-pose]')).toHaveAttribute(
      'data-pose',
      'proud-2',
    );
    await expect(c.getByText('8 sommen')).toBeVisible();
    await expect(c.getAllByText('1 som')).toHaveLength(2);
    await expect(c.queryByText(/punt|½/)).not.toBeInTheDocument();
  },
};
