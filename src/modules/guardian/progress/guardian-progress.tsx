'use client';
import { useState } from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  CheckCheck,
  ListChecks,
} from 'lucide-react';
import { Button } from '@/components/button/button';
import {
  GuardianEmpty,
  GuardianPanel,
  GuardianStatus,
  GuardianTextLink,
} from '@/components/guardian-ui/guardian-ui';
import {
  guardianSubjects,
  SubjectIcon,
  SubjectLabel,
  type GuardianSubject,
} from '@/components/guardian-ui/subject-icon';
import { ProgressChart } from '@/components/guardian-ui/progress-chart';
import type { GuardianResultTask } from '@/modules/practice/guardian-results/guardian-result-contract';
import { scoreOutOfTen } from '@/modules/practice/exercise/score-display';
import { guardianTaskTitle, subjectForTitle } from '../subject-presentation';
import styles from '../guardian-workspace.module.css';

export function GuardianProgress({
  tasks,
  onOpenTask,
  onResults,
}: {
  tasks: readonly GuardianResultTask[];
  onOpenTask: (id: string) => void;
  onResults: () => void;
}) {
  const [subject, setSubject] = useState<GuardianSubject | 'all'>('all');
  const completed = tasks.filter(
    (t) => t.result.complete && !t.corrections?.length,
  );
  const filtered = completed.filter(
    (t) => subject === 'all' || subjectForTitle(t.title) === subject,
  );
  const total = filtered.reduce((sum, t) => sum + t.result.total, 0);
  const first = filtered.reduce((sum, t) => sum + t.result.first, 0);
  const percentage = total ? Math.round((first / total) * 100) : null;
  return (
    <div className={styles.stack}>
      <div className={styles.metrics}>
        <div className={styles.metric}>
          <BookOpenCheck size={28} strokeWidth={1.5} aria-hidden="true" />
          <dl>
            <dt>Gemaakte vragen</dt>
            <dd>
              {total}
              <small> in afgeronde sessies</small>
            </dd>
          </dl>
        </div>
        <div className={styles.metric}>
          <CheckCheck size={28} strokeWidth={1.5} aria-hidden="true" />
          <dl>
            <dt>In één keer goed</dt>
            <dd>
              {percentage === null ? '—' : `${percentage}%`}
              <small>
                {' '}
                {first} van {total} vragen
              </small>
            </dd>
          </dl>
        </div>
        <div className={styles.metric}>
          <ListChecks size={28} strokeWidth={1.5} aria-hidden="true" />
          <dl>
            <dt>Afgeronde sessies</dt>
            <dd>
              {filtered.length}
              <small> in deze selectie</small>
            </dd>
          </dl>
        </div>
      </div>
      <div className={styles.grid}>
        <GuardianPanel
          title="Resultaten per sessie"
          action={
            <label className={styles.filters}>
              <span className={styles.muted}>Vak</span>
              <select
                className={styles.select}
                aria-label="Vak voor grafiek"
                value={subject}
                onChange={(e) =>
                  setSubject(e.target.value as GuardianSubject | 'all')
                }
              >
                <option value="all">Alle vakken</option>
                {Object.entries(guardianSubjects).map(([id, s]) => (
                  <option key={id} value={id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          }
        >
          <ProgressChart
            points={filtered.map((t, i) => ({
              label: `Sessie ${i + 1}`,
              correct: t.result.first,
              total: t.result.total,
            }))}
            caption="In één keer goed, per afgeronde sessie in deze selectie. Dit vergelijkt antwoorden; het is geen uitspraak over beheersing of groei over tijd."
          />
        </GuardianPanel>
        <GuardianPanel
          title="Per vak"
          action={
            <GuardianTextLink onClick={onResults}>Details</GuardianTextLink>
          }
        >
          <ul className={styles.subjectRows}>
            {(Object.keys(guardianSubjects) as GuardianSubject[]).map((id) => {
              const rows = completed.filter(
                (t) => subjectForTitle(t.title) === id,
              );
              const count = rows.reduce((n, t) => n + t.result.total, 0);
              const right = rows.reduce((n, t) => n + t.result.first, 0);
              return (
                <li key={id}>
                  <header>
                    <SubjectLabel subject={id} />
                    <span>
                      {count
                        ? `${Math.round((right / count) * 100)}%`
                        : 'Nog geen resultaat'}
                    </span>
                  </header>
                  {count > 0 && (
                    <progress
                      value={right}
                      max={count}
                      aria-label={`${guardianSubjects[id].label}: ${right} van ${count} in één keer goed`}
                    />
                  )}
                  <p>
                    {count
                      ? `${rows.length} ${rows.length === 1 ? 'sessie' : 'sessies'} · ${right} van ${count} in één keer goed`
                      : 'Na een afgeronde sessie zie je hier een resultaat.'}
                  </p>
                </li>
              );
            })}
          </ul>
        </GuardianPanel>
      </div>
      <GuardianPanel
        title="De sessies achter de cijfers"
        action={
          <GuardianTextLink onClick={onResults}>
            Alle resultaten
          </GuardianTextLink>
        }
      >
        {filtered.length ? (
          <ul className={styles.taskRows}>
            {filtered.map((task, i) => (
              <li key={task.id}>
                <SubjectIcon subject={subjectForTitle(task.title)} />
                <div>
                  <h3>{guardianTaskTitle(task.title)}</h3>
                  <p>
                    Sessie {i + 1} in de grafiek · {task.result.total} vragen
                  </p>
                </div>
                <span className={styles.taskScore}>
                  {scoreOutOfTen(task.result.score, task.result.total)} / 10
                </span>
                <GuardianStatus tone="positive">Afgerond</GuardianStatus>
                <Button
                  variant="ghost"
                  size="small"
                  aria-label={`Bekijk sessie: ${guardianTaskTitle(task.title)}`}
                  onClick={() => onOpenTask(task.id)}
                >
                  Bekijk sessie
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <GuardianEmpty
            title="Nog geen afgeronde sessies voor deze selectie"
            action={
              <GuardianTextLink onClick={onResults}>
                Bekijk het lopende werk
              </GuardianTextLink>
            }
          >
            <p>
              Lopende en ingetrokken sessies gebruiken we niet voor deze
              cijfers.
            </p>
          </GuardianEmpty>
        )}
      </GuardianPanel>
      <p className={styles.muted}>
        Redactiesommen hoort bij Rekenen. Eerste en tweede pogingen blijven
        apart zichtbaar in de resultaten. Een cijfer vertelt hoe deze sessie
        ging.
      </p>
    </div>
  );
}
