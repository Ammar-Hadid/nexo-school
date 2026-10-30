import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AutomaticLearningPath } from './path-preview';
import { createPath, taskTitle } from './path-model';
const meta = {
  title: 'Practice/Automatic learning path',
  component: AutomaticLearningPath,
  tags: ['in-review'],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          'In Review · synthetic automatic learning path revision 3. Seven dates including a weekend, two independent bounded routes, daily Redactiesommen and retention. In-memory only; explicit unvalidated demonstration policy. Reuses approved exercise compositions, exact Nexai messages and guardian navigation.',
      },
    },
  },
} satisfies Meta<typeof AutomaticLearningPath>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReviewPage: Story = {};
export const TargetedGap: Story = { args: { initialHistory: 'gap' } };
export const InsufficientEvidence: Story = {
  args: { initialHistory: 'unknown' },
};
export const KeyboardResumeAndCompletion: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const model = createPath('known');
    const task = model.tasks.find((t) => t.purpose === 'confirm')!;
    const title = taskTitle(task);
    c.getByRole('link', { name: 'Bekijk taken' }).focus();
    await userEvent.keyboard('{Enter}');
    await expect(c.getByRole('heading', { name: 'Jouw taken' })).toHaveFocus();
    c.getByRole('button', { name: `Start taak: ${title}` }).focus();
    await userEvent.keyboard('{Enter}');
    await expect(c.getByRole('textbox')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(c.getByText('Typ eerst een getal in.')).toBeVisible();
    await userEvent.type(c.getByRole('textbox'), '99999');
    await userEvent.click(c.getByRole('link', { name: '← Mijn taken' }));
    await expect(
      c.getByRole('button', { name: `Ga verder: ${title}` }),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(c.getByRole('textbox')).toHaveValue('99999');
    await userEvent.keyboard('{Enter}');
    await userEvent.click(c.getByRole('button', { name: 'Naar ouderpreview' }));
    await expect(
      c.getByRole('heading', { name: 'Automatisch klaar voor vandaag' }),
    ).toHaveFocus();
    await expect(
      c.getByRole('region', { name: 'Rekenen leerroute' }),
    ).toHaveTextContent('Nieuwe check');
    await userEvent.click(
      c.getByRole('button', { name: 'Naar leerlingpreview' }),
    );
    await expect(c.getByText('Nog niet goed')).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    for (const question of task.questions.slice(1)) {
      await userEvent.type(c.getByRole('textbox'), question.answer);
      await userEvent.keyboard('{Enter}');
      await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    }
    await expect(
      c.getByRole('heading', { name: task.questions[0]!.prompt }),
    ).toBeVisible();
    await userEvent.type(c.getByRole('textbox'), '99999');
    await userEvent.keyboard('{Enter}');
    await expect(
      c.getByText(
        new RegExp(`Het juiste antwoord is ${task.questions[0]!.answer}`),
      ),
    ).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Verder' }));
    await expect(c.getByLabelText('3 van de 4 sommen goed')).toBeVisible();
    await userEvent.click(
      c.getByRole('link', { name: '← Terug naar mijn taken' }),
    );
    await expect(
      c.getByRole('button', { name: `Bekijk resultaat: ${title}` }),
    ).toHaveFocus();
    await expect(
      c.getByRole('button', { name: /Start taak: Taal/ }),
    ).toBeVisible();
    await userEvent.click(
      c.getByRole('button', { name: 'Volgende previewdag' }),
    );
    await userEvent.click(c.getByRole('link', { name: 'Bekijk taken' }));
    await expect(
      c.getByRole('button', {
        name: 'Start taak: Rekenen · Getalbegrip · Gericht oefenen',
      }),
    ).toBeVisible();
  },
};
export const WeekendRetentionAndIndependentRoutes: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(
      c.getByRole('button', { name: 'Doorloop open taken foutloos (demo)' }),
    );
    await userEvent.click(
      c.getByRole('button', { name: 'Volgende previewdag' }),
    );
    await userEvent.click(c.getByRole('link', { name: 'Bekijk taken' }));
    await expect(
      c.getByRole('button', {
        name: 'Start taak: Rekenen · Optellen · Startcheck',
      }),
    ).toBeVisible();
    await expect(
      c.queryByRole('button', { name: /Start taak: Taal/ }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      c.getByRole('button', { name: 'Doorloop open taken foutloos (demo)' }),
    );
    await userEvent.click(
      c.getByRole('button', { name: 'Volgende previewdag' }),
    );
    await expect(c.getByRole('status')).toHaveTextContent('zaterdag');
    await userEvent.click(c.getByRole('link', { name: 'Bekijk taken' }));
    await expect(
      c.getByRole('button', {
        name: 'Start taak: Rekenen · Redactiesommen · Dagelijkse toepassing',
      }),
    ).toBeVisible();
    await expect(
      c.getByRole('button', {
        name: 'Start taak: Rekenen · Getalbegrip · Even terugkijken',
      }),
    ).toBeVisible();
    await expect(
      c.queryByRole('button', { name: /Start taak: Taal/ }),
    ).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Naar ouderpreview' }));
    await expect(
      c.getByRole('region', { name: 'Rekenen leerroute' }),
    ).toHaveTextContent('Optellen');
    await expect(
      c.getByText('Demonstratieregels, geen meting van Adams niveau'),
    ).toBeVisible();
  },
};
export const CarryoverAcrossDays: Story = {
  args: { initialHistory: 'unknown' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('link', { name: 'Bekijk taken' }));
    await userEvent.click(
      c.getByRole('button', {
        name: 'Ga verder: Rekenen · Getalbegrip · Startcheck',
      }),
    );
    const question = c.getByRole('heading', { level: 2 }).textContent;
    await userEvent.type(c.getByRole('textbox'), '17');
    await userEvent.click(
      c.getByRole('button', { name: 'Volgende previewdag' }),
    );
    await userEvent.click(c.getByRole('link', { name: 'Bekijk taken' }));
    await userEvent.click(
      c.getByRole('button', {
        name: 'Ga verder: Rekenen · Getalbegrip · Startcheck',
      }),
    );
    await expect(c.getByRole('textbox')).toHaveValue('17');
    await expect(c.getByRole('heading', { level: 2 })).toHaveTextContent(
      question!,
    );
    await userEvent.click(c.getByRole('button', { name: 'Naar ouderpreview' }));
    await expect(
      c.getByRole('region', { name: 'Rekenen leerroute' }),
    ).toHaveTextContent('Startcheck');
  },
};

