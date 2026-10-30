import { SavedGuardianResults } from '@/modules/practice/guardian-results/saved-guardian-results';
import type { GuardianDestination } from '@/components/guardian-navigation/guardian-navigation';
export default async function GuardianResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; task?: string }>;
}) {
  const { section, task } = await searchParams;
  const destination = (
    [
      'overview',
      'planning',
      'progress',
      'settings',
      'admin',
      'results',
    ] as GuardianDestination[]
  ).find((item) => item === section);
  return <SavedGuardianResults section={destination} initialTask={task} />;
}
