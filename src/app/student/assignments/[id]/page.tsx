import { SavedExercise } from '@/modules/practice/saved/saved-exercise';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SavedExercise key={id} id={id} />;
}
