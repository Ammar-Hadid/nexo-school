# Synthetic guardian task-result review

## 26 October 2026 · D04-M3 result-scale amendment

The user requests a result out of 10 regardless of question count. Completed tasks now display `10 × existing weighted points / original question count`, rounded to at most one decimal with Dutch formatting. Eight first-attempt successes therefore display 10/10; seven first-attempt successes and one retry success display 9,4/10. Stored points remain 1 / 0.5 / 0; solved-question counts remain separate and visible. This supersedes earlier child-facing solved-count-only presentation, not retry policy, question selection, task size, assessment evidence or progression thresholds. The same shared formatter serves student and guardian results. Unfinished or withdrawn work retains its existing result withholding. This is a practice result, not a mastery estimate. Implemented presentation remains In Review.

Revision 1 · **In Review** · 19 October 2026.

The user explicitly authorized: “Go ahead with the synthetic guardian task-result review. Reuse our approved guardian navigation, keep it read-only and in memory, and give me a working Storybook link to review.” This extends the approved [connected student journey](connected-practice-journey.md) with guardian inspection only. The [guardian interview](guardian-interview.md), [weekly practice contract](../product/weekly-practice.md) and approved [guardian navigation](guardian-navigation.md) supply the existing requirements. No new product decision was required; production and guardian-action decisions remain outside this slice.

