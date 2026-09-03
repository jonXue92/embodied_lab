import { spawnSync } from 'node:child_process';
import { loadTs } from './load-courseware.mjs';

const { authoredDays } = loadTs('app/courseware/index.ts');
const python = process.env.COURSE_TEST_PYTHON || 'python3';
let failures = 0, count = 0;
for (const [date, day] of Object.entries(authoredDays)) {
  for (const [track, lesson] of Object.entries(day.lessons)) {
    // Authored repository snippets only. These fixtures contain no network,
    // filesystem writes, driver imports or physical-device commands.
    const result = spawnSync(python, ['-c', lesson.code], {
      encoding: 'utf8', timeout: 30_000,
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' },
    });
    const id = date + '-' + track;
    if (result.status !== 0) {
      failures++;
      console.error('FAIL ' + id + '\n' + (result.stderr || result.error?.message));
    } else {
      console.log('PASS ' + id + ': ' + result.stdout.trim().replaceAll('\n', ' | '));
    }
    count++;
  }
}
console.log(count + ' examples, ' + failures + ' failures');
if (failures) process.exitCode = 1;
