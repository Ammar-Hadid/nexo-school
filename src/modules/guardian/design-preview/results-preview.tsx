import { GuardianResultBrowser } from '../results/guardian-result-browser';
import { resultTasks } from './preview-data';
import { TaskReviewPreview } from './task-review-preview';
export function ResultsPreview({
  selectedId,
  onSelect,
}: {
  selectedId?: string;
  onSelect: (id?: string) => void;
}) {
  return (
    <GuardianResultBrowser
      tasks={resultTasks}
      selectedId={selectedId}
      onSelect={onSelect}
      detailAction={<TaskReviewPreview key={selectedId} />}
    />
  );
}
