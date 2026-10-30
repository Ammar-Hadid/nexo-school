import { expect, it } from 'vitest';
import { createPath, finishFixture, nextDay } from './path-model';

it('does not advance vocabulary from correct choice-only responses; asks for different evidence instead of drills', () => {
  let s = createPath('known');
  const task = s.tasks.find((t) => t.subject === 'taal')!;
  s = finishFixture(s, task.id);
  s = nextDay(s);
  expect(
    s.tasks.find((t) => s.days[s.day]!.includes(t.id) && t.subject === 'taal'),
  ).toBeUndefined();
  expect(s.notices.join(' ')).toContain('vereiste bewijs');
  expect(s.routes.taal.index).toBe(0);
  expect(s.routes.taal.next).toBe('confirm');
});

import { categoryAssessment, numericalProbe } from './path-assessment';
import {
  changeSnapshot,
  submit,
  type PathState,
  type Assignment,
} from './path-model';
import { advancePreview } from '../exercise/exercise-preview';

const main = (s: PathState) =>
  s.tasks.find(
    (t) =>
      s.days[s.day]!.includes(t.id) &&
      t.subject === 'rekenen' &&
      ['check', 'confirm', 'practice'].includes(t.purpose),
  );
function solve(
  s: PathState,
  task: Assignment,
  wrong: (q: Assignment['questions'][number]) => boolean,
) {
  let snap = task.snapshot;
  while (snap.state.stage !== 'result') {
    if (snap.state.stage === 'answer') {
      const q = task.questions[snap.state.index]!;
      snap = submit(
        task,
        snap,
        !snap.state.retry && wrong(q) ? '99999' : q.answer,
      );
    } else snap = { ...snap, state: advancePreview(snap.state) };
  }
  return changeSnapshot(s, task.id, snap);
}
it('known numerical skills use eight original observations, skip drills, then stop testing that category until retention', () => {
  let s = createPath('known');
  s = finishFixture(s, main(s)!.id);
  expect(s.routes.rekenen.index).toBe(1);
  expect(categoryAssessment(s, 'getalbegrip').coverage).toEqual({
    demonstrated: 2,
    required: 2,
  });
  expect(
    s.tasks
      .filter((t) => t.category === 'getalbegrip')
      .flatMap((t) => t.snapshot.state.attempts),
  ).toHaveLength(8);
  s = nextDay(s);
  expect(main(s)?.category).toBe('optellen');
});
it.each(['concept', 'application'] as const)(
  'a %s weakness survives correct procedures and retries; only that objective is practised',
  (facet) => {
    let s = createPath('known');
    s = solve(
      s,
      main(s)!,
      (q) => q.objective === 1 && q.assessment?.facet === facet,
    );
    expect(s.routes.rekenen.index).toBe(0);
    expect(s.routes.rekenen.gaps).toEqual([1]);
    expect(categoryAssessment(s, 'getalbegrip').skills[0]!.decision).toBe(
      'ready-provisional',
    );
    s = nextDay(s);
    expect(main(s)?.questions.every((q) => q.objective === 1)).toBe(true);
    s = finishFixture(s, main(s)!.id);
    s = nextDay(s);
    expect(main(s)?.questions).toHaveLength(1);
    expect(main(s)?.questions[0]!.assessment?.facet).toBe(facet);
    s = finishFixture(s, main(s)!.id);
    expect(s.routes.rekenen.index).toBe(1);
  },
);
it('assistance cannot become proof and requests fresh relevant evidence without a drill', () => {
  let s = createPath('known');
  const task = main(s)!;
  task.assistedItems = task.questions.map((q) => q.id);
  s = finishFixture(s, task.id);
  expect(s.routes.rekenen.next).toBe('confirm');
  expect(s.routes.rekenen.index).toBe(0);
  s = nextDay(s);
  expect(
    main(s)?.questions.every(
      (q) => !task.questions.some((old) => old.id === q.id),
    ),
  ).toBe(true);
});
it('a failed prerequisite retention check suspends dependent work without resetting a subject; repair is bounded', () => {
  let s = createPath('known');
  s = finishFixture(s, main(s)!.id);
  s = nextDay(nextDay(s));
  const retention = s.tasks.find((t) => t.purpose === 'retention')!;
  s = finishFixture(s, retention.id, [1]);
  const index = s.routes.rekenen.index;
  s = nextDay(s);
  expect(s.routes.rekenen.index).toBe(index);
  expect(s.retention[0]?.next).toBe('repair');
  expect(categoryAssessment(s, 'optellen').missingPrerequisites).toHaveLength(
    2,
  );
});
it('independently scores conceptual and application numerical probes from their displayed tasks', () => {
  let checked = 0;
  for (let n = 0; n < 36; n++)
    for (const category of ['getalbegrip', 'optellen'] as const)
      for (const objective of [0, 1])
        for (const facet of ['concept', 'application'] as const) {
          const q = numericalProbe(category, objective, facet, n)!;
          const nums = q.prompt.match(/\d+/g)!.map(Number);
          const expected =
            category === 'optellen'
              ? facet === 'concept'
                ? nums[0]! + nums[1]! - nums[2]!
                : nums[0]! + nums[1]!
              : objective === 0
                ? facet === 'concept'
                  ? Math.floor(nums[0]! / 10)
                  : nums[0]! * nums[1]! + nums[2]! * nums[3]! + nums[4]!
                : facet === 'concept'
                  ? nums[0]! - 1
                  : (nums[0]! + nums[1]!) / 2;
          expect(Number(q.answer), q.prompt).toBe(expected);
          checked++;
        }
  expect(checked).toBe(288);
});

