const DB_NAME = "track-offline-db";
const STORE_NAME = "offline-entries";
const DB_VERSION = 1;

export interface OfflineEntry {
  id: string;
  description?: string;
  projectId?: string;
  taskId?: string;
  tagIds?: string[];
  startTime: number;
  endTime?: number;
  duration: number;
  billable: boolean;
  workspaceId: string;
  synced: boolean;
  createdAt: number;
  operation?: "create" | "update" | "delete";
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("synced", "synced", { unique: false });
        store.createIndex("workspaceId", "workspaceId", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
  });

  return dbPromise;
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = fn(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function initDB(): Promise<void> {
  await openDB();
}

export async function saveOfflineEntry(entry: OfflineEntry): Promise<void> {
  await withStore("readwrite", (store) => store.put(entry));
}

export async function getOfflineEntries(): Promise<OfflineEntry[]> {
  return withStore("readonly", (store) => store.getAll());
}

export async function getPendingEntries(): Promise<OfflineEntry[]> {
  const entries = await getOfflineEntries();
  return entries.filter((e) => !e.synced);
}

export async function removeOfflineEntry(id: string): Promise<void> {
  await withStore("readwrite", (store) => store.delete(id));
}

export async function markSynced(id: string): Promise<void> {
  const entry = await withStore("readonly", (store) => store.get(id));
  if (entry) {
    entry.synced = true;
    await withStore("readwrite", (store) => store.put(entry));
  }
}

export async function clearSynced(): Promise<void> {
  const entries = await getOfflineEntries();
  const tx = (await openDB()).transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  for (const entry of entries) {
    if (entry.synced) {
      store.delete(entry.id);
    }
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function queueOfflineOperation(
  entry: Omit<OfflineEntry, "synced" | "createdAt">,
  operation: "create" | "update" | "delete"
): Promise<void> {
  const id = entry.id || `offline-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await saveOfflineEntry({
    ...entry,
    id,
    synced: false,
    createdAt: Date.now(),
    operation,
  });
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export function onOnlineChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
