'use client';

export const OFFLINE_SYNC_EVENT = 'zhixing:offline-sync';
export const OFFLINE_STATE_EVENT = 'zhixing:offline-state';

const DATABASE_NAME = 'zhixing-learning-offline';
const DATABASE_VERSION = 1;
const SNAPSHOT_STORE = 'state-snapshots';
const OUTBOX_STORE = 'sync-outbox';

export type ProgressRow = {
  itemId: string;
  taskType?: string;
  completed: number;
  updatedAt?: string;
};

export type ProgressSummary = {
  completedDays: number;
  currentStreak: number;
  fullDayCompleted: boolean;
  completedDates: string[];
};

export type LearningState = {
  progress: ProgressRow[];
  progressSummary: ProgressSummary;
  favorites: Array<Record<string, unknown>>;
  answers: Array<Record<string, unknown>>;
  qa: Array<Record<string, unknown>>;
  notes: Array<Record<string, unknown>>;
};

export type SyncStatus = {
  online: boolean;
  pending: number;
  phase: 'offline' | 'pending' | 'syncing' | 'synced' | 'error';
  message?: string;
};

export type ProgressOperation = {
  operationId: string;
  type: 'toggle-task';
  learningDate: string;
  itemId: string;
  taskType: string;
  completed: boolean;
  clientUpdatedAt: string;
};

type SnapshotRecord = { date: string; state: LearningState; cachedAt: string };

let databasePromise: Promise<IDBDatabase> | null = null;
let flushPromise: Promise<void> | null = null;

export function emptyState(): LearningState {
  return {
    progress: [],
    progressSummary: { completedDays: 0, currentStreak: 0, fullDayCompleted: false, completedDates: [] },
    favorites: [], answers: [], qa: [], notes: [],
  };
}

function openDatabase() {
  if (databasePromise) return databasePromise;
  databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(SNAPSHOT_STORE)) database.createObjectStore(SNAPSHOT_STORE, { keyPath: 'date' });
      if (!database.objectStoreNames.contains(OUTBOX_STORE)) {
        const store = database.createObjectStore(OUTBOX_STORE, { keyPath: 'operationId' });
        store.createIndex('clientUpdatedAt', 'clientUpdatedAt');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('无法打开离线学习数据库'));
  });
  return databasePromise;
}

function idbRequest<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('离线数据读写失败'));
  });
}

function transactionDone(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('离线事务失败'));
    transaction.onabort = () => reject(transaction.error ?? new Error('离线事务已取消'));
  });
}

async function readSnapshot(date: string) {
  const database = await openDatabase();
  const transaction = database.transaction(SNAPSHOT_STORE, 'readonly');
  const done = transactionDone(transaction);
  const record = await idbRequest(transaction.objectStore(SNAPSHOT_STORE).get(date)) as SnapshotRecord | undefined;
  await done;
  return record?.state;
}

async function writeSnapshot(date: string, state: LearningState) {
  const database = await openDatabase();
  const transaction = database.transaction(SNAPSHOT_STORE, 'readwrite');
  transaction.objectStore(SNAPSHOT_STORE).put({ date, state, cachedAt: new Date().toISOString() } satisfies SnapshotRecord);
  await transactionDone(transaction);
}

async function listOperations() {
  const database = await openDatabase();
  const transaction = database.transaction(OUTBOX_STORE, 'readonly');
  const done = transactionDone(transaction);
  const operations = await idbRequest(transaction.objectStore(OUTBOX_STORE).getAll()) as ProgressOperation[];
  await done;
  return operations.sort((a, b) => a.clientUpdatedAt.localeCompare(b.clientUpdatedAt));
}

async function putOperation(operation: ProgressOperation) {
  const database = await openDatabase();
  const transaction = database.transaction(OUTBOX_STORE, 'readwrite');
  transaction.objectStore(OUTBOX_STORE).put(operation);
  await transactionDone(transaction);
}

async function deleteOperation(operationId: string) {
  const database = await openDatabase();
  const transaction = database.transaction(OUTBOX_STORE, 'readwrite');
  transaction.objectStore(OUTBOX_STORE).delete(operationId);
  await transactionDone(transaction);
}

function shanghaiDateKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

function previousDate(date: string) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() - 1);
  return value.toISOString().slice(0, 10);
}

