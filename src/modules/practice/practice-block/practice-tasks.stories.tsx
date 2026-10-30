import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { PracticeJourney } from '../journey/practice-journey';
import { PracticeTasksPage } from './practice-tasks-page';
import { blockExamples } from './practice-block.fixtures';
import type { BlockState } from './practice-block.types';

const chooseTask = fn();

function TasksPreview({ state }: { state: BlockState }) {
  const block =
    blockExamples.find((item) => item.state === state) ?? blockExamples[0];
  return block ? (
    <PracticeTasksPage
      onChoose={chooseTask}
      block={block}
      backHref="./iframe.html?id=components-practice-blocks--review-page&viewMode=story#adam"
    />
  ) : null;
}
const meta = {
  title: 'Components/Practice tasks',
  component: TasksPreview,
  args: { state: 'active' },
  argTypes: {
    state: {
      control: 'select',
      options: ['planned', 'active', 'review', 'completed'],
    },
  },
} satisfies Meta<typeof TasksPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const TasksPage: Story = {
  render: () => <PracticeJourney initialPage="tasks" />,
};
export const TaskSelectionCallback: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement).not.toHaveTextContent(/sessie/i);
    await expect(canvas.getByText('6 vragen', { exact: false })).toBeVisible();
    const resume = canvas.getByRole('button', {
      name: 'Ga verder: Spelling · taak 1',
    });
    resume.focus();
    await userEvent.keyboard('{Enter}');
    await expect(chooseTask).toHaveBeenCalledWith(
      expect.objectContaining({ id: 's1' }),
    );
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Start taak: Begrijpend lezen · één tekst',
      }),
    );
    await expect(chooseTask).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'b1' }),
    );
  },
};
export const AwaitingReview: Story = {
  args: { state: 'review' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Klaar! Vraag Ammar om samen te kijken.',
    );
    await expect(
      canvas.queryByRole('button', { name: /Start taak|Ga verder/ }),
    ).not.toBeInTheDocument();
  },
};

export const AllTasksDone: Story = {
  args: { state: 'completed' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Alle taken zijn klaar! Goed gedaan!',
    );
    await expect(
      canvas.queryByText('Welke taak kies je?'),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: /Start taak|Ga verder/ }),
    ).not.toBeInTheDocument();
  },
};
export const TaskStatusDrivesMessage: Story = {
  render: () => {
    const active = blockExamples.find((block) => block.state === 'active');
    return active ? (
      <PracticeTasksPage
        onChoose={chooseTask}
        block={{ ...active, state: 'completed' }}
        backHref="#blocks"
      />
    ) : (
      <></>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Welke taak kies je?',
    );
    await expect(
      canvas.getByRole('button', { name: 'Ga verder: Spelling · taak 1' }),
    ).toBeVisible();
  },
};
export const CompletedTasksBeforeBlockUpdate: Story = {
  render: () => {
    const completed = blockExamples.find(
      (block) => block.state === 'completed',
    );
    return completed ? (
      <PracticeTasksPage
        onChoose={chooseTask}
        block={{ ...completed, state: 'active' }}
        backHref="#blocks"
      />
    ) : (
      <></>
    );
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent(
      'Alle taken zijn klaar! Goed gedaan!',
    );
  },
};
export const NoTasks: Story = {
  render: () => {
    const block = blockExamples[0];
    return block ? (
      <PracticeTasksPage
        onChoose={chooseTask}
        block={{ ...block, sessions: [] }}
        backHref="#blocks"
      />
    ) : (
      <></>
    );
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent(
      'Er staan nog geen taken klaar.',
    );
  },
};
