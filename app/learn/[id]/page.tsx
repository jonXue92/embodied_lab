import LessonPage from '@/app/LessonPage';
import { lessons } from '@/app/content';

export function generateStaticParams() {
  return Object.keys(lessons).map((id) => ({ id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LessonPage lessonId={id} />;
}
