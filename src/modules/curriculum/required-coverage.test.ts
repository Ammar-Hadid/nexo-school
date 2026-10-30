import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import coverage from './required-coverage.json';

it('accounts for every supplied objective line and all 34 menu headings without declaring skill evidence', () => {
  const source = readFileSync(
    'docs/research/references/2026-10-19-user-category-list.txt',
    'utf8',
  ).split('\n');
  const requiredLines = source.flatMap((line, i) =>
    /^(\d+\. .+\t|- |(?:Optelsommen|Aftreksommen|Keersommen|Deelsommen|Geldsommen|Tijdsommen|Meetsommen|Breukensommen|Meerstapssommen|Gemengde redactiesommen)\t)/.test(
      line,
    )
      ? [i + 1]
      : [],
  );
  expect([
    ...new Set(
      coverage.filter((r) => r.sourceLine > 0).map((r) => r.sourceLine),
    ),
  ]).toEqual(requiredLines);
  for (const line of requiredLines) {
    const original = source[line - 1]!;
    const labels = coverage
      .filter((r) => r.sourceLine === line)
      .map((r) => r.label);
    const wording = original.startsWith('- ')
      ? original.slice(2)
      : /^\d/.test(original)
        ? original.split('\t')[1]!
        : original.replace('\t', ': ');
    expect(labels.join(', ')).toBe(wording);
  }
  expect(new Set(coverage.map((r) => r.id)).size).toBe(coverage.length);
  expect(new Set(coverage.map((r) => r.code)).size).toBe(coverage.length);
  for (const [subject, count] of [
    ['Rekenen', 12],
    ['Taal', 7],
    ['Spelling', 5],
    ['Begrijpend Lezen', 10],
  ] as const)
    expect(
      new Set(
        coverage.filter((r) => r.subject === subject).map((r) => r.category),
      ).size,
    ).toBe(count);
  expect(coverage.find((r) => r.kind === 'coverage-gap')?.label).toBe(
    'Verbanden, tabellen en grafieken',
  );
  for (const row of coverage) {
    expect(row.definitionStatus).toBe('required-unmapped');
    expect(row.progressionPermission).toBe(false);
    expect(row.skillMappings).toBeNull();
    expect(row.independentFamilyStock).toBeNull();
    if (row.category === 'Spelling toepassen')
      expect(row.kind).toBe('practice-format');
    if (row.category === 'Redactiesommen') expect(row.subject).toBe('Rekenen');
  }
});
