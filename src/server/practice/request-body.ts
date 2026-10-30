import 'server-only';
/** Shared bounded JSON reader for synthetic assignment commands. */
export async function requestBody(
  request: Request,
): Promise<Record<string, unknown> | null> {
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json')
    return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 1024) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  try {
    const body: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    return body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
