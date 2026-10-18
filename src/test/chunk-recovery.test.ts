import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  isChunkLoadError,
  planChunkRecovery,
  recoverFromChunkLoadError,
  registerChunkRecovery,
} from "@/lib/chunk-recovery";

// The exact failure the preview reported when the song viewer blanked the screen.
const STALE = new TypeError(
  "Failed to fetch dynamically imported module: https://preview.lovableproject.com/src/routes/song.$id.tsx?t=1792285986974&tsr-split=component",
);

beforeEach(() => window.sessionStorage.clear());

describe("stale module recovery", () => {
  it("recognizes the failed song-viewer module fetch", () => {
    expect(isChunkLoadError(STALE)).toBe(true);
  });

  it("leaves unrelated errors alone", () => {
    expect(isChunkLoadError(new TypeError("user is not a function"))).toBe(false);
    expect(isChunkLoadError(undefined)).toBe(false);
  });

  it("reloads once, then refuses an immediate second reload", () => {
    const reload = vi.fn();
    expect(recoverFromChunkLoadError(STALE, reload)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(recoverFromChunkLoadError(STALE, reload)).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("reloads again once the guard window has passed", () => {
    vi.useFakeTimers();
    const reload = vi.fn();
    recoverFromChunkLoadError(STALE, reload);
    vi.advanceTimersByTime(16_000);
    expect(planChunkRecovery(STALE)).toBe(true);
    recoverFromChunkLoadError(STALE, reload);
    expect(reload).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("recovers from a background module rejection that never reaches the boundary", () => {
    const reload = vi.fn();
    registerChunkRecovery(reload);
    window.dispatchEvent(
      new PromiseRejectionEvent("unhandledrejection", { reason: STALE, cancelable: true }),
    );
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
