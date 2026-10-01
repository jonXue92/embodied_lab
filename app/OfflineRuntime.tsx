'use client';

import { useEffect, useState } from 'react';
import { allLessonIds, getLessonById } from './curriculum';
import { currentSyncStatus, flushProgressOutbox, OFFLINE_SYNC_EVENT, type SyncStatus } from './offline-state';

type WorkerMessage = { type?: string; pending?: number; error?: string; ready?: boolean };

const initialStatus: SyncStatus = { online: true, pending: 0, phase: 'synced' };

export default function OfflineRuntime() {
  const [status, setStatus] = useState<SyncStatus>(initialStatus);
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    let active = true;
    const update = (next: SyncStatus) => { if (active) setStatus(next); };
    const onSync = (event: Event) => update((event as CustomEvent<SyncStatus>).detail);
    const refresh = () => { currentSyncStatus().then(update).catch(() => undefined); };
    const onOnline = () => { flushProgressOutbox().then(refresh).catch(refresh); };
    const onOffline = () => refresh();
    const onVisible = () => { if (document.visibilityState === 'visible') onOnline(); };
    const onWorkerMessage = (event: MessageEvent<WorkerMessage>) => {
      if (event.data?.type === 'OFFLINE_CONTENT_READY') setContentReady(Boolean(event.data.ready));
      if (event.data?.type === 'SYNC_COMPLETE') onOnline();
      if (event.data?.type === 'SYNC_ERROR') update({ online: navigator.onLine, pending: event.data.pending ?? 1, phase: 'error', message: event.data.error });
    };

    window.addEventListener(OFFLINE_SYNC_EVENT, onSync);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('focus', onOnline);
    document.addEventListener('visibilitychange', onVisible);
    navigator.serviceWorker?.addEventListener('message', onWorkerMessage);
    refresh();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(async (registration) => {
        await navigator.storage?.persist?.().catch(() => false);
        const lessonUrls = allLessonIds().filter((id) => getLessonById(id)).map((id) => `/learn/${id}`);
        const ready = await navigator.serviceWorker.ready;
        (ready.active ?? registration.active)?.postMessage({ type: 'CACHE_OFFLINE_CONTENT', urls: ['/', ...lessonUrls] });
        await flushProgressOutbox();
      }).catch(() => update({ online: navigator.onLine, pending: 0, phase: 'error', message: '离线课程初始化失败' }));
    }

    return () => {
      active = false;
      window.removeEventListener(OFFLINE_SYNC_EVENT, onSync);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('focus', onOnline);
      document.removeEventListener('visibilitychange', onVisible);
      navigator.serviceWorker?.removeEventListener('message', onWorkerMessage);
    };
  }, []);

  const label = status.phase === 'offline'
    ? `离线学习 · ${status.pending ? `${status.pending} 条打卡待同步` : '打卡保存在本机'}`
    : status.phase === 'syncing'
      ? `正在同步 ${status.pending} 条进度`
      : status.phase === 'pending'
        ? `${status.pending} 条进度等待同步`
        : status.phase === 'error'
          ? status.message ?? '同步需要重试'
          : contentReady ? '课程可离线 · 进度已同步' : '正在准备离线课程';

  return <div className={`offline-status ${status.phase}`} role="status" aria-live="polite">
    <span aria-hidden="true" />
    <b>{label}</b>
  </div>;
}
