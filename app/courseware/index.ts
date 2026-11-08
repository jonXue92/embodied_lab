import { day73 } from './2026-11-12';
import type { AuthoredDay } from './types';
import { day69 } from './2026-11-08';
import { day70 } from './2026-11-09';
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
import { day15 } from './2026-09-15';
import { day16 } from './2026-09-16';
import { day17 } from './2026-09-17';
import { day18 } from './2026-09-18';
import { day19 } from './2026-09-19';
import { day20 } from './2026-09-20';
import { day21 } from './2026-09-21';
import { day22 } from './2026-09-22';
import { day23 } from './2026-09-23';
import { day24 } from './2026-09-24';
import { day25 } from './2026-09-25';
import { day26 } from './2026-09-26';
import { day27 } from './2026-09-27';
import { day28 } from './2026-09-28';
import { day29 } from './2026-09-29';
import { day30 } from './2026-09-30';
import { day31 } from './2026-10-01';
import { day32 } from './2026-10-02';
import { day33 } from './2026-10-03';
import { day34 } from './2026-10-04';
import { day35 } from './2026-10-05';
import { day36 } from './2026-10-06';
import { day37 } from './2026-10-07';
import { day38 } from './2026-10-08';
import { day39 } from './2026-10-09';
import { day40 } from './2026-10-10';
import { day41 } from './2026-10-11';
import { day42 } from './2026-10-12';
import { day43 } from './2026-10-13';
import { day44 } from './2026-10-14';
import { day45 } from './2026-10-15';
import { day46 } from './2026-10-16';
import { day47 } from './2026-10-17';
import { day48 } from './2026-10-18';
import { day49 } from './2026-10-19';
import { day50 } from './2026-10-20';
import { day51 } from './2026-10-21';
import { day52 } from './2026-10-22';
import { day53 } from './2026-10-23';
import { day54 } from './2026-10-24';
import { day55 } from './2026-10-25';
import { day56 } from './2026-10-26';
import { day57 } from './2026-10-27';
import { day58 } from './2026-10-28';
import { day59 } from './2026-10-29';
import { day60 } from './2026-10-30';
import { day61 } from './2026-10-31';
import { day62 } from './2026-11-01';
import { day63 } from './2026-11-02';
import { day64 } from './2026-11-03';
import { day65 } from './2026-11-04';
import { day66 } from './2026-11-05';
import { day67 } from './2026-11-06';
import { day68 } from './2026-11-07';

// No generated fallback: an unregistered date is a syllabus, not a lesson.
import { day71 } from './2026-11-10';
import { day72 } from './2026-11-11';

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
  '2026-09-15': day15,
  '2026-09-16': day16,
  '2026-09-17': day17,
  '2026-09-18': day18,
  '2026-09-19': day19,
  '2026-09-20': day20,
  '2026-09-21': day21,
  '2026-09-22': day22,
  '2026-09-23': day23,
  '2026-09-24': day24,
  '2026-09-25': day25,
  '2026-09-26': day26,
  '2026-09-27': day27,
  '2026-09-28': day28,
  '2026-09-29': day29,
  '2026-09-30': day30,
  '2026-10-01': day31,
  '2026-10-02': day32,
  '2026-10-03': day33,
  '2026-10-04': day34,
  '2026-10-05': day35,
  '2026-10-06': day36,
  '2026-10-07': day37,
  '2026-10-08': day38,
  '2026-10-09': day39,
  '2026-10-10': day40,
  '2026-10-11': day41,
  '2026-10-12': day42,
  '2026-10-13': day43,
  '2026-10-14': day44,
  '2026-10-15': day45,
  '2026-10-16': day46,
  '2026-10-17': day47,
  '2026-10-18': day48,
  '2026-10-19': day49,
  '2026-10-20': day50,
  '2026-10-21': day51,
  '2026-10-22': day52,
  '2026-10-23': day53,
  '2026-10-24': day54,
  '2026-10-25': day55,
  '2026-10-26': day56,
  '2026-10-27': day57,
  '2026-10-28': day58,
  '2026-10-29': day59,
  '2026-10-30': day60,
  '2026-10-31': day61,
  '2026-11-01': day62,
  '2026-11-02': day63,
  '2026-11-03': day64,
  '2026-11-04': day65,
  '2026-11-05': day66,
  '2026-11-06': day67,
  '2026-11-07': day68,
  '2026-11-08': day69,
  '2026-11-09': day70,
  '2026-11-10': day71,
  '2026-11-11': day72,
  '2026-11-12': day73,
};
