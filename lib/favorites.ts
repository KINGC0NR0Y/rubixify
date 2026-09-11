const KEY = 'algently_favorites';
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
  return next;
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}
