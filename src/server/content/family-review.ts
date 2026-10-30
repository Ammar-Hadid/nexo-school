import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { Prisma } from '../../generated/prisma/client';
import {
  canonicalJson,
  exact,
  record,
} from '../../modules/content/content-records';
import {
  emptyFamilyDraft,
  familyDraftValid,
  familyDecision,
  type FamilyOutcome,
  type FamilyReviewState,
} from '../../modules/content/family-review/family-review-contract';
import { validFamilyDescriptor } from '../../modules/content/family-review/family-package';
import spelling from '../../modules/content/family-review/spelling-doubling-workflow-v3.json';
import { spellingFamilyReport } from './spelling-family';
import { familySourceMatches } from './family-source-compatibility';
import digits from '../../modules/content/family-review/addition-digits-v2.json';
import twoDigits from '../../modules/content/family-review/addition-two-digits-v1.json';
import type { FamilyPackage } from '../../modules/content/family-review/family-review-contract';
import { teachingAdditionReport } from './teaching-addition-family';
const hash = (value: unknown) =>
  createHash('sha256').update(canonicalJson(value)).digest('hex');
// Explicit application-owned adapters, not caller-supplied code or approval authority.
const packages = [
  { package: spelling as FamilyPackage, report: spellingFamilyReport },
  {
    package: digits as FamilyPackage,
    report: () => teachingAdditionReport('digits'),
  },
  {
    package: twoDigits as FamilyPackage,
    report: () => teachingAdditionReport('two-digits'),
  },
];
export const familyPackageHash = hash(digits);
export const familyProgressId = `family-certification:${familyPackageHash}`;
export function validateFamilyPackage(value: unknown): value is FamilyPackage {
  try {
    return packages.some(
      (entry) => canonicalJson(value) === canonicalJson(entry.package),
    );
  } catch {
    return false;
  }
}
export function resolveFamilyPackage(version = digits.version) {
  const entry = packages.find((p) => p.package.version === version);
  if (!entry) throw new Error('UNKNOWN_FAMILY_PACKAGE');
  const pkg = entry.package;
  if (!validFamilyDescriptor(pkg)) throw new Error('MALFORMED_FAMILY_PACKAGE');
  if (process.env.NODE_ENV !== 'production') {
    for (const path of Object.keys(pkg.sources)) {
      if (
        !familySourceMatches(
          pkg,
          path,
          createHash('sha256').update(readFileSync(path)).digest('hex'),
        )
      )
        throw new Error('STALE_FAMILY_SOURCE');
    }
  }
  const report = entry.report();
  if (
    report.technical.mismatches ||
    report.contractHash !== pkg.contractHash ||
    report.inventoryHash !== pkg.inventoryHash ||
    hash(pkg.contract) !== report.contractHash ||
    hash(pkg.inventory) !== report.inventoryHash ||
    canonicalJson(pkg.technical) !== canonicalJson(report.technical) ||
    pkg.examples.some(
      (e) =>
        canonicalJson(report.items[e.index]) !==
        canonicalJson(
          Object.fromEntries(Object.entries(e).filter(([k]) => k !== 'reason')),
        ),
    )
  )
    throw new Error('STALE_FAMILY_PACKAGE');
  const packageHash = hash(pkg);
  return {
    package: structuredClone(pkg),
    packageHash,
    progressId: `family-certification:${packageHash}`,
  };
}
export function currentFamilyPackage() {
  return resolveFamilyPackage().package;
}
export async function familyReviewState(
  tx: Prisma.TransactionClient,
  reviewerId: string,
  version?: string,
): Promise<FamilyReviewState> {
  const {
    package: pkg,
    packageHash: familyPackageHash,
    progressId: familyProgressId,
  } = resolveFamilyPackage(version);
  const draft = await tx.familyReviewDraft.findUnique({
    where: {
      reviewerId_packageHash: { reviewerId, packageHash: familyPackageHash },
    },
  });
  const history = await tx.familyReviewDecision.findMany({
    where: { reviewerId, packageHash: familyPackageHash },
    orderBy: { revision: 'desc' },
  });
  const progress = await tx.contentReviewProgress.findUnique({
    where: { reviewerId_batchId: { reviewerId, batchId: familyProgressId } },
  });
  return {
    package: pkg,
    packageHash: familyPackageHash,
    revision: draft?.revision ?? 0,
    draft: draft ? JSON.parse(draft.snapshot) : emptyFamilyDraft(pkg),
    activeMs: progress?.totalMs ?? 0,
    history: history.map((r) => ({
      id: r.id,
      revision: r.revision,
      outcome: r.outcome as FamilyOutcome,
      createdAt: r.createdAt.toISOString(),
      reviewerId: r.reviewerId,
      snapshot: r.snapshot,
    })),
    automaticPublication: false,
  };
}
/** Authenticated, locked operator transaction only. No issuance or publication authority is added. */
export async function familyReviewCommand(
  tx: Prisma.TransactionClient,
  reviewerId: string,
  input: unknown,
  version?: string,
) {
  const { package: proposedPackage, packageHash: familyPackageHash } =
    resolveFamilyPackage(version);
  if (
    !record(input) ||
    !['save', 'record'].includes(String(input.action)) ||
    !exact(
      input,
      input.action === 'record'
        ? ['action', 'packageHash', 'revision', 'draft', 'confirmed']
        : ['action', 'packageHash', 'revision', 'draft'],
    ) ||
    input.packageHash !== familyPackageHash ||
    !Number.isSafeInteger(input.revision) ||
    Number(input.revision) < 0 ||
    !familyDraftValid(input.draft, proposedPackage)
  )
    throw new Error('FAMILY_REVIEW_CONFLICT');
  const outcome = familyDecision(input.draft, proposedPackage);
  if (
    input.action === 'record' &&
    (input.confirmed !== true || outcome === 'incomplete')
  )
    throw new Error('INCOMPLETE_FAMILY_REVIEW');
  const snapshot = canonicalJson(input.draft),
    revision = Number(input.revision) + 1,
    where = {
      reviewerId_packageHash: { reviewerId, packageHash: familyPackageHash },
    };
  const old = await tx.familyReviewDraft.findUnique({ where });
  if (
    old?.revision === revision &&
    old.snapshot === snapshot &&
    old.lastAction === input.action
  )
    return familyReviewState(tx, reviewerId, version);
  if ((old?.revision ?? 0) !== input.revision)
    throw new Error('FAMILY_REVIEW_CONFLICT');
  const fields = { revision, lastAction: String(input.action), snapshot };
  await tx.familyReviewDraft.upsert({
    where,
    create: { reviewerId, packageHash: familyPackageHash, ...fields },
    update: fields,
  });
  if (input.action === 'record') {
    await tx.familyReviewDecision.create({
      data: {
        id: randomUUID(),
        reviewerId,
        packageHash: familyPackageHash,
        revision,
        outcome,
        snapshot,
        packageSnapshot: canonicalJson(proposedPackage),
      },
    });
    await tx.identityAudit.create({
      data: {
        id: randomUUID(),
        userId: reviewerId,
        event: 'family-review-decision-recorded',
      },
    });
  }
  return familyReviewState(tx, reviewerId, version);
}
