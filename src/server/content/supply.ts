import 'server-only';
import { eligibleStock } from './eligibility';
import { createHash, randomUUID } from 'node:crypto';
import type { Prisma } from '../../generated/prisma/client';
import { canonicalJson } from '../../modules/content/content-records';
import {
  checkExercise,
  exercisePayload,
} from '../../modules/content/exercise-contract';
import type {
  ReviewBatch,
  ReviewItem,
} from '../../modules/content/review/review-contract';
import {
  amsterdamWeek,
  reviewCapacity,
  selectSupply,
  supplyLimits,
  supplyPolicyVersion,
} from '../../modules/content/supply/supply-policy';
import type { SupplyOverview } from '../../modules/content/supply/supply-contract';
import { additionFamily, solveDisplayedAddition } from './addition-family';
import { contentCommandInTransaction } from './records';
import { supplyCatalogue as catalogue } from './addition-supply-catalogue';
import coverage from '../../modules/curriculum/required-coverage.json';
const requirement = coverage.find(
  (r) => r.code === additionFamily.coverageCode,
)!;
const digest = (value: unknown) =>
  createHash('sha256').update(canonicalJson(value)).digest('hex');
export const supplyBatchId = (now = new Date()) =>
  `d14-optellen:${amsterdamWeek(now)}`;
