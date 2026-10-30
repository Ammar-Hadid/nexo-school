import { describe, expect, it } from 'vitest';
import { advancePreview } from '../exercise/exercise-preview';
import { categories, dailyQuestions, routes } from './path-content';
import {
  changeSnapshot,
  createPath,
  dayLabel,
  evidence,
  finishFixture,
  issueDay,
  nextDay,
  submit,
  type PathState,
} from './path-model';
const main = (s: PathState, subject = 'rekenen') =>
  s.tasks.find(
    (t) =>
      s.days[s.day]!.includes(t.id) &&
      t.subject === subject &&
      ['check', 'confirm', 'practice'].includes(t.purpose),
  )!;

describe('synthetic automatic route', () => {
  it('daily contexts use eligible operations and keep the approved unit-labelled passage input', () => {
    const comparison = dailyQuestions(0, false);
    const addition = dailyQuestions(0, true);
    expect(comparison[0]!.answer).toBe('19');
    expect(addition[0]!.answer).toBe('17');
    expect(comparison).toHaveLength(10);
    expect(addition).toHaveLength(10);
    for (const question of [...comparison, ...addition]) {
      expect(question.answerUnit).toBe('potten');
      expect(question.prompt.endsWith('?')).toBe(true);
      expect(question.prompt.split(/\s+/).length).toBeGreaterThanOrEqual(43);
    }
  });
  it('known entry skips drills, confirms with fresh coverage and advances only its own subject', () => {
    let s = createPath('known');
    const check = main(s);
    expect(check.purpose).toBe('confirm');
    expect(
      check.questions.every(
        (q) => !s.tasks[0]!.questions.some((old) => old.id === q.id),
      ),
    ).toBe(true);
    s = finishFixture(s, check.id);
    expect(s.routes.rekenen.index).toBe(1);
    expect(s.routes.taal.index).toBe(0);
    expect(
      s.tasks.filter((t) => t.category === 'getalbegrip').map((t) => t.purpose),
    ).toEqual(['check', 'confirm']);
    expect(issueDay(s)).toBe(s);
    expect(
      changeSnapshot(
        s,
        check.id,
        s.tasks.find((t) => t.id === check.id)!.snapshot,
      ),
    ).toBe(s);
    s = nextDay(s);
    expect(main(s).category).toBe('optellen');
    expect(main(s).purpose).toBe('check');
  });
  it('a second-attempt success cannot hide an objective gap; practice targets only that gap', () => {
    let s = createPath('gap');
    const entry = s.tasks[0]!;
    expect(entry.snapshot.state.outcomes).toEqual([
      'first',
      'second',
      'first',
      'second',
    ]);
    expect(evidence(s, entry).map((o) => o.demonstrated)).toEqual([
      false,
      false,
    ]);
    const task = main(s);
    expect(task.questions).toHaveLength(10);
    expect(new Set(task.questions.map((q) => q.objective))).toEqual(
      new Set([1]),
    );
    s = finishFixture(s, task.id);
    expect(s.routes.rekenen.index).toBe(0);
    s = nextDay(s);
    expect(main(s).purpose).toBe('confirm');
    expect(new Set(main(s).questions.map((q) => q.objective))).toEqual(
      new Set([0, 1]),
    );
  });
  it('partial evidence remains unknown and exact draft/error/retry state carries through dates', () => {
    let s = createPath('unknown');
    const task = main(s);
    expect(evidence(s, task).every((e) => !e.demonstrated)).toBe(true);
    const snapshot = {
      ...submit(task, task.snapshot, '0'),
      answer: '0',
      error: 'fictief',
    };
    s = changeSnapshot(s, task.id, snapshot);
    const carried = nextDay(s);
    expect(main(carried).id).toBe(task.id);
    expect(main(carried).snapshot).toBe(snapshot);
    expect(main(carried).questions).toBe(task.questions);
    expect(main(carried).snapshot.state.queue).toEqual([1]);
    expect(carried.routes.rekenen.index).toBe(0);
  });
  it('issues once per day with daily Redactiesommen through weekends and at most four slots', () => {
    let s = createPath('known');
    const dates: string[] = [];
    for (let day = 0; day < 7; day += 1) {
      dates.push(dayLabel(s.day));
      const ids = s.days[s.day]!;
      expect(ids.length).toBeLessThanOrEqual(4);
      expect(new Set(ids).size).toBe(ids.length);
      expect(
        ids
          .map((id) => s.tasks.find((t) => t.id === id)!)
          .filter((t) => t.category === 'redactiesommen'),
      ).toHaveLength(1);
      expect(issueDay(s)).toBe(s);
      for (const id of ids) s = finishFixture(s, id);
      s = nextDay(s);
    }
    expect(dates.some((d) => d.startsWith('zaterdag'))).toBe(true);
    expect(dates.some((d) => d.startsWith('zondag'))).toBe(true);
    expect(nextDay(s)).toBe(s);
    for (const subject of ['rekenen', 'taal'] as const) {
      expect(
        s.tasks
          .filter((t) => t.subject === subject && t.purpose === 'check')
          .map((t) => t.category),
      ).toEqual(subject === 'rekenen' ? routes.rekenen : ['woordenschat']);
    }
  });
  it('retention failure gives bounded repair without resetting main progress', () => {
    let s = createPath('known');
    s = finishFixture(s, main(s).id);
    s = nextDay(nextDay(s));
    const task = s.tasks.find(
      (t) => s.days[s.day]!.includes(t.id) && t.purpose === 'retention',
    )!;
    expect(task.category).toBe('getalbegrip');
    expect(task.questions).toHaveLength(2);
    s = finishFixture(s, task.id, [1]);
    expect(s.routes.rekenen.index).toBe(1);
    expect(s.retention[0]!.next).toBe('repair');
    s = nextDay(s);
    const repair = s.tasks.find(
      (t) => s.days[s.day]!.includes(t.id) && t.purpose === 'repair',
    )!;
    expect(repair.questions.every((q) => q.objective === 1)).toBe(true);
    s = finishFixture(s, repair.id);
    expect(s.retention[0]!.next).toBe('retention');
    expect(s.routes.rekenen.index).toBe(1);
  });
  it('stops repeated unsuccessful confirmation instead of endless drills or category hopping', () => {
    let s = createPath('gap');
    for (let i = 0; i < 4; i += 1) {
      s = finishFixture(s, main(s).id, [1]);
      s = nextDay(s);
    }
    expect(s.routes.rekenen).toMatchObject({
      index: 0,
      next: 'support',
      failedChecks: 2,
    });
    expect(main(s)).toBeUndefined();
    expect(main(s, 'taal')).toBeDefined();
  });
  it('same semantic item or repeated family cannot become two independent demonstrations', () => {
    const s = createPath('known');
    const task = main(s);
    const changed = {
      ...task,
      questions: task.questions.map((q, i) =>
        i === 1
          ? {
              ...q,
              id: task.questions[0]!.id,
              family: task.questions[0]!.family,
            }
          : q,
      ),
    };
    let altered = {
      ...s,
      tasks: s.tasks.map((t) => (t.id === task.id ? changed : t)),
    };
    altered = finishFixture(altered, task.id);
    expect(altered.routes.rekenen.index).toBe(0);
    expect(altered.routes.rekenen.gaps).toContain(0);
  });
  it('retains identical original items and deferred retry order through completion', () => {
    const s = createPath('known');
    const task = main(s);
    let snap = task.snapshot;
    for (let i = 0; i < 4; i += 1) {
      snap = submit(
        task,
        snap,
        i === 0 || i === 3 ? '99999' : task.questions[i]!.answer,
      );
      snap = { ...snap, state: advancePreview(snap.state) };
    }
    expect(snap.state.queue).toEqual([0, 3]);
    expect(snap.state.index).toBe(0);
    snap = submit(task, snap, task.questions[0]!.answer);
    snap = { ...snap, state: advancePreview(snap.state) };
    expect(snap.state.index).toBe(3);
    snap = submit(task, snap, '0');
    expect(snap.state.outcomes[3]).toBe('missed');
    expect(task.questions[3]!.steps.length).toBeGreaterThan(0);
    expect(categories.getalbegrip.objectives).toHaveLength(2);
  });
});
