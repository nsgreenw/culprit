/**
 * Browser-only persistence. Everything stays on the user's device:
 * IndexedDB first, localStorage as a fallback when IndexedDB is blocked.
 */

const DB_NAME = "elimination-tracker";
const STORE = "kv";
const DATA_KEY = "data";
/** Key used by the first prototype, which stored data in localStorage. */
export const LEGACY_KEY = "elimination-tracker:v1";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

let dbPromise: Promise<IDBDatabase> | null = null;
const db = () => (dbPromise ??= openDb());

function tx<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest,
): Promise<T> {
  return db().then(
    (d) =>
      new Promise<T>((resolve, reject) => {
        const t = d.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        t.oncomplete = () => resolve(req.result as T);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      }),
  );
}

/** Reads saved data. Moves prototype data out of localStorage on first run. */
export async function readData<T>(): Promise<T | undefined> {
  try {
    const stored = await tx<T | undefined>("readonly", (s) => s.get(DATA_KEY));
    if (stored !== undefined) return stored;
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as T;
      await tx("readwrite", (s) => s.put(parsed, DATA_KEY));
      localStorage.removeItem(LEGACY_KEY);
      return parsed;
    }
    return undefined;
  } catch {
    // IndexedDB blocked (some private modes): fall back to localStorage.
    try {
      const raw = localStorage.getItem(LEGACY_KEY);
      return raw ? (JSON.parse(raw) as T) : undefined;
    } catch {
      return undefined;
    }
  }
}

// Writes run one after another so a slow write never overwrites a newer one.
let queue: Promise<unknown> = Promise.resolve();

export function writeData<T>(value: T): Promise<void> {
  queue = queue.then(async () => {
    try {
      await tx("readwrite", (s) => s.put(value, DATA_KEY));
    } catch {
      try {
        localStorage.setItem(LEGACY_KEY, JSON.stringify(value));
      } catch {
        // Storage full or blocked: the in-memory copy stays for this session.
      }
    }
  });
  return queue as Promise<void>;
}

/** Tells other open tabs that the data changed. */
const channel =
  typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("elimination-tracker")
    : null;

export function announceChange() {
  channel?.postMessage("changed");
}

export function onExternalChange(fn: () => void): () => void {
  if (!channel) return () => {};
  const handler = () => fn();
  channel.addEventListener("message", handler);
  return () => channel.removeEventListener("message", handler);
}

export type PersistState = "persisted" | "best-effort" | "unsupported";

/**
 * Asks the browser not to evict our data under storage pressure.
 * Browsers may grant this silently, ask the user, or refuse.
 */
export async function requestPersistence(): Promise<PersistState> {
  if (!navigator.storage?.persist) return "unsupported";
  if (await navigator.storage.persisted()) return "persisted";
  return (await navigator.storage.persist()) ? "persisted" : "best-effort";
}

export async function persistState(): Promise<PersistState> {
  if (!navigator.storage?.persisted) return "unsupported";
  return (await navigator.storage.persisted()) ? "persisted" : "best-effort";
}
