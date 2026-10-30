import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  AdditionFamilyPreview,
  additionPreviewPairs,
} from './addition-family-preview';
import { explainAddition } from './addition-strategies';
const meta = {
  title: 'Practice/Addition families',
  component: AdditionFamilyPreview,
  tags: ['in-review'],
  args: { range: 'digits', scenario: 'question' },
} satisfies Meta<typeof AdditionFamilyPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SingleDigit: Story = {};
export const DoubleDigit: Story = { args: { range: 'two-digits' } };
export const SingleExplanation: Story = {
  args: { scenario: 'retryIncorrect' },
};
export const DoubleExplanation: Story = {
  args: { range: 'two-digits', scenario: 'retryIncorrect' },
};
export const DeferredRetry: Story = {
  args: { range: 'two-digits' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    for (const [i, pair] of additionPreviewPairs['two-digits'].entries()) {
      await userEvent.type(
        c.getByLabelText('Jouw antwoord'),
        i === 0 ? '999' : explainAddition(...pair).answer,
      );
      await userEvent.click(
        c.getByRole('button', { name: 'Controleer antwoord' }),
      );
      await expect(
        c.queryByRole('heading', { name: 'Zo kun je het uitrekenen' }),
      ).not.toBeInTheDocument();
      await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    }
    await expect(c.getByText('24 + 18 = ?')).toBeVisible();
    await userEvent.type(c.getByLabelText('Jouw antwoord'), '999');
    await userEvent.click(
      c.getByRole('button', { name: 'Controleer antwoord' }),
    );
    await expect(c.getByText('24 + 10 = 34.')).toBeVisible();
    await expect(
      c.getByText('Maak eerst 40. Splits 8 in 6 en 2.'),
    ).toBeVisible();
  },
};
