'use client';
import {
  familyDecision,
  familyOutcomeLabels,
  type FamilyDraft,
  type FamilyPackage,
  type FamilyJudgment,
} from './family-review-contract';
import styles from './family-review.module.css';
export function FamilyDecisionForm({
  pkg,
  draft,
  change,
  confirmed,
  onConfirm,
}: {
  pkg: FamilyPackage;
  draft: FamilyDraft;
  change: (d: FamilyDraft) => void;
  confirmed: boolean;
  onConfirm: (checked: boolean) => void;
}) {
  const outcome = familyDecision(draft, pkg);
  return (
    <section aria-labelledby="judgment-title">
      <h2 id="judgment-title">
        {pkg.criteria.length} oordelen over de hele familie
      </h2>
      <p>
        Je hoeft niet elke oefening apart goed te keuren. Beoordeel de vaste
        regels. Je mag bij een probleem of twijfel direct stoppen en je
        bevinding vastleggen.
      </p>
      <div className={styles.criteria}>
        {pkg.criteria.map((c) => {
          const id = c.id;
          return (
            <div key={id}>
              <h3>{c.title}</h3>
              <p>{c.question}</p>
              <details>
                <summary>Wat valt hieronder?</summary>
                <p>{c.detail}</p>
              </details>
              <label htmlFor={`judgment-${id}`}>Oordeel: {c.title}</label>
              <select
                id={`judgment-${id}`}
                value={draft.judgments[id]}
                onChange={(e) =>
                  change({
                    ...draft,
                    judgments: {
                      ...draft.judgments,
                      [id]: e.target.value as FamilyJudgment,
                    },
                  })
                }
              >
                <option value="">Kies je oordeel</option>
                <option value="accept">Geschikt binnen deze grenzen</option>
                <option value="change">Aanpassing nodig</option>
                <option value="unsure">Ik weet het niet</option>
              </select>
            </div>
          );
        })}
      </div>
      <fieldset className={styles.reviewer}>
        <legend>Wie beoordeelt, en op welke basis?</legend>
        <label>
          Ik beoordeel als
          <select
            value={draft.role}
            onChange={(e) =>
              change({ ...draft, role: e.target.value as FamilyDraft['role'] })
            }
          >
            <option value="guardian">Ouder</option>
            <option value="educator">Onderwijskundige / vakdocent</option>
          </select>
        </label>
        <p>
          Ouderfeedback helpt om de inhoud te verbeteren. Voor een
          familiecertificaat is een onafhankelijke onderwijskundige beoordeling
          vereist.
        </p>
        {draft.role === 'educator' && (
          <label>
            Relevante deskundigheid
            <textarea
              value={draft.qualification}
              maxLength={2000}
              onChange={(e) =>
                change({ ...draft, qualification: e.target.value })
              }
            />
            <small>
              Beschrijf je eigen ervaring of bevoegdheid. De applicatie
              verifieert deze verklaring niet.
            </small>
          </label>
        )}
        <label>
          Basis van mijn oordeel
          <select
            value={draft.basis}
            onChange={(e) =>
              change({
                ...draft,
                basis: e.target.value as FamilyDraft['basis'],
              })
            }
          >
            <option value="">Kies de basis</option>
            <option value="independent-human">
              Mijn eigen onafhankelijke beoordeling
            </option>
            <option value="ai-assisted">
              Voorlopig oordeel met hulp van AI
            </option>
          </select>
        </label>
        <label>
          Toelichting bij mijn oordeel
          <textarea
            value={draft.notes}
            maxLength={2000}
            onChange={(e) => change({ ...draft, notes: e.target.value })}
          />
          <small>
            Benoem geschiktheid, een benodigde wijziging of je twijfel. Minimaal
            10 tekens.
          </small>
        </label>
      </fieldset>
      <div className={styles.result}>
        <strong>Wat wordt vastgelegd?</strong>
        <p>{familyOutcomeLabels[outcome]}</p>
        <p>
          Alleen dit pakket en deze versie. Er worden geen oefeningen
          automatisch gepubliceerd of aan Adam toegewezen.
        </p>
      </div>
      <label className={styles.confirm}>
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => onConfirm(e.target.checked)}
        />
        Ik bevestig mijn ingevulde oordeel, bekeken onderdelen, rol en
        beoordelingsbasis.
      </label>
    </section>
  );
}
