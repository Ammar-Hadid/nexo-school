import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import {
  GuardianFeedback,
  GuardianPanel,
  GuardianPageHeading,
  GuardianStatus,
} from './guardian-ui';
import {
  SubjectLabel,
  guardianSubjects,
  type GuardianSubject,
} from './subject-icon';
import { ProgressChart } from './progress-chart';
import styles from './guardian-ui.module.css';
const meta = {
  title: 'Guardian/Shared system',
  tags: ['approved'],
  parameters: { layout: 'padded' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const SubjectIdentity: Story = {
  render: () => (
    <div data-guardian-ui="r3">
      <GuardianPageHeading
        title="Vier vakken, vaste herkenning"
        description="Guardian-only iconen en statuskleuren."
      />
      <GuardianPanel title="Vakken">
        {(Object.keys(guardianSubjects) as GuardianSubject[]).map((subject) => (
          <p key={subject}>
            <SubjectLabel subject={subject} />
          </p>
        ))}
        <p>
          <SubjectLabel subject="rekenen" category="Redactiesommen" />
        </p>
        <p className={styles.headingActions}>
          <GuardianStatus tone="positive">Afgerond</GuardianStatus>
          <GuardianStatus tone="warning">Aandacht</GuardianStatus>
          <GuardianStatus tone="negative">Ingetrokken</GuardianStatus>
        </p>
      </GuardianPanel>
    </div>
  ),
};
function ReceiptExample() {
  const [undone, setUndone] = useState(false);
  return (
    <div data-guardian-ui="r3">
      <GuardianFeedback
        title={undone ? 'Wijziging teruggezet' : 'Weekritme opgeslagen'}
        undo={undone ? undefined : { onClick: () => setUndone(true) }}
      >
        <p>
          {undone
            ? 'Je vorige weekritme geldt weer. Je kunt verder plannen.'
            : 'Vanaf maandag geldt je nieuwe weekritme. Je kunt dit terugzetten zolang er geen sessies zijn klaargezet. Bekijk nu de dagplanning.'}
        </p>
      </GuardianFeedback>
    </div>
  );
}
export const ReversibleReceipt: Story = {
  render: () => <ReceiptExample />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Ongedaan maken' }));
    await expect(c.getByRole('status')).toHaveTextContent(
      'Wijziging teruggezet',
    );
  },
};
export const AccessibleChart: Story = {
  render: () => (
    <div data-guardian-ui="r3">
      <GuardianPanel title="Resultaten per sessie">
        <ProgressChart
          points={[
            { label: 'Sessie 1', correct: 8, total: 10 },
            { label: 'Sessie 2', correct: 4, total: 5 },
            { label: 'Sessie 3', correct: 7, total: 10 },
          ]}
          caption="Fictieve meetpunten; geen uitspraak over beheersing."
        />
      </GuardianPanel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByText('Bekijk de gegevens als tabel'));
    await expect(c.getByRole('table')).toBeVisible();
  },
};
