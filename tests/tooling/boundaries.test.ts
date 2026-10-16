import { ESLint } from 'eslint';
import { expect, it } from 'vitest';

const eslint = new ESLint();
for (const importPath of [
  '@/server/db/client',
  '@/modules/foundation/components/foundation-notice',
]) {
  it(`shared UI cannot import ${importPath}`, async () => {
    const [result] = await eslint.lintText(
      `import * as dependency from '${importPath}'; export const probe = dependency;`,
      {
        filePath: 'src/components/boundary-probe.tsx',
      },
    );
    expect(
      result?.messages.some(
        (message) => message.ruleId === 'no-restricted-imports',
      ),
    ).toBe(true);
  });
}
