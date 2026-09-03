import type { Lesson } from '../content';

export type AuthoredLesson = Omit<Lesson, 'type' | 'duration' | 'quiz'> & {
  minutes: number;
  quiz: Omit<Lesson['quiz'], 'id'> & { keywords: string[] };
};
export type AuthoredDay = {
  reviewedAt: string;
  revision: string;
  deliverable: string;
  question: { title: string; summary: string; keywords: string[]; reference: string };
  lessons: Record<'foundation' | 'code' | 'insight', AuthoredLesson>;
};
