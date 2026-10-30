import { describe, expect, it } from 'vitest';
import { advancePreview } from '../exercise/exercise-preview';
import { dailyQuestions, makeQuestions, type Question } from './path-content';
import {
  changeSnapshot,
  createPath,
  finishFixture,
  nextDay,
  submit,
  type Assignment,
  type PathState,
} from './path-model';

const main = (s: PathState, subject = 'taal') =>
  s.tasks.find(
    (t) =>
      s.days[s.day]!.includes(t.id) &&
      t.subject === subject &&
      ['check', 'confirm', 'practice'].includes(t.purpose),
  );
function answerTask(
  s: PathState,
  task: Assignment,
  solver: (q: Question, retry: boolean) => string,
) {
  let snapshot = task.snapshot;
  while (snapshot.state.stage !== 'result') {
    if (snapshot.state.stage === 'answer')
      snapshot = submit(
        task,
        snapshot,
        solver(task.questions[snapshot.state.index]!, snapshot.state.retry),
      );
    else
      snapshot = {
        state: advancePreview(snapshot.state),
        answer: '',
        error: '',
      };
  }
  return changeSnapshot(s, task.id, snapshot);
}
const oldShortcut = (q: Question) =>
  q.prompt.split(': ').at(-1)!.replace(/\?$/, '').split(' of ')[
    q.prompt.startsWith('Kies') ? 1 : 0
  ]!;

