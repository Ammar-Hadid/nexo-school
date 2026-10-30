import 'server-only';
import type { Prisma } from '../../generated/prisma/client';
import { contentInclude, deliverySource } from '../content/eligibility';
export const assignedItemInclude = {
  question: true,
  content: { include: contentInclude },
} as const;
export type AssignedItem = Prisma.AssignmentItemGetPayload<{
  include: typeof assignedItemInclude;
}>;
/** Reuse one source resolver in learner, grader, guardian and shadow projections. Never serialize its output wholesale. */
export function assignedQuestion(item: AssignedItem) {
  if (item.question && !item.content)
    return {
      ...item.question,
      options: [] as { value: string; label: string }[],
      readingText: undefined as
        { title: string; paragraphs: string[] } | undefined,
      answerUnit: undefined as string | undefined,
      steps: [`${item.question.prompt} ${item.question.answer}`],
    };
  const row = item.content;
  const source = row && deliverySource(row);
  if (
    !row ||
    !source ||
    item.contentHash !== row.contentHash ||
    item.familyId !== source.descriptor.familyId ||
    item.exposureKey !== source.descriptor.exposureKey ||
    item.purpose !== source.descriptor.purpose
  )
    throw new Error('INVALID_ASSIGNED_CONTENT');
  return {
    id: row.id,
    prompt: source.payload.learner.prompt,
    options: source.payload.learner.options.map((label, i) => ({
      value: String.fromCharCode(97 + i),
      label,
    })),
    answerUnit: source.descriptor.answerUnit || undefined,
    readingText: source.payload.learner.passage
      ? {
          title: source.descriptor.passageTitle ?? 'Leestekst',
          paragraphs: source.payload.learner.passage.split('\n\n'),
        }
      : undefined,
    answer: source.payload.privateEvaluation.acceptedAnswers[0]!,
    steps: [source.payload.privateEvaluation.explanation],
    subject: row.coverage.subject,
    category: row.coverage.category,
    responseType: source.descriptor.responseType,
    evaluatorVersion: source.descriptor.evaluatorVersion,
    contentHash: row.contentHash,
  };
}
export async function assignmentWithdrawals(
  tx: Prisma.TransactionClient,
  assignmentId: string,
) {
  return tx.contentWithdrawal.findMany({
    where: { content: { items: { some: { assignmentId } } } },
    include: { correction: true },
    orderBy: { createdAt: 'asc' },
  });
}
