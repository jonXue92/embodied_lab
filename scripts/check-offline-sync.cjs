/* eslint-disable @typescript-eslint/no-require-imports -- isolated Node audit for browser-independent merge rules. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'app/offline-state.ts'), 'utf8');
const code = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const mod = { exports: {} };
vm.runInNewContext(code, {
  module: mod, exports: mod.exports, require, console, Date, Intl, structuredClone,
  window: {}, navigator: {}, indexedDB: {}, crypto,
}, { filename: 'app/offline-state.ts' });

const { emptyState, mergeOperations } = mod.exports;
const date = '2026-09-03';
const base = emptyState();
base.progress = ['foundation', 'code', 'insight'].map((track) => ({
  itemId: `${date}-${track}`, taskType: track, completed: 1, updatedAt: '2026-09-03T12:00:00.000Z',
}));
base.progressSummary = { completedDays: 1, currentStreak: 1, fullDayCompleted: true, completedDates: [date] };

const stale = mergeOperations(base, date, [{
  operationId: 'stale', type: 'toggle-task', learningDate: date,
  itemId: `${date}-code`, taskType: 'code', completed: false,
  clientUpdatedAt: '2026-09-03T11:59:59.000Z',
}]);
assert.equal(stale.progress.find((row) => row.itemId.endsWith('-code')).completed, 1);
assert.equal(stale.progressSummary.fullDayCompleted, true);

const newest = mergeOperations(base, date, [{
  operationId: 'newest', type: 'toggle-task', learningDate: date,
  itemId: `${date}-code`, taskType: 'code', completed: false,
  clientUpdatedAt: '2026-09-03T12:00:01.000Z',
}]);
assert.equal(newest.progress.find((row) => row.itemId.endsWith('-code')).completed, 0);
assert.equal(newest.progressSummary.fullDayCompleted, false);

const worker = fs.readFileSync(path.join(root, 'public/sw.js'), 'utf8');
for (const signal of ['CACHE_OFFLINE_CONTENT', 'zhixing-progress-sync', "url.pathname.startsWith('/api/')"]) {
  assert.ok(worker.includes(signal), `service worker missing ${signal}`);
}
console.log(JSON.stringify({ localMerge: 'passed', staleWriteProtection: 'passed', serviceWorkerContract: 'passed' }, null, 2));
