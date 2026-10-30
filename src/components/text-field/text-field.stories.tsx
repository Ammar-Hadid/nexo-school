import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { TextField } from './text-field';
import { TextFieldReview } from './text-field-review';
import styles from './text-field-review.module.css';
const meta = {
  title: 'Components/Text field',
  component: TextField,
  args: { label: 'Jouw antwoord', appearance: 'answer' },
  render: (args) => (
    <div className={styles.card}>
      <TextField {...args} />
    </div>
  ),
} satisfies Meta<typeof TextField>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReviewPage: Story = {
  render: () => <TextFieldReview />,
  decorators: [],
  parameters: { controls: { disable: true } },
};
export const KeyboardAndError: Story = {
  args: { error: 'Typ eerst een getal in.' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const field = c.getByLabelText('Jouw antwoord');
    await userEvent.tab();
    await expect(field).toHaveFocus();
    await userEvent.type(field, '42');
    await expect(field).toHaveValue('42');
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(field).toHaveAccessibleDescription('Typ eerst een getal in.');
  },
};
export const ReadOnly: Story = {
  args: { value: '42', readOnly: true },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByLabelText('Jouw antwoord');
    await userEvent.type(field, '9');
    await expect(field).toHaveValue('42');
  },
};
export const Disabled: Story = { args: { value: '42', disabled: true } };
export const Pending: Story = { args: { value: '42', pending: true } };
