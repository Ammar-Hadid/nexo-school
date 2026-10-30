import 'server-only';
import { rehearsalSpecs } from './rehearsal-batches';
import { createHash, randomUUID } from 'node:crypto';
import type { Prisma, PrismaClient } from '../../generated/prisma/client';
import { withAdultIdentity } from '../auth/service';
import type { LocalIdentityConfig } from '../auth/config';
import { contentCommandInTransaction } from './records';
import {
  canonicalJson,
  exact,
  record,
} from '../../modules/content/content-records';
import { exercisePayload } from '../../modules/content/exercise-contract';
import {
  acceptedReviewTime,
  exactSelection,
  type ReviewBatch,
  type ReviewItem,
} from '../../modules/content/review/review-contract';
import {
  reviewBatchId,
  reviewBatchTitle,
  reviewRubric,
  reviewRubricId,
  reviewRules,
  reviewSeeds,
} from '../../modules/content/review/review-fixture';
import {
  supplyReviewBatch,
  admitSupplyEdit,
  prepareSupply,
  supplyOverview,
} from './supply';
import {
  familyReviewState,
  familyReviewCommand,
  resolveFamilyPackage,
} from './family-review';
import { spellingReviewSpec } from './spelling-review-batch';
import { subjectContentChecks } from './subject-checks';
import coverage from '../../modules/curriculum/required-coverage.json';
const requirement = coverage.find(
  (r) => r.id === 'fc6bb1d1-a097-5570-b7e1-bb5afe4107e2',
)!;
const defaultReviewSpec = {
  id: reviewBatchId,
  title: reviewBatchTitle,
  rubricId: reviewRubricId,
  rubric: reviewRubric,
  rules: reviewRules,
  requirement,
  seeds: reviewSeeds,
  provenance: 'synthetic-haiku-example' as
    'synthetic-haiku-example' | 'deterministic-check',
};
const hash = (value: unknown) =>
  createHash('sha256').update(canonicalJson(value)).digest('hex');
const reply = (
  status: number,
  data: unknown = { error: 'CONTENT_REVIEW_DENIED' },
) => Response.json(data, { status, headers: { 'cache-control': 'no-store' } });
async function body(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('EMPTY');
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const r = await reader.read();
    if (r.done) break;
    size += r.value.length;
    if (size > 64000) {
      await reader.cancel();
      throw new Error('TOO_LARGE');
    }
    chunks.push(r.value);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}
