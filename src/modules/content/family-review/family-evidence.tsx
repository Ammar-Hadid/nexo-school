import {
  familyOutcomeLabels,
  type FamilyReviewState,
} from './family-review-contract';
import styles from './family-review.module.css';
export function FamilyEvidence({ state }: { state: FamilyReviewState }) {
  const pkg = state.package;
  return (
    <>
      <details className={styles.details}>
        <summary>Technisch dossier en volledige inventaris</summary>
        <p>
          Versie: {pkg.version}. Broncodes, contract, voorbeelden en volledige
          inventaris zijn aan dit pakket gekoppeld.
        </p>
        <p className={styles.hash}>
          Pakket: {state.packageHash}
          <br />
          Contract: {pkg.contractHash}
          <br />
          Inventaris: {pkg.inventoryHash}
        </p>
        <ul>
          {Object.entries(pkg.sources).map(([path, hash]) => (
            <li key={path} className={styles.hash}>
              {path}: {hash}
            </li>
          ))}
        </ul>
        <p>
          Geen AI-aanvragen. Publicatie, intrekken van fouten en echte
          leerlingtoewijzing hebben afzonderlijke vrijgavevoorwaarden.
        </p>
        <details>
          <summary>
            Alle {pkg.inventory.length} varianten tonen (optioneel)
          </summary>
          <ol>
            {pkg.inventory.map((i) => (
              <li key={i.index}>
                <strong>
                  {i.prompt} {i.answer}
                </strong>{' '}
                — {i.explanation}
              </li>
            ))}
          </ol>
        </details>
      </details>
      <details className={styles.details} open={state.history.length > 0}>
        <summary>Vastgelegde beoordelingen ({state.history.length})</summary>
        {state.history.map((row) => (
          <article key={row.id}>
            <h3>{familyOutcomeLabels[row.outcome]}</h3>
            <p>
              {new Date(row.createdAt).toLocaleString('nl-NL')} · revisie{' '}
              {row.revision}
            </p>
            <details>
              <summary>Verklaring en herkomst</summary>
              <p className={styles.hash}>
                Beoordelaar: {row.reviewerId} · pakket {state.packageHash}
              </p>
              <p>
                {JSON.parse(row.snapshot).role === 'educator'
                  ? 'Onderwijskundige'
                  : 'Ouder'}{' '}
                ·{' '}
                {JSON.parse(row.snapshot).basis === 'independent-human'
                  ? 'Onafhankelijke eigen beoordeling'
                  : 'AI-ondersteund'}
              </p>
              <p>{JSON.parse(row.snapshot).qualification}</p>
              <p>{JSON.parse(row.snapshot).notes}</p>
            </details>
          </article>
        ))}
      </details>
    </>
  );
}
