'use client';
import { useState } from 'react';
import { Button } from '../button/button';
import { TextField } from './text-field';
import styles from './text-field-review.module.css';
export function TextFieldReview() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  return (
    <main className={styles.review}>
      <p>nexo School · invoervelden · goedgekeurd</p>
      <h1>Een fijne plek voor je antwoord.</h1>
      <p className={styles.intro}>
        Eén rustige rand, duidelijke focus en een potloodje voor Adam. Een fout
        krijgt een korte uitleg, geen groot rood blok.
      </p>
      <nav className={styles.links} aria-label="Volgende reviews">
        <a href="/iframe.html?id=components-nexai--review-page&viewMode=story">
          Hierna: Nexai in beweging →
        </a>
        <a href="/iframe.html?id=practice-rekenen--review-page&viewMode=story">
          Bekijk de vernieuwde rekentaak
        </a>
      </nav>
      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>Leeg · hover · focus</h2>
          <TextField
            label="Naam van je oefenblok"
            hint="Klik of gebruik Tab om de focus te bekijken."
          />
        </section>
        <section className={styles.card}>
          <h2>Ingevuld</h2>
          <TextField label="Naam van je oefenblok" defaultValue="Na school" />
        </section>
        <section className={styles.card}>
          <h2>Hulp bij een fout</h2>
          <TextField
            label="E-mailadres"
            type="email"
            defaultValue="ammar"
            error="Vul een volledig e-mailadres in."
          />
        </section>
        <section className={styles.card}>
          <h2>Bevestigd</h2>
          <TextField
            label="Naam van je oefenblok"
            defaultValue="Na school"
            success="Deze naam kun je gebruiken."
          />
        </section>
        <section className={styles.card}>
          <h2>Alleen lezen</h2>
          <TextField
            label="Leerling"
            value="Testleerling"
            readOnly
            hint="Je kunt deze tekst selecteren en kopiëren."
          />
        </section>
        <section className={styles.card}>
          <h2>Niet beschikbaar</h2>
          <TextField
            label="Extra oefenblok"
            disabled
            value="Later beschikbaar"
          />
        </section>
        <section className={styles.card}>
          <h2>Bezig</h2>
          <TextField label="Naam controleren" value="Na school" pending />
        </section>
        <section className={styles.card}>
          <h2>Voor Adam</h2>
          <TextField
            label="Jouw antwoord"
            appearance="answer"
            inputMode="numeric"
            defaultValue="42"
          />
        </section>
      </div>
      <section className={styles.example}>
        <h2>Probeer de invoer zelf</h2>
        <p>24 + 18 = ?</p>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            setError(
              /^\d+$/.test(value.trim()) ? '' : 'Typ eerst een getal in.',
            );
          }}
        >
          <TextField
            label="Jouw antwoord"
            appearance="answer"
            inputMode="numeric"
            value={value}
            error={error}
            onChange={(event) => {
              setValue(event.target.value);
              setError('');
            }}
          />
          <Button type="submit">Controleer invoer</Button>
        </form>
      </section>
    </main>
  );
}
