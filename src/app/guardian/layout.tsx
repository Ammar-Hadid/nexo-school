import type { ReactNode } from 'react';
import { PortalAccess } from '@/modules/identity/portal/portal-access';
export default function GuardianLayout({ children }: { children: ReactNode }) {
  return <PortalAccess role="guardian">{children}</PortalAccess>;
}
