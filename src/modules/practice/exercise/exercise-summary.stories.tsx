import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { ExerciseSummary } from './exercise-summary';
import './exercise.tokens.css';
import styles from './exercise-screen.module.css';
const meta = {
  title: 'Practice/Task result',
  component: ExerciseSummary,
  render: (args) => (
    <main className={styles.page}>
      <ExerciseSummary {...args} />
    </main>
  ),
  args: {
    copy: {
      title: 'Rekenen · Optellen',
      singular: 'som',
      plural: 'sommen',
      success: 'Taak afgerond.',
      support: 'We oefenen verder.',
    },
    outcomes: Array.from({ length: 8 }, () => 'first' as const),
  },
} satisfies Meta<typeof ExerciseSummary>;
export default meta;
type Story = StoryObj<typeof meta>;
export const EightQuestions: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByLabelText('Resultaat: 10 van de 10')).toBeVisible();
    await expect(c.getByText('Je hebt alle 8 vragen afgerond.')).toBeVisible();
  },
};
export const WeightedRetry: Story = {
  args: { outcomes: ['first', 'second'] },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByLabelText('Resultaat: 7,5 van de 10')).toBeVisible();
    await expect(c.getByLabelText('2 van de 2 sommen goed')).toBeVisible();
  },
};
export const NoCorrectAnswers: Story = {
  args: { outcomes: ['missed', 'missed'] },
};
