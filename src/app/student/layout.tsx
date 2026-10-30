import type { ReactNode } from 'react';
import { PortalAccess } from '@/modules/identity/portal/portal-access';
export default function StudentLayout({ children }: { children: ReactNode }) {
  return <PortalAccess role="student">{children}</PortalAccess>;
}
