import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SupplyDemo, supplyReviewExample } from './supply-demo';
import { ReviewDemo } from '../review/review-demo';
const meta = {
  title: 'Content/Question supply',
  component: SupplyDemo,
  tags: ['in-review'],
  parameters: {
    docs: {
      description: {
        component:
          'D14-S1 local synthetic supply proof. No actual certification or approval. Saved persistence and caps tested separately.',
      },
    },
  },
} satisfies Meta<typeof SupplyDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const FirstWeek: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(
      c.getByRole('button', { name: 'Kleine set voorbereiden' }),
    );
    await expect(
      c.getByRole('heading', { name: '2 oefeningen te beoordelen' }),
    ).toBeVisible();
    await expect(
      c.getByRole('link', { name: 'Beoordeel de kleine set' }),
    ).toBeVisible();
    const demand = c.getByRole('spinbutton');
    await userEvent.clear(demand);
    await userEvent.type(demand, '600');
    await userEvent.click(
      c.getByRole('button', { name: 'Voorraad opnieuw plannen' }),
    );
    await expect(
      c.getByRole('heading', { name: '8 oefeningen te beoordelen' }),
    ).toBeVisible();
    await userEvent.click(c.getByText('Voorraad, weeklimiet en reviewtijd'));
    await expect(c.getByText(/Er ontbreken nog 600 oefeningen/)).toBeVisible();
  },
};
export const ReusedBank: Story = {
  args: { reused: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(
      c.getByRole('button', { name: 'Voorraad opnieuw plannen' }),
    );
    await userEvent.click(c.getByText('Voorraad, weeklimiet en reviewtijd'));
    await expect(c.getByText(/0 \/ 10 nieuwe versies/)).toBeVisible();
    await expect(
      c.getByRole('heading', {
        name: 'Je voorraad is klaar voor de volgende stap',
      }),
    ).toBeVisible();
  },
};
export const BudgetReached: Story = {
  args: { exhausted: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(
      c.getByRole('button', { name: 'Voorraad opnieuw plannen' }),
    );
    await userEvent.click(c.getByText('Voorraad, weeklimiet en reviewtijd'));
    await expect(c.getByText(/10 \/ 10 nieuwe versies/)).toBeVisible();
    await expect(c.getByText('Gemeten: 15m 0s')).toBeVisible();
  },
};
export const SaveFailure: Story = {
  args: { fail: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(
      c.getByRole('button', { name: 'Kleine set voorbereiden' }),
    );
    await expect(c.getByRole('alert')).toHaveTextContent('Niet opgeslagen.');
    await userEvent.click(c.getByText('Voorraad, weeklimiet en reviewtijd'));
    await expect(c.getByText(/0 \/ 10 nieuwe versies/)).toBeVisible();
  },
};
export const ReviewExample: Story = {
  render: () => <ReviewDemo sample={supplyReviewExample} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.getByText(/Vaste rekencontrole/, { selector: 'summary' }),
    ).toBeVisible();
    await expect(c.queryByText(/Haiku · gesimuleerd/)).not.toBeInTheDocument();
  },
};
