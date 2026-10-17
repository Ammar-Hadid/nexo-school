import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AttentionReview, RecoveryExample } from './attention-review';
import { AttentionState } from './attention-card';
import { ExampleCard, examples } from './attention-examples';
import { AttentionContext } from './attention-context';
import styles from './attention-review.module.css';

const meta = {
  title: 'Components/Attention cards',
  component: AttentionReview,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof AttentionReview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReviewPage: Story = {};
export const KeyboardDetails: Story = {
  render: () => (
    <main>
      <h1>Sessie bekijken</h1>
      <h2>Jouw aandacht</h2>
      {examples
        .filter((item) => item.id === 'session')
        .map((item) => (
          <ExampleCard key={item.id} item={item} />
        ))}
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Bekijk de sessie' });
    button.focus();
    await userEvent.keyboard('{Enter}');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(button).toHaveFocus();
    await expect(
      canvas.getByText('Wat laten de antwoorden zien?'),
    ).toBeVisible();
    const detailsId = button.getAttribute('aria-controls');
    await expect(detailsId).toBeTruthy();
    await expect(
      canvasElement.ownerDocument.getElementById(detailsId ?? ''),
    ).toBeVisible();
    await userEvent.keyboard(' ');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(
      canvas.getByText('Wat laten de antwoorden zien?'),
    ).not.toBeVisible();
  },
};
export const Recovery: Story = {
  render: () => (
    <main>
      <h1>Aandachtspunten</h1>
      <h2>Fout herstellen</h2>
      <RecoveryExample />
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByText('Je hoeft nu niets te doen'),
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Opnieuw proberen' }),
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Voorbeeld opnieuw geladen',
    );
    await expect(canvas.getByText('Je hoeft nu niets te doen')).toBeVisible();
    await expect(
      canvas.queryByText('Aandachtspunten niet geladen'),
    ).not.toBeInTheDocument();
  },
};
export const Loading: Story = {
  render: () => (
    <main>
      <h1>Aandachtspunten</h1>
      <h2>Even ophalen</h2>
      <AttentionState state="loading" />
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveAttribute(
      'aria-busy',
      'true',
    );
    await expect(
      canvas.queryByText('Je hoeft nu niets te doen'),
    ).not.toBeInTheDocument();
  },
};
export const Desktop: Story = {
  render: () => <AttentionContext name="Desktop kaarten" expanded />,
};
export const Iphone: Story = {
  render: () => (
    <div className={styles.phone}>
      <AttentionContext name="iPhone kaarten" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selector = canvas.getByRole('combobox', {
      name: 'Voorbeeldsituatie',
    });
    await userEvent.selectOptions(selector, 'empty');
    await expect(canvas.getByText('Je hoeft nu niets te doen')).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Bekijk de sessie' }),
    ).not.toBeInTheDocument();
    await userEvent.selectOptions(selector, 'error');
    await expect(canvas.getByText('Nog onbekend')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Opnieuw proberen' }),
    );
    await expect(
      canvas.getByRole('button', { name: 'Bekijk de sessie' }),
    ).toBeVisible();
    await userEvent.selectOptions(selector, 'blocker');
    await expect(
      canvas.getByRole('button', { name: 'Bekijk de aanvraag' }),
    ).toBeVisible();
    await userEvent.selectOptions(selector, 'attention');
    const nav = within(
      canvas.getByRole('navigation', { name: /Mobiele navigatie/ }),
    );
    await userEvent.click(nav.getByRole('link', { name: 'Planning' }));
    await expect(
      canvas.getByRole('heading', { name: 'Weekplanning' }),
    ).toBeVisible();
    await userEvent.click(nav.getByRole('link', { name: 'Overzicht' }));
    await expect(
      canvas.getByRole('button', { name: 'Bekijk de sessie' }),
    ).toBeVisible();
  },
};
