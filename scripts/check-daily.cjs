/* eslint-disable @typescript-eslint/no-require-imports -- This isolated Node test is intentionally CommonJS. */
// Isolated audit: never connects to the deployed D1 database.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { DatabaseSync } = require('node:sqlite');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const db = new DatabaseSync(':memory:');
const cache = new Map();
let clock = Date.parse('2026-09-03T15:59:59.500Z');
class AuditDate extends Date { constructor(...args) { super(...(args.length ? args : [clock])); } static now() { return clock; } }
const timers = new Map(); let nextTimer = 0;
const events = { document: new Map(), window: new Map() };
const target = (type) => ({ addEventListener: (name, fn) => events[type].set(name, fn), removeEventListener: (name) => events[type].delete(name) });
function prepare(sql) {
  let values = [];
  return { bind(...args) { values = args; return this; }, async run() { db.prepare(sql).run(...values); return { success: true }; }, all() {
    const stmt = db.prepare(sql);
    return { results: stmt.columns().length ? stmt.all(...values) : (stmt.run(...values), []) };
  } };
}
const DB = { prepare, batch: async (statements) => statements.map((s) => s.all()) };
function load(file) {
  file = path.resolve(root, file);
  if (cache.has(file)) return cache.get(file).exports;
  const mod = { exports: {} }; cache.set(file, mod);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  const req = (name) => name === 'cloudflare:workers' ? { env: { DB } } : name.startsWith('@/') ? load(name.slice(2) + '.ts') : name.startsWith('.') ? load(fs.existsSync(path.resolve(path.dirname(file), name + '.ts')) ? path.resolve(path.dirname(file), name + '.ts') : path.resolve(path.dirname(file), name, 'index.ts')) : require(name);
  vm.runInNewContext(code, { module: mod, exports: mod.exports, require: req, Date: AuditDate, Intl, URL, Request, Response, crypto, console,
    setTimeout: (fn, delay) => { const id = ++nextTimer; timers.set(id, { fn, delay }); return id; }, clearTimeout: (id) => timers.delete(id),
    document: target('document'), window: target('window') }, { filename: file });
  return mod.exports;
}
(async () => {
  const c = load('app/curriculum.ts');
  assert.equal(c.TOTAL_LEARNING_DAYS, 122);
  const ids = c.allLessonIds(); assert.equal(ids.length, 366); assert.equal(new Set(ids).size, 366);
  for (const id of ids) {
    const entry = c.getLessonById(id);
    if (!entry) {
      assert.equal(c.getDailyLearningPlan(id.slice(0, 10)).contentStatus, 'planned');
      assert.equal(c.getDynamicRubric('quiz-' + id), null);
      continue;
    }
    const { lesson, task, plan } = entry;
    assert.equal(plan.tasks.length, 3); assert.equal(task.learningDate, plan.date);
    assert.equal(new Set(plan.tasks.map((t) => t.track)).size, 3);
    for (const key of ['title', 'intro', 'duration', 'codeTitle', 'code']) assert.ok(lesson[key]?.trim(), `${id}: ${key}`);
    for (const key of ['outcomes', 'sections', 'points']) assert.ok(lesson[key]?.length >= 2, `${id}: ${key}`);
    assert.ok(lesson.sections.every((s) => s.heading && s.body));
    assert.ok(lesson.sources.every((s) => /^https:\/\//.test(s.url)));
    assert.ok(lesson.quiz.question && lesson.quiz.hint && lesson.quiz.reference);
    assert.ok(plan.question.title && plan.question.reference && plan.question.summary);
    assert.ok(c.getDynamicRubric(lesson.quiz.id)); assert.ok(c.getDynamicRubric(plan.question.id));
  }
  for (const date of ['2026-08-31','2027-01-01','2026-09-31','2026-11-31','2026-09-00','2026-9-3']) {
    assert.equal(c.isCurriculumDate(date), false, date); assert.equal(c.getDailyLearningPlan(date), null, date);
  }
  assert.equal(c.shanghaiDateKey(new Date('2026-09-03T15:59:59.999Z')), '2026-09-03');
  assert.equal(c.shanghaiDateKey(new Date('2026-09-03T16:00:00.000Z')), '2026-09-04');
  const observed = []; const stop = load('app/learning-clock.ts').observeShanghaiDate((date) => observed.push(date));
  assert.equal(observed.at(-1), '2026-09-03'); assert.equal([...timers.values()][0].delay, 500);
  clock += 500; [...timers.values()][0].fn(); assert.equal(observed.at(-1), '2026-09-04');
  clock = Date.parse('2026-09-05T01:00:00Z'); events.document.get('visibilitychange')(); assert.equal(observed.at(-1), '2026-09-05');
  events.window.get('focus')(); assert.equal(timers.size, 1); stop(); assert.equal(timers.size, 0); assert.equal(events.document.size + events.window.size, 0);
  // Apply the complete migration journal in a fresh database; retain fixtures from older schemas.
  const journal = JSON.parse(fs.readFileSync(path.join(root, 'drizzle/meta/_journal.json')));
  for (const entry of journal.entries) {
    const sql = fs.readFileSync(path.join(root, `drizzle/${entry.tag}.sql`), 'utf8');
    assert.ok(!/\b(DROP|DELETE|TRUNCATE)\b/i.test(sql)); db.exec(sql);
    if (entry.idx === 0) db.exec("INSERT INTO progress VALUES ('vla-map',1,'audit-fixture'); INSERT INTO answers VALUES ('fixture','keep',80,'keep','audit-fixture'); INSERT INTO favorites VALUES ('fixture','course','keep','keep','audit-fixture')");
  }
  db.exec("INSERT INTO notes VALUES ('fixture','keep','keep','keep','audit-fixture','audit-fixture'); INSERT INTO learning_answers VALUES ('fixture','fixture','keep','keep','keep',80,'keep','keep','audit-fixture'); INSERT INTO qa_conversations VALUES ('fixture','keep','keep','audit-fixture')");
  const protectedTables = ['progress','answers','favorites','learning_answers','notes','qa_conversations'];
  const snapshot = () => JSON.stringify(protectedTables.map((t) => db.prepare(`SELECT * FROM ${t}`).all()));
  const before = snapshot();
  clock = Date.parse('2026-09-03T15:27:48Z');
  const api = load('app/api/state/route.ts');
  const get = async (date) => (await api.GET(new Request(`https://audit.invalid/api/state?date=${date}`))).json();
  const toggle = (date, track, completed = true, itemId = `${date}-${track}`) => api.POST(new Request('https://audit.invalid/api/state', { method: 'POST', body: JSON.stringify({ type: 'toggle-task', learningDate: date, itemId, taskType: track, completed }) }));
  assert.equal((await get('2026-09-01')).progressSummary.completedDays, 0);
  assert.equal((await get('2026-09-01')).progress.filter((r) => r.completed).length, 1);
  for (const track of ['foundation','code']) assert.equal((await toggle('2026-09-03',track)).status, 200);
  assert.equal((await get('2026-09-03')).progressSummary.fullDayCompleted, false);
  assert.equal((await toggle('2026-09-03','insight')).status, 200);
  assert.equal((await get('2026-09-03')).progressSummary.fullDayCompleted, true);
  await toggle('2026-09-03','code',false); assert.equal((await get('2026-09-03')).progressSummary.fullDayCompleted, false);
  await toggle('2026-09-03','code');
  for (const track of ['foundation','code','insight']) await toggle('2026-09-02',track);
  assert.equal((await get('2026-09-03')).progressSummary.currentStreak, 2);
  for (const args of [['2026-09-04','foundation'],['2026-09-31','code'],['2026-09-03','code',true,'2026-09-03-fake'],['2026-09-03','code',true,'2026-09-03-foundation'],['2026-09-03','code','false']]) assert.equal((await toggle(...args)).status, 400);
  for (const [i,track] of ['foundation','code','insight'].entries()) db.prepare('INSERT INTO daily_progress VALUES (?,?,?,?,?,?)').run(`fake-${i}`,'2026-09-01',`2026-09-01-fake-${i}`,track,1,'fixture');
  assert.equal((await get('2026-09-01')).progressSummary.fullDayCompleted, false);
  assert.equal((await get('2026-09-04')).progressSummary.fullDayCompleted, false);
  clock = Date.parse('2026-12-31T10:00:00Z');
  assert.equal((await toggle('2026-12-31','foundation')).status, 400, 'unprepared course cannot be checked in');
  const answer = (questionId, date) => api.POST(new Request('https://audit.invalid/api/state', { method: 'POST', body: JSON.stringify({ type: 'answer', learningDate: date, questionId, answer: 'test answer for rejection only' }) }));
  assert.equal((await answer('daily-2026-12-31','2026-12-31')).status, 400);
  assert.equal((await answer('quiz-2026-09-03-code','2026-09-02')).status, 400);
  assert.equal((await answer('quiz-2026-09-03-fake','2026-09-03')).status, 400);
  assert.equal(snapshot(), before, 'Learning records outside the synthetic progress fixtures must stay unchanged');
  console.log(JSON.stringify({ plannedDays: 122, plannedLessonIds: ids.length, authoredLessonCount: ids.filter((id) => c.getLessonById(id)).length, focusDates: ['2026-09-03','2026-09-04'].map((date) => c.getDailyLearningPlan(date).tasks.map((t) => t.title)), midnightAndResume: 'passed', strictCheckIns: 'passed', migrations: journal.entries.length, preservedTables: protectedTables }, null, 2));
  db.close();
})().catch((error) => { console.error(error); process.exitCode = 1; });
