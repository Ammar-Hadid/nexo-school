import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import type { PrismaClient, Prisma } from '../../generated/prisma/client';
import {
  canonicalJson,
  contentPayload,
  rubricPayload,
  record,
  text,
  exact,
} from '../../modules/content/content-records';
import { exercisePayload } from '../../modules/content/exercise-contract';
import { subjectContentChecks } from './subject-checks';
import coverage from '../../modules/curriculum/required-coverage.json';
import { withAdultIdentity } from '../auth/service';
import type { LocalIdentityConfig } from '../auth/config';

const hash = (snapshot: string) =>
  createHash('sha256').update(snapshot).digest('hex');
const reply = (
  status: number,
  data: unknown = { error: 'CONTENT_REQUEST_DENIED' },
) => Response.json(data, { status, headers: { 'cache-control': 'no-store' } });
const uuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
// Legacy D10 snapshots stay in their bounded synthetic lane. New v2 drafts
// must pin v2 rubric rules and cannot downgrade to bypass their checks.
function matchingContract(payload: unknown, rubric: unknown) {
  return (
    record(rubric) &&
    exercisePayload(payload) === Object.hasOwn(rubric, 'exerciseContract')
  );
}
function draftChecks(payload: unknown, rubric: unknown) {
  return exercisePayload(payload) && record(rubric)
    ? {
        checks: subjectContentChecks(payload, rubric),
        humanApprovalRequired: true,
        automaticPublication: false,
      }
    : {};
}
function reviewBlockers(payload: unknown, rubric: unknown) {
  if (
    !contentPayload(payload) ||
    !rubricPayload(rubric) ||
    !matchingContract(payload, rubric)
  )
    return true;
  return (
    exercisePayload(payload) &&
    record(rubric) &&
    subjectContentChecks(payload, rubric).length > 0
  );
}
const revision = (value: unknown): value is number =>
  Number.isSafeInteger(value) && Number(value) > 0;

async function registerCoverage(tx: Prisma.TransactionClient) {
  for (const row of coverage) {
    const specification = canonicalJson(row);
    const data = {
      id: row.id,
      release: row.release,
      code: row.code,
      subject: row.subject,
      category: row.category,
      label: row.label,
      specification,
      contentHash: hash(specification),
    };
    const existing = await tx.coverageObjective.findUnique({
      where: { id: row.id },
    });
    if (existing && existing.contentHash !== data.contentHash)
      throw new Error('Coverage version changed');
    if (!existing) await tx.coverageObjective.create({ data });
  }
  return reply(200, {
    release: coverage[0]!.release,
    objectives: coverage.length,
    definitionStatus: 'required-unmapped',
    progressionPermission: false,
  });
}

/** Trusted server use case, not a public HTTP endpoint. D14 owns the review UI.
 * Local bootstrap operator + fresh authenticated MFA is the bounded D10 author.
 * Callers cannot supply a reviewer identity or claim policy/educator authority.
 */
export async function contentCommand(
  db: PrismaClient,
  config: LocalIdentityConfig,
  headers: Headers,
  command: unknown,
): Promise<Response> {
  try {
    if (headers.get('origin') !== config.origin) return reply(403);
    if (!record(command) || canonicalJson(command).length > 64000)
      return reply(400);
    return await withAdultIdentity(db, config, headers, async (tx, actor) => {
      const bootstrap = await tx.identityBootstrap.findFirst({
        where: { userId: actor.userId },
      });
      if (!bootstrap || Date.now() - actor.mfaVerifiedAt.getTime() > 5 * 60_000)
        return reply(403);
      return contentCommandInTransaction(tx, actor, command);
    });
  } catch {
    // Rollback, no payload/answer/session data in errors or logs.
    return reply(409);
  }
}

