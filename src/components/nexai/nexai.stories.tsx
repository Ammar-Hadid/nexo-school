import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { NexaiCompanion } from './nexai';
import { NexaiReview } from './nexai-review';
import { motions } from './nexai-motion';
const meta = {
  title: 'Components/Nexai',
  component: NexaiCompanion,
  args: {
    message: 'Hoi Adam! Welke taak kies je?',
    motion: 'wave',
    ambient: true,
  },
} satisfies Meta<typeof NexaiCompanion>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReviewPage: Story = {
  render: () => <NexaiReview />,
  parameters: { controls: { disable: true } },
};
export const Companion: Story = {};
export const Pause: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(
      c.getByRole('button', { name: 'Nexai even stilzetten' }),
    );
    await expect(
      c.getByRole('button', { name: 'Laat Nexai bewegen' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(canvasElement.querySelector('svg')).toHaveAttribute(
      'data-playing',
      'false',
    );
    await expect(c.getAllByRole('status')).toHaveLength(1);
  },
};
export const LongMessage: Story = {
  args: {
    message:
      'Je bent klaar met deze taak. Vraag Ammar om samen te kijken, dan kunnen jullie rustig verder.',
  },
};

export const EveryClip: Story = {
  render: () => <NexaiReview />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const artwork = canvasElement.querySelector('svg[data-playing]');
    for (const [name, clip] of Object.entries(motions)) {
      await userEvent.click(
        c.getByRole('button', { name: `${clip.label} ${clip.description}` }),
      );
      await waitFor(() => expect(artwork).toHaveAttribute('data-motion', name));
      await expect(artwork).toHaveAttribute('data-asset-error', 'false');
      expect(artwork?.querySelector('[data-sheet]')?.getAttribute('href')).toBe(
        `/nexai/motion-v2/${name}.png`,
      );
    }
    // Rapid replacement cannot let an older async image load win.
    await userEvent.click(
      c.getByRole('button', {
        name: `${motions.back.label} ${motions.back.description}`,
      }),
    );
    await userEvent.click(
      c.getByRole('button', {
        name: `${motions.yawn.label} ${motions.yawn.description}`,
      }),
    );
    await waitFor(() => expect(artwork).toHaveAttribute('data-motion', 'yawn'));
    await userEvent.click(c.getByRole('button', { name: 'Stilzetten' }));
    await expect(artwork).toHaveAttribute('data-playing', 'false');
    await waitFor(() => expect(artwork).toHaveAttribute('data-frame', '0'));
  },
};

/** Proposed reading placement; artwork and exact catalogue line remain approved. */
export const BesideMessage: Story = {
  args: {
    layout: 'beside',
    pose: 'calm-1',
    message: 'Ik kijk mee. Neem je tijd.',
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('status')).toHaveTextContent(
      'Ik kijk mee. Neem je tijd.',
    );
    await expect(canvasElement.querySelector('svg[data-pose]')).toHaveAttribute(
      'data-pose',
      'calm-1',
    );
    await userEvent.click(
      c.getByRole('button', { name: 'Nexai even stilzetten' }),
    );
    await expect(
      c.getByRole('button', { name: 'Laat Nexai bewegen' }),
    ).toHaveAttribute('aria-pressed', 'true');
  },
};
