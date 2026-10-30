import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { ReviewDemo } from './review-demo';
import { ReviewTime } from './review-time';
import styles from './review.module.css';
const meta = {
  title: 'Content/Batch review',
  component: ReviewDemo,
  tags: ['in-review'],
  parameters: {
    docs: {
      description: {
        component:
          'D14 first slice · In Review. Local synthetic demonstration only. No paid AI or educational approval. Saved API and authorization verified separately.',
      },
    },
  },
} satisfies Meta<typeof ReviewDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReviewBatch: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.getByRole('heading', { name: 'Oefeningen beoordelen' }),
    ).toBeVisible();
    await expect(c.getByRole('heading', { name: 'Hebben' })).toBeVisible();
    await expect(
      c.queryByRole('heading', { name: 'Spelen' }),
    ).not.toBeInTheDocument();
    await expect(
      c.getByRole('button', { name: /Beslis over selectie \(0\)/ }),
    ).toBeDisabled();
  },
};
export const EditAndApprove: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: /^03\s*Spelen/ }));
    await expect(
      c.getByText(/De vereiste zin of context ontbreekt/),
    ).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Bewerk Spelen' }));
    await expect(
      c.getByRole('button', { name: /^01\s*Hebben/ }),
    ).toBeDisabled();
    await userEvent.clear(c.getByLabelText('Vraag'));
    await userEvent.type(c.getByLabelText('Vraag'), 'Lina __ (spelen) buiten.');
    await userEvent.clear(c.getByLabelText('Uitleg'));
    await userEvent.type(c.getByLabelText('Uitleg'), 'Bij Lina hoort speelt.');
    await userEvent.click(
      c.getByRole('button', { name: 'Nieuwe versie opslaan' }),
    );
    await expect(
      c.getByText('Gewijzigde versie; beoordeel de inhoud opnieuw.'),
    ).toBeVisible();
    await userEvent.click(
      c.getByRole('checkbox', { name: 'Selecteer Spelen' }),
    );
    await userEvent.click(
      c.getByRole('button', { name: /Beslis over selectie \(1\)/ }),
    );
    await userEvent.type(
      c.getByLabelText('Beoordelingsnotitie (optioneel)'),
      'Alleen een synthetische testbeslissing.',
    );
    await userEvent.click(
      c.getByRole('checkbox', {
        name: 'Ik heb de volledige geselecteerde versies zelf beoordeeld.',
      }),
    );
    await userEvent.click(
      c.getByRole('button', { name: 'Selectie goedkeuren' }),
    );
    await expect(c.getByText('Versie 2 · Goedgekeurd')).toBeVisible();
  },
};
export const Empty: Story = { args: { empty: true } };
export const SaveFailure: Story = {
  args: { fail: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Bewerk Hebben' }));
    await userEvent.click(
      c.getByRole('button', { name: 'Nieuwe versie opslaan' }),
    );
    await expect(c.getByText(/Niet opgeslagen\./)).toBeVisible();
    await expect(c.getByLabelText('Vraag')).toHaveValue(
      'Hij __ (hebben) een boek.',
    );
  },
};
export const PauseOnBlur: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Start tijdmeting' }));
    await expect(
      c.getByRole('button', { name: 'Pauzeer tijdmeting' }),
    ).toBeVisible();
    window.dispatchEvent(new Event('blur'));
    await expect(
      await c.findByRole('button', { name: 'Start tijdmeting' }),
    ).toBeVisible();
  },
};

export const LiveTimer: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Start tijdmeting' }));
    const clock = c.getByRole('timer', { name: 'Actieve beoordelingstijd' });
    await waitFor(() => expect(clock).not.toHaveTextContent('0:00'), {
      timeout: 4000,
    });
    await expect(c.getByText('Opgeslagen: 0:00')).toBeVisible();
    await userEvent.click(
      c.getByRole('button', { name: 'Pauzeer tijdmeting' }),
    );
    const paused = clock.textContent;
    await new Promise((resolve) => setTimeout(resolve, 1100));
    await expect(clock).toHaveTextContent(paused!);
    await expect(c.getByText(`Opgeslagen: ${paused}`)).toBeVisible();
  },
};

