import 'server-only';
import type { GenerationProvider } from './generation-jobs.ts';
import type {
  Review,
  Finding,
} from '../../modules/content/review-benchmark/benchmark.ts';
import { solveDisplayedAddition } from './addition-family.ts';
import { fakeGenerationProvider } from './fake-generation-provider.ts';

/** Scripted plumbing controls, not AI models. This module never reads reference labels. */
export const fakeReviewProvider: GenerationProvider = {
  id: 'fake-v1',
  async generate(input) {
    input.signal.throwIfAborted();
    let request;
    try {
      request = JSON.parse(input.specification);
    } catch {
      return fakeGenerationProvider.generate(input);
    }
    if (request.namespace !== 'd13-review')
      return fakeGenerationProvider.generate(input);
    if (
      !['fake-checker-v1', 'fake-pass-all-v1'].includes(request.model) ||
      !['solve', 'semantic'].includes(request.stage)
    )
      throw new Error('UNSUPPORTED_REVIEW_REQUEST');
    const response: Review = {
      contentHash: request.contentHash,
      status: 'clear',
      answer: null,
      findings: [],
    };
    if (request.stage === 'solve') {
      if (
        'answer' in request ||
        'explanation' in request ||
        'expected' in request
      )
        throw new Error('SOLVE_KEY_DISCLOSURE');
      try {
        response.answer = solveDisplayedAddition(request.prompt);
      } catch {
        if (request.prompt.includes('hetzelfde als blij'))
          response.answer = 'vrolijk';
        else if (request.prompt.includes('hij ...')) response.answer = 'loopt';
        else if (request.prompt.includes('12 centimeter'))
          response.answer = '12 centimeter';
        else if (request.prompt.includes('fotosynthese'))
          response.answer = 'voedselvorming';
        else if (request.prompt.includes('miauwt')) response.answer = 'kat';
        else if (request.prompt.includes('Hoeveel appels'))
          response.answer = 'drie';
        else if (request.passage.includes('rode jas')) response.answer = 'rood';
        else response.status = 'abstain';
      }
    } else if (request.model === 'fake-checker-v1') {
      const flag = (
        code: Finding['code'],
        field: Finding['field'],
        quote: string,
        reason: string,
        severity: Finding['severity'] = 'blocking',
      ) => response.findings.push({ code, field, quote, reason, severity });
      try {
        if (solveDisplayedAddition(request.prompt) !== request.answer)
          flag(
            'wrong-key',
            'answer',
            request.answer,
            'De onafhankelijke telsom geeft een ander antwoord.',
          );
      } catch {
        /* Not an arithmetic form. */
      }
      if (
        request.options.includes('vrolijk') &&
        request.options.includes('opgewekt')
      )
        flag(
          'ambiguity',
          'options',
          'opgewekt',
          'Beide keuzes kunnen blij betekenen.',
        );
      if (
        request.prompt.includes('centimeter') &&
        request.answer === '12 meter'
      )
        flag(
          'wrong-unit',
          'answer',
          'meter',
          'De gevraagde eenheid is centimeter.',
        );
      if (request.prompt.includes('fotosynthese'))
        flag(
          'vocabulary',
          'prompt',
          'fotosynthese',
          'Vaktaal botst met de gegeven woordenbeperking.',
          'attention',
        );
      if (
        request.prompt.includes('Welke kleur') &&
        !request.passage.includes('jas')
      )
        flag(
          'missing-evidence',
          'passage',
          request.passage,
          'De passage noemt geen jas of kleur.',
        );
      if (request.passage.includes('Eerder zichtbare feedback'))
        flag(
          'answer-leakage',
          'passage',
          'Noor heeft drie appels.',
          'Eerdere feedback onthult het latere antwoord.',
        );
      if (
        request.objective.includes('optellen') &&
        request.prompt.includes('miauwt')
      )
        flag(
          'objective-mismatch',
          'prompt',
          'Welk dier miauwt?',
          'Deze vraag verzamelt geen optelbewijs.',
        );
      // Deliberate false positive and missed grammar defect are negative controls.
      if (
        request.prompt.includes('hetzelfde als blij') &&
        request.options.includes('boos')
      )
        flag(
          'vocabulary',
          'prompt',
          'blij',
          'Gesimuleerd onterecht aandachtspunt.',
          'attention',
        );
      if (response.findings.length) response.status = 'flagged';
    }
    return {
      draft: JSON.stringify(response),
      costMicroEur: 400,
      inputTokens: 10,
      outputTokens: 20,
    };
  },
};
