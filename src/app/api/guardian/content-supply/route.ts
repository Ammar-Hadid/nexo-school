import { getDatabase } from '@/server/db/client';
import { localIdentityConfig } from '@/server/auth/config';
import { contentReviewHandler } from '@/server/content/review';
export const runtime = 'nodejs';
async function handle(request: Request) {
  try {
    return await contentReviewHandler(
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
