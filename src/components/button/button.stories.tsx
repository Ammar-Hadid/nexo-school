import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from './button';
import { ButtonReview } from './button-review';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Opslaan', iconOnly: false },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    startIcon: { control: false },
    endIcon: { control: false },
    iconOnly: { control: false },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ReviewPage: Story = {
  render: () => <ButtonReview />,
  parameters: { controls: { disable: true } },
};

export const InteractionChecks: Story = {
  render: () => <ButtonReview />,
  parameters: { controls: { disable: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const save = canvas.getByRole('button', { name: 'Probeer opslaan' });
    await userEvent.click(save);
    await expect(save).toHaveAttribute('aria-busy', 'true');
    await expect(save).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await waitFor(
      () =>
        expect(canvas.getByRole('status')).toHaveTextContent(
          'Demo opgeslagen · 1 keer',
        ),
      { timeout: 3000 },
    );
    await expect(save).not.toHaveAttribute('aria-busy');
    const toggle = canvas.getByRole('button', { name: 'Selecteer voorbeeld' });
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{Enter}');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(
      await canvasElement.ownerDocument.fonts.load('600 18px "Nexo Outfit"'),
    ).toHaveLength(1);
  },
};

export const Playground: Story = { parameters: { layout: 'centered' } };

function luminance(color: string) {
  const channels = (color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
  const weights = [0.2126, 0.7152, 0.0722];
  return channels.reduce((sum, channel, index) => {
    const value = color.startsWith('color(srgb') ? channel : channel / 255;
    const linear =
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    return sum + linear * (weights[index] ?? 0);
  }, 0);
}

function contrast(a: string, b: string) {
  const first = luminance(a);
  const second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

export const SecondaryContrast: Story = {
  render: () => <ButtonReview />,
  parameters: { controls: { disable: true } },
  play: async ({ canvasElement }) => {
    // Protect the specific default/hover/pressed contrast regression from review 1.
    for (const state of ['default', 'hover', 'pressed']) {
      const button = canvasElement.querySelector<HTMLButtonElement>(
        `button[data-variant="secondary"][data-preview="${state}"]`,
      );
      if (!button) throw new Error(`Missing secondary ${state} specimen`);
      const style = getComputedStyle(button);
      await expect(
        contrast(style.color, style.backgroundColor),
      ).toBeGreaterThanOrEqual(7);
      await expect(
        contrast(style.borderTopColor, style.backgroundColor),
      ).toBeGreaterThanOrEqual(3);
    }
  },
};

function FormContract() {
  const [submits, setSubmits] = useState(0);
  const [clicks, setClicks] = useState(0);
  return (
    <main>
      <h1>Knopgedrag</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmits(submits + 1);
        }}
      >
        <Button onClick={() => setClicks(clicks + 1)}>Gewone actie</Button>
        <Button disabled onClick={() => setClicks(clicks + 1)}>
          Niet beschikbaar
        </Button>
        <Button loading type="submit" onClick={() => setClicks(clicks + 1)}>
          Bezig met opslaan
        </Button>
        <Button
          aria-disabled="true"
          type="submit"
          onClick={() => setClicks(clicks + 1)}
        >
          Tijdelijk geblokkeerd
        </Button>
        <Button type="submit">Formulier versturen</Button>
        <p role="status">
          Klikken: {clicks}; verzonden: {submits}
        </p>
      </form>
    </main>
  );
}

export const NativeBehavior: Story = {
  render: () => <FormContract />,
  parameters: { controls: { disable: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Gewone actie' }));
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Klikken: 1; verzonden: 0',
    );
    await userEvent.tab();
    const busy = canvas.getByRole('button', { name: 'Bezig met opslaan' });
    await expect(busy).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Niet beschikbaar' }),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Tijdelijk geblokkeerd' }),
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Klikken: 1; verzonden: 0',
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Formulier versturen' }),
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Klikken: 1; verzonden: 1',
    );
  },
};
