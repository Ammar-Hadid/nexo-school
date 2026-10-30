'use client';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { GuardianEmpty } from './guardian-ui';
import styles from './progress-chart.module.css';

export type GuardianChartPoint = {
  label: string;
  correct: number;
  total: number;
};
export function ProgressChart({
  points,
  caption,
}: {
  points: readonly GuardianChartPoint[];
  caption: string;
}) {
  const data = points
    .filter((p) => p.total > 0)
    .map((p) => ({
      ...p,
      percentage: Math.round((p.correct / p.total) * 100),
    }));
  if (!data.length)
    return (
      <GuardianEmpty title="Nog geen gegevens voor een grafiek">
        <p>Na afgeronde sessies kun je de resultaten hier vergelijken.</p>
      </GuardianEmpty>
    );
  return (
    <figure className={styles.figure}>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height={250} minWidth={0}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 18, bottom: 8, left: 0 }}
            accessibilityLayer
            title="Goed in de eerste poging, per meetpunt"
          >
            <CartesianGrid
              stroke="var(--guardian-line)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: 'var(--guardian-line)' }}
              tick={{ fill: 'var(--guardian-muted)', fontSize: 12 }}
              minTickGap={20}
              dy={8}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              width={42}
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--guardian-muted)', fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className={styles.tooltip}>
                    <strong>{label}</strong>
                    <span>
                      {payload[0]?.payload.correct} van{' '}
                      {payload[0]?.payload.total} in één keer goed
                    </span>
                    <b>{payload[0]?.value}%</b>
                  </div>
                ) : null
              }
            />
            <Line
              type="linear"
              dataKey="percentage"
              name="In één keer goed"
              stroke="var(--guardian-primary)"
              strokeWidth={2.5}
              dot={{
                r: 4,
                fill: 'var(--guardian-primary)',
                stroke: 'var(--guardian-surface)',
                strokeWidth: 2,
              }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <figcaption>{caption}</figcaption>
      <details className={styles.data}>
        <summary>Bekijk de gegevens als tabel</summary>
        <table>
          <caption>Antwoorden in de eerste poging</caption>
          <thead>
            <tr>
              <th scope="col">Meetpunt</th>
              <th scope="col">Goed / vragen</th>
              <th scope="col">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.label}>
                <th scope="row">{p.label}</th>
                <td>
                  {p.correct} / {p.total}
                </td>
                <td>{p.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
