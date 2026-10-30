import { Button } from '../button/button';
import { destinations, type GuardianDestination } from './guardian-navigation';
import styles from './navigation-review.module.css';

export function PreviewContent({
  page,
  onNavigate,
}: {
  page: GuardianDestination;
  onNavigate: (page: GuardianDestination) => void;
}) {
  const label = destinations.find((item) => item.id === page)?.label;
  return (
    <div className={styles.pageContent}>
      <div className={styles.pageMeta}>
        <span>Adam · groep 5+</span>
        <span>Voorbeeld</span>
      </div>
      <h3>{label}</h3>
      {page === 'overview' ? (
        <>
          <p className={styles.intro}>Even kijken hoe het gaat.</p>
          <div className={styles.attention}>
            <div className={styles.attentionTitle}>
              <span className={styles.dot} aria-hidden="true" />
              <strong>Er staat een taak voor je klaar</strong>
            </div>
            <p>
              Adam heeft redactiesommen afgerond. Bekijk samen de antwoorden
              voordat het blok meetelt.
            </p>
            <p className={styles.exampleNote}>
              Dit is voorbeeldinhoud; de taakbeoordeling ontwerpen we later.
            </p>
          </div>
          <div className={styles.sectionLine}>
            <h4>Vandaag</h4>
            <Button
              variant="ghost"
              size="small"
              onClick={() => onNavigate('planning')}
            >
              Weekplanning
            </Button>
          </div>
          <ol className={styles.blocks}>
            <li>
              <span className={styles.blockNumber}>01</span>
              <div>
                <strong>Na school</strong>
                <span>Rekenen · spelling</span>
              </div>
              <span className={styles.state}>Afgerond</span>
            </li>
            <li>
              <span className={styles.blockNumber}>02</span>
              <div>
                <strong>Voor het avondeten</strong>
                <span>Redactiesommen · taal</span>
              </div>
              <span className={styles.state}>Ter review</span>
            </li>
          </ol>
        </>
      ) : (
        <>
          <p className={styles.intro}>
            {
              {
                planning: 'Een vertrouwde week, op jouw manier.',
                progress: 'Waar Adam groeit en waar hij hulp kan gebruiken.',
                results: 'De oorspronkelijke vragen en antwoorden.',
                settings: 'Jouw voorkeuren voor nexo School.',
                admin: 'Content, AI-verbruik en de werking van de app.',
              }[page]
            }
          </p>
          <div className={styles.destination}>
            <span className={styles.eyebrow}>Navigatievoorbeeld</span>
            <h4>Je bent bij {label?.toLowerCase()}.</h4>
            <p>
              Deze plek is bereikbaar via beide navigatievormen. De inhoud van
              deze pagina ontwerpen we in een volgende stap.
            </p>
            <Button variant="outline" onClick={() => onNavigate('overview')}>
              Terug naar overzicht
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
