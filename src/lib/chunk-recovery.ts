/**
 * Recovers from stale code-split module fetches — "Failed to fetch dynamically
 * imported module" — that blank the screen when a tab holds a module graph the dev
 * server has since replaced, or when the app is republished while a page is open.
 * One reload refetches the current module graph; a short guard stops a reload loop
 * when the failure is persistent instead of stale.
 */

const GUARD_KEY = "bm-chunk-recovery";
const GUARD_MS = 15_000;

const CHUNK_ERROR =
  /dynamically imported module|importing a module script failed|chunkloaderror|loading chunk .* failed|failed to load (module|script)/i;

export function isChunkLoadError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";
  return CHUNK_ERROR.test(message);
}

/** True when this failure should trigger a reload; refuses repeat reloads inside GUARD_MS. */
export function planChunkRecovery(error: unknown): boolean {
  if (!isChunkLoadError(error) || typeof window === "undefined") return false;
  const now = Date.now();
  try {
    const previous = Number(window.sessionStorage.getItem(GUARD_KEY));
    if (Number.isFinite(previous) && now - previous < GUARD_MS) return false;
    window.sessionStorage.setItem(GUARD_KEY, String(now));
  } catch {
    /* private mode or storage disabled: still worth one reload */
  }
  return true;
}

export function recoverFromChunkLoadError(
  error: unknown,
  reload: () => void = () => window.location.reload(),
): boolean {
  if (!planChunkRecovery(error)) return false;
  reload();
  return true;
}

let registered = false;

/** Watches failures that never reach the error boundary (background module loads). */
export function registerChunkRecovery(
  reload: () => void = () => window.location.reload(),
): void {
  if (registered || typeof window === "undefined") return;
  registered = true;
  window.addEventListener("unhandledrejection", (event) =>
    recoverFromChunkLoadError(event.reason, reload),
  );
  window.addEventListener("error", (event) =>
    recoverFromChunkLoadError(event.error ?? event.message, reload),
  );
}
