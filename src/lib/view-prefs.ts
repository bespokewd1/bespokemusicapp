/** Song-viewer display preferences kept on this device (never touch song content). */
export const SIZE_MIN = 14;
export const SIZE_MAX = 30;

export interface ViewPrefs {
  size: number;
  nashville: boolean;
}

const KEY = "bm-view-prefs";
const TR_KEY = (id: string) => `bm-tr-${id}`;

export function parseViewPrefs(raw: string | null): ViewPrefs {
  const d = { size: 18, nashville: false };
  if (!raw) return d;
  try {
    const p = JSON.parse(raw);
    const size = Number(p?.size);
    return {
      size: Number.isFinite(size) ? Math.min(SIZE_MAX, Math.max(SIZE_MIN, Math.round(size))) : d.size,
      nashville: p?.nashville === true,
    };
  } catch {
    return d;
  }
}

export function loadViewPrefs(): ViewPrefs {
  try { return parseViewPrefs(localStorage.getItem(KEY)); } catch { return parseViewPrefs(null); }
}
export function saveViewPrefs(p: ViewPrefs) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage unavailable */ }
}

/** Transposition remembered per song, clamped to ±11 semitones. */
export function parseTranspose(raw: string | null): number {
  const n = Number(raw);
  return Number.isInteger(n) && Math.abs(n) <= 11 ? n : 0;
}
export function loadTranspose(id: string): number {
  try { return parseTranspose(localStorage.getItem(TR_KEY(id))); } catch { return 0; }
}
export function saveTranspose(id: string, t: number) {
  try { t ? localStorage.setItem(TR_KEY(id), String(t)) : localStorage.removeItem(TR_KEY(id)); } catch { /* ignore */ }
}

/** Previous/next neighbours of a song inside an ordered playlist. */
export function playlistNeighbours(order: string[], id: string) {
  const i = order.indexOf(id);
  if (i < 0) return null;
  return { index: i, total: order.length, prev: i > 0 ? order[i - 1] : null, next: i < order.length - 1 ? order[i + 1] : null };
}
