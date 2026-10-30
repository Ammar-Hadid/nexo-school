import { getDatabase } from '@/server/db/client';
import { localIdentityConfig } from '@/server/auth/config';
import { guardianResultsHandler } from '@/server/practice/guardian-results';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  try {
    return await guardianResultsHandler(
      getDatabase(),
      localIdentityConfig(process.env),
      request,
    );
  } catch {
    return Response.json(
      { error: 'LOCAL_IDENTITY_UNAVAILABLE' },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    );
  }
}
