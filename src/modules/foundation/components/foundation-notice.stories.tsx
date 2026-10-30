import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { FoundationNotice } from './foundation-notice';

const meta = {
  title: 'Foundation/Development notice',
  component: FoundationNotice,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Provisional development fixture. No product design or shared component approval is implied.',
      },
    },
  },
} satisfies Meta<typeof FoundationNotice>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Expanded: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disclosure = canvas.getByText('Over deze omgeving');
    await userEvent.click(disclosure);
    await expect(
      canvas.getByText(/Dit is een ontwikkelomgeving/),
    ).toBeVisible();
  },
};
