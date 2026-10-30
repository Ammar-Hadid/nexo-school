import { getDatabase } from '@/server/db/client';
import { localIdentityConfig } from '@/server/auth/config';
import { identityHandler } from '@/server/auth/service';
export const runtime = 'nodejs';
async function handle(request: Request) {
  try {
    const config = localIdentityConfig(process.env);
    return await identityHandler(getDatabase(), config, request);
  } catch {
    return Response.json(
      { error: 'LOCAL_IDENTITY_UNAVAILABLE' },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    );
  }
}
export const GET = handle;
export const POST = handle;
