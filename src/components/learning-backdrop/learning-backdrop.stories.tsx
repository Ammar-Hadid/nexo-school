import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { LearningBackdrop } from './learning-backdrop';
import { Button } from '../button/button';
import styles from './learning-backdrop-review.module.css';

const meta = {
  title: 'Components/Learning backdrop',
  component: LearningBackdrop,
  parameters: { controls: { disable: true } },
  args: {
    children: (
      <main className={styles.example}>
        <p>Gedeelde decoratie · goedgekeurd</p>
        <h1>Ruimte om te leren.</h1>
        <p>
          Boekjes, potloden en kleine sterren vullen de zijmarges. Het midden
          blijft rustig.
        </p>
        <div className={styles.card}>
          <h2>De inhoud blijft voorop</h2>
          <p>
            Onder 1184 pixels verdwijnen de tekeningen. Er is geen animatie,
            tekst in de illustratie of betekenis gekoppeld aan de decoratie.
          </p>
          <Button>Voorbeeldactie</Button>
        </div>
      </main>
    ),
  },
} satisfies Meta<typeof LearningBackdrop>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReviewPage: Story = {};
export const KeyboardAndDecoration: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const action = canvas.getByRole('button', { name: 'Voorbeeldactie' });
    await userEvent.tab();
    await expect(action).toHaveFocus();
    await expect(canvas.queryByRole('img')).not.toBeInTheDocument();
    const artwork = canvasElement.querySelector('[aria-hidden="true"]');
    await expect(artwork).toHaveStyle({ pointerEvents: 'none' });
  },
};
