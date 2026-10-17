'use client';

import { useId, useState } from 'react';
import { AttentionCard, type AttentionKind } from './attention-card';
import styles from './attention-review.module.css';

export const examples: {
  id: string;
  kind: AttentionKind;
  title: string;
  summary: string;
  metadata: string;
  action: string;
  detailTitle: string;
  detail: string;
}[] = [
  {
    id: 'session',
    kind: 'review',
    title: 'Kijk samen naar redactiesommen',
    summary:
      'Adam heeft de sessie afgerond. Vier vragen waren bij de eerste poging fout. De sessie wacht op jouw beoordeling.',
    metadata: 'Redactiesommen · blok 2 · vandaag',
    action: 'Bekijk de sessie',
    detailTitle: 'Wat laten de antwoorden zien?',
    detail:
      'Voorbeeld: 6 van de 10 antwoorden waren meteen goed. Bij de tweede poging waren nog 2 antwoorden goed: eindscore 7/10. Dit zegt op zichzelf niet waarom antwoorden fout waren. In de uiteindelijke sessiebeoordeling kun je antwoorden bekijken en de sessie accepteren of laten herhalen.',
  },
  {
    id: 'higher',
    kind: 'recommendation',
    title: 'Is rekenen toe aan een volgende stap?',
    summary:
      'In drie recente sessies waren bijna alle eerste antwoorden goed. Bekijk of iets moeilijkere oefeningen passen.',
    metadata: 'Rekenen · 3 recente sessies',
    action: 'Bekijk het advies',
    detailTitle: 'Voorstel: één stap moeilijker',
    detail:
      'Voorbeeldresultaten bij dezelfde vaardigheid: 9/10, 10/10 en 10/10 meteen goed. Dit is een ontwerpscenario, geen vastgestelde beslisregel. Het niveau verandert pas als jij het advies goedkeurt.',
  },
  {
    id: 'support',
    kind: 'recommendation',
    title: 'Spelling vraagt wat extra steun',
    summary:
      'Woorden met ei en ij blijven lastig in de recente sessies. Bekijk het voorstel om een stap terug te doen.',
    metadata: 'Spelling · ei en ij · deze week',
    action: 'Bekijk het voorstel',
    detailTitle: 'Voorstel: eerst de basis versterken',
    detail:
      'Voorbeeld: dezelfde ei/ij-verwisseling komt terug in meerdere sessies, ook bij de tweede poging. Bekijk eerst de antwoorden en bespreek met Adam wat lastig is. Een lager niveau wordt niet automatisch ingesteld. De precieze aanbevelingsregels moeten nog onderzocht worden.',
  },
  {
    id: 'blocker',
    kind: 'blocker',
    title: 'De tablet wacht op toestemming',
    summary:
      'Adam kan op deze browser nog niet verder. Bekijk de aanvraag en controleer of deze van zijn tablet komt.',
    metadata: 'Toegang · nieuwe browser',
    action: 'Bekijk de aanvraag',
    detailTitle: 'Controleer de browseraanvraag',
    detail:
      'Dit is een voorbeeld van een toegangsblokkade. De uiteindelijke aanvraag toont de browsernaam en code, waarna je de bestaande veilige goedkeuringsstappen volgt. Deze preview geeft geen toegang en verandert geen instellingen.',
  },
];

export function ExampleCard({
  item,
  headingLevel = 3,
}: {
  item: (typeof examples)[number];
  headingLevel?: 3 | 4;
}) {
  const [open, setOpen] = useState(false);
  const detailId = useId();
  return (
    <div>
      <AttentionCard
        kind={item.kind}
        title={item.title}
        summary={item.summary}
        metadata={item.metadata}
        headingLevel={headingLevel}
        action={{
          label: open ? 'Sluit de toelichting' : item.action,
          onSelect: () => setOpen(!open),
          expanded: open,
          controls: detailId,
        }}
      />
      <div id={detailId} hidden={!open} className={styles.detail}>
        <strong>{item.detailTitle}</strong>
        <p>{item.detail}</p>
        <span className={styles.small}>
          Voorbeeld · er wordt niets opgeslagen of goedgekeurd.
        </span>
      </div>
    </div>
  );
}
