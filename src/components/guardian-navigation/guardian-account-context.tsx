'use client';
import { createContext, useContext, type ReactNode } from 'react';
const GuardianAccountContext = createContext<{
  name: string;
  actions: ReactNode;
} | null>(null);
export const useGuardianAccount = () => useContext(GuardianAccountContext);
/** The authenticated host supplies presentation only; no auth logic in shared UI. */
export function GuardianAccountProvider({
  name,
  actions,
  children,
}: {
  name: string;
  actions: ReactNode;
  children: ReactNode;
}) {
  return (
    <GuardianAccountContext value={{ name, actions }}>
      {children}
    </GuardianAccountContext>
  );
}
