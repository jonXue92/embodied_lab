import LessonPage from '@/app/LessonPage';
import { allLessonIds } from '@/app/curriculum';

export function generateStaticParams() {
  return allLessonIds().map((id) => ({ id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LessonPage lessonId={id} />;
}
