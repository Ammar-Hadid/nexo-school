import 'server-only';
import { createHash } from 'node:crypto';
import type { Prisma } from '../../generated/prisma/client';
import {
  exercisePayload,
  type ExercisePayload,
} from '../../modules/content/exercise-contract';
import {
  deliveryDescriptor,
  type DeliveryDescriptor,
} from './delivery-adapters';
export const contentInclude = {
  rubric: true,
  coverage: true,
  review: { include: { publication: true } },
  withdrawal: { include: { correction: true } },
} as const;
export type DeliveryContent = Prisma.ContentVersionGetPayload<{
  include: typeof contentInclude;
}>;
const hash = (s: string) => createHash('sha256').update(s).digest('hex');
export async function lockContent(tx: Prisma.TransactionClient) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(78210415)`;
}
/** Validates the immutable source even for historical tasks. New-issue status is checked separately. */
export function deliverySource(
  row: DeliveryContent,
): { payload: ExercisePayload; descriptor: DeliveryDescriptor } | null {
  try {
    if (
      hash(row.snapshot) !== row.contentHash ||
      hash(row.rubric.snapshot) !== row.rubricHash ||
      hash(row.coverage.specification) !== row.coverage.contentHash
    )
      return null;
    const body = JSON.parse(row.snapshot),
      rubric = JSON.parse(row.rubric.snapshot);
    if (
      body.contentId !== row.contentId ||
      body.revision !== row.revision ||
      body.coverageId !== row.coverageId ||
      body.coverageHash !== row.coverage.contentHash ||
      body.rubricVersionId !== row.rubricVersionId ||
      body.rubricHash !== row.rubricHash ||
      !exercisePayload(body.payload)
    )
      return null;
    const descriptor = deliveryDescriptor(
      row.contentId,
      body.payload,
      rubric.payload,
    );
    if (!descriptor || descriptor.coverageCode !== row.coverage.code)
      return null;
    return { payload: body.payload, descriptor };
  } catch {
    return null;
  }
}
/** The single current eligibility projection. No caller can supply approval, purpose or a certificate. */
export async function contentEligibility(
  tx: Prisma.TransactionClient,
  row: DeliveryContent,
) {
  if (row.withdrawal) return { eligible: false as const, reason: 'withdrawn' };
  if (
    await tx.contentVersion.findFirst({
      where: { contentId: row.contentId, revision: { gt: row.revision } },
      select: { id: true },
    })
  )
    return { eligible: false as const, reason: 'stale-content' };
  if (
    await tx.contentRubricVersion.findFirst({
      where: {
        rubricId: row.rubric.rubricId,
        revision: { gt: row.rubric.revision },
      },
      select: { id: true },
    })
  )
    return { eligible: false as const, reason: 'stale-rubric' };
  const review = row.review,
    publication = review?.publication;
  if (
    !review ||
    review.decision !== 'approved' ||
    review.authority !== 'human-content-review' ||
    review.contentHash !== row.contentHash
  )
    return { eligible: false as const, reason: 'review-required' };
  if (
    !publication ||
    publication.scope !== 'local-synthetic-practice' ||
    publication.contentHash !== row.contentHash ||
    publication.reviewId !== review.id
  )
    return { eligible: false as const, reason: 'publication-required' };
  const source = deliverySource(row);
  return source
    ? { eligible: true as const, ...source }
    : { eligible: false as const, reason: 'unsupported-or-invalid-metadata' };
}
export async function eligibleStock(
  tx: Prisma.TransactionClient,
  coverageId?: string,
) {
  const rows = await tx.contentVersion.findMany({
    where: coverageId ? { coverageId } : {},
    include: contentInclude,
    orderBy: [{ contentId: 'asc' }, { revision: 'desc' }],
  });
  const result = [];
  for (const row of rows)
    result.push({ row, eligibility: await contentEligibility(tx, row) });
  return result;
}
