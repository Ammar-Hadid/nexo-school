import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within, fn } from 'storybook/test';
import { GuardianSignIn } from './guardian-sign-in';
const meta = {
  title: 'Identity/Guardian portal access',
  component: GuardianSignIn,
  tags: ['in-review'],
  parameters: { layout: 'fullscreen' },
  args: { onDone: fn() },
} satisfies Meta<typeof GuardianSignIn>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SignIn: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.getByLabelText('Wachtwoord', { exact: false }),
    ).toHaveAttribute('type', 'password');
    await expect(
      c.getByRole('button', { name: 'Aanmelden als ouder' }),
    ).toBeVisible();
  },
};
export const VerifyAgain: Story = {
  args: { reverify: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.getByText(/Je opgeslagen werk blijft bewaard/),
    ).toBeVisible();
    await userEvent.click(
      c.getByRole('button', { name: 'Gebruik een herstelcode' }),
    );
    await expect(
      c.getByLabelText('Herstelcode', { exact: false }),
    ).toBeVisible();
  },
};
export const Setup: Story = { args: { setup: true } };
export const PasswordRecovery: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(
      c.getByRole('button', { name: 'Wachtwoord vergeten' }),
    );
    await expect(
      c.getByRole('button', { name: 'Herstelmail aanvragen' }),
    ).toBeVisible();
  },
};