async function command(
  tx: Prisma.TransactionClient,
  actor: { userId: string },
  input: Record<string, unknown>,
) {
  const result = await contentCommandInTransaction(tx, actor, input);
  if (!result.ok) throw new Error('CONTENT_CONFLICT'); // Roll back the entire batch, including audits.
  return result.json();
}
async function batch(
  tx: Prisma.TransactionClient,
  userId: string,
  spec = defaultReviewSpec,
): Promise<ReviewBatch> {
  const {
    id: reviewBatchId,
    title: reviewBatchTitle,
    rubricId: reviewRubricId,
    rubric: reviewRubric,
    rules: reviewRules,
    requirement,
    seeds: reviewSeeds,
  } = spec;
  const rows = await tx.contentVersion.findMany({
    where: { contentId: { in: reviewSeeds.map((s) => s.contentId) } },
    orderBy: { revision: 'desc' },
    include: { review: { include: { publication: true } } },
  });
  const originalRubricHash = hash({
    rubricId: reviewRubricId,
    revision: 1,
    payload: reviewRubric,
  });
  const items: ReviewItem[] = [];
  for (const seed of reviewSeeds) {
    const row = rows.find((r) => r.contentId === seed.contentId);
    if (!row) continue;
    const payload: unknown = JSON.parse(row.snapshot).payload;
    if (!exercisePayload(payload) || row.rubricHash !== originalRubricHash)
      throw new Error('UNSUPPORTED_REVIEW_CONTENT');
    const sourceHash = hash({
      contentId: seed.contentId,
      revision: 1,
      coverageId: requirement.id,
      coverageHash: hash(requirement),
      rubricVersionId: row.rubricVersionId,
      rubricHash: originalRubricHash,
      payload: seed.payload,
    });
    items.push({
      id: row.id,
      contentId: row.contentId,
      contentHash: row.contentHash,
      revision: row.revision,
      title: seed.title,
      objective: requirement.label,
      payload,
      rules: reviewRules,
      checks: subjectContentChecks(payload, reviewRubric),
      decision: (row.review?.decision as 'approved' | 'rejected') ?? 'pending',
      published: !!row.review?.publication,
      advisory: {
        status: sourceHash === row.contentHash ? seed.advisory : 'stale',
        text:
          sourceHash === row.contentHash
            ? seed.note
            : 'De inhoud is gewijzigd. De eerdere bevinding geldt niet voor deze versie. Beoordeel deze versie opnieuw.',
        sourceHash,
        provenance: spec.provenance,
      },
    });
  }
  const progress = await tx.contentReviewProgress.findUnique({
    where: {
      reviewerId_batchId: { reviewerId: userId, batchId: reviewBatchId },
    },
  });
  return {
    id: reviewBatchId,
    title: reviewBatchTitle,
    items,
    cursor: progress?.cursor ?? null,
    activeMs: progress?.totalMs ?? 0,
  };
}
/** One explicit local synthetic batch. No general author role, arbitrary import or provider dispatch. */
export async function contentReviewHandler(
  db: PrismaClient,
  config: LocalIdentityConfig,
  request: Request,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    if (
      url.origin !== config.origin ||
      ![
        '/api/guardian/content-review',
        '/api/guardian/content-supply',
        '/api/guardian/family-review',
      ].includes(url.pathname) ||
      (url.search !== '' &&
        !(
          url.pathname === '/api/guardian/content-review' &&
          [
            '?batch=optellen',
            '?batch=spelling-doubling',
            ...rehearsalSpecs.map((s) => `?batch=${s.id}`),
          ].includes(url.search)
        ) &&
        !(
          url.pathname === '/api/guardian/family-review' &&
          [...url.searchParams.keys()].join(',') === 'package'
        ))
    )
      return reply(403);
    if (!['GET', 'POST'].includes(request.method)) return reply(405);
    if (
      request.headers.get('origin') !== config.origin &&
      !(
        request.method === 'GET' &&
        request.headers.get('origin') === null &&
        request.headers.get('sec-fetch-site') === 'same-origin'
      )
    )
      return reply(403);
    const input = request.method === 'POST' ? await body(request) : null;
    if (request.method === 'POST' && !record(input)) return reply(400);
    return await withAdultIdentity(
      db,
      config,
      request.headers,
      async (tx, actor) => {
        if (
          !(await tx.identityBootstrap.findFirst({
            where: { userId: actor.userId },
          })) ||
          Date.now() - actor.mfaVerifiedAt.getTime() > 300000
        )
          return reply(403);
        const isFamily = url.pathname === '/api/guardian/family-review';
        const family = isFamily
          ? resolveFamilyPackage(url.searchParams.get('package') ?? undefined)
          : null;
        if (isFamily) {
          if (input === null)
            return reply(
              200,
              await familyReviewState(
                tx,
                actor.userId,
                family!.package.version,
              ),
            );
          if (
            record(input) &&
            !['start-time', 'time'].includes(String(input.action))
          )
            return reply(
              200,
              await familyReviewCommand(
                tx,
                actor.userId,
                input,
                family!.package.version,
              ),
            );
        }
        const isSupply = url.pathname === '/api/guardian/content-supply';
        const optellen = url.search === '?batch=optellen';
        const spec =
          url.search === '?batch=spelling-doubling'
            ? spellingReviewSpec
            : (rehearsalSpecs.find((s) => url.search === `?batch=${s.id}`) ??
              defaultReviewSpec);
        const readBatch = () =>
          isFamily
            ? Promise.resolve({
                id: family!.progressId,
                title: family!.package.title,
                items: [],
                cursor: null,
                activeMs: 0,
              } as ReviewBatch)
            : optellen
              ? supplyReviewBatch(tx, actor.userId)
              : batch(tx, actor.userId, spec);
        if (isSupply) {
          if (input === null)
            return reply(200, await supplyOverview(tx, actor.userId));
          if (
            record(input) &&
            exact(input, ['action', 'demand']) &&
            input.action === 'prepare' &&
            typeof input.demand === 'number'
          )
            return reply(
              200,
              await prepareSupply(tx, actor.userId, input.demand),
            );
          return reply(400);
        }
        if (input === null) return reply(200, await readBatch());
        if (!record(input)) return reply(400);
        if (
          !optellen &&
          input.action === 'initialize' &&
          exact(input, ['action'])
        ) {
          const {
            rubricId: reviewRubricId,
            rubric: reviewRubric,
            requirement,
            seeds: reviewSeeds,
          } = spec;
          await command(tx, actor, { action: 'register-coverage' });
          const r = await command(tx, actor, {
            action: 'create-rubric',
            rubricId: reviewRubricId,
            revision: 1,
            payload: reviewRubric,
          });
          for (const seed of reviewSeeds)
            await command(tx, actor, {
              action: 'create-content',
              contentId: seed.contentId,
              revision: 1,
              coverageId: requirement.id,
              rubricVersionId: r.id,
              payload: seed.payload,
            });
          return reply(200, await readBatch());
        }
        const current = await readBatch();
        if (
          input.action === 'edit' &&
          exact(input, ['action', 'id', 'contentHash', 'payload']) &&
          exercisePayload(input.payload)
        ) {
          const old = await tx.contentVersion.findUnique({
            where: { id: String(input.id) },
          });
          const latest = current.items.find(
            (i) => i.contentId === old?.contentId,
          );
          if (!old || !latest || old.contentHash !== input.contentHash)
            return reply(409);
          if (latest.id !== old.id) {
            if (
              latest.revision === old.revision + 1 &&
              canonicalJson(latest.payload) === canonicalJson(input.payload)
            )
              return reply(200, current);
            return reply(409);
          }
          if (canonicalJson(latest.payload) !== canonicalJson(input.payload)) {
            const editCommand = {
              action: 'create-content',
              contentId: old.contentId,
              revision: old.revision + 1,
              coverageId: old.coverageId,
              rubricVersionId: old.rubricVersionId,
              payload: input.payload,
            };
            if (optellen)
              await admitSupplyEdit(tx, actor.userId, old.id, editCommand);
            else await command(tx, actor, editCommand);
          }
          return reply(200, await readBatch());
        }
        if (['approve', 'reject', 'publish'].includes(String(input.action))) {
          const publishing = input.action === 'publish';
          if (
            !exact(
              input,
              publishing || input.notes === undefined
                ? ['action', 'refs']
                : ['action', 'refs', 'notes'],
            ) ||
            (!publishing &&
              input.notes !== undefined &&
              (typeof input.notes !== 'string' || input.notes.length > 16000))
          )
            return reply(400);
          if (!exactSelection(input.refs, current.items)) return reply(409);
          // Validate the entire selection before recording a single decision.
          for (const ref of input.refs) {
            const item = current.items.find((i) => i.id === ref.id)!;
            if (
              (input.action === 'approve' || publishing) &&
              item.checks.length
            )
              return reply(409);
            if (publishing && item.decision !== 'approved') return reply(409);
          }
          for (const ref of input.refs)
            await command(
              tx,
              actor,
              publishing
                ? {
                    action: 'publish',
                    contentVersionId: ref.id,
                    contentHash: ref.contentHash,
                  }
                : {
                    action: 'review',
                    contentVersionId: ref.id,
                    contentHash: ref.contentHash,
                    decision:
                      input.action === 'approve' ? 'approved' : 'rejected',
                    notes: input.notes ?? '',
                  },
            );
          return reply(200, await readBatch());
        }
        const where = {
          reviewerId_batchId: {
            reviewerId: actor.userId,
            batchId: current.id,
          },
        };
        const create = { reviewerId: actor.userId, batchId: current.id };
        if (
          input.action === 'cursor' &&
          exact(input, ['action', 'contentId']) &&
          current.items.some((i) => i.contentId === input.contentId)
        ) {
          await tx.contentReviewProgress.upsert({
            where,
            create: { ...create, cursor: String(input.contentId) },
            update: { cursor: String(input.contentId) },
          });
          return reply(200, { saved: true });
        }
        if (input.action === 'start-time' && exact(input, ['action'])) {
          const sessionId = randomUUID(),
            now = new Date();
          const fields = {
            sessionId,
            sessionMs: 0,
            sequence: 0,
            startedAt: now,
            lastPulseAt: now,
          };
          const progress = await tx.contentReviewProgress.upsert({
            where,
            create: { ...create, ...fields },
            update: fields,
          });
          return reply(200, { sessionId, activeMs: progress.totalMs });
        }
        if (
          input.action === 'time' &&
          exact(input, ['action', 'sessionId', 'sequence', 'sessionMs']) &&
          typeof input.sequence === 'number' &&
          typeof input.sessionMs === 'number'
        ) {
          const old = await tx.contentReviewProgress.findUnique({ where });
          if (!old || !old.sessionId || old.sessionId !== input.sessionId)
            return reply(409);
          const now = new Date(),
            delta = acceptedReviewTime(
              old,
              { sequence: input.sequence, sessionMs: input.sessionMs },
              now,
            );
          if (delta || input.sequence !== old.sequence)
            await tx.contentReviewProgress.update({
              where,
              data: {
                totalMs: { increment: delta },
                sessionMs: input.sessionMs,
                sequence: input.sequence,
                lastPulseAt: now,
              },
            });
          return reply(200, { activeMs: old.totalMs + delta });
        }
        return reply(400);
      },
    );
  } catch (error) {
    return reply(409, {
      error:
        error instanceof Error && error.message === 'REVIEW_LIMIT'
          ? 'REVIEW_LIMIT'
          : 'CONTENT_REVIEW_DENIED',
    });
  }
}
