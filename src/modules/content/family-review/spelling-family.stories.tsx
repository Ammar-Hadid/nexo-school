import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { FamilyReviewDemo } from './family-review-demo';
const meta = {
  title: 'Content/Spelling family',
  component: FamilyReviewDemo,
  tags: ['in-review'],
  args: { spelling: true },
} satisfies Meta<typeof FamilyReviewDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReviewBank: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.getByRole('heading', { name: 'Spelling · medeklinkerverdubbeling' }),
    ).toBeVisible();
    await expect(c.getByText(/10 woorden · 0 bankafwijkingen/)).toBeVisible();
    await userEvent.click(
      c.getByRole('button', { name: 'Bekijk de 5 voorbeelden' }),
    );
    await expect(c.getByText('één kat → twee …')).toBeVisible();
    await userEvent.click(
      c.getByRole('button', { name: 'Bekeken · volgend voorbeeld' }),
    );
    await expect(c.getByText('één kip → twee …')).toBeVisible();
  },
};
export const Resume: Story = { args: { resume: true } };
