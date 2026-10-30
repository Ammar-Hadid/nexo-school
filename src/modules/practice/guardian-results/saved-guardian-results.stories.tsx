import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { GuardianResultsView } from './guardian-results-view';
import { guardianReviewFixture } from './guardian-results.fixtures';
import { guardianResult } from './guardian-result-model';
import { practiceTasks } from '../journey/practice-journey-tasks';

const task = practiceTasks.find((item) => item.id === 'rekenen-1')!;
const meta = {
  title: 'Practice/Saved guardian results',
  component: GuardianResultsView,
  tags: ['approved'],
  parameters: {
    docs: {
      description: {
        component:
          'D04-R3 presentation In Review; D08 behavior preserved. Synthetic presentation specimens; actual PostgreSQL and MFA authorization are verified separately. No role switch or guardian mutation.',
      },
    },
  },
  args: {
    saved: true,
    tasks: [
      {
        id: task.id,
        title: 'Synthetische leerling · Rekenen · Optellen',
        result: guardianResult(
          task.definition,
          guardianReviewFixture()[task.id],
        ),
      },
    ],
  },
} satisfies Meta<typeof GuardianResultsView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Completed: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: /^Bekijk sessie:/ }));
    await expect(c.getByText('8,5 / 10')).toBeVisible();
    await expect(c.getByText('9 / 10')).toBeVisible();
  },
};
export const Unstarted: Story = {
  args: {
    tasks: [
      {
        id: task.id,
        title: 'Synthetische leerling · Rekenen · Optellen',
        result: guardianResult(task.definition),
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: /^Bekijk sessie:/ }));
    await expect(c.getByText('Nog geen eindresultaat')).toBeVisible();
    await expect(c.queryByText('Gewogen score')).not.toBeInTheDocument();
  },
};
export const Empty: Story = { args: { tasks: [] } };
