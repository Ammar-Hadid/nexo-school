import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import styles from './palette.module.css';

const colors = [
  ['Purple', '--color-action-primary'],
  ['Cornflower', '--color-accent'],
  ['Blush', '--color-surface-soft'],
  ['Ivory', '--color-surface'],
  ['Ink', '--color-text'],
  ['White', '--color-surface-raised'],
] as const;

const statuses = [
  ['Gemarkeerd / fout', '--color-status-negative'],
  ['Positieve groei', '--color-status-positive'],
  ['Blokkade / urgent', '--color-status-warning'],
  ['Ondersteuning', '--color-status-info'],
] as const;

const meta = {
  title: 'Foundation/Color palette',
  parameters: {
    docs: {
      description: {
        component:
          'Purple & Cornflower: approved by the user on 17 October 2026. Edit src/styles/tokens.css to update the application and this preview together. Typography and Button revision 4 are also approved; other components require their own review.',
      },
    },
  },
  render: () => (
    <main>
      <h1>Purple &amp; Cornflower</h1>
      <p>
        De kleuren van nexo School. Lichter paars · goedgekeurd op 17 oktober
        2026.
      </p>
      <dl className={styles.palette}>
        {colors.map(([name, token]) => (
          <div key={token}>
            <div
              aria-hidden="true"
              className={styles.swatch}
              style={{ backgroundColor: `var(${token})` }}
            />
            <dt>{name}</dt>
            <dd className={styles.token}>{token}</dd>
          </div>
        ))}
      </dl>
      <h2>Statuskleuren · voorstel</h2>
      <p>
        De betekenis is gekozen; de precieze tinten en toepassing zijn ter
        beoordeling.
      </p>
      <dl className={styles.palette}>
        {statuses.map(([name, token]) => (
          <div key={token}>
            <div
              aria-hidden="true"
              className={styles.swatch}
              style={{ backgroundColor: `var(${token})` }}
            />
            <dt>{name}</dt>
            <dd className={styles.token}>{token}</dd>
          </div>
        ))}
      </dl>
      <p className={styles.primary}>Elke dag een beetje verder.</p>
      <p className={styles.accent}>Ruimte om te ontdekken.</p>
      <p>
        Groen betekent correct of positieve groei; rood vraagt om beoordeling,
        oranje markeert een blokkade.
      </p>
    </main>
  ),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;
export const ApprovedColors: Story = {};
