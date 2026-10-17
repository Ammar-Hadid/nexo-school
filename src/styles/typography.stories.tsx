import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import styles from './typography.module.css';

const scale = [
  ['Paginatitels', 'Outfit · 32–40px · 700'],
  ['Sectiekoppen', 'Outfit · 24–28px · 600'],
  ['Navigatie en knoppen', 'Outfit · 18px · 600'],
  ['Oefenvragen', 'Lexend · 22–26px · 500'],
  ['Leesteksten', 'Lexend · 22px · 400 · regelhoogte 1,7'],
  ['Antwoorden', 'Lexend · 18–22px · 400'],
  ['Tekst voor ouders', 'Outfit · 16px · 400'],
  ['Kleine labels', 'Outfit · 14px · 500'],
] as const;

const meta = {
  title: 'Foundation/Typography',
  parameters: {
    docs: {
      description: {
        component:
          'Typography proposal based on the supplied Outfit/Lexend scale. Real locally served fonts, isolated from application defaults. Awaiting user approval.',
      },
    },
  },
  render: () => (
    <main className={styles.specimen}>
      <p className={styles.label}>nexo School · Typografievoorstel</p>
      <h1>Elke dag een beetje verder.</h1>
      <p className={styles.intro}>
        Outfit voor de wegwijzers. Lexend voor het leren.
      </p>

      <section className={styles.section}>
        <p className={styles.label}>Outfit · Koppen en navigatie</p>
        <h2>Klaar voor iets nieuws?</h2>
        <p className={styles.navigationSample}>
          Vandaag · Oefenen · Mijn groei
        </p>
        <p>
          Deze week heeft je kind geoefend met de tafels van 6 en 7. Bekijk
          samen wat al goed gaat en wat nog aandacht nodig heeft.
        </p>
      </section>

      <section className={styles.section}>
        <p className={styles.label}>Lexend · Leestekst · 22px</p>
        <h2>Een ontdekking in de tuin</h2>
        <p className={styles.reading}>
          Noor zit op haar knieën naast een oude bloempot. Onder een blad
          ontdekt ze een slak. Langzaam steekt hij zijn voelsprieten uit. Noor
          blijft stil zitten en kijkt hoe de slak over de rand kruipt. Dan roept
          ze zachtjes haar broer. Samen volgen ze het glimmende spoor door de
          tuin.
        </p>
      </section>

      <section className={styles.section}>
        <p className={styles.label}>Lexend · Vraag en antwoorden</p>
        <h2>Even oefenen</h2>
        <p className={styles.question}>
          Er staan 7 dozen op tafel. In elke doos zitten 8 potloden. Hoeveel
          potloden zijn er samen?
        </p>
        <ol className={styles.answers} type="A">
          <li>48 potloden</li>
          <li>56 potloden</li>
          <li>64 potloden</li>
        </ol>
        <p className={styles.label}>Letterproef, geen interactieve oefening.</p>
      </section>

      <section className={styles.section}>
        <h2>Letters, cijfers en leestekens</h2>
        <div className={styles.characters}>
          <p>I l 1 · O 0 · b d p q</p>
          <p>één · ideeën · coöperatie · IJssel</p>
          <p>7 × 8 = 56 · 24 ÷ 6 = 4 · 12,5</p>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Voorgestelde schaal</h2>
        <dl className={styles.scale}>
          {scale.map(([role, specification]) => (
            <div className={styles.scaleRow} key={role}>
              <dt>{role}</dt>
              <dd>{specification}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  ),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProposedPairing: Story = {
  play: async ({ canvasElement }) => {
    const fonts = canvasElement.ownerDocument.fonts;
    const outfit = await fonts.load('700 40px "Nexo Outfit Preview"');
    const lexend = await fonts.load('400 22px "Nexo Lexend Preview"');
    await expect(outfit).toHaveLength(1);
    await expect(lexend).toHaveLength(1);
    await expect(outfit[0]?.status).toBe('loaded');
    await expect(lexend[0]?.status).toBe('loaded');
  },
};
