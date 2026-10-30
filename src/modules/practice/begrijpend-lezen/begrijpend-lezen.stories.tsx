import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { BegrijpendLezenScreen } from './begrijpend-lezen-screen';
import { BegrijpendLezenReview } from './begrijpend-lezen-review';
import { scenarios } from './begrijpend-lezen-preview';
const meta = {
  title: 'Practice/Begrijpend Lezen',
  component: BegrijpendLezenScreen,
  tags: ['approved'],
  parameters: {
    docs: {
      description: {
        component:
          'Begrijpend Lezen revision 3, Approved. Full passage beside one multiple-choice question, with full-body Nexai below the answer panel. Synthetic reading bundle; docs/design/begrijpend-lezen-task.md.',
      },
    },
  },
  args: { scenario: 'question', messageVariant: -1 },
  argTypes: {
    scenario: { control: 'select', options: Object.keys(scenarios) },
  },
  render: (args) => <BegrijpendLezenScreen key={args.scenario} {...args} />,
} satisfies Meta<typeof BegrijpendLezenScreen>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReviewPage: Story = {
  render: () => <BegrijpendLezenReview />,
  parameters: { controls: { disable: true } },
};
export const Screen: Story = {};
export const Correct: Story = { args: { scenario: 'correct' } };
export const FirstMistake: Story = {
  args: { scenario: 'incorrect' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByText(/Het juiste antwoord/)).not.toBeInTheDocument();
    await expect(c.getByRole('article')).toHaveTextContent(
      'Daar kunnen insecten schuilen.',
    );
    for (const radio of c.getAllByRole('radio'))
      await expect(radio).toBeDisabled();
    await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    await expect(c.getAllByRole('radio')[0]).toHaveFocus();
  },
};
export const Retry: Story = { args: { scenario: 'retry' } };
export const RetryCorrect: Story = { args: { scenario: 'retryCorrect' } };
export const RetryExplanation: Story = {
  args: { scenario: 'retryIncorrect' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.getByRole('heading', { name: 'Zo vind je het in de tekst' }),
    ).toBeVisible();
    await expect(
      c.getByText('In alinea 3 staat: “Daar kunnen insecten schuilen.”'),
    ).toBeVisible();
    await expect(
      c.getByText(/Jouw antwoord was Om het smalle pad af te sluiten/),
    ).toBeVisible();
  },
};
export const Result: Story = { args: { scenario: 'result' } };
export const Perfect: Story = { args: { scenario: 'perfect' } };
export const NeedsSupport: Story = { args: { scenario: 'support' } };
export const KeyboardAndNavigation: Story = {
  name: 'Keyboard answers',
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.queryByRole('link', { name: /Naar de vraag|Terug naar de tekst/ }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      c.getByRole('button', { name: 'Controleer antwoord' }),
    );
    await expect(c.getByRole('alert')).toHaveTextContent(
      'Kies eerst een antwoord.',
    );
    const radios = c.getAllByRole('radio');
    await expect(radios[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(radios[1]).toBeChecked();
    await expect(c.queryByRole('alert')).not.toBeInTheDocument();
    await userEvent.tab();
    await expect(
      c.getByRole('button', { name: 'Controleer antwoord' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(c.getByText('✓ Goed!')).toBeVisible();
    await userEvent.keyboard('{Enter}');
    await expect(c.getAllByRole('radio')[0]).toHaveFocus();
    await expect(c.getByRole('article')).toHaveTextContent(
      'Een tuin voor iedereen',
    );
  },
};
export const ReviewControls: Story = {
  ...ReviewPage,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const exercise = within(canvasElement.querySelector('#try')!);
    const choice = exercise.getAllByRole('radio')[1]!;
    await userEvent.click(choice);
    const before = exercise.getByRole('status').textContent;
    await userEvent.selectOptions(c.getByLabelText('Berichtvariant'), '1');
    await expect(choice).toBeChecked();
    await expect(exercise.getByRole('status')).not.toHaveTextContent(before!);
    for (const frame of canvasElement.querySelectorAll('iframe'))
      await expect(frame).toHaveAttribute(
        'src',
        expect.stringContaining('practice-begrijpend-lezen--screen'),
      );
  },
};
export const CompleteJourney: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const answers = [1, 3, 0, 1, 0, 3, 1, 2, 1, 3];
    for (const choice of answers) {
      await userEvent.click(c.getAllByRole('radio')[choice]!);
      await userEvent.click(
        c.getByRole('button', { name: 'Controleer antwoord' }),
      );
      await expect(
        c.queryByText(/Het juiste antwoord/),
      ).not.toBeInTheDocument();
      await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    }
    await expect(
      c.getByRole('heading', { name: 'Waarvoor dient het hoopje takken?' }),
    ).toBeVisible();
    await userEvent.click(
      c.getByRole('radio', { name: 'Als schuilplek voor insecten.' }),
    );
    await userEvent.click(
      c.getByRole('button', { name: 'Controleer antwoord' }),
    );
    await expect(c.queryByText(/Het juiste antwoord/)).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    await userEvent.click(
      c.getByRole('radio', { name: 'Er spelen veel meer kinderen.' }),
    );
    await userEvent.click(
      c.getByRole('button', { name: 'Controleer antwoord' }),
    );
    await expect(
      c.getByRole('heading', { name: 'Zo vind je het in de tekst' }),
    ).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    await expect(c.getByLabelText('9 van de 10 vragen goed')).toBeVisible();
    await expect(c.queryByRole('article')).not.toBeInTheDocument();
    await userEvent.click(
      c.getByRole('button', { name: 'Voorbeeld opnieuw proberen' }),
    );
    await expect(c.getByRole('article')).toBeVisible();
    await expect(c.getAllByRole('radio')[0]).toHaveFocus();
  },
};
