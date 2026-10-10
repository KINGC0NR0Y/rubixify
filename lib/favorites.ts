import { useMemo, useSyncExternalStore } from 'react';

const KEY = 'rubixify_favorites';
const LEGACY_KEY = 'cubopedia_favorites';

// One-time carry-over from the pre-rename key so existing users keep their favorites.
function migrateLegacy() {
  if (typeof window === 'undefined') return;
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy !== null && localStorage.getItem(KEY) === null) {
      localStorage.setItem(KEY, legacy);
    }
    if (legacy !== null) localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* storage unavailable — nothing to migrate */
  }
}

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener('storage', cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', cb);
  };
}

function readRaw(): string {
  migrateLegacy();
  try { return localStorage.getItem(KEY) ?? '[]'; }
  catch { return '[]'; }
}

const NONE: string[] = [];

/** Reactive favorites list, safe for SSR (empty on the server). */
export function useFavorites(): string[] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => '[]');
  return useMemo(() => {
    if (raw === '[]') return NONE;
    try { return JSON.parse(raw) as string[]; }
    catch { return NONE; }
  }, [raw]);
}

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  migrateLegacy();
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function toggleFavorite(id: string): string[] {
  const favs = getFavorites();
  const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
  localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach(l => l());
  return next;
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}
