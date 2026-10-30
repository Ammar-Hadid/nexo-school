import type { ReviewItem } from './review-contract';
import styles from './review.module.css';
export function ReviewDetails({ item }: { item: ReviewItem }) {
  return (
    <details className={styles.details}>
      <summary>Opdrachtregels en herkomst</summary>
      <p>
        Antwoordvorm: {item.rules.response}; opties: {item.rules.optionCount};
        context: {item.rules.context}.
      </p>
      <p>
        Tekstlengte:{' '}
        {item.rules.passageWords
          ? `${item.rules.passageWords.min}–${item.rules.passageWords.max} woorden`
          : 'geen vaste grens'}
        .
      </p>
      <p>
        Vereiste termen: {item.rules.requiredPromptTerms.join(', ') || 'geen'}.
      </p>
      <p>
        Rekencontrole:{' '}
        {item.rules.calculation
          ? JSON.stringify(item.rules.calculation)
          : 'niet van toepassing'}
        .
      </p>
      <p>
        Rechten: {item.payload.rights}. Herkomst: {item.payload.provenance}.
      </p>
      <p className={styles.hash}>
        Inhoud: {item.contentHash}
        <br />
        Bevinding hoort bij: {item.advisory.sourceHash}
      </p>
    </details>
  );
}
