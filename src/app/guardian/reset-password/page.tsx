import { PasswordReset } from '@/modules/identity/portal/password-reset';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <PasswordReset token={token} />;
}