function recalculateSummary(state: LearningState, date: string) {
  const canonical = new Set(['foundation', 'code', 'insight'].map((track) => `${date}-${track}`));
  const completed = new Set(state.progress.filter((row) => row.completed && canonical.has(row.itemId)).map((row) => row.itemId));
  const completedDates = new Set(state.progressSummary?.completedDates ?? []);
  if (completed.size === 3) completedDates.add(date); else completedDates.delete(date);
  const today = shanghaiDateKey();
  let cursor = completedDates.has(today) ? today : previousDate(today);
  let currentStreak = 0;
  while (completedDates.has(cursor)) { currentStreak += 1; cursor = previousDate(cursor); }
  state.progressSummary = {
    completedDays: completedDates.size,
    currentStreak,
    fullDayCompleted: completedDates.has(date),
    completedDates: [...completedDates].sort(),
  };
  return state;
}

export function mergeOperations(input: LearningState, date: string, operations: ProgressOperation[]) {
  const state = structuredClone(input);
  const rows = new Map(state.progress.map((row) => [row.itemId, row]));
  for (const operation of operations.filter((item) => item.learningDate === date)) {
    const current = rows.get(operation.itemId);
    if (current?.updatedAt && current.updatedAt > operation.clientUpdatedAt) continue;
    rows.set(operation.itemId, {
      itemId: operation.itemId,
      taskType: operation.taskType,
      completed: operation.completed ? 1 : 0,
      updatedAt: operation.clientUpdatedAt,
    });
  }
  state.progress = [...rows.values()];
  return recalculateSummary(state, date);
}

function emitSync(status: SyncStatus) {
  window.dispatchEvent(new CustomEvent<SyncStatus>(OFFLINE_SYNC_EVENT, { detail: status }));
}

async function emitCurrentStatus(phase?: SyncStatus['phase'], message?: string) {
  const pending = (await listOperations()).length;
  const online = navigator.onLine;
  emitSync({ online, pending, phase: phase ?? (!online ? 'offline' : pending ? 'pending' : 'synced'), message });
}

async function requestBackgroundSync() {
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  const syncRegistration = registration as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } };
  await syncRegistration.sync?.register('zhixing-progress-sync').catch(() => undefined);
}

export async function loadLearningState(date: string): Promise<LearningState> {
  const cached = await readSnapshot(date);
  if (navigator.onLine) {
    try {
      await flushProgressOutbox();
      const response = await fetch(`/api/state?date=${date}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`学习状态加载失败：${response.status}`);
      const remote = await response.json() as LearningState;
      const merged = mergeOperations(remote, date, await listOperations());
      await writeSnapshot(date, merged);
      await emitCurrentStatus();
      return merged;
    } catch {
      // A captive portal or transient outage can disagree with navigator.onLine.
    }
  }
  const local = mergeOperations(cached ?? emptyState(), date, await listOperations());
  await writeSnapshot(date, local);
  await emitCurrentStatus('offline');
  return local;
}

export async function queueProgressChange(input: { learningDate: string; itemId: string; taskType: string; completed: boolean }) {
  const operation: ProgressOperation = {
    operationId: crypto.randomUUID(),
    type: 'toggle-task',
    ...input,
    clientUpdatedAt: new Date().toISOString(),
  };
  await putOperation(operation);
  const next = mergeOperations((await readSnapshot(input.learningDate)) ?? emptyState(), input.learningDate, [operation]);
  await writeSnapshot(input.learningDate, next);
  window.dispatchEvent(new CustomEvent(OFFLINE_STATE_EVENT));
  await emitCurrentStatus(navigator.onLine ? 'pending' : 'offline');
  await requestBackgroundSync();
  if (navigator.onLine) await flushProgressOutbox();
  return next;
}

export async function flushProgressOutbox() {
  if (flushPromise) return flushPromise;
  flushPromise = (async () => {
    if (!navigator.onLine) { await emitCurrentStatus('offline'); return; }
    const operations = await listOperations();
    if (!operations.length) { await emitCurrentStatus('synced'); return; }
    await emitCurrentStatus('syncing');
    for (const operation of operations) {
      let response: Response;
      try {
        response = await fetch('/api/state', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(operation),
        });
      } catch {
        await emitCurrentStatus('offline');
        return;
      }
      if (!response.ok) {
        const detail = await response.json().catch(() => null) as { error?: string } | null;
        await emitCurrentStatus('error', detail?.error ?? `同步失败：${response.status}`);
        return;
      }
      await deleteOperation(operation.operationId);
    }
    await emitCurrentStatus('synced');
    window.dispatchEvent(new CustomEvent(OFFLINE_STATE_EVENT));
  })().finally(() => { flushPromise = null; });
  return flushPromise;
}

export async function currentSyncStatus(): Promise<SyncStatus> {
  const pending = (await listOperations()).length;
  const online = navigator.onLine;
  return { online, pending, phase: !online ? 'offline' : pending ? 'pending' : 'synced' };
}
