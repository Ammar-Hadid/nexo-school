import { getDatabase } from '@/server/db/client';
import { localIdentityConfig } from '@/server/auth/config';
import { contentDeliveryHandler } from '@/server/content/delivery';
export const runtime = 'nodejs';
async function handle(request: Request) {
  try {
    return await contentDeliveryHandler(
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
export { handle as GET, handle as POST };
