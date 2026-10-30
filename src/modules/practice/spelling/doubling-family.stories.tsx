import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { DoublingFamilyPreview } from './doubling-family-preview';
import { doublingBank } from './doubling-family';
const meta = {
  title: 'Practice/Spelling family',
  component: DoublingFamilyPreview,
  tags: ['in-review'],
  args: { scenario: 'question' },
} satisfies Meta<typeof DoublingFamilyPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Practice: Story = {};
export const Explanation: Story = { args: { scenario: 'retryIncorrect' } };
export const MisspellingAndDeferredRetry: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    for (const [i, w] of doublingBank.entries()) {
      await userEvent.type(
        c.getByLabelText('Jouw antwoord'),
        i === 0 ? 'katen' : w.plural,
      );
      await userEvent.click(
        c.getByRole('button', { name: 'Controleer antwoord' }),
      );
      await expect(
        c.queryByRole('heading', { name: 'Zo schrijf je het woord' }),
      ).not.toBeInTheDocument();
      await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    }
    await expect(c.getByText('één kat → twee …')).toBeVisible();
    await userEvent.type(c.getByLabelText('Jouw antwoord'), 'katen');
    await userEvent.click(
      c.getByRole('button', { name: 'Controleer antwoord' }),
    );
    await expect(
      c.getByText(
        'Schrijf daarom twee keer de t en zet er en achter: kat → katten.',
      ),
    ).toBeVisible();
  },
};
