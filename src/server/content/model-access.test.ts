import { expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { checkModelAccess } from './model-access';

it('uses only fixed model-information GET endpoints and never sends Mistral credentials', async () => {
  const fetcher = vi.fn(
    async (url: string | URL | Request, init?: RequestInit) => {
      expect(init?.method).toBe('GET');
      expect(init?.redirect).toBe('error');
      expect(String(url)).not.toContain('key=');
      expect(String(url)).not.toContain('mistral');
      return new Response(
        JSON.stringify({
          id: String(url).split('/').at(-1),
          name: String(url).split('/').at(-1),
        }),
      );
    },
  );
  const results = await checkModelAccess(
    {
      OPENAI_API_KEY: 'sentinel-openai',
      ANTHROPIC_API_KEY: 'sentinel-anthropic',
      GEMINI_API_KEY: 'sentinel-google',
    },
    fetcher,
  );
  expect(results).toHaveLength(7);
  expect(fetcher).toHaveBeenCalledTimes(7);
  expect(results.every((r) => r.status === 'accessible')).toBe(true);
  expect(JSON.stringify(results)).not.toContain('sentinel');
});

it('keeps missing keys and HTTP/network failures distinct without printing provider error bodies', async () => {
  const fetcher = vi.fn(async (url: string | URL | Request) => {
    if (String(url).includes('anthropic')) throw new Error('secret-sentinel');
    return new Response('secret-sentinel', { status: 404 });
  });
  const results = await checkModelAccess(
    { OPENAI_API_KEY: 'x', ANTHROPIC_API_KEY: 'x' },
    fetcher,
  );
  expect(results.filter((r) => r.status === 'missing-key')).toHaveLength(2);
  expect(results.filter((r) => r.status === 'not-accessible')).toHaveLength(2);
  expect(results.filter((r) => r.status === 'network-error')).toHaveLength(3);
  expect(JSON.stringify(results)).not.toContain('secret-sentinel');
});
