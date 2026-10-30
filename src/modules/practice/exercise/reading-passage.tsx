import styles from './exercise-screen.module.css';

export function ReadingPassage({
  title,
  paragraphs,
  id,
}: {
  title: string;
  paragraphs: readonly string[];
  id: string;
}) {
  return (
    <article
      className={styles.readingPassage}
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <span className={styles.eyebrow}>De tekst</span>
      <h2 id={`${id}-title`}>{title}</h2>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </article>
  );
}