/** Internal composition only. Caller must hold withAdultIdentity and bootstrap/fresh-MFA authorization. */
export async function contentCommandInTransaction(
  tx: Prisma.TransactionClient,
  actor: { userId: string },
  command: Record<string, unknown>,
): Promise<Response> {
  if (command.action === 'register-coverage' && exact(command, ['action']))
    return registerCoverage(tx);
  if (
    command.action === 'create-rubric' &&
    exact(command, ['action', 'rubricId', 'revision', 'payload']) &&
    uuid(command.rubricId) &&
    revision(command.revision) &&
    rubricPayload(command.payload)
  ) {
    const snapshot = canonicalJson({
      rubricId: command.rubricId,
      revision: command.revision,
      payload: command.payload,
    });
    const contentHash = hash(snapshot);
    const existing = await tx.contentRubricVersion.findUnique({
      where: {
        rubricId_revision: {
          rubricId: command.rubricId,
          revision: command.revision,
        },
      },
    });
    if (existing)
      return existing.contentHash === contentHash
        ? reply(200, { id: existing.id, contentHash })
        : reply(409);
    const result = await tx.contentRubricVersion.create({
      data: {
        id: randomUUID(),
        rubricId: command.rubricId,
        revision: command.revision,
        snapshot,
        contentHash,
      },
    });
    return reply(201, { id: result.id, contentHash });
  }
  if (
    command.action === 'create-content' &&
    exact(command, [
      'action',
      'contentId',
      'revision',
      'coverageId',
      'rubricVersionId',
      'payload',
    ]) &&
    uuid(command.contentId) &&
    revision(command.revision) &&
    uuid(command.coverageId) &&
    uuid(command.rubricVersionId) &&
    contentPayload(command.payload)
  ) {
    const requirement = await tx.coverageObjective.findUnique({
      where: { id: command.coverageId },
    });
    const rubric = await tx.contentRubricVersion.findUnique({
      where: { id: command.rubricVersionId },
    });
    if (!requirement || !rubric) return reply(409);
    const rubricBody = JSON.parse(rubric.snapshot);
    if (
      !rubricPayload(rubricBody.payload) ||
      !matchingContract(command.payload, rubricBody.payload)
    )
      return reply(409);
    const validation = draftChecks(command.payload, rubricBody.payload);
    const snapshot = canonicalJson({
      contentId: command.contentId,
      revision: command.revision,
      coverageId: requirement.id,
      coverageHash: requirement.contentHash,
      rubricVersionId: rubric.id,
      rubricHash: rubric.contentHash,
      payload: command.payload,
    });
    const contentHash = hash(snapshot);
    const existing = await tx.contentVersion.findUnique({
      where: {
        contentId_revision: {
          contentId: command.contentId,
          revision: command.revision,
        },
      },
    });
    if (existing)
      return existing.contentHash === contentHash
        ? reply(200, { id: existing.id, contentHash, ...validation })
        : reply(409);
    const result = await tx.contentVersion.create({
      data: {
        id: randomUUID(),
        contentId: command.contentId,
        revision: command.revision,
        coverageId: requirement.id,
        rubricVersionId: rubric.id,
        rubricHash: rubric.contentHash,
        snapshot,
        contentHash,
      },
    });
    return reply(201, { id: result.id, contentHash, ...validation });
  }
  if (
    command.action === 'review' &&
    exact(command, [
      'action',
      'contentVersionId',
      'contentHash',
      'decision',
      'notes',
    ]) &&
    uuid(command.contentVersionId) &&
    text(command.contentHash) &&
    ['approved', 'rejected'].includes(String(command.decision)) &&
    typeof command.notes === 'string' &&
    command.notes.length <= 16000
  ) {
    const content = await tx.contentVersion.findUnique({
      where: { id: command.contentVersionId },
      include: { rubric: true },
    });
    if (!content || content.contentHash !== command.contentHash)
      return reply(409);
    if (
      command.decision === 'approved' &&
      reviewBlockers(
        JSON.parse(content.snapshot).payload,
        JSON.parse(content.rubric.snapshot).payload,
      )
    )
      return reply(409);
    const existing = await tx.contentReview.findUnique({
      where: { contentVersionId: content.id },
    });
    if (existing)
      return existing.decision === command.decision &&
        existing.notes === command.notes &&
        existing.reviewerId === actor.userId
        ? reply(200, { id: existing.id })
        : reply(409);
    const review = await tx.contentReview.create({
      data: {
        id: randomUUID(),
        contentVersionId: content.id,
        contentHash: content.contentHash,
        decision: String(command.decision),
        notes: command.notes,
        reviewerId: actor.userId,
      },
    });
    await tx.identityAudit.create({
      data: {
        id: randomUUID(),
        userId: actor.userId,
        event: 'content-review-recorded',
      },
    });
    return reply(201, { id: review.id });
  }
  if (
    command.action === 'publish' &&
    exact(command, ['action', 'contentVersionId', 'contentHash']) &&
    uuid(command.contentVersionId) &&
    text(command.contentHash)
  ) {
    const content = await tx.contentVersion.findUnique({
      where: { id: command.contentVersionId },
      include: { rubric: true, coverage: true, review: true },
    });
    if (
      !content ||
      content.contentHash !== command.contentHash ||
      !content.review ||
      content.review.decision !== 'approved'
    )
      return reply(409);
    if (
      hash(content.snapshot) !== content.contentHash ||
      hash(content.rubric.snapshot) !== content.rubricHash ||
      hash(content.coverage.specification) !== content.coverage.contentHash
    )
      return reply(409);
    const body = JSON.parse(content.snapshot);
    const rubricBody = JSON.parse(content.rubric.snapshot);
    if (
      reviewBlockers(body.payload, rubricBody.payload) ||
      body.coverageHash !== content.coverage.contentHash
    )
      return reply(409);
    const existing = await tx.contentPublication.findUnique({
      where: { contentVersionId: content.id },
    });
    if (existing) return reply(200, { id: existing.id, scope: existing.scope });
    const publication = await tx.contentPublication.create({
      data: {
        id: randomUUID(),
        contentVersionId: content.id,
        contentHash: content.contentHash,
        reviewId: content.review.id,
      },
    });
    await tx.identityAudit.create({
      data: {
        id: randomUUID(),
        userId: actor.userId,
        event: 'content-published-local-synthetic',
      },
    });
    return reply(201, { id: publication.id, scope: publication.scope });
  }
  return reply(400);
}
