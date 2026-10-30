import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { NexaiCompanion } from './nexai';
import { nexaiLibrary, type NexaiPoseId } from './nexai-library';
import { Button } from '../button/button';
import styles from './nexai-library.module.css';

const meta = {
  title: 'Components/Nexai library',
  component: NexaiCompanion,
  args: { pose: 'calm-1', message: 'Welke taak kies je?', ambient: false },
  argTypes: {
    pose: { control: 'select', options: nexaiLibrary.map((p) => p.id) },
  },
} satisfies Meta<typeof NexaiCompanion>;
export default meta;
type Story = StoryObj<typeof meta>;
function Library() {
  const [pose, setPose] = useState<NexaiPoseId>('calm-1');
  const [eventKey, replay] = useState(0);
  return (
    <main className={styles.page}>
      <h1>Nexai · gedeelde bibliotheek</h1>
      <p>
        24 goedgekeurde houdingen met oogbewegingen. Kies een houding en bekijk
        de beweging. Situaties wijzen we toe wanneer we de bijbehorende pagina
        ontwerpen.
      </p>
      <label htmlFor="library-pose">Houding</label>
      <select
        id="library-pose"
        value={pose}
        onChange={(e) => setPose(e.target.value as NexaiPoseId)}
      >
        {nexaiLibrary.map((p) => (
          <option key={p.id} value={p.id}>
            {p.number} · {p.label} · {p.title}
          </option>
        ))}
      </select>
      <NexaiCompanion
        pose={pose}
        message="Hoi! Ik ben Nexai."
        eventKey={eventKey}
        ambient={false}
      />
      <Button variant="outline" onClick={() => replay((n) => n + 1)}>
        Opnieuw afspelen
      </Button>
      <p>
        Goedkeuring van een houding betekent niet dat hij al aan een leermoment
        is gekoppeld. Boze en verdrietige houdingen staan voorlopig vrij.
      </p>
    </main>
  );
}
export const LibraryReview: Story = { render: () => <Library /> };
export const EveryPose: Story = {
  render: () => <Library />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    for (const pose of nexaiLibrary) {
      await userEvent.selectOptions(c.getByLabelText('Houding'), pose.id);
      const svg = canvasElement.querySelector('svg[data-pose]');
      await waitFor(() => expect(svg).toHaveAttribute('data-pose', pose.id));
      await waitFor(() => expect(svg).toHaveAttribute('data-ready', 'true'));
      await expect(svg).toHaveAttribute('data-asset-error', 'false');
      await expect(svg?.querySelector('[data-body]')).toHaveAttribute(
        'href',
        pose.asset,
      );
      await expect(svg?.querySelectorAll('[data-eye]')).toHaveLength(2);
    }
    await userEvent.click(
      c.getByRole('button', { name: 'Nexai even stilzetten' }),
    );
    await expect(canvasElement.querySelector('svg')).toHaveAttribute(
      'data-playing',
      'false',
    );
    for (const eye of canvasElement.querySelectorAll('[data-eye]'))
      await expect(eye).toHaveAttribute('opacity', '0');
    await expect(c.getAllByRole('status')).toHaveLength(1);
  },
};
export const WinkAndPaw: Story = {
  args: { pose: 'encourage-2', ambient: true },
};
export const ClosedEyePeek: Story = { args: { pose: 'happy-1' } };
