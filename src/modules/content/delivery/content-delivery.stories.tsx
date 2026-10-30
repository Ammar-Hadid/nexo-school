import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ContentDeliveryWorkspace } from './content-delivery-workspace';
import type { DeliveryOverview } from './delivery-contract';
const initial: DeliveryOverview = {
  scope: 'local-synthetic-practice',
  students: [{ id: 'synthetic-student', displayName: 'Synthetische leerling' }],
  measuredReviewMs: 45000,
  pending: 1,
  items: [
    {
      id: 'version-1',
      contentId: 'content-1',
      contentHash: 'synthetic-hash',
      revision: 1,
      coverageId: 'addition',
      title: 'Rekenen · Optellen',
      prompt: '3 + 4 =',
      eligible: true,
      reason: null,
      withdrawal: null,
    },
  ],
};
const assign = fn(async () => ({ id: 'synthetic-task' })),
  command = fn(async () => ({ items: [] }));
const meta = {
  title: 'Content/Saved assignment delivery',
  component: ContentDeliveryWorkspace,
  tags: ['in-review'],
  args: {
    initial,
    assign,
    command,
    refresh: async () => initial,
    preview: true,
  },
} satisfies Meta<typeof ContentDeliveryWorkspace>;
export default meta;
type Story = StoryObj<typeof meta>;
export const PublishedStock: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.clear(c.getByRole('spinbutton'));
    await userEvent.type(c.getByRole('spinbutton'), '1');
    await userEvent.click(
      c.getByRole('button', { name: 'Sessie klaarzetten' }),
    );
    await expect(c.getByRole('status')).toHaveTextContent('Sessie opgeslagen');
    await expect(assign).toHaveBeenCalled();
    await expect(
      c.getByRole('heading', {
        name: 'De sessie staat klaar. Nu is de leerling aan de beurt.',
      }),
    ).toBeVisible();
  },
};
export const Shortage: Story = {
  args: {
    assign: fn(async () => {
      throw new Error(
        'Er ontbreken 9 geschikte oefeningen (1 beschikbaar). Er is geen sessie aangemaakt.',
      );
    }),
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(
      c.getByRole('button', { name: 'Sessie klaarzetten' }),
    );
    await expect(c.getByRole('alert')).toHaveTextContent('Er ontbreken 9');
  },
};
export const Withdrawn: Story = {
  args: {
    initial: {
      ...initial,
      items: [
        {
          ...initial.items[0]!,
          eligible: false,
          reason: 'withdrawn',
          withdrawal: {
            id: 'withdrawal-1',
            note: 'Synthetische inhoudsfout: de uitleg moet worden gecontroleerd.',
            correction: null,
          },
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByText(/3 \+ 4 = · versie 1/));
    await expect(
      c.queryByRole('button', { name: 'Versie intrekken en sessies pauzeren' }),
    ).not.toBeInTheDocument();
    await expect(c.getByText(/Synthetische inhoudsfout/)).toBeVisible();
  },
};
export const Empty: Story = {
  args: { initial: { ...initial, students: [], items: [] } },
};

export const NoStock: Story = {
  args: { initial: { ...initial, items: [], pending: 0 } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.queryByRole('combobox', { name: 'Categorie' }),
    ).not.toBeInTheDocument();
    await expect(
      c.getByRole('link', { name: 'Begin met twee rekenoefeningen' }),
    ).toHaveAttribute('href', '/guardian/content/supply');
  },
};
export const NeedsPublication: Story = {
  args: {
    initial: {
      ...initial,
      items: [
        {
          ...initial.items[0]!,
          eligible: false,
          reason: 'publication-required',
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', {
        name: 'Rekenen beoordelen en publiceren',
      }),
    ).toHaveAttribute('href', '/guardian/content/supply/review');
  },
};
