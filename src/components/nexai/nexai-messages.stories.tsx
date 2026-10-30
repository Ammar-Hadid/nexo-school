import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { NexaiMessageReview } from './nexai-message-review';

const meta = {
  title: 'Components/Nexai messages',
  component: NexaiMessageReview,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof NexaiMessageReview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReviewPage: Story = {};
export const RatingWorkflow: Story = {
  args: { persist: false },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const category = c.getByRole('combobox', { name: 'Categorie' });
    await expect(c.getAllByRole('article')).toHaveLength(20);
    const first = within(c.getAllByRole('article')[0]!);
    await userEvent.click(first.getByRole('button', { name: 'Goed' }));
    await expect(c.getByText('1 van 240 beoordeeld')).toBeVisible();
    await userEvent.click(first.getByRole('button', { name: 'Aanpassen' }));
    await userEvent.type(first.getByRole('textbox'), 'Minder uitroeptekens.');
    await userEvent.selectOptions(category, 'ready');
    await userEvent.selectOptions(category, 'welcome');
    await expect(
      c.getByRole('textbox', { name: /Wat wil je anders/ }),
    ).toHaveValue('Minder uitroeptekens.');
    await userEvent.selectOptions(
      c.getByRole('combobox', { name: 'Beoordeling' }),
      'unrated',
    );
    await expect(c.getAllByRole('article')).toHaveLength(19);
    await userEvent.selectOptions(
      c.getByRole('combobox', { name: 'Beoordeling' }),
      'revise',
    );
    await expect(c.getAllByRole('article')).toHaveLength(1);
    await userEvent.click(c.getByRole('button', { name: 'Bekijk met Nexai' }));
    await expect(canvasElement.querySelector('svg[data-pose]')).toHaveAttribute(
      'data-pose',
      'curious-1',
    );
    await userEvent.selectOptions(category, 'all');
    await userEvent.selectOptions(
      c.getByRole('combobox', { name: 'Beoordeling' }),
      'all',
    );
    await userEvent.type(
      c.getByRole('textbox', { name: 'Zoek in berichten' }),
      'ready-01',
    );
    await expect(c.getAllByRole('article')).toHaveLength(1);
    await expect(c.getByText('Ik kijk mee. Neem je tijd.')).toBeVisible();
  },
};
