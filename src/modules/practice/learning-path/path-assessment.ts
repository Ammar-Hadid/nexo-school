import {
  assessCategory,
  type Blueprint,
  type Evidence,
  type Facet,
} from '../assessment/assessment-policy';
import {
  CURRICULUM,
  skillId,
  categories,
  type Category,
  type Question,
} from './path-content';
import type { PathState } from './path-model';

export function blueprint(category: Category): Blueprint {
  return {
    version: CURRICULUM,
    subject: ['getalbegrip', 'optellen'].includes(category)
      ? 'rekenen'
      : 'taal',
    category,
    level: categories[category].level,
    objectives: categories[category].objectives.map((_, i) => ({
      skill: skillId(category, i),
      facets: ['procedure', 'concept', 'application'],
    })),
    prerequisites:
      category === 'optellen'
        ? [skillId('getalbegrip', 0), skillId('getalbegrip', 1)]
        : [],
  };
}
/** Projection of committed snapshots, not another mutable attempt store. */
export function pathEvidence(state: PathState): Evidence[] {
  const exposed = new Set<string>();
  return state.tasks.flatMap((task) =>
    task.snapshot.state.attempts.flatMap((a, i) => {
      const q = task.questions[a.index];
      if (!q) return [];
      const novel = !exposed.has(q.id);
      exposed.add(q.id);
      if (!q.assessment) return [];
      return [
        {
          ...q.assessment,
          family: q.family,
          id: `${task.id}:${i}`,
          item: q.id,
          day: task.attemptDays?.[i] ?? task.completedDay ?? state.day,
          session: task.id,
          correct: a.correct,
          firstAttempt: !a.retry,
          assisted: task.assistedItems?.includes(q.id) ?? false,
          novel,
          complete: task.snapshot.state.stage === 'result',
          purpose: task.purpose,
        },
      ];
    }),
  );
}
export function categoryAssessment(state: PathState, category: Category) {
  const facts = pathEvidence(state);
  const prerequisites = new Set<string>();
  if (category === 'optellen') {
    const earlier = assessCategory(blueprint('getalbegrip'), facts, state.day);
    for (const s of earlier.skills)
      if (s.decision === 'ready-provisional') prerequisites.add(s.skill);
    if (
      state.retention.some((r) => r.category === 'getalbegrip' && r.gaps.length)
    )
      prerequisites.clear();
  }
  return assessCategory(blueprint(category), facts, state.day, prerequisites);
}
export function checkRequests(
  state: PathState,
  category: Category,
): { objective: number; facet: Facet }[] {
  return categoryAssessment(state, category)
    .skills.flatMap((s, objective) => {
      if (s.decision === 'ready-provisional') return [];
      const facets = [...new Set([...s.conflicts, ...s.missing])];
      return (
        facets.length ? facets : (['concept', 'application'] as const)
      ).map((facet) => ({ objective, facet }));
    })
    .slice(0, 4);
}
/** Numerically varied fixtures share a stable family. New numbers never create a new family. */
export function numericalProbe(
  category: Category,
  objective: number,
  facet: Facet,
  serial: number,
): Question | undefined {
  if (
    facet === 'procedure' ||
    (category !== 'getalbegrip' && category !== 'optellen')
  )
    return undefined;
  const n = serial % 36;
  const a = 123 + n * 10;
  let prompt: string;
  let answer: number;
  let explanation: string;
  if (category === 'getalbegrip' && objective === 0) {
    if (facet === 'concept') {
      prompt = `${a} eenheden worden verdeeld in volle tientallen en losse eenheden. Hoeveel volle tientallen zijn dat?`;
      answer = Math.floor(a / 10);
      explanation = `${answer} tientallen vormen ${answer * 10}; er blijven 3 eenheden over.`;
    } else {
      prompt = `Er zijn ${Math.floor(a / 100)} dozen met elk 100 kralen, ${Math.floor(a / 10) % 10} zakjes met elk 10 kralen en 3 losse kralen. Hoeveel kralen zijn er samen?`;
      answer = a;
      explanation = `Tel de honderdtallen, tientallen en eenheden samen: ${a}.`;
    }
  } else if (category === 'getalbegrip') {
    if (facet === 'concept') {
      prompt = `Op een getallenlijn staat ${a}. Welk getal staat precies één plaats daarvoor?`;
      answer = a - 1;
      explanation = `Eén plaats terug is één minder: ${a - 1}.`;
    } else {
      prompt = `Drie rugnummers volgen direct op elkaar. Het eerste is ${a} en het laatste is ${a + 2}. Welk rugnummer hoort ertussen?`;
      answer = a + 1;
      explanation = `De volgorde is ${a}, ${a + 1}, ${a + 2}.`;
    }
  } else {
    const units = objective === 0 ? n % 9 : 2 + (n % 7);
    const a = 100 + n * 10 + units;
    const b =
      10 * ((n * 3) % 5) +
      (objective === 0 ? 1 + (n % (9 - units)) : 10 - units + (n % units));
    if (facet === 'concept') {
      prompt = `${a} + ${b} kun je splitsen in ${a - units} + een aantal eenheden. Hoeveel eenheden tel je bij ${a - units} op?`;
      answer = units + b;
      explanation = `De ${a - units} blijft staan. Tel de eenheden samen: ${units} + ${b} = ${answer}.`;
    } else {
      prompt = `Een bibliotheek heeft ${a} boeken. Er komen ${b} boeken bij. Hoeveel boeken zijn er daarna?`;
      answer = a + b;
      explanation = `Er komen boeken bij: ${a} + ${b} = ${answer}.`;
    }
  }
  const family = `${category}:${objective}:${facet}`;
  return {
    id: `${family}:${n}`,
    objective,
    family,
    prompt,
    answer: String(answer),
    steps: [explanation],
    assessment: {
      contentVersion: 'numeric-probes-v1',
      evaluatorVersion: 'whole-number-v2',
      curriculumVersion: CURRICULUM,
      subject: 'rekenen',
      category,
      skill: skillId(category, objective),
      level: categories[category].level,
      facet,
      representation: facet === 'concept' ? 'decomposition' : 'context',
      response: 'constructed',
      role: 'assessed',
      review: 'synthetic',
    },
  };
}
export function confirmationQuestions(
  state: PathState,
  category: Category,
  procedural: (objective: number) => Question | undefined,
): Question[] {
  const seen = new Set(
    state.tasks.flatMap((t) => t.questions.map((q) => q.id)),
  );
  const result: Question[] = [];
  for (const request of checkRequests(state, category)) {
    let q: Question | undefined;
    if (request.facet === 'procedure') q = procedural(request.objective);
    else
      for (let n = 0; n < 36; n++) {
        const candidate = numericalProbe(
          category,
          request.objective,
          request.facet,
          (state.tasks.length * 11 +
            request.objective * 7 +
            (request.facet === 'application' ? 3 : 0) +
            n) %
            36,
        );
        if (candidate && !seen.has(candidate.id)) {
          q = candidate;
          break;
        }
      }
    if (!q) return []; // No partial task can pretend its missing required content exists.
    result.push(q);
    seen.add(q.id);
  }
  return result;
}
