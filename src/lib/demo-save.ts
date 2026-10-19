export const DEMO_SAVE_KEY = 'bm:pending-demo-save';
export const DEMO_SAVE_REASON = 'Like this song? Save it to your personal songbook.';
export function demoSavePath(id: string) {
  return `/song/${encodeURIComponent(id)}?saveDemo=1`;
}
export function pendingDemoId(search: string, pathname: string, stored: string | null) {
  const match = pathname.match(/^\/song\/([^/]+)$/);
  if (new URLSearchParams(search).get('saveDemo') === '1' && match?.[1]) {
    try { return decodeURIComponent(match[1]); } catch { return null; }
  }
  return stored && stored.length <= 200 && !/[/?#\s]/.test(stored) ? stored : null;
}