Review: [Practice → Guardian task results → Review Page](http://127.0.0.1:6006/?path=/story/practice-guardian-task-results--review-page). [Empty Block](http://127.0.0.1:6006/?path=/story/practice-guardian-task-results--empty-block) starts with six unstarted tasks for an entirely live run.

## Implemented contract

- Read-only list and detail for the same six synthetic tasks as the student preview, with completed, active and unstarted states. Both Rekenen tasks remain independent.
- Exact committed first/second attempts in original question order. Unsubmitted drafts are not presented as answers. Reading choice values are shown as their original option labels; spelling accents, punctuation and internal whitespace are preserved. No inferred motivation, mastery or attention classification.
- Completed metrics separately show first-attempt correct, second-attempt correct, solved questions and weighted score. The existing shared 1 / 0.5 / 0 rule is reused. The mixed fixture has 8 first, 1 second, 9 solved and 8.5/10 weighted; child results remain 9 solved. Incomplete tasks show submitted-original count and pending retries, without a final score or marking unattempted questions incorrect.
- Native keyboard-operable question disclosures retain exact prompts/options. Completed tasks expose fixture answer models/explanations. Unfinished tasks expose an answer model only for an already-explained second miss. “Antwoordmodel” does not claim that the student saw every explanation.
- Reading detail retains the entire immutable passage/question bundle via a full-text disclosure. The six paragraphs and ten questions belong to this fixture, not a universal reading requirement. Counts derive from the subject definition.
- Approved guardian navigation revision 1 is reused unchanged: desktop header/collapsible sidebar and narrow-screen option A bottom navigation. Overzicht and Voortgang expose the factual task list. Weekplanning, Instellingen and Beheer clearly state they are outside this preview and provide a working return to results. These destinations are not implemented product workflows.
- The guardian view has no Nexai, editable fields, approve/repeat controls or result mutation callbacks. The preview toolbar explicitly identifies synthetic, temporary data and provides the student/guardian review switch; it is not product role switching or authentication.
- In-memory snapshots are shared with the mounted student journey. Returning restores its exact navigation/draft/feedback/retry/result state and last student focus target. Guardian task detail focuses its heading; back restores the originating task button. Refresh restores the story's fixture, not the user's temporary edits.

The default review begins with two tasks actually advanced through the existing synthetic submit/advance transitions (mixed Rekenen and reading), one active spelling task, and three unstarted tasks. Its recorded attempts are not fabricated from the standalone outcome-only scenario shortcuts. The toolbar identifies the pre-completed examples. The empty story has no seeded progress.

## Implementation and reuse

- `src/modules/practice/guardian-results/guardian-results-preview.tsx`: review host owns the map and switch; student/guardian subtrees remain mounted with native `hidden` handling.
- `guardian-results.tsx` and `guardian-results.module.css`: domain-owned list/detail composition using existing GuardianNavigation, Button, typography and semantic color/spacing tokens. No new generic component, dependency or global token.
- `guardian-result-model.ts`: pure projection of committed state; no rendering, persistence, grader or separate result store.
- `guardian-results.fixtures.ts`: synthetic examples built through existing transitions.
- `guardian-results.stories.tsx`: Review Page, Empty Block, Attempts And Reading, Live Progress And Resume.
- `journey/practice-journey-tasks.ts`: unchanged six-task mapping extracted for both views. `PracticeJourney` accepts optional controlled `progress`; its default approved entry remains self-contained.
- `guardian-result-model.test.ts` and `tests/e2e/guardian-results.spec.ts`: projection and connected browser coverage.

All pre-existing files under practice and guardian-navigation were fingerprinted before editing. Only `practice-journey.tsx` changed among them, to extract the mapping and optionally share state ownership. Existing subject screens/definitions, exercise components, navigation source/styles, messages and artwork remain byte-identical. The approved student story still carries its approval; the new guardian stories carry `in-review`.

## Verification — 19 October 2026

Executed on Node 24.22.0 with synthetic fixtures and local Chromium. Final executed outcomes are recorded below. No production data/service used.

No loading or network error state is simulated because this view synchronously projects local state. Empty and partial states are explicit. Browser/axe checks are not accessibility certification; manual screen-reader use, physical iPhone/Tab S9 Ultra and software keyboards are unverified. Safari/auth-spike checks were not repeated. There are no approved visual baselines and none were written.

## Remaining scope

Revision 1 awaits explicit user visual approval. Guardian approve/request-repeat actions, durable saving/history, route/auth/permission boundaries, family isolation, server validation, concurrency, real educational content, reveal-dependency/evidence rules, live AI, automatic difficulty/attention detection, gaming-pass policy and deployment are **Not Implemented**. The approved stack, isolated auth spike and MVP AI/all-five-category roadmap remain intact. No production authorization is implied by the review switch or successful build.

## Executed evidence

| Check                                       | Result                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                                  | **55 passed**, including three new independent projection checks for incomplete state/key withholding, exact attempts, original order, non-ten-question bundles and solved versus weighted counts.                                                                                                                                     |
| `npm run test:stories`                      | **125 passed** across 20 files, including all four new guardian stories and all seven approved connected-journey stories; Chromium interactions and axe.                                                                                                                                                                               |
| `npm run test:e2e`                          | **16 passed** against built app/Storybook: six guardian, six student-journey and four foundation checks.                                                                                                                                                                                                                               |
| Final guardian E2E rerun                    | **6 passed** after correcting the local spacing reference and extending reading-selection resume coverage. 320, 390, 768, 1024 and 1440px; keyboard navigation/focus, original attempts/score, full passage, overflow, axe, no console/runtime errors, incomplete/retry/completed transition, same-subject isolation and reload reset. |
| `npm run lint` / `npm run typecheck`        | Both passed; generated local Prisma/Next types only.                                                                                                                                                                                                                                                                                   |
| `npm run build` / `npm run storybook:build` | Both passed. Storybook rebuilt after final CSS refinement. Existing nonfatal bundler/directive warnings remain.                                                                                                                                                                                                                        |
| Formatting / whitespace                     | Scoped formatting and `git diff --check` passed. Root `npm run format:check` fails only on pre-existing `.impeccable/config.json` and `.impeccable/hook.cache.json`; left untouched.                                                                                                                                                   |

Initial story checks caught a main landmark nested inside the reused navigation content region; the local composition now uses that existing region without adding a nested main. Other initial failures were ambiguous hidden-disclosure text selectors and a test holding a detached list button; assertions now target the actual visible question/current button. No accessibility assertions or visual baselines were disabled. Inspection also caught a reference to an absent spacing token; it now derives from the existing spacing scale.

The browser plugin was unavailable, so rendered inspection used installed Playwright/Chromium. Live Storybook identity and nonblank content were verified at the review URL. Desktop list/detail and narrow-screen detail were visually inspected, including expanded attempts and answer model at 320px. All content remains reachable in the navigation shell's scrolling region; the narrow layout uses stacked task actions and a two-column metric grid. Screenshots/logs are temporary under `/tmp/nexo-guardian-results/`, with built E2E captures in ignored `test-results/`. No screenshot is an approved baseline.

Review fingerprint: **`6bf289fc653f7d9fdf678189afddfa18116da99d374bf12c2344d63c8a55d6f9`**. SHA-256 over sorted repository-relative paths + NUL + bytes + NUL for all files directly under `src/modules/practice/guardian-results/`, `journey/practice-journey.tsx`, `journey/practice-journey-tasks.ts` (both under `src/modules/practice/`), and `tests/e2e/guardian-results.spec.ts`.

Not run for this slice: hosted CI, dependency audit, separate Prisma schema validation (schema unchanged), live database/auth-spike/remote checks, physical-device/manual screen-reader tests or visual baseline comparisons. No deployment.

## D08 saved-result integration — 21 October 2026

The user resumed D08 after the D07 handoff. [D08](../engineering/guardian-results.md) reuses this feature presentation through `guardian-results-view.tsx`, while the original `guardian-results.tsx` remains the in-memory preview adapter. The real `/guardian/results` route uses authorized PostgreSQL assignments/committed attempts with the existing adult MFA boundary, without the preview role switch. Persisted scope is the D05 synthetic arithmetic family only; broader subject persistence and guardian actions remain later tasks. Saved-route loading, signed-out, unavailable, empty and result states are **In Review**, not Approved. Original reading/attempt/focus behavior is preserved and regression-tested. The historical Not Implemented statements above describe revision 1 at its original date; consult D08 and the ledger for current integration evidence.