it('retention recovery checks the failed facet even when the next date would normally sample another facet', () => {
  let s = createPath('known');
  s = finishFixture(s, main(s)!.id);
  s = nextDay(nextDay(s));
  const retention = s.tasks.find((t) => t.purpose === 'retention')!;
  s = finishFixture(s, retention.id, [1]);
  s = nextDay(s);
  s = nextDay(s); // delayed repair changes the default retention facet
  s = finishFixture(
    s,
    s.tasks.find(
      (t) => s.days[s.day]!.includes(t.id) && t.purpose === 'repair',
    )!.id,
  );
  s = nextDay(s);
  const check = s.tasks.find(
    (t) => s.days[s.day]!.includes(t.id) && t.purpose === 'retention',
  )!;
  expect(
    check.questions.find((q) => q.objective === 1)?.assessment?.facet,
  ).toBe(retention.questions.find((q) => q.objective === 1)?.assessment?.facet);
});

import { setRouteHold } from './path-model';
it('guardian hold/resume changes assignment permission, leaves facts intact and never awards mastery', () => {
  let s = createPath('known');
  s = finishFixture(s, main(s)!.id);
  const facts = JSON.stringify(s.tasks);
  s = setRouteHold(s, 'rekenen', true, 'Extra uitleg bespreken');
  expect(JSON.stringify(s.tasks)).toBe(facts);
  s = nextDay(s);
  expect(main(s)).toBeUndefined();
  expect(
    s.days[s.day]!.some(
      (id) => s.tasks.find((t) => t.id === id)?.purpose === 'daily',
    ),
  ).toBe(true);
  s = setRouteHold(s, 'rekenen', false, 'Verder met aanvullende check');
  s = nextDay(s);
  expect(main(s)?.category).toBe('optellen');
  expect(s.routes.rekenen.index).toBe(1);
  expect(s.overrides).toHaveLength(2);
});
it('addition concept probes do not expose one constant answer per objective', () => {
  for (const objective of [0, 1]) {
    const probes = Array.from({ length: 36 }, (_, n) =>
      numericalProbe('optellen', objective, 'concept', n)!,
    );
    expect(new Set(probes.map((q) => q.answer)).size).toBeGreaterThan(4);
    for (const q of probes) {
      const [a, b] = q.prompt.match(/\d+/g)!.map(Number);
      expect((a! % 10) + (b! % 10) >= 10).toBe(objective === 1);
    }
  }
});
it('follow-up probes vary contexts across facets instead of repeating one value throughout the check', () => {
  const check = main(createPath('known'))!;
  const firstValues = check.questions.map((q) =>
    Number(q.prompt.match(/\d+/)![0]),
  );
  expect(new Set(firstValues).size).toBe(4);
});
it('unreviewed delayed checks cannot silently refresh retention eligibility', () => {
  let s = createPath('known');
  s = finishFixture(s, main(s)!.id);
  s = nextDay(nextDay(s));
  const task = s.tasks.find((t) => t.purpose === 'retention')!;
  task.questions = task.questions.map((q) => ({
    ...q,
    assessment: q.assessment
      ? { ...q.assessment, review: 'missing' }
      : undefined,
  }));
  s = finishFixture(s, task.id);
  expect(s.retention[0]!.due).toBe(s.day + 1);
});
it('missing recovery evidence does not count the earlier mistake again or escalate to instruction', () => {
  let s = createPath('forgotten');
  const repair = s.tasks.find(
    (t) => s.days[s.day]!.includes(t.id) && t.purpose === 'repair',
  )!;
  s = finishFixture(s, repair.id);
  s = nextDay(s);
  const recovery = s.tasks.find(
    (t) => s.days[s.day]!.includes(t.id) && t.purpose === 'retention',
  )!;
  recovery.assistedItems = recovery.questions.map((q) => q.id);
  s = finishFixture(s, recovery.id);
  expect(s.retention[0]!.failures).toBe(1);
  expect(s.retention[0]!.next).toBe('retention');
});
it('assisted confirmation after practice asks again instead of recounting a historical error', () => {
  let s = createPath('gap');
  s = finishFixture(s, main(s)!.id);
  s = nextDay(s);
  const task = main(s)!;
  task.assistedItems = task.questions.map((q) => q.id);
  s = finishFixture(s, task.id);
  expect(s.routes.rekenen.next).toBe('confirm');
  expect(s.routes.rekenen.failedChecks).toBe(0);
});
it('exhausted conceptual/application pools block the route without recycling questions or inventing success', () => {
  let s = createPath('assisted');
  const task = main(s)!;
  task.assistedItems = task.questions.map((q) => q.id);
  s = finishFixture(s, task.id);
  s.tasks[0]!.questions = [
    ...s.tasks[0]!.questions,
    ...Array.from({ length: 36 }, (_, n) =>
      [0, 1].flatMap((objective) =>
        (['concept', 'application'] as const).map((f) =>
          numericalProbe('getalbegrip', objective, f, n)!,
        ),
      ),
    ).flat(),
  ];
  s = nextDay(s);
  expect(main(s)).toBeUndefined();
  expect(s.routes.rekenen.index).toBe(0);
  expect(s.notices.join(' ')).toContain('vereiste bewijs');
});
it('a later correct variant in the same vocabulary check cannot erase an earlier first-attempt weakness', () => {
  let s = createPath('known');
  const task = s.tasks.find((t) => t.subject === 'taal')!;
  let original = 0;
  s = solve(s, task, () => original++ === 0);
  expect(s.routes.taal.next).toBe('practice');
  expect(s.routes.taal.gaps).toEqual([0]);
});
