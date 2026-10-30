import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from '../button/button';
import { SignInLayout, SignInNotice } from './sign-in-layout';
const meta = {
  title: 'Components/Sign in layout',
  component: SignInLayout,
  tags: ['approved'],
  args: {
    context: 'Voor leerlingen',
    title: 'Welkom terug.',
    description: 'Meld je aan en ga verder met jouw taken.',
    welcome: {
      eyebrow: 'Jouw plek om te groeien',
      title: 'Kleine stappen.',
      accent: 'Grote ontdekkingen.',
      description: 'Ontdek wat je al kunt en leer elke dag iets nieuws.',
    },
    children: (
      <Button fullWidth onClick={fn()}>
        Aanmelden
      </Button>
    ),
    help: (
      <details>
        <summary>Hulp nodig?</summary>
        <p>Vraag je ouder om even mee te kijken.</p>
      </details>
    ),
    footer: <span>Componentreview · Goedgekeurd</span>,
  },
} satisfies Meta<typeof SignInLayout>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Layout: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.tab();
    await expect(c.getByRole('link', { name: 'Naar aanmelden' })).toHaveFocus();
    await expect(c.getByRole('button', { name: 'Aanmelden' })).toBeVisible();
  },
};
export const Feedback: Story = {
  args: {
    children: (
      <>
        <SignInNotice>Even controleren…</SignInNotice>
        <SignInNotice tone="error">
          Aanmelden is niet gelukt. Probeer opnieuw.
        </SignInNotice>
        <SignInNotice tone="success">Je bent afgemeld.</SignInNotice>
      </>
    ),
  },
};
