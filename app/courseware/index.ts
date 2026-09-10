import type { AuthoredDay } from './types';
import { day02 } from './2026-09-02';
import { day03 } from './2026-09-03';
import { day04 } from './2026-09-04';
import { day05 } from './2026-09-05';
import { day06 } from './2026-09-06';
import { day07 } from './2026-09-07';
import { day08 } from './2026-09-08';
import { day09 } from './2026-09-09';
import { day10 } from './2026-09-10';
import { day11 } from './2026-09-11';
import { day12 } from './2026-09-12';
import { day13 } from './2026-09-13';
import { day14 } from './2026-09-14';

// No generated fallback: an unregistered date is a syllabus, not a lesson.
export const authoredDays: Record<string, AuthoredDay> = {
  '2026-09-02': day02,
  '2026-09-03': day03,
  '2026-09-04': day04,
  '2026-09-05': day05,
  '2026-09-06': day06,
  '2026-09-07': day07,
  '2026-09-08': day08,
  '2026-09-09': day09,
  '2026-09-10': day10,
  '2026-09-11': day11,
  '2026-09-12': day12,
  '2026-09-13': day13,
  '2026-09-14': day14,
};
