import { taalPresentation } from '../taal/taal-presentation';
import { redactiesommenPresentation } from '../redactiesommen/redactiesommen-presentation';
import { readingPresentation } from '../begrijpend-lezen/begrijpend-lezen-presentation';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ExerciseScreen } from '../exercise/exercise-screen';
import { rekenenPresentation } from '../rekenen/rekenen-presentation';
const submit = fn();
const save = fn();
const meta = {
  title: 'Practice/Saved journey',
  component: ExerciseScreen,
  tags: ['approved'],
  args: {
    definition: {
      ...rekenenPresentation,
      previewQuestion: () => ({ prompt: '1 + 3 = ?', answer: '', steps: [] }),
    },
    connected: {
      snapshot: {
        state: {
          index: 0,
          retry: false,
          stage: 'answer',
          outcomes: ['open'],
          queue: [],
          retryIndex: 0,
          submitted: '',
          attempts: [],
        },
        answer: '4',
        error: '',
      },
      onChange: fn(),
      onReturn: fn(),
      taskNumber: 1,
      blockLabel: 'Opgeslagen oefentaak',
      taskTitle: 'Rekenen · Optellen',
    },
    saved: {
      busy: false,
      note: 'Concept opgeslagen. Je kunt later verder.',
      onSaveDraft: save,
      onSubmit: submit,
      onContinue: fn(),
    },
  },
} satisfies Meta<typeof ExerciseScreen>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SavedDraft: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('textbox')).toHaveValue('4');
    await userEvent.click(
      c.getByRole('button', { name: 'Controleer antwoord' }),
    );
    await expect(submit).toHaveBeenCalled();
    await expect(
      c.queryByText('✓ Goed!', { exact: true }),
    ).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Bewaar concept' }));
    await expect(save).toHaveBeenCalled();
  },
};
export const Saving: Story = {
  args: { saved: { ...meta.args.saved, busy: true, note: 'Opslaan…' } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('textbox')).toHaveAttribute('readonly');
    await expect(
      c.getByRole('button', { name: 'Controleer antwoord' }),
    ).toHaveAttribute('aria-disabled', 'true');
    await expect(
      c.getByRole('button', { name: 'Bewaar concept' }),
    ).toBeDisabled();
  },
};
export const SaveFailed: Story = {
  args: {
    saved: {
      ...meta.args.saved,
      note: 'Opslaan niet bevestigd. Probeer opnieuw of laad het opgeslagen werk.',
    },
  },
};

export const TaalSavedDraft: Story = {
  tags: ['!approved', 'in-review'],
  args: {
    definition: {
      ...taalPresentation,
      previewQuestion: () => ({
        prompt: 'De kat slaapt op de bank.',
        answer: '',
        steps: [],
      }),
    },
    connected: {
      ...meta.args.connected,
      taskTitle: 'Taal · Woordsoorten',
      snapshot: { ...meta.args.connected.snapshot, answer: 'kat' },
    },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Welk woord is het werkwoord?')).toBeVisible();
    await expect(c.getByRole('textbox')).toHaveValue('kat');
    await userEvent.click(
      c.getByRole('button', { name: 'Controleer antwoord' }),
    );
    await expect(
      c.queryByText('Nog niet goed', { exact: true }),
    ).not.toBeInTheDocument();
  },
};
export const RedactiesommenSavedDraft: Story = {
  tags: ['!approved', 'in-review'],
  args: {
    definition: {
      ...redactiesommenPresentation,
      previewQuestion: () => ({
        prompt:
          'Noor heeft 24 stickers. Ze krijgt er 18 bij. Hoeveel stickers heeft Noor nu?',
        answerUnit: 'stickers',
        answer: '',
        steps: [],
      }),
    },
    connected: {
      ...meta.args.connected,
      taskTitle: 'Rekenen · Redactiesommen',
    },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByLabelText('Jouw antwoord in stickers')).toBeVisible();
    await expect(c.getByText(/Noor heeft 24 stickers/).tagName).toBe('P');
  },
};
export const ReadingSavedChoice: Story = {
  tags: ['!approved', 'in-review'],
  args: {
    definition: {
      ...readingPresentation,
      readingText: {
        title: 'Een tuin voor iedereen',
        paragraphs: ['De klas maakt een tuin voor kinderen en bijen.'],
      },
      previewQuestion: () => ({
        prompt: 'Voor wie is de tuin?',
        options: [
          { value: 'a', label: 'Alleen voor kinderen.' },
          { value: 'b', label: 'Voor kinderen en bijen.' },
          { value: 'c', label: 'Voor niemand.' },
          { value: 'd', label: 'Alleen voor bijen.' },
        ],
        answer: '',
        steps: [],
      }),
    },
    connected: {
      ...meta.args.connected,
      taskTitle: 'Begrijpend Lezen · Informatie vinden',
      snapshot: { ...meta.args.connected.snapshot, answer: 'b' },
    },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.getByRole('heading', { name: 'Een tuin voor iedereen' }),
    ).toBeVisible();
    await expect(
      c.getByRole('radio', { name: /Voor kinderen en bijen/ }),
    ).toBeChecked();
    await userEvent.click(c.getByRole('button', { name: 'Bewaar concept' }));
    await expect(save).toHaveBeenCalled();
    await expect(c.queryByText(/Het juiste antwoord/)).not.toBeInTheDocument();
  },
};
