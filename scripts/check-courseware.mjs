import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import katex from 'katex';
import { loadTs, proseSimilarity, projectRoot } from './load-courseware.mjs';

const { authoredDays } = loadTs('app/courseware/index.ts');
const curriculum = loadTs('app/curriculum.ts');
const { addDays, getDailyLearningPlan, getLessonById, getDynamicRubric, shanghaiDateKey, isCurriculumDate } = curriculum;
const tracks = ['foundation', 'code', 'insight'];
const paragraphs = new Map(), codes = new Set(), questions = new Set();
const entries = [];
let formulas = 0;

assert.equal(shanghaiDateKey(new Date('2026-09-02T15:59:59Z')), '2026-09-02');
assert.equal(shanghaiDateKey(new Date('2026-09-02T16:00:00Z')), '2026-09-03');
assert.equal(isCurriculumDate('2026-09-31'), false);
assert.equal(isCurriculumDate('2026-12-31'), true);

for (const [date, day] of Object.entries(authoredDays)) {
  const plan = getDailyLearningPlan(date);
  assert.equal(plan.contentStatus, 'ready');
  assert.ok(day.question.reference.length >= 80, date + ': daily answer too shallow');
  assert.ok(!questions.has(day.question.title), date + ': duplicate daily question');
  questions.add(day.question.title);
  let minutes = 0;
  for (const track of tracks) {
    const lesson = day.lessons[track];
    const id = date + '-' + track;
    assert.ok(lesson && lesson.prerequisites && lesson.connection, id + ': missing learning context');
    assert.ok(lesson.sections.length >= 4, id + ': too few teaching sections');
    const prose = lesson.sections.map((section) => section.body).join('\n');
    assert.ok(prose.length >= 900, id + ': insufficient explanatory prose: ' + prose.length);
    assert.ok(lesson.sources.length >= 1 && lesson.sources.every((s) => s.reading && s.url.startsWith('https://')), id + ': missing primary-source reading location');
    assert.ok(lesson.exercise?.steps.length >= 2 && lesson.exercise.solution.length >= 35, id + ': exercise/solution missing');
    assert.ok(lesson.codeNotes?.length >= 2, id + ': code explanation missing');
    assert.ok(lesson.quiz.reference.length >= 50 && lesson.quiz.keywords.length >= 4, id + ': topic-specific rubric missing');
    assert.ok(!questions.has(lesson.quiz.question), id + ': duplicate self-check');
    questions.add(lesson.quiz.question);
    assert.ok(!codes.has(lesson.code), id + ': repeated code sample');
    codes.add(lesson.code);
    let lessonFormulas = 0;
    for (const section of lesson.sections) {
      assert.ok(section.body.split('\n\n').length >= 2, id + ': section is only a one-line outline');
      for (const paragraph of section.body.split('\n\n')) {
        assert.ok(paragraph.length >= 65, id + ': under-explained paragraph');
        assert.ok(!paragraphs.has(paragraph), id + ': copied paragraph from ' + paragraphs.get(paragraph));
        paragraphs.set(paragraph, id);
      }
      for (const sourceId of section.sourceIds ?? []) assert.ok(lesson.sources.some((s) => s.id === sourceId), id + ': unresolved citation ' + sourceId);
      for (const formula of section.formulas ?? []) {
        katex.renderToString(formula.latex, { throwOnError: true, strict: 'error', trust: false });
        assert.ok(formula.explanation.length >= 25, id + ': formula lacks notation explanation');
        formulas++; lessonFormulas++;
      }
    }
    if (track !== 'code') assert.ok(lessonFormulas >= 1, id + ': no formula or quantitative model');
    assert.equal(getLessonById(id).lesson.quiz.id, 'quiz-' + id);
    assert.equal(getDynamicRubric('quiz-' + id).answer, lesson.quiz.reference);
    assert.deepEqual(getDynamicRubric('quiz-' + id).keywords, lesson.quiz.keywords);
    minutes += lesson.minutes;
    entries.push({ id, track, prose, length: prose.length });
  }
  assert.ok(minutes <= 105, date + ': leaves no review time within 120-minute budget');
}

let maxPair = { similarity: 0, a: '', b: '' };
for (let i = 0; i < entries.length; i++) {
  for (let j = i + 1; j < entries.length; j++) {
    if (entries[i].track !== entries[j].track) continue;
    const similarity = proseSimilarity(entries[i].prose, entries[j].prose);
    assert.ok(similarity < 0.28, 'Repeated body despite different titles: ' + entries[i].id + ' / ' + entries[j].id);
    if (similarity > maxPair.similarity) maxPair = { similarity, a: entries[i].id, b: entries[j].id };
  }
}

// Require all opened dates and the next learning day. The scheduler targets a
// four-day reserve, but can never publish with today's/tomorrow's body missing.
const requested = process.argv.find((arg) => arg.startsWith('--through='))?.slice(10);
const through = requested ?? [addDays(shanghaiDateKey(), 1), curriculum.COURSE_END_DATE].sort()[0];
assert.ok(isCurriculumDate(through), 'Invalid coverage date: ' + through);
for (let date = curriculum.COURSE_START_DATE; date <= through; date = addDays(date, 1)) {
  assert.equal(getDailyLearningPlan(date).contentStatus, 'ready', date + ': missing authored courseware');
}
const planned = '2026-12-31';
if (!authoredDays[planned]) {
  assert.equal(getDailyLearningPlan(planned).contentStatus, 'planned');
  assert.equal(getLessonById(planned + '-foundation'), null);
  assert.equal(getDynamicRubric('daily-' + planned), null);
}

const comparison = tracks.map((track) => {
  const body = (date) => getLessonById(date + '-' + track).lesson.sections.map((s) => s.body).join('\n');
  return { track, similarity: proseSimilarity(body('2026-09-02'), body('2026-09-03')) };
});
if (process.argv.includes('--compare-baseline')) {
  const oldSource = execFileSync('git', ['show', 'c6eb88a4d7d48204dac39b602faf46485d095297:app/curriculum.ts'], { cwd: projectRoot, encoding: 'utf8' });
  const old = loadTs('app/curriculum.ts', oldSource);
  for (const row of comparison) {
    const body = (date) => old.getLessonById(date + '-' + row.track).lesson.sections.map((s) => s.body).join('\n');
    row.oldSimilarity = proseSimilarity(body('2026-09-02'), body('2026-09-03'));
  }
}
console.log(JSON.stringify({
  authoredDates: Object.keys(authoredDays), lessons: entries.length, formulas,
  minProseCharacters: Math.min(...entries.map((e) => e.length)),
  maxSameTrackSimilarity: maxPair, september02vs03: comparison, requiredCoverageThrough: through,
  note: 'Similarity is a 5-character Jaccard screening signal, not proof of teaching quality.',
}, null, 2));