export const ConceptualGap: Story = { args: { initialHistory: 'conceptual' } };
export const UnfamiliarApplication: Story = {
  args: { initialHistory: 'transfer' },
};
export const AssistedAnswers: Story = { args: { initialHistory: 'assisted' } };
export const MissingLanguageEvidence: Story = {
  args: { initialHistory: 'guessing' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Naar ouderpreview' }));
    await expect(
      c.getByText(/Taal: passende ongeziene vragen ontbreken/),
    ).toBeVisible();
    await expect(
      c.getByRole('region', { name: 'Taal leerroute' }),
    ).toHaveTextContent('Aanvullend bewijs nodig');
  },
};
export const RetentionRecovery: Story = {
  args: { initialHistory: 'forgotten' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Naar ouderpreview' }));
    await expect(c.getByText(/Niet meer voldoende aangetoond/)).toBeVisible();
  },
};
export const GuardianHoldIsNotEvidence: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Naar ouderpreview' }));
    await userEvent.click(
      c.getByRole('button', { name: 'Pauzeer Rekenen-route' }),
    );
    await expect(c.getByText(/Gepauzeerd vanaf/)).toBeVisible();
    await userEvent.click(
      c.getByRole('button', { name: 'Hervat Rekenen-route' }),
    );
    await expect(
      c.getByRole('region', { name: 'Rekenen leerroute' }),
    ).toHaveTextContent('Aanvullend bewijs nodig');
  },
};
