import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAutoScroll } from "@/hooks/use-auto-scroll";

describe("auto-scroll restart", () => {
  let y = 400;
  let frame: FrameRequestCallback | undefined;
  const scroll = vi.fn((x: number | ScrollToOptions, next?: number) => {
    y = typeof x === "number" ? next ?? 0 : x.top ?? 0;
  });
  beforeEach(() => {
    y = 400;
    frame = undefined;
    scroll.mockClear();
    vi.spyOn(window, "scrollTo").mockImplementation(scroll);
    vi.spyOn(window, "scrollY", "get").mockImplementation(() => y);
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(800);
    vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(4000);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => { frame = callback; return 1; });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it("returns to the beginning and starts from paused", () => {
    const { result } = renderHook(() => useAutoScroll(1.5));
    act(() => result.current.restart());
    expect(y).toBe(0);
    expect(result.current.playing).toBe(true);
    expect(scroll).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "instant" });
  });

  it("restarts while playing using the current speed", () => {
    const { result, rerender } = renderHook(({ speed }) => useAutoScroll(speed), { initialProps: { speed: 1 } });
    act(() => result.current.play());
    rerender({ speed: 2 });
    y = 900;
    act(() => result.current.restart());
    act(() => frame?.(performance.now() + 100));
    expect(result.current.playing).toBe(true);
    expect(y).toBeCloseTo(4.4, 1); // 22 px/sec × current 2× speed × 100 ms
  });

  it("still adopts manual scroll positions and preserves pause after restart", () => {
    const { result } = renderHook(() => useAutoScroll(1));
    act(() => result.current.restart());
    y = 600;
    const now = performance.now();
    act(() => frame?.(now + 100));
    expect(y).toBe(600);
    act(() => frame?.(now + 400));
    expect(y).toBeCloseTo(602.2, 1);
    expect(result.current.playing).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.playing).toBe(false);
  });

  it("yields throughout touch momentum, then resumes from the settled position at the selected speed", () => {
    const { result } = renderHook(() => useAutoScroll(2));
    act(() => result.current.play());
    const now = performance.now();
    act(() => window.dispatchEvent(new Event("touchstart")));
    y = 800;
    act(() => frame?.(now + 100));
    const end = new Event("touchend");
    Object.defineProperty(end, "touches", { value: [] });
    act(() => window.dispatchEvent(end));
    y = 1000;
    act(() => frame?.(now + 500));
    y = 1100;
    act(() => frame?.(now + 800));
    expect(scroll).not.toHaveBeenCalled();
    act(() => frame?.(now + 1000));
    expect(y).toBe(1100);
    act(() => frame?.(now + 1100));
    expect(y).toBeCloseTo(1104.4, 1);
    expect(result.current.playing).toBe(true);
  });

  it("lets wheel and trackpad input take priority in both directions without rebuilding the loop", () => {
    const { result, rerender } = renderHook(({ speed }) => useAutoScroll(speed), { initialProps: { speed: 1 } });
    act(() => result.current.play());
    const now = performance.now();
    act(() => window.dispatchEvent(new WheelEvent("wheel", { deltaY: -300 })));
    y = 100;
    act(() => frame?.(now + 100));
    y = 600;
    act(() => frame?.(now + 200));
    rerender({ speed: 1.5 });
    act(() => frame?.(now + 400));
    expect(scroll).not.toHaveBeenCalled();
    act(() => frame?.(now + 500));
    expect(y).toBeCloseTo(603.3, 1);
    expect(result.current.playing).toBe(true);
  });

  it("does not stop at the bottom while a manual gesture is still moving", () => {
    const { result } = renderHook(() => useAutoScroll(1));
    act(() => result.current.play());
    const now = performance.now();
    y = 3200;
    act(() => frame?.(now + 100));
    expect(result.current.playing).toBe(true);
    y = 2800;
    act(() => frame?.(now + 200));
    act(() => frame?.(now + 500));
    expect(y).toBeCloseTo(2802.2, 1);
  });
});