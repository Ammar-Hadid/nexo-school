import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { GuardianPreview } from './guardian-preview';
const meta = {
  title: 'Guardian/Portal design',
  component: GuardianPreview,
  tags: ['approved'],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          'D04-R3 · Guardian-only replacement from the supplied sketches. Fictitious in-memory examples. Existing saved capabilities use the same scoped visual system, with their own authenticated adapters. Scheduling and proposed task decisions remain reference interactions.',
      },
    },
  },
} satisfies Meta<typeof GuardianPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReviewPage: Story = {};
export const Planning: Story = { args: { initialDestination: 'planning' } };
export const Progress: Story = { args: { initialDestination: 'progress' } };
export const Results: Story = { args: { initialDestination: 'results' } };
export const Admin: Story = { args: { initialDestination: 'admin' } };
export const Settings: Story = { args: { initialDestination: 'settings' } };
export const Quiet: Story = { args: { initialScenario: 'quiet' } };
export const Shortage: Story = { args: { initialScenario: 'shortage' } };
export const FirstVisit: Story = { args: { initialScenario: 'empty' } };
export const Loading: Story = { args: { initialScenario: 'loading' } };
export const RetryLoading: Story = {
  args: { initialScenario: 'error' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Opnieuw proberen' }));
    await expect(
      c.getByRole('heading', { name: 'Samen één rekenvraag bekijken' }),
    ).toBeVisible();
  },
};
export const DatedChangeAndUndo: Story = {
  ...Planning,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('radio', { name: /Alleen vandaag/ }));
    const input = c.getByRole('spinbutton', { name: /Rekenen · Optellen/ });
    await userEvent.clear(input);
    await userEvent.type(input, '2');
    await userEvent.click(
      c.getByRole('button', { name: 'Wijziging bekijken' }),
    );
    await expect(c.getByText(/Alleen 27 oktober/)).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Wijziging opslaan' }));
    await expect(
      c.getByText(/Alleen dinsdag 27 oktober gewijzigd/),
    ).toBeVisible();
    await userEvent.click(
      c.getByRole('button', { name: 'Laatste wijziging terugzetten' }),
    );
    await expect(
      c.getByRole('spinbutton', { name: /Rekenen · Optellen/ }),
    ).toHaveValue(1);
    await expect(c.getByText(/Wijziging teruggezet\./)).toBeVisible();
  },
};
export const FailedSaveKeepsDraft: Story = {
  args: { initialDestination: 'planning', failFirstSave: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole('spinbutton', { name: /Spelling · Meervouden/ });
    await userEvent.clear(input);
    await userEvent.type(input, '2');
    await userEvent.click(
      c.getByRole('button', { name: 'Wijziging bekijken' }),
    );
    await userEvent.click(c.getByRole('button', { name: 'Wijziging opslaan' }));
    await expect(c.getByRole('alert')).toHaveTextContent(/concept.*bewaard/);
    await expect(
      c.queryByText('Opgeslagen in dit voorbeeld'),
    ).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Opnieuw opslaan' }));
    await expect(input).toHaveValue(2);
  },
};
export const DraftSurvivesNavigation: Story = {
  ...Planning,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole('spinbutton', { name: /Spelling · Meervouden/ });
    await userEvent.clear(input);
    await userEvent.type(input, '3');
    await userEvent.click(
      c.getByRole('link', { name: 'Ammar — instellingen' }),
    );
    await waitFor(() =>
      expect(
        c.getByRole('heading', { level: 1, name: 'Instellingen' }),
      ).toHaveFocus(),
    );
    await userEvent.click(c.getByRole('link', { name: 'Planning' }));
    await expect(
      c.getByRole('spinbutton', { name: /Spelling · Meervouden/ }),
    ).toHaveValue(3);
    await userEvent.click(c.getByRole('button', { name: 'Concept annuleren' }));
    await expect(input).toHaveValue(1);
  },
};
export const PublicationIsSeparate: Story = {
  ...Admin,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Volgende vraag' }));
    await userEvent.click(
      c.getByRole('button', { name: 'Beoordeling afronden' }),
    );
    await userEvent.click(
      c.getByRole('checkbox', {
        name: 'Ik heb de inhoud en de gevolgen gecontroleerd.',
      }),
    );
    await userEvent.click(c.getByRole('button', { name: 'Goedkeuren' }));
    await expect(
      c.getByText(/Nog niet gepubliceerd\. Bekijk nu/),
    ).toBeVisible();
    await userEvent.click(
      c.getByRole('button', { name: 'Publicatie bekijken' }),
    );
    await userEvent.click(
      c.getByRole('checkbox', {
        name: 'Ik heb de inhoud en de gevolgen gecontroleerd.',
      }),
    );
    await userEvent.click(c.getByRole('button', { name: 'Publiceren' }));
    await userEvent.click(
      c.getByRole('button', { name: 'Probleem melden en intrekken' }),
    );
    await userEvent.type(
      c.getByRole('textbox', { name: 'Reden van intrekken' }),
      'De uitleg moet opnieuw worden bekeken.',
    );
    await userEvent.click(
      c.getByRole('checkbox', {
        name: 'Ik heb de inhoud en de gevolgen gecontroleerd.',
      }),
    );
    await userEvent.click(c.getByRole('button', { name: 'Inhoud intrekken' }));
    await expect(
      c.getByText('Optellen en aftrekken: ingetrokken in dit voorbeeld'),
    ).toBeVisible();
  },
};
export const ResultsPreserveEvidence: Story = {
  ...Results,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(
      c.getByRole('button', { name: 'Bekijk sessie: Rekenen · sessie 1' }),
    );
    await expect(c.getByText('8,5 / 10')).toBeVisible();
    await expect(c.getByText('9 / 10')).toBeVisible();
    await userEvent.click(c.getByText('Vraag 4', { exact: true }));
    await expect(
      within(canvasElement.querySelector('details[open]')!).getByText(
        'Eerste poging · Niet goed',
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      within(canvasElement.querySelector('details[open]')!).getByText(
        'Tweede poging · Goed',
        { exact: true },
      ),
    ).toBeVisible();
    await userEvent.click(
      c.getByRole('button', { name: 'Alle sessieresultaten' }),
    );
    await expect(
      c.getByRole('button', { name: 'Bekijk sessie: Rekenen · sessie 1' }),
    ).toHaveFocus();
    await userEvent.click(
      c.getByRole('button', { name: 'Bekijk sessie: Spelling · sessie 1' }),
    );
    await expect(c.getByText('Nog geen eindresultaat')).toBeVisible();
    await userEvent.click(c.getByText('Vraag 1', { exact: true }));
    await expect(c.getByText('kátten', { exact: false })).toBeVisible();
    await expect(c.queryByText(/^Antwoord:/)).not.toBeInTheDocument();
  },
};
export const ReadingContext: Story = {
  ...Results,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(
      c.getByRole('button', {
        name: 'Bekijk sessie: Begrijpend Lezen · sessie 1',
      }),
    );
    await expect(
      c
        .getByRole('article', { name: 'Een tuin voor iedereen' })
        .querySelectorAll('p'),
    ).toHaveLength(6);
    await expect(
      c.getByRole('heading', { name: 'Volledige leestekst' }),
    ).toBeVisible();
  },
};
export const RevocationExplainsRecovery: Story = {
  ...Settings,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Beveiliging' }));
    await userEvent.click(
      c.getByRole('button', { name: 'Browsertoegang beheren' }),
    );
    await expect(
      c.getByText(/Deze actie is niet terug te draaien/),
    ).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Annuleren' }));
    await userEvent.click(
      c.getByRole('button', { name: 'Browsertoegang beheren' }),
    );
    await userEvent.click(
      c.getByRole('button', { name: 'Toegang intrekken in voorbeeld' }),
    );
    await expect(c.getByText(/meld de browser opnieuw aan/)).toBeVisible();
  },
};
export const ProfileSaveAndUndo: Story = {
  ...Settings,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Profiel bewerken' }));
    const name = c.getByRole('textbox', { name: 'Naam' });
    await userEvent.clear(name);
    await userEvent.type(name, 'Ammar Test');
    await userEvent.click(c.getByRole('button', { name: 'Profiel opslaan' }));
    await expect(
      c.getByRole('link', { name: 'Ammar Test — instellingen' }),
    ).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Ongedaan maken' }));
    await expect(
      c.getByRole('link', { name: 'Ammar — instellingen' }),
    ).toBeVisible();
  },
};
export const AttentionUndo: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(
      c.getByRole('button', { name: 'Markeer als samen bekeken' }),
    );
    await expect(c.getByRole('status')).toHaveTextContent(
      'Gemarkeerd als samen bekeken',
    );
    await userEvent.click(c.getByRole('button', { name: 'Ongedaan maken' }));
    await expect(
      c.getByRole('heading', { name: 'Samen één rekenvraag bekijken' }),
    ).toBeVisible();
  },
};
export const ProgressFilter: Story = {
  ...Progress,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.selectOptions(
      c.getByRole('combobox', { name: 'Vak voor grafiek' }),
      'spelling',
    );
    await expect(
      c.getByRole('heading', { name: 'Nog geen gegevens voor een grafiek' }),
    ).toBeVisible();
    await userEvent.selectOptions(
      c.getByRole('combobox', { name: 'Vak voor grafiek' }),
      'rekenen',
    );
    await userEvent.click(
      c.getByText('Bekijk de gegevens als tabel', { exact: true }),
    );
    await expect(c.getByRole('table')).toBeVisible();
  },
};
