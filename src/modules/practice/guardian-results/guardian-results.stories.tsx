import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { GuardianResultsPreview } from './guardian-results-preview';

const meta = {
  title: 'Practice/Guardian task results',
  component: GuardianResultsPreview,
  tags: ['in-review'],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          'In Review · synthetic guardian task-result review revision 1. Read-only projection of the connected student snapshots. The preview switch is review tooling. Reload resets the example; no saved progress or authentication.',
      },
    },
  },
} satisfies Meta<typeof GuardianResultsPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ReviewPage: Story = {};
export const EmptyBlock: Story = { args: { populated: false } };
export const AttemptsAndReading: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const open = c.getByRole('button', {
      name: 'Bekijk taak: Rekenen · taak 1',
    });
    open.focus();
    await userEvent.keyboard('{Enter}');
    await expect(
      c.getByRole('heading', { level: 1, name: 'Rekenen · taak 1' }),
    ).toHaveFocus();
    await expect(c.getByText('8,5 / 10')).toBeVisible();
    await expect(c.getByText('9 / 10')).toBeVisible();
    await userEvent.click(c.getByText('Vraag 4', { exact: true }));
    await expect(
      within(canvasElement.querySelector('details[open]')!).getByText(
        'Eerste poging · Niet goed',
      ),
    ).toBeVisible();
    await expect(c.getByText('Tweede poging · Goed')).toBeVisible();
    await userEvent.click(
      c.getByRole('button', { name: '← Alle taakresultaten' }),
    );
    await expect(
      c.getByRole('button', { name: 'Bekijk taak: Rekenen · taak 1' }),
    ).toHaveFocus();
    await userEvent.click(
      c.getByRole('button', { name: 'Bekijk taak: Spelling · taak 1' }),
    );
    await expect(c.getByText('Nog geen eindresultaat')).toBeVisible();
    await expect(c.queryByText('Gewogen score')).not.toBeInTheDocument();
    await userEvent.click(c.getByText('Vraag 1', { exact: true }));
    await expect(c.getByText('kátten', { exact: true })).toBeVisible();
    await expect(c.queryByText('Antwoordmodel')).not.toBeInTheDocument();
    await userEvent.click(
      c.getByRole('button', { name: '← Alle taakresultaten' }),
    );
    await userEvent.click(
      c.getByRole('button', { name: 'Bekijk taak: Begrijpend Lezen · taak 1' }),
    );
    await userEvent.click(
      c.getByText('Volledige leestekst · Een tuin voor iedereen'),
    );
    await expect(
      c
        .getByRole('article', { name: 'Een tuin voor iedereen' })
        .querySelectorAll('p'),
    ).toHaveLength(6);
  },
};
export const LiveProgressAndResume: Story = {
  args: { populated: false },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(
      c.getByRole('button', { name: 'Naar leerlingpreview' }),
    );
    await userEvent.click(
      c.getByRole('button', { name: 'Start taak: Rekenen · taak 1' }),
    );
    await userEvent.type(c.getByRole('textbox'), '17');
    await userEvent.click(c.getByRole('button', { name: 'Naar ouderpreview' }));
    await userEvent.click(
      c.getByRole('button', { name: 'Bekijk taak: Rekenen · taak 1' }),
    );
    await userEvent.click(c.getByText('Vraag 1', { exact: true }));
    await expect(
      within(canvasElement.querySelector('details[open]')!).getByText(
        'Nog geen ingediend antwoord.',
      ),
    ).toBeVisible();
    await userEvent.click(
      c.getByRole('button', { name: 'Naar leerlingpreview' }),
    );
    await expect(c.getByRole('textbox')).toHaveValue('17');
    await expect(c.getByRole('textbox')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(c.getByRole('button', { name: 'Naar ouderpreview' }));
    await expect(
      within(canvasElement.querySelector('details[open]')!).getByText(
        'Eerste poging · Niet goed',
      ),
    ).toBeVisible();
    await expect(c.getByText('17', { exact: true })).toBeVisible();
    await userEvent.click(
      c.getByRole('button', { name: 'Naar leerlingpreview' }),
    );
    await expect(c.getByText('Nog niet goed', { exact: true })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    await expect(c.getByRole('heading', { name: '56 − 19 = ?' })).toBeVisible();
  },
};