async function command(
  tx: Prisma.TransactionClient,
  userId: string,
  input: Record<string, unknown>,
) {
  const result = await contentCommandInTransaction(tx, { userId }, input);
  if (!result.ok) throw new Error('SUPPLY_CONFLICT');
  return result.json();
}
async function stock(tx: Prisma.TransactionClient, userId: string) {
  const admissions = await tx.contentSupplyAdmission.findMany({
    where: { reviewerId: userId },
    include: {
      content: { include: { review: { include: { publication: true } } } },
    },
    orderBy: { createdAt: 'asc' },
  });
  const rows = admissions
    .map((a) => a.content)
    .sort((a, b) => b.revision - a.revision);
  const items: ReviewItem[] = [];
  for (const seed of catalogue) {
    const row = rows.find((r) => r.contentId === seed.contentId);
    if (!row) continue;
    const payload: unknown = JSON.parse(row.snapshot).payload;
    if (
      !exercisePayload(payload) ||
      row.rubricHash !==
        digest({ rubricId: seed.rubricId, revision: 1, payload: seed.rubric })
    )
      throw new Error('INVALID_SUPPLY_RECORD');
    const checks = checkExercise(payload, seed.rules);
    if (
      payload.learner.prompt !== seed.instance.prompt ||
      canonicalJson(payload.privateEvaluation.acceptedAnswers) !==
        canonicalJson([solveDisplayedAddition(seed.instance.prompt)])
    )
      checks.push({ code: 'family-mismatch', field: 'prompt' });
    items.push({
      id: row.id,
      contentId: row.contentId,
      contentHash: row.contentHash,
      revision: row.revision,
      title: seed.instance.prompt,
      objective: 'Rekenen · Optellen · twee cijfers 0–9 (deelgebied)',
      payload,
      rules: seed.rules,
      checks,
      decision: (row.review?.decision as 'approved' | 'rejected') ?? 'pending',
      published: !!row.review?.publication,
      advisory: {
        status: checks.length ? 'flagged' : 'clear',
        text: 'Som en sleutel worden met vaste rekenregels gecontroleerd. Controleer zelf de uitleg en geschiktheid. De familie is nog niet educatief gecertificeerd.',
        sourceHash: row.contentHash,
        provenance: 'deterministic-check',
      },
    });
  }
  return { admissions, items };
}
export async function supplyReviewBatch(
  tx: Prisma.TransactionClient,
  userId: string,
  now = new Date(),
): Promise<ReviewBatch> {
  const { items } = await stock(tx, userId);
  // Pending backlog plus this week's decisions; completed old work doesn't become a giant review queue.
  const week = amsterdamWeek(now);
  const admissions = await tx.contentSupplyAdmission.findMany({
    where: { reviewerId: userId, week },
  });
  const current = items.filter(
    (i) =>
      (!i.published && i.decision !== 'rejected') ||
      admissions.some((a) => a.contentVersionId === i.id),
  );
  const id = supplyBatchId(now);
  const progress = await tx.contentReviewProgress.findUnique({
    where: { reviewerId_batchId: { reviewerId: userId, batchId: id } },
  });
  return {
    id,
    title: 'Rekenen · Optellen — begrensde weekvoorraad',
    items: current,
    cursor: progress?.cursor ?? null,
    activeMs: progress?.totalMs ?? 0,
    supply: true,
  };
}
async function workload(
  tx: Prisma.TransactionClient,
  userId: string,
  now: Date,
) {
  const { admissions, items } = await stock(tx, userId),
    week = amsterdamWeek(now);
  const current = admissions.filter((a) => a.week === week);
  const pending = items.filter(
    (i) => !i.published && i.decision !== 'rejected',
  );
  const oldPending = pending.filter(
    (i) => !current.some((a) => a.contentVersionId === i.id),
  ).length;
  const progress = await tx.contentReviewProgress.findUnique({
    where: {
      reviewerId_batchId: { reviewerId: userId, batchId: supplyBatchId(now) },
    },
  });
  const measuredMs = progress?.totalMs ?? 0;
  return {
    items,
    admissions,
    current,
    pending,
    oldPending,
    measuredMs,
    capacity: reviewCapacity(
      current.length,
      pending.length,
      oldPending,
      measuredMs,
    ),
  };
}
export async function admitSupplyEdit(
  tx: Prisma.TransactionClient,
  userId: string,
  oldId: string,
  input: Record<string, unknown>,
  now = new Date(),
) {
  const load = await workload(tx, userId, now);
  if (!load.items.some((i) => i.id === oldId) || load.capacity < 1)
    throw new Error('REVIEW_LIMIT');
  const row = await command(tx, userId, input);
  await tx.contentSupplyAdmission.create({
    data: {
      id: randomUUID(),
      reviewerId: userId,
      week: amsterdamWeek(now),
      contentVersionId: row.id,
      contentHash: row.contentHash,
    },
  });
}
export async function supplyOverview(
  tx: Prisma.TransactionClient,
  userId: string,
  now = new Date(),
): Promise<SupplyOverview> {
  const week = amsterdamWeek(now),
    load = await workload(tx, userId, now);
  const plan = await tx.contentSupplyWeek.findUnique({
    where: { reviewerId_week: { reviewerId: userId, week } },
  });
  if (plan && plan.policyVersion !== supplyPolicyVersion)
    throw new Error('UNSUPPORTED_SUPPLY_POLICY');
  const reservations = await tx.contentSupplyReservation.findMany({
    where: { reviewerId: userId },
  });
  const recent = new Set(
    reservations
      .filter(
        (r) =>
          r.week !== week &&
          r.createdAt.getTime() >=
            now.getTime() - supplyLimits.cooldownDays * 86400000,
      )
      .map((r) => r.exposureKey),
  );
  const held = reservations.filter((r) => r.week === week);
  // Reservations pin immutable published versions. Later edits cannot rewrite an existing plan.
  const published = load.admissions.filter(
    (a) => a.content.review?.publication,
  );
  const availability = await eligibleStock(tx, requirement.id);
  const eligibleIds = new Set(
    availability.filter((s) => s.eligibility.eligible).map((s) => s.row.id),
  );
  const withdrawnIds = new Set(
    availability.filter((s) => s.row.withdrawal).map((s) => s.row.id),
  );
  const stockItems = load.items
    .filter((i) => eligibleIds.has(i.id))
    .map((i) => ({
      id: i.id,
      eligible: true,
      exposureKey: catalogue.find((s) => s.contentId === i.contentId)!.instance
        .exposureKey,
    }));
  for (const reservation of held) {
    if (
      !withdrawnIds.has(reservation.contentVersionId) &&
      published.some((a) => a.contentVersionId === reservation.contentVersionId)
    )
      stockItems.push({
        id: reservation.contentVersionId,
        eligible: true,
        exposureKey: reservation.exposureKey,
      });
  }
  const selection = selectSupply(
    plan?.demand ?? 20,
    stockItems,
    recent,
    held.map((r) => r.contentVersionId),
  );
  return {
    week,
    planned: !!plan,
    demand: plan?.demand ?? 20,
    ready: selection.readyIds.length,
    readyIds: selection.readyIds,
    shortage: selection.shortage,
    pending: load.pending.length,
    admitted: load.current.length,
    capacity: load.capacity,
    measuredMs: load.measuredMs,
    estimatedMs: load.pending.length * supplyLimits.estimateMs,
    bank: load.items.filter((i) => eligibleIds.has(i.id)).length,
    recentGroups: recent.size,
    certification: 'pending',
    automaticPublication: false,
    purpose: 'local-synthetic-practice',
  };
}
/** Must run inside the authenticated operator's locked transaction. No live AI, learner assignment or certificate authority. */
export async function prepareSupply(
  tx: Prisma.TransactionClient,
  userId: string,
  demand: number,
  now = new Date(),
) {
  selectSupply(demand, [], new Set(), []); // Validate before any write.
  const week = amsterdamWeek(now);
  await tx.contentSupplyWeek.upsert({
    where: { reviewerId_week: { reviewerId: userId, week } },
    create: { reviewerId: userId, week, demand },
    update: { demand },
  });
  let overview = await supplyOverview(tx, userId, now);
  const load = await workload(tx, userId, now);
  const candidates = catalogue.filter(
    (s) => !load.items.some((i) => i.contentId === s.contentId),
  );
  const newDrafts = load.current.filter((a) => a.content.revision === 1).length;
  const count = Math.min(
    overview.capacity,
    Math.max(0, 8 - newDrafts),
    Math.max(0, overview.shortage - overview.pending),
  );
  if (count) {
    await command(tx, userId, { action: 'register-coverage' });
    for (const seed of candidates.slice(0, count)) {
      const rubric = await command(tx, userId, {
        action: 'create-rubric',
        rubricId: seed.rubricId,
        revision: 1,
        payload: seed.rubric,
      });
      const row = await command(tx, userId, {
        action: 'create-content',
        contentId: seed.contentId,
        revision: 1,
        coverageId: requirement.id,
        rubricVersionId: rubric.id,
        payload: seed.payload,
      });
      await tx.contentSupplyAdmission.create({
        data: {
          id: randomUUID(),
          reviewerId: userId,
          week,
          contentVersionId: row.id,
          contentHash: row.contentHash,
        },
      });
    }
  }
  overview = await supplyOverview(tx, userId, now);
  for (const id of overview.readyIds) {
    const row = load.items.find((i) => i.id === id);
    if (!row) continue; // Already-pinned prior version.
    const exposureKey = catalogue.find((s) => s.contentId === row.contentId)!
      .instance.exposureKey;
    await tx.contentSupplyReservation.upsert({
      where: {
        reviewerId_week_exposureKey: { reviewerId: userId, week, exposureKey },
      },
      create: {
        id: randomUUID(),
        reviewerId: userId,
        week,
        contentVersionId: id,
        contentHash: row.contentHash,
        exposureKey,
        createdAt: now,
      },
      update: {},
    });
  }
  return supplyOverview(tx, userId, now);
}
