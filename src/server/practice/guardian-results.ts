import 'server-only';
import { assignedItemInclude, assignedQuestion } from './assigned-content';
import type { PrismaClient } from '../../generated/prisma/client';
import type { GuardianResultTask } from '../../modules/practice/guardian-results/guardian-result-contract';
import { guardianResult } from '../../modules/practice/guardian-results/guardian-result-model';
import { replaySubmissions } from '../../modules/practice/assignment/submission-state';
import { localIdentityConfig, type LocalIdentityConfig } from '../auth/config';
import { withAdultIdentity } from '../auth/service';

const reply = (
  status: number,
  data: unknown = { error: 'RESULT_REQUEST_DENIED' },
) => Response.json(data, { status, headers: { 'cache-control': 'no-store' } });

/** Read-only, authenticated projection of immutable attempts. No stored presentation/drafts. */
export async function guardianResultsHandler(
  db: PrismaClient,
  config: LocalIdentityConfig,
  request: Request,
): Promise<Response> {
  try {
    localIdentityConfig({
      NEXO_LOCAL_IDENTITY: 'synthetic-only',
      DATABASE_URL: config.databaseUrl,
      BETTER_AUTH_URL: config.origin,
      BETTER_AUTH_SECRET: config.secret,
    });
    const url = new URL(request.url);
    if (url.origin !== config.origin) return reply(403);
    const match = /^\/api\/guardian\/results(?:\/([0-9a-f-]{36}))?$/.exec(
      url.pathname,
    );
    if (!match || url.search) return reply(404);
    if (request.method !== 'GET') return reply(405);
    if (
      request.headers.get('origin') !== config.origin &&
      !(
        request.headers.get('origin') === null &&
        request.headers.get('sec-fetch-site') === 'same-origin'
      )
    )
      return reply(403);
    return await withAdultIdentity(
      db,
      config,
      request.headers,
      async (tx, actor) => {
        const rows = await tx.assignment.findMany({
          where: {
            ...(match[1] ? { id: match[1] } : {}),
            student: {
              guardians: {
                some: {
                  guardianId: actor.userId,
                  canView: true,
                  revokedAt: null,
                },
              },
            },
          },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: 100,
          select: {
            id: true,
            student: { select: { displayName: true } },
            items: {
              orderBy: { position: 'asc' },
              include: assignedItemInclude,
            },
            attempts: {
              orderBy: { sequence: 'asc' },
              select: {
                itemId: true,
                attemptNumber: true,
                rawAnswer: true,
                correct: true,
                policyVersion: true,
              },
            },
          },
        });
        if (match[1] && !rows.length) return reply(404);
        const tasks: GuardianResultTask[] = rows.map((row) => {
          const { state } = replaySubmissions(
            row.items.length,
            row.attempts.map((a) => {
              const item = row.items.find((i) => i.id === a.itemId);
              if (!item || a.policyVersion !== 'deferred-retry-v1')
                throw new Error('Unsupported committed history');
              return {
                index: item.position,
                retry: a.attemptNumber === 2,
                answer: a.rawAnswer,
                correct: a.correct,
              };
            }),
          );
          const first = assignedQuestion(row.items[0]!);
          const corrections = row.items.flatMap((i) =>
            i.content?.withdrawal
              ? [
                  {
                    itemId: i.id,
                    reason: i.content.withdrawal.reason,
                    note: i.content.withdrawal.note,
                    withdrawnAt: i.content.withdrawal.createdAt.toISOString(),
                    replacementVersionId:
                      i.content.withdrawal.correction?.replacementVersionId ??
                      null,
                    correctionNote:
                      i.content.withdrawal.correction?.note ?? null,
                  },
                ]
              : [],
          );
          const task: GuardianResultTask = {
            id: row.id,
            title: `${row.student.displayName} · ${first.subject} · ${first.category}`,
            ...(corrections.length ? { corrections } : {}),
            ...(first.readingText ? { readingText: first.readingText } : {}),
            result: guardianResult(
              {
                initialPreview: () => state,
                previewQuestion: (index) => {
                  const q = assignedQuestion(row.items[index]!);
                  return {
                    prompt: q.prompt,
                    options: q.options.length ? q.options : undefined,
                    answerUnit: q.answerUnit,
                    answer: q.answer,
                    steps: q.steps,
                  };
                },
              },
              row.attempts.length
                ? { state, answer: '', error: '' }
                : undefined,
            ),
          };
          if (corrections.length) {
            task.result.score = undefined;
            task.result.status = task.result.complete
              ? 'Afgerond · inhoud ingetrokken'
              : 'Gepauzeerd · inhoud ingetrokken';
            for (const question of task.result.questions)
              if (
                corrections.some(
                  (c) => c.itemId === row.items[question.index]!.id,
                )
              )
                question.answerModel = undefined;
          }
          return task;
        });
        return reply(200, match[1] ? tasks[0] : tasks);
      },
    );
  } catch {
    return reply(503);
  }
}
