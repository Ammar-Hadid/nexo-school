export type PortalSession =
  | {
      role: 'guardian';
      name: string;
      fresh: boolean;
      freshUntil: number;
      operator: boolean;
    }
  | { role: 'student'; name: string }
  | { role: 'setup' };
export class PortalError extends Error {
  constructor(public status: number) {
    super(
      status === 429
        ? 'Te veel pogingen. Wacht even en probeer opnieuw.'
        : 'Niet gelukt. Controleer je gegevens en probeer opnieuw.',
    );
  }
}
export async function portalRequest<T = { ok: boolean }>(
  path: string,
  body?: object,
): Promise<T> {
  const response = await fetch(path, {
    cache: 'no-store',
    ...(body
      ? {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        }
      : {}),
  });
  if (!response.ok) throw new PortalError(response.status);
  return response.json();
}
export const authRequest = <T = { ok: boolean }>(path: string, body?: object) =>
  portalRequest<T>(`/api/auth${path}`, body);
