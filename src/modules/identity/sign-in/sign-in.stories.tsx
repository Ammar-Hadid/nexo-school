import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SignInReview } from './sign-in-review';

const meta = {
  title: 'Identity/Sign in',
  component: SignInReview,
  tags: ['approved'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SignInReview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Review: Story = {};
export const ReviewControls: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.selectOptions(c.getByLabelText('Weergave'), 'guardian');
    await expect(
      c.getByRole('heading', { name: 'Fijn dat je er bent.' }),
    ).toBeVisible();
    await userEvent.selectOptions(c.getByLabelText('Methode'), 'password');
    await expect(
      c.getByLabelText('E-mailadres', { exact: false }),
    ).toBeVisible();
    await userEvent.selectOptions(c.getByLabelText('Weergave'), 'student');
    await userEvent.selectOptions(c.getByLabelText('Methode'), 'device');
  },
};
export const Student: Story = { args: { controls: false } };
export const Guardian: Story = {
  args: { controls: false, initialRole: 'guardian' },
};
export const Checking: Story = {
  args: { controls: false, initialState: 'checking' },
};
export const Busy: Story = {
  args: { controls: false, initialState: 'busy' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const button = c.getByRole('button', { name: 'Bezig met aanmelden…' });
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    await expect(c.queryByRole('status')).not.toBeInTheDocument();
  },
};
export const SignInFailed: Story = {
  args: { controls: false, initialState: 'error' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('alert')).toBeVisible();
    await userEvent.click(c.getByText('Hulp nodig bij aanmelden?'));
    await expect(c.getByText(/Gebruik de browser die je ouder/)).toBeVisible();
  },
};
export const Unavailable: Story = {
  args: { controls: false, initialState: 'unavailable' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.queryByRole('button', { name: 'Aanmelden' }),
    ).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Opnieuw proberen' }));
    await expect(c.getByRole('button', { name: 'Aanmelden' })).toBeVisible();
  },
};
export const PasswordConcept: Story = {
  args: { controls: false, initialRole: 'guardian', initialMethod: 'password' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const password = c.getByLabelText('Wachtwoord', {
      exact: false,
      selector: 'input',
    });
    await userEvent.type(
      c.getByLabelText('E-mailadres', { exact: false }),
      'voorbeeld@example.invalid',
    );
    await userEvent.type(password, 'fictief-voorbeeld');
    await userEvent.click(c.getByRole('button', { name: 'Toon wachtwoord' }));
    await expect(password).toHaveAttribute('type', 'text');
    await userEvent.click(
      c.getByRole('button', { name: 'Verberg wachtwoord' }),
    );
    await expect(password).toHaveAttribute('type', 'password');
    await userEvent.click(c.getByRole('button', { name: 'Aanmelden' }));
    await expect(c.getByRole('status')).toHaveTextContent(
      'Je gegevens worden niet verstuurd',
    );
  },
};
export const CodeConcept: Story = {
  args: { controls: false, initialMethod: 'code' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const code = c.getByLabelText('Jouw toegangscode', { exact: false });
    await userEvent.type(code, '123');
    await userEvent.click(c.getByRole('button', { name: 'Aanmelden' }));
    await expect(code).toBeInvalid();
    await expect(c.queryByRole('status')).not.toBeInTheDocument();
    await userEvent.type(code, '456');
    await userEvent.click(c.getByRole('button', { name: 'Aanmelden' }));
    await expect(c.getByRole('status')).toHaveTextContent('niet aangemeld');
  },
};
