import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { WorkflowGuide } from './workflow-guide';
const meta = {
  title: 'Components/Workflow guide',
  component: WorkflowGuide,
  tags: ['in-review'],
  args: {
    steps: ['Voorbereiden', 'Beoordelen', 'Klaarzetten', 'Resultaat'],
    current: 0,
    title: 'Begin met twee oefeningen',
    children: (
      <p>Bereid een kleine set voor. Daarna kun je de oefeningen bekijken.</p>
    ),
    action: {
      label: 'Oefeningen voorbereiden',
      href: '/guardian/content/supply',
    },
  },
} satisfies Meta<typeof WorkflowGuide>;
export default meta;
type Story = StoryObj<typeof meta>;
export const NextStep: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.getByRole('link', { name: 'Oefeningen voorbereiden' }),
    ).toHaveAttribute('href', '/guardian/content/supply');
    await expect(c.getByText('Voorbereiden')).toHaveAttribute(
      'aria-current',
      'step',
    );
  },
};
export const WithinPage: Story = {
  args: {
    current: 1,
    title: 'Bekijk en selecteer de oefeningen',
    action: undefined,
  },
};
