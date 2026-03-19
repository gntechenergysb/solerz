type CacheEnvelope<T> = {
  ts: number;
  value: T;
};

const safeGetItem = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore storage errors
  }
};

export const readCache = <T>(key: string, maxAgeMs: number): T | null => {
  if (typeof window === 'undefined') return null;
  const raw = safeGetItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (!parsed || typeof parsed.ts !== 'number') return null;
    if (Date.now() - parsed.ts > maxAgeMs) return null;
    return parsed.value ?? null;
  } catch {
    return null;
  }
};

export const readCacheEnvelope = <T>(key: string): CacheEnvelope<T> | null => {
  if (typeof window === 'undefined') return null;
  const raw = safeGetItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (!parsed || typeof parsed.ts !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
};

export const writeCache = <T>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  const payload: CacheEnvelope<T> = { ts: Date.now(), value };
  safeSetItem(key, JSON.stringify(payload));
};
