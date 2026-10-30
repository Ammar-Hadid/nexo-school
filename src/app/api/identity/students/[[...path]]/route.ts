import { getDatabase } from '@/server/db/client';
import { localIdentityConfig } from '@/server/auth/config';
import { studentsHandler } from '@/server/identity/students';

export const runtime = 'nodejs';
async function handle(request: Request) {
  try {
    const config = localIdentityConfig(process.env);
    return await studentsHandler(getDatabase(), config, request);
  } catch {
    return Response.json(
      { error: 'LOCAL_IDENTITY_UNAVAILABLE' },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    );
  }
}
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
