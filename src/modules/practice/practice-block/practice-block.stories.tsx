import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  PracticeBlockReview,
  BlockRecoveryExample,
} from './practice-block-review';
import {
  PracticeBlockContext,
  BlockCollectionState,
} from './practice-block-context';
import { PracticeBlockCard } from './practice-block-card';
import { blockExamples, tasksPreviewHref } from './practice-block.fixtures';
import styles from './practice-block-review.module.css';

const meta = {
  title: 'Components/Practice blocks',
  component: PracticeBlockReview,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof PracticeBlockReview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReviewPage: Story = {};
export const KeyboardDetails: Story = {
  render: () => (
    <main>
      <h1>Oefenblokken</h1>
      <h2>Beoordeling nodig</h2>
      {blockExamples
        .filter((block) => block.state === 'review')
        .map((block) => (
          <PracticeBlockCard
            key={block.state}
            block={block}
            tasksHref={tasksPreviewHref(block)}
          />
        ))}
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('5 van 5')).toBeVisible();
    await expect(canvas.getByText('Nog even wachten op Ammar.')).toBeVisible();
    await expect(
      canvas.getByText('Je bent klaar! Vraag Ammar om samen te kijken.'),
    ).toBeVisible();
    await expect(canvas.queryByText('Ter beoordeling')).not.toBeInTheDocument();
    const link = canvas.getByRole('link', { name: 'Bekijk taken' });
    link.focus();
    await expect(link).toHaveFocus();
    await expect(link).toHaveAttribute(
      'href',
      './iframe.html?id=components-practice-tasks--tasks-page&viewMode=story&args=state:review',
    );
    await expect(link).not.toHaveAttribute('aria-expanded');
    await expect(canvas.queryByRole('list')).not.toBeInTheDocument();
    await expect(canvasElement).not.toHaveTextContent(/sessie/i);
  },
};
export const Recovery: Story = {
  render: () => (
    <main>
      <h1>Oefenblokken</h1>
      <BlockRecoveryExample />
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByText('Vandaag geen oefenblokken'),
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Opnieuw proberen' }),
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Voorbeeld opnieuw geladen.',
    );
    await expect(canvas.getByText('Vandaag geen oefenblokken')).toBeVisible();
  },
};
export const Loading: Story = {
  render: () => (
    <main>
      <h1>Oefenblokken</h1>
      <BlockCollectionState state="loading" />
    </main>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveAttribute(
      'aria-busy',
      'true',
    );
  },
};
export const Desktop: Story = {
  render: () => <PracticeBlockContext name="Desktop blokken" expanded />,
};
export const Iphone: Story = {
  render: () => (
    <div className={styles.phone}>
      <PracticeBlockContext name="iPhone blokken" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', { name: 'Voorbeeldsituatie' });
    await userEvent.selectOptions(select, 'review');
    await expect(
      canvas.getByText('Nog niet verdiend · eerst jouw beoordeling'),
    ).toBeVisible();
    await userEvent.selectOptions(select, 'completed');
    await expect(
      canvas.getByText('Verdiend · vandaag te gebruiken'),
    ).toBeVisible();
    await expect(
      canvas.getByText('Dit blok is nu aan de beurt.'),
    ).toBeVisible();
    await userEvent.selectOptions(select, 'error');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Opnieuw proberen' }),
    );
    await expect(canvas.getByText('2 van 5')).toBeVisible();
    const nav = within(
      canvas.getByRole('navigation', { name: /Mobiele navigatie/ }),
    );
    await userEvent.click(nav.getByRole('link', { name: 'Planning' }));
    await expect(
      canvas.getByRole('heading', { name: 'Weekplanning' }),
    ).toBeVisible();
    await userEvent.click(nav.getByRole('link', { name: 'Overzicht' }));
    await expect(canvas.getByText('2 van 5')).toBeVisible();
  },
};
