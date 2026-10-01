/* global self, indexedDB */
'use strict';

const CACHE_VERSION = 'zhixing-offline-v1';
const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const DATABASE_NAME = 'zhixing-learning-offline';
const DATABASE_VERSION = 1;
const OUTBOX_STORE = 'sync-outbox';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(ASSET_CACHE);
    await Promise.allSettled(['/','/manifest.webmanifest','/icon-192.png','/icon-512.png'].map(async (url) => {
      const response = await fetch(url, { credentials: 'include' });
      if (response.ok) await cache.put(url, response);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith('zhixing-offline-') && ![PAGE_CACHE, ASSET_CACHE].includes(name)).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

function sameOriginUrl(value) {
  const url = new URL(value, self.location.origin);
  return url.origin === self.location.origin ? url : null;
}

async function cacheDocumentAndAssets(value) {
  const url = sameOriginUrl(value);
  if (!url || url.pathname.startsWith('/api/')) return false;
  const pageCache = await caches.open(PAGE_CACHE);
  let response;
  try {
    response = await fetch(url.href, { credentials: 'include', headers: { accept: 'text/html' } });
  } catch {
    return Boolean(await pageCache.match(url.pathname + url.search, { ignoreSearch: true }));
  }
  if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) return false;
  await pageCache.put(url.pathname + url.search, response.clone());
  const html = await response.text();
  const assetUrls = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
    .map((match) => sameOriginUrl(match[1]))
    .filter((asset) => asset && !asset.pathname.startsWith('/api/') && asset.pathname !== url.pathname);
  const assetCache = await caches.open(ASSET_CACHE);
  await Promise.allSettled(assetUrls.map(async (asset) => {
    const cached = await assetCache.match(asset.href, { ignoreSearch: false });
    if (cached) return;
    const assetResponse = await fetch(asset.href, { credentials: 'include' });
    if (assetResponse.ok) await assetCache.put(asset.href, assetResponse);
  }));
  return true;
}

async function notify(message) {
  const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  windows.forEach((windowClient) => windowClient.postMessage(message));
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'CACHE_OFFLINE_CONTENT') {
    const urls = Array.isArray(event.data.urls) ? [...new Set(event.data.urls)] : [];
    event.waitUntil((async () => {
      let cached = 0;
      for (const url of urls) {
        try { if (await cacheDocumentAndAssets(url)) cached += 1; } catch { /* Retry on the next online launch. */ }
      }
      await notify({ type: 'OFFLINE_CONTENT_READY', ready: cached === urls.length, cached, total: urls.length });
    })());
  }
  if (event.data?.type === 'FLUSH_OUTBOX') event.waitUntil(syncOutbox());
});

function timeoutFetch(request, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(request, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function networkFirst(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await timeoutFetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request, { ignoreSearch: true })) ?? (await cache.match('/')) ?? Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }
  if (/\.(?:js|css|png|jpg|jpeg|svg|webp|woff2?|ico)$/i.test(url.pathname) || url.pathname.startsWith('/_next/') || url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request));
  }
});

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains('state-snapshots')) database.createObjectStore('state-snapshots', { keyPath: 'date' });
      if (!database.objectStoreNames.contains(OUTBOX_STORE)) {
        const store = database.createObjectStore(OUTBOX_STORE, { keyPath: 'operationId' });
        store.createIndex('clientUpdatedAt', 'clientUpdatedAt');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function listOperations(database) {
  return requestResult(database.transaction(OUTBOX_STORE, 'readonly').objectStore(OUTBOX_STORE).getAll());
}

async function removeOperation(database, operationId) {
  const transaction = database.transaction(OUTBOX_STORE, 'readwrite');
  transaction.objectStore(OUTBOX_STORE).delete(operationId);
  await new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

async function syncOutbox() {
  const database = await openDatabase();
  const operations = await listOperations(database);
  for (const operation of operations.sort((a, b) => a.clientUpdatedAt.localeCompare(b.clientUpdatedAt))) {
    try {
      const response = await fetch('/api/state', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(operation),
      });
      if (!response.ok) {
        await notify({ type: 'SYNC_ERROR', pending: operations.length, error: `同步失败：${response.status}` });
        return;
      }
      await removeOperation(database, operation.operationId);
    } catch {
      return;
    }
  }
  await notify({ type: 'SYNC_COMPLETE' });
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'zhixing-progress-sync') event.waitUntil(syncOutbox());
});