export const BlockedSelection: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: /^03\s*Spelen/ }));
    await userEvent.click(
      c.getByRole('checkbox', { name: 'Selecteer Spelen' }),
    );
    await userEvent.click(c.getByRole('button', { name: /^01\s*Hebben/ }));
    await userEvent.click(
      c.getByRole('checkbox', { name: 'Selecteer Hebben' }),
    );
    await userEvent.click(
      c.getByRole('button', { name: /Beslis over selectie \(2\)/ }),
    );
    await userEvent.type(
      c.getByLabelText('Beoordelingsnotitie (optioneel)'),
      'Alleen een synthetische testbeslissing.',
    );
    await userEvent.click(
      c.getByRole('checkbox', {
        name: 'Ik heb de volledige geselecteerde versies zelf beoordeeld.',
      }),
    );
    await expect(
      c.getByRole('button', { name: 'Selectie goedkeuren' }),
    ).toBeDisabled();
    await userEvent.click(
      c.getByRole('button', { name: 'Verwijder Spelen uit selectie' }),
    );
    await expect(
      c.getByRole('checkbox', {
        name: 'Ik heb de volledige geselecteerde versies zelf beoordeeld.',
      }),
    ).not.toBeChecked();
    await userEvent.click(c.getByRole('button', { name: 'Bekijk Hebben' }));
    await expect(
      c.getByRole('checkbox', { name: 'Selecteer Hebben' }),
    ).toBeChecked();
  },
};

const failTimerSave = async (input: Record<string, unknown>) => {
  if (input.action === 'start-time')
    return { sessionId: 'failed-save-demo', activeMs: 1000 };
  throw new Error('SYNTHETIC_SAVE_FAILURE');
};
export const TimerSaveFailure: Story = {
  render: () => (
    <div className={styles.shell}>
      <ReviewTime initialMs={1000} send={failTimerSave} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Start tijdmeting' }));
    const clock = c.getByRole('timer', { name: 'Actieve beoordelingstijd' });
    await waitFor(() => expect(clock).not.toHaveTextContent('0:01'), {
      timeout: 4000,
    });
    await userEvent.click(
      c.getByRole('button', { name: 'Pauzeer tijdmeting' }),
    );
    await expect(await c.findByRole('alert')).toHaveTextContent(
      'opslaan is niet bevestigd',
    );
    await expect(clock).toHaveTextContent('0:01');
    await expect(c.getByText('Opgeslagen: 0:01')).toBeVisible();
  },
};

export const ApproveThenPublish: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(
      c.getByRole('checkbox', { name: 'Selecteer Hebben' }),
    );
    await userEvent.click(
      c.getByRole('button', { name: /Beslis over selectie \(1\)/ }),
    );
    await expect(
      c.getByLabelText('Beoordelingsnotitie (optioneel)'),
    ).toHaveValue('');
    await expect(
      c.getByRole('button', { name: 'Selectie goedkeuren' }),
    ).toBeDisabled();
    await userEvent.click(
      c.getByRole('checkbox', {
        name: 'Ik heb de volledige geselecteerde versies zelf beoordeeld.',
      }),
    );
    await userEvent.click(
      c.getByRole('button', { name: 'Selectie goedkeuren' }),
    );
    await userEvent.click(
      c.getByRole('button', { name: 'Verder naar publiceren (1)' }),
    );
    await expect(
      c.getByRole('button', { name: 'Goedgekeurde selectie publiceren' }),
    ).toBeDisabled();
    await userEvent.click(
      c.getByRole('checkbox', {
        name: 'Ik heb de volledige geselecteerde versies zelf beoordeeld.',
      }),
    );
    await userEvent.click(
      c.getByRole('button', { name: 'Goedgekeurde selectie publiceren' }),
    );
    await expect(c.getByRole('status')).toHaveTextContent(
      'Geselecteerde versies zijn lokaal gepubliceerd.',
    );
  },
};
