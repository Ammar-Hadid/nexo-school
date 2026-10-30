import { NexaiCompanion } from '../../../components/nexai/nexai';
/** Full-body composition; the same shared companion appears across student pages. */
export function PracticeTasksNexai({ message }: { message: string }) {
  return <NexaiCompanion message={message} />;
}
