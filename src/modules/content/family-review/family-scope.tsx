import { Button } from '@/components/button/button';
import type { FamilyPackage } from './family-review-contract';
import styles from './family-review.module.css';
export function FamilyScope({
  pkg,
  onExamples,
}: {
  pkg: FamilyPackage;
  onExamples: () => void;
}) {
  return (
    <section aria-labelledby="scope-title">
      <h2 id="scope-title">Dit is de familie die je beoordeelt</h2>
      <ul className={styles.scope}>
        <li>
          <strong>Wel:</strong> {pkg.scope?.bounds ?? pkg.contract.operands}
        </li>
        <li>
          <strong>Voorkennis:</strong>{' '}
          {pkg.scope?.prerequisites ?? pkg.contract.prerequisites}
        </li>
        <li>
          <strong>Doel:</strong>{' '}
          {pkg.scope?.objective ??
            'Procedureel oefenen; geen bewijs voor beheersing.'}
        </li>
        <li>
          <strong>Vast patroon:</strong>{' '}
          {pkg.scope?.pattern ?? pkg.contract.explanationPattern}
        </li>
      </ul>
      {pkg.scope && <p>{pkg.scope.changes}</p>}
      <div className={styles.technical}>
        <h3>Wat al automatisch is gecontroleerd</h3>
        <p>
          {pkg.technical.checkedInstances}{' '}
          {pkg.contract.subject === 'Spelling' ? 'woorden' : 'sommen'} ·{' '}
          {pkg.technical.mismatches}{' '}
          {pkg.contract.subject === 'Spelling'
            ? 'bankafwijkingen'
            : 'rekenafwijkingen'}{' '}
          · {pkg.technical.exposureGroups}{' '}
          {pkg.contract.subject === 'Spelling' ? 'woordgroepen' : 'somgroepen'}{' '}
          · {pkg.technical.independentFamilies} familie
        </p>
        <p>
          Dit controleert de technische regels. Het beantwoordt niet of de
          uitleg en grenzen onderwijskundig geschikt zijn.
        </p>
      </div>
      <p>
        Je beoordeelt de familie één keer. Een latere wijziging aan dit pakket
        vraagt een nieuw oordeel; oude beslissingen blijven bewaard.
      </p>
      <Button onClick={onExamples}>
        Bekijk de {pkg.examples.length} voorbeelden
      </Button>
    </section>
  );
}