describe('evaluation audit regressions (synthetic policy, not educational calibration)', () => {
  it('accepts leading zeros in numeric answers but retains raw submissions and rejects malformed forms', () => {
    const state = createPath('known');
    const task = state.tasks.find((t) => t.purpose === 'daily')!;
    expect(task.questions[0]!.answer).toBe('29');
    for (const answer of ['29', '029', '000029', ' 029 ']) {
      const result = submit(task, task.snapshot, answer).state.attempts[0]!;
      expect(result.correct).toBe(true);
      expect(result.answer).toBe(answer.trim());
    }
    for (const answer of [
      '',
      ' ',
      '29x',
      '2.9e1',
      '0x1d',
      '29.0',
      '-29',
      '0000029',
    ])
      expect(
        submit(task, task.snapshot, answer).state.attempts[0]!.correct,
      ).toBe(false);
  });
  it('the audited position-only vocabulary solver no longer bypasses the initial check', () => {
    let s = createPath('known');
    const task = main(s)!;
    s = answerTask(s, task, oldShortcut);
    expect(s.routes.taal.index).toBe(0);
    expect(s.routes.taal.next).toBe('practice');
  });
  it('both answer positions occur within each vocabulary wording, independent of that wording', () => {
    const positions = new Map<string, Set<number>>();
    for (let serial = 0; serial < 72; serial++) {
      for (const q of makeQuestions('woordenschat', 'check', serial)) {
        const options = q.prompt
          .split(': ')
          .at(-1)!
          .replace(/\?$/, '')
          .split(' of ');
        const key = q.prompt.split(' ‘')[0]!;
        const seen = positions.get(key) ?? new Set<number>();
        seen.add(options.indexOf(q.answer));
        positions.set(key, seen);
      }
    }
    expect(positions.size).toBe(4);
    for (const positionsForWording of positions.values())
      expect(positionsForWording).toEqual(new Set([0, 1]));
  });
  for (const gap of [[0], [1], [0, 1]]) {
    it(`vocabulary gaps ${gap} can practise without consuming checks, but cannot bypass missing transfer content`, () => {
      let s = createPath('known');
      s = finishFixture(s, main(s)!.id, gap);
      s = nextDay(s);
      const practice = main(s)!;
      expect(practice.purpose).toBe('practice');
      expect(practice.questions).toHaveLength(10);
      expect(new Set(practice.questions.map((q) => q.id)).size).toBe(10);
      s = finishFixture(s, practice.id);
      s = nextDay(s);
      expect(main(s)).toBeUndefined();
      expect(s.routes.taal.index).toBe(0);
      expect(s.notices.join(' ')).toContain('vereiste bewijs');
      // Remaining procedural inventory still exists: this is missing diversity,
      // not the old practice/confirmation pool starvation defect.
      expect(makeQuestions('woordenschat', 'check', 99)).toHaveLength(4);
    });
  }
  it('independently recomputes 2,656 numerical cases from displayed prompts and checks carry explanations', () => {
    let checked = 0;
    for (let serial = 0; serial < 72; serial++) {
      for (const category of ['getalbegrip', 'optellen'] as const) {
        for (const purpose of ['check', 'practice'] as const) {
          for (const q of makeQuestions(category, purpose, serial)) {
            const numbers = q.prompt.match(/\d+/g)!.map(Number);
            let expected: number;
            if (category === 'optellen') {
              expected = numbers[0]! + numbers[1]!;
              const [a, b] = q.prompt.startsWith('Tel')
                ? [numbers[1]!, numbers[0]!]
                : [numbers[0]!, numbers[1]!];
              expect((a % 10) + (b % 10) >= 10).toBe(q.objective === 1);
              if (q.objective === 1) {
                const [intermediate, added] =
                  q.steps[0]!.match(/\d+/g)!.map(Number);
                const [remaining, result] =
                  q.steps[1]!.match(/\d+/g)!.map(Number);
                expect(a + added!).toBe(intermediate);
                expect(intermediate! + remaining!).toBe(expected);
                expect(result).toBe(expected);
              }
            } else if (q.objective === 0)
              expected = Math.trunc(numbers.at(-1)! / 10) % 10;
            else
              expected = q.prompt.includes('grootst')
                ? Math.max(...numbers)
                : Math.min(...numbers);
            expect(Number(q.answer)).toBe(expected);
            expect(expected).toBeLessThan(1000);
            checked++;
          }
        }
      }
    }
    for (let serial = 0; serial < 32; serial++)
      for (const addition of [false, true]) {
        for (const q of dailyQuestions(serial, addition)) {
          const numbers = q.prompt.match(/\d+/g)!.map(Number);
          expect(Number(q.answer)).toBe(
            addition ? numbers[0]! + numbers[1]! : Math.max(...numbers),
          );
          checked++;
        }
      }
    expect(checked).toBe(2656);
  });
  it('reserves disjoint semantic pools across categories and keeps assigned ordering stable', () => {
    for (const category of [
      'getalbegrip',
      'optellen',
      'woordenschat',
      'woordsoorten',
    ] as const) {
      const checks = new Set<string>();
      for (let serial = 0; serial < 72; serial++)
        for (const q of makeQuestions(
          category,
          'check',
          serial,
          [0, 1],
          checks,
        ))
          checks.add(q.id);
      const practice = Array.from({ length: 72 }, (_, serial) =>
        makeQuestions(category, 'practice', serial),
      ).flat();
      expect(practice.some((q) => checks.has(q.id))).toBe(false);
    }
    const s = createPath('known');
    const task = main(s)!;
    const before = JSON.stringify(task.questions);
    let changed = answerTask(s, task, oldShortcut);
    changed = nextDay(changed);
    expect(
      JSON.stringify(changed.tasks.find((t) => t.id === task.id)!.questions),
    ).toBe(before);
  });
  it('exhausted assessment content stays unavailable rather than being recycled as unseen', () => {
    const seen = new Set<string>();
    for (let serial = 0; serial < 12; serial++)
      for (const q of makeQuestions(
        'woordenschat',
        'check',
        serial,
        [0, 1],
        seen,
      ))
        seen.add(q.id);
    expect(seen.size).toBe(24);
    expect(makeQuestions('woordenschat', 'confirm', 99, [0, 1], seen)).toEqual(
      [],
    );
    expect(
      makeQuestions('woordenschat', 'practice', 99, [0], seen),
    ).toHaveLength(10);
  });
  it('addition samples vary both operands and their unit digits', () => {
    const operands = Array.from({ length: 72 }, (_, serial) =>
      makeQuestions('optellen', 'check', serial),
    )
      .flat()
      .map((q) => {
        const numbers = q.prompt.match(/\d+/g)!.map(Number);
        return q.prompt.startsWith('Tel')
          ? [numbers[1]!, numbers[0]!]
          : [numbers[0]!, numbers[1]!];
      });
    expect(new Set(operands.map((pair) => pair[1])).size).toBeGreaterThan(2);
    expect(new Set(operands.map((pair) => pair[0]! % 10)).size).toBeGreaterThan(
      2,
    );
  });
});
