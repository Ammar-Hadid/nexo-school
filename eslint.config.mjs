import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import storybook from 'eslint-plugin-storybook';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  ...storybook.configs['flat/recommended'],
  prettier,
  globalIgnores([
    '.next/**',
    'src/generated/**',
    'spikes/**',
    'storybook-static/**',
    'test-results/**',
    'playwright-report/**',
    '.artifacts/**',
    'coverage/**',
    'next-env.d.ts',
  ]),
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/spikes/**'],
              message:
                'The disposable auth spike is not an application dependency.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/components/**/*.{ts,tsx}',
      'src/modules/**/components/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/server/**',
                '**/server/**',
                '@/generated/**',
                '**/generated/**',
                '@prisma/*',
                'pg',
                'better-auth',
                'better-auth/**',
                '@better-auth/passkey',
                '**/spikes/**',
              ],
              message:
                'Presentation must consume safe props; server adapters and spike code stay outside UI.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/modules/**',
                '**/modules/**',
                '@/server/**',
                '**/server/**',
                '@/generated/**',
                '**/generated/**',
                '@prisma/*',
                'pg',
                'better-auth',
                'better-auth/**',
                '@better-auth/passkey',
                '**/spikes/**',
              ],
              message:
                'Shared UI cannot own domain or infrastructure dependencies.',
            },
          ],
        },
      ],
    },
  },
]);
