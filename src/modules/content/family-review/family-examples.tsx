'use client';
import { Button } from '@/components/button/button';
import type { FamilyPackage } from './family-review-contract';
import styles from './family-review.module.css';
export function FamilyExamples({
  pkg,
  seen,
  index,
  onIndex,
  onSeen,
}: {
  pkg: FamilyPackage;
  seen: number[];
  index: number;
  onIndex: (n: number) => void;
  onSeen: (id: number) => void;
}) {
  const item = pkg.examples[index]!;
  return (
    <section aria-labelledby="examples-title">
      <h2 id="examples-title">
        {pkg.examples.length} voorbeelden, één familie
      </h2>
      <p>
        Bekijk de vraag, het antwoord en vooral de uitleg. Alle{' '}
        {pkg.technical.checkedInstances} oefeningen zijn automatisch
        gecontroleerd.
      </p>
      <nav className={styles.examplesNav} aria-label="Voorbeelden">
        {pkg.examples.map((s, n) => (
          <button
            key={s.index}
            type="button"
            aria-label={`Voorbeeld ${n + 1}: ${s.prompt}`}
            aria-current={index === n ? 'step' : undefined}
            onClick={() => onIndex(n)}
          >
            {n + 1}
            {seen.includes(s.index) ? ' ✓' : ''}
          </button>
        ))}
      </nav>
      <article className={styles.example} aria-label={`Voorbeeld ${index + 1}`}>
        <p className={styles.eyebrow}>
          {index + 1} / {pkg.examples.length} · {item.reason}
        </p>
        <div className={styles.exampleColumns}>
          <div>
            <h3>Leerling ziet</h3>
            <p className={styles.sum}>{item.prompt}</p>
            <p>Vul het gehele getal in.</p>
          </div>
          <div>
            <h3>Antwoord en uitleg</h3>
            <p className={styles.sum}>{item.answer}</p>
            <p>{item.explanation}</p>
          </div>
        </div>
      </article>
      <Button onClick={() => onSeen(item.index)}>
        {index === pkg.examples.length - 1
          ? 'Bekeken · naar mijn oordeel'
          : 'Bekeken · volgend voorbeeld'}
      </Button>
      <p>
        {seen.length} van {pkg.examples.length} voorbeelden bekeken. Dit vinkje
        is nog geen goedkeuring.
      </p>
    </section>
  );
}
