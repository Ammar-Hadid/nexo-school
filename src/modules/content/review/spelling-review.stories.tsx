import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { ReviewDemo } from './review-demo';
import { spellingPayload, spellingRules } from '../spelling/doubling-content';
import type { ReviewBatch } from './review-contract';
const sample: ReviewBatch = {
  id: 'spelling-demo',
  title: 'Spelling · medeklinkerverdubbeling — proefset',
  cursor: null,
  activeMs: 0,
  items: [
    {
      id: 'kat-v1',
      contentId: 'kat',
      contentHash: 'synthetic',
      revision: 1,
      title: 'kat',
      objective: 'Medeklinkerverdubbeling',
      payload: spellingPayload(0),
      rules: spellingRules,
      checks: [],
      decision: 'pending',
      published: false,
      advisory: {
        status: 'clear',
        text: 'Vaste woordenbank gecontroleerd; geen AI gebruikt. Onderwijskundige review blijft nodig.',
        sourceHash: 'synthetic',
        provenance: 'deterministic-check',
      },
    },
  ],
};
const meta = {
  title: 'Content/Spelling bank',
  component: ReviewDemo,
  tags: ['in-review'],
  args: { sample },
} satisfies Meta<typeof ReviewDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WordReview: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.getByText(/Vaste inhoudscontrole/, { selector: 'summary' }),
    ).toBeVisible();
    await expect(
      c.queryByText(/Vaste rekencontrole|Haiku · gesimuleerd/),
    ).not.toBeInTheDocument();
    await expect(c.getByRole('heading', { name: 'kat' })).toBeVisible();
  },
};
export const ChangedBankBlocked: Story = {
  args: {
    sample: {
      ...sample,
      items: [
        {
          ...sample.items[0]!,
          checks: [{ code: 'spelling-bank-mismatch', field: 'payload' }],
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.getByText(/Vraag, antwoord of uitleg wijkt af/),
    ).toBeVisible();
  },
};
