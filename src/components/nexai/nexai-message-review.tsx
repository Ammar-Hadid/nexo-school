'use client';
import { useRef, useState } from 'react';
import { Button } from '../button/button';
import { TextField } from '../text-field/text-field';
import { NexaiCompanion } from './nexai';
import {
  messageCandidates,
  messageCategories,
  messageCatalogueVersion,
} from './nexai-message-candidates';
import {
  decodeReviews,
  ratingsStorageKey,
  reviewExport,
  type MessageRating,
  type MessageReviews,
} from './nexai-message-ratings';
import styles from './nexai-message-review.module.css';

const ratingLabels = {
  keep: 'Goed',
  revise: 'Aanpassen',
  remove: 'Weg',
} as const;
/** Local editorial workbench, Storybook only. No learner storage or publication. */
export function NexaiMessageReview({ persist = true }: { persist?: boolean }) {
  // A live Storybook update must not retain ratings for the previous wording.
  return <CatalogueReview key={messageCatalogueVersion} persist={persist} />;
}

function CatalogueReview({ persist }: { persist: boolean }) {
  const [saved, setSaved] = useState(() => {
    if (!persist || typeof window === 'undefined')
      return {
        reviews: {} as MessageReviews,
        notice: 'Deze test bewaart geen beoordelingen.',
      };
    try {
      return {
        reviews: decodeReviews(localStorage.getItem(ratingsStorageKey)),
        notice: 'Beoordelingen worden alleen in deze browser bewaard.',
      };
    } catch {
      return {
        reviews: {} as MessageReviews,
        notice:
          'Opgeslagen beoordelingen konden niet worden geladen. Exporteer je nieuwe keuzes als back-up.',
      };
    }
  });
  const [category, setCategory] = useState('welcome');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const activeCategory = messageCategories.find((item) => item.id === category);
  const visible = messageCandidates.filter(
    (item) =>
      (category === 'all' || item.category === category) &&
      (filter === 'all' ||
        (filter === 'unrated'
          ? !saved.reviews[item.id]
          : saved.reviews[item.id]?.rating === filter)) &&
      `${item.id} ${item.text}`
        .toLocaleLowerCase('nl')
        .includes(search.trim().toLocaleLowerCase('nl')),
  );
  function update(id: string, rating: MessageRating | null, note = '') {
    const reviews = { ...saved.reviews };
    if (rating) reviews[id] = { rating, note };
    else delete reviews[id];
    let notice = saved.notice;
    if (persist) {
      try {
        localStorage.setItem(
          ratingsStorageKey,
          JSON.stringify(reviewExport(reviews)),
        );
        notice =
          'Opgeslagen in deze browser. Exporteer je keuzes om ze te delen of te bewaren.';
      } catch {
        notice =
          'Opslaan lukt niet. Je keuzes staan nog op deze pagina; exporteer ze voordat je weggaat.';
      }
    }
    if (
      filter !== 'all' &&
      ((filter === 'unrated' && rating) ||
        (filter !== 'unrated' && rating !== filter))
    )
      resultsHeading.current?.focus();
    setSaved({ reviews, notice });
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(reviewExport(saved.reviews), null, 2)], {
        type: 'application/json',
      }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nexai-berichten-beoordeling-v2.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <main className={styles.page}>
      <header>
        <p className={styles.eyebrow}>
          nexo School · berichtencatalogus 2 · goedgekeurd
        </p>
        <h1>Wat zegt Nexai?</h1>
        <p>
          240 goedgekeurde berichten van een nieuwsgierige kattenmaat.
          Beoordelingen en notities blijven beschikbaar voor latere feedback.
        </p>
        <div className={styles.summary}>
          <strong>
            {Object.keys(saved.reviews).length} van 240 beoordeeld
          </strong>
          {Object.entries(ratingLabels).map(([value, label]) => (
            <span key={value}>
              {label}:{' '}
              {
                Object.values(saved.reviews).filter(
                  (review) => review.rating === value,
                ).length
              }
            </span>
          ))}
          <Button variant="outline" onClick={download}>
            Exporteer beoordelingen
          </Button>
        </div>
        <p className={styles.notice} role="status">
          {saved.notice}
        </p>
        <p>
          Alle teksten zijn herschreven. Beoordelingen van voorstel 1 blijven
          apart bewaard in deze browser en tellen hier niet mee.
        </p>
        <p>
          Deze berichten zijn goedgekeurd en worden gebruikt in de rekenreview.
          Lokale beoordelingen wijzigen die goedkeuring niet. Wis je
          browsergegevens, dan verdwijnen je lokale beoordelingen.
        </p>
      </header>
      <section className={styles.filters} aria-label="Berichten filteren">
        <label>
          Categorie
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPreview(null);
            }}
          >
            <option value="all">Alle categorieën · 240</option>
            {messageCategories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label} · {item.messages.length}
              </option>
            ))}
          </select>
        </label>
        <label>
          Beoordeling
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Alle beoordelingen</option>
            <option value="unrated">Nog te beoordelen</option>
            {Object.entries(ratingLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <TextField
          label="Zoek in berichten"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Bijvoorbeeld: rustig"
        />
      </section>
      <section aria-labelledby="message-results">
        <h2 id="message-results" ref={resultsHeading} tabIndex={-1}>
          {activeCategory?.label ?? 'Alle situaties'}{' '}
          <span className={styles.count}>· {visible.length} berichten</span>
        </h2>
        <p>
          {activeCategory?.note ??
            'Elke kaart noemt zijn situatie. De boze categorieën zijn losse tekstvoorstellen; er is geen gedragsdetectie aan gekoppeld.'}
        </p>
        {visible.length === 0 && (
          <p>
            Geen berichten met deze filters. Kies een andere categorie,
            beoordeling of zoekterm.
          </p>
        )}
        <div className={styles.grid}>
          {visible.map((item) => {
            const review = saved.reviews[item.id];
            const group = messageCategories.find(
              (entry) => entry.id === item.category,
            )!;
            return (
              <article
                key={item.id}
                className={styles.card}
                data-rating={review?.rating ?? 'unrated'}
                aria-labelledby={`title-${item.id}`}
              >
                <div className={styles.cardTop}>
                  <h3 id={`title-${item.id}`}>{group.label}</h3>
                  <span>{item.id}</span>
                </div>
                {preview === item.id ? (
                  <NexaiCompanion
                    pose={item.pose}
                    message={item.text}
                    ambient={false}
                    eventKey={item.id}
                  />
                ) : (
                  <blockquote>{item.text}</blockquote>
                )}
                <div
                  className={styles.rating}
                  role="group"
                  aria-label={`Beoordeling ${item.id}`}
                >
                  {Object.entries(ratingLabels).map(([value, label]) => (
                    <Button
                      key={value}
                      size="small"
                      variant={review?.rating === value ? 'primary' : 'outline'}
                      aria-pressed={review?.rating === value}
                      onClick={() =>
                        update(
                          item.id,
                          review?.rating === value
                            ? null
                            : (value as MessageRating),
                          review?.note,
                        )
                      }
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                {review?.rating === 'revise' && (
                  <label className={styles.noteLabel}>
                    Wat wil je anders aan {item.id}?
                    <textarea
                      maxLength={500}
                      rows={3}
                      value={review.note}
                      onChange={(event) =>
                        update(item.id, 'revise', event.target.value)
                      }
                      placeholder="Bijvoorbeeld: korter, grappiger, ander woord…"
                    />
                  </label>
                )}
                <Button
                  size="small"
                  variant="ghost"
                  aria-expanded={preview === item.id}
                  onClick={() =>
                    setPreview(preview === item.id ? null : item.id)
                  }
                >
                  {preview === item.id ? 'Verberg Nexai' : 'Bekijk met Nexai'}
                </Button>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
