import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { GuardianHomeView } from './guardian-home';
const empty = {
  scope: 'local-synthetic-practice' as const,
  students: [],
  items: [],
  pending: 0,
  measuredReviewMs: 0,
};
const meta = {
  title: 'Identity/Guardian start',
  component: GuardianHomeView,
  tags: ['in-review'],
  args: {
    name: 'Testouder',
    operator: true,
    state: 'ready',
    data: empty,
    tasks: [],
  },
} satisfies Meta<typeof GuardianHomeView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const FirstVisit: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.getByRole('link', { name: 'Leerling instellen' }),
    ).toHaveAttribute('href', '/guardian/access');
  },
};
export const NoExercises: Story = {
  args: {
    data: { ...empty, students: [{ id: 'test', displayName: 'adamtest' }] },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.getByRole('link', { name: 'Oefeningen voorbereiden' }),
    ).toHaveAttribute('href', '/guardian/content/supply');
    await expect(c.getByText(/Er zijn nog geen oefeningen/)).toBeVisible();
  },
};
export const Loading: Story = { args: { state: 'loading', data: undefined } };
export const FailedLoad: Story = {
  args: { state: 'error', data: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).toHaveTextContent(
      'niet ophalen',
    );
    await expect(
      within(canvasElement).queryByText(/Er zijn nog geen oefeningen/),
    ).not.toBeInTheDocument();
  },
};
export const Reverify: Story = { args: { state: 'verify', data: undefined } };
const stock = {
  ...empty,
  students: [{ id: 'test', displayName: 'adamtest' }],
  items: [
    {
      id: 'version',
      contentId: 'content',
      contentHash: 'synthetic',
      revision: 1,
      coverageId: 'addition',
      title: 'Rekenen · Optellen',
      prompt: '2 + 3 =',
      eligible: true,
      reason: null,
      withdrawal: null,
    },
  ],
};
export const Published: Story = {
  args: { data: stock },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', {
        name: 'Sessie klaarzetten',
      }),
    ).toHaveAttribute('href', '/guardian/content/assignments');
  },
};
export const PendingReview: Story = {
  args: {
    data: {
      ...stock,
      items: [
        { ...stock.items[0]!, eligible: false, reason: 'review-required' },
      ],
    },
  },
};
export const BlockedStock: Story = {
  args: {
    data: {
      ...stock,
      items: [{ ...stock.items[0]!, eligible: false, reason: 'withdrawn' }],
    },
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'Voorraad bekijken' }),
    ).toBeVisible();
    await expect(
      within(canvasElement).queryByText(/Er zijn nog geen oefeningen/),
    ).not.toBeInTheDocument();
  },
};
export const StudentTurn: Story = {
  args: {
    data: stock,
    tasks: [
      {
        id: 'task',
        title: 'Rekenen · Optellen',
        result: {
          status: 'Nog niet gestart',
          complete: false,
          total: 2,
          first: 0,
          second: 0,
          solved: 0,
          answered: 0,
          pendingRetries: 0,
          score: undefined,
          questions: [],
        },
      },
    ],
  },
};
export const Completed: Story = {
  args: {
    data: stock,
    tasks: [
      {
        id: 'task',
        title: 'Rekenen · Optellen',
        result: {
          status: 'Afgerond',
          complete: true,
          total: 2,
          first: 2,
          second: 0,
          solved: 2,
          answered: 2,
          pendingRetries: 0,
          score: 2,
          questions: [],
        },
      },
    ],
  },
};
