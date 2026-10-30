import 'server-only';
import { parseIntegerAnswer } from '../../modules/practice/assignment/submission-state';
/** Exact, versioned finite response adapters. No semantic inference or assessment credit. */
export function evaluateAnswer(
  question: {
    responseType: string;
    evaluatorVersion: string;
    answer: string;
    options: readonly { value: string; label: string }[];
  },
  raw: string,
): { normalized: string; correct: boolean } | null {
  const { evaluatorVersion: version, responseType, answer, options } = question;
  if (
    ['integer-exact-v1', 'redactiesommen-integer-v1'].includes(version) &&
    responseType === 'integer'
  ) {
    if (!/^(0|[1-9][0-9]{0,5})$/.test(answer))
      throw new Error('INVALID_INTEGER_KEY');
    const normalized = raw.length <= 64 ? parseIntegerAnswer(raw) : null;
    return normalized === null
      ? null
      : { normalized, correct: normalized === answer };
  }
  if (
    version === 'reading-choice-exact-v1' &&
    responseType === 'single-choice'
  ) {
    if (!options.some((o) => o.label === answer))
      throw new Error('INVALID_CHOICE_KEY');
    const choice = options.find((o) => o.value === raw);
    return choice
      ? { normalized: choice.value, correct: choice.label === answer }
      : null;
  }
  if (
    ['taal-word-exact-v1', 'spelling-doubling-v1'].includes(version) &&
    responseType === 'word'
  ) {
    const normalized = raw.trim().toLocaleLowerCase('nl-NL');
    if (
      !normalized ||
      raw.length > 40 ||
      (version === 'taal-word-exact-v1' && !/^\p{L}{1,40}$/u.test(raw.trim()))
    )
      return null;
    return { normalized, correct: normalized === answer };
  }
  throw new Error('Unsupported evaluation specification');
}
