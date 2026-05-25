// lib/offlineCache.ts (runs in browser)
// Uses IndexedDB via the 'idb' library for offline punch data caching

import { openDB } from 'idb';

const DB_NAME = 'workforce_offline';
const STORE   = 'pending_syncs';

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

/**
 * Cache an OUT punch payload locally when the network is unavailable.
 */
export async function cacheOutPunch(payload: object): Promise<void> {
  const db = await getDB();
  await db.add(STORE, { ...payload, cachedAt: Date.now(), type: 'out_punch' });
}

/**
 * Retrieve all pending (not-yet-synced) OUT punches from IndexedDB.
 */
export async function getPendingOutPunches(): Promise<any[]> {
  const db = await getDB();
  return db.getAll(STORE);
}

/**
 * Clear a specific cached punch after successful sync.
 */
export async function clearCachedPunch(id: number): Promise<void> {
  const db = await getDB();
  await db.delete(STORE, id);
}

/**
 * Clear all cached punches (e.g. after full sync).
 */
export async function clearAllCachedPunches(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE);
}
