import { useCallback, useEffect, useRef, useState } from "react";

const BASE_PX_PER_SEC = 22;
const WHEEL_YIELD_MS = 250;

/**
 * Window auto-scroll. Manual scrolling (touch, wheel, keys, scrollbar) never stops it:
 * it briefly yields while the finger/wheel is moving, then keeps going from the new
 * position. Only an explicit pause (or reaching the end) stops it.
 */
export function useAutoScroll(speed: number) {
  const [playing, setPlaying] = useState(false);
  const st = useRef({ raf: 0, last: 0, pos: 0, expected: 0, touching: false, yieldUntil: 0 });
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const stop = useCallback(() => {
    cancelAnimationFrame(st.current.raf);
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const s = st.current;
    s.last = performance.now();
    s.pos = window.scrollY;
    s.expected = window.scrollY;
    const tick = (now: number) => {
      const dt = Math.min(100, now - s.last);
      s.last = now;
      const actual = window.scrollY;
      // Compare against the last position actually written, not a rounded target.
      // Native touch momentum/trackpad motion keeps extending the handoff until
      // the page settles; our own scroll writes never extend it.
      if (Math.abs(actual - s.expected) > 0.5) {
        s.yieldUntil = now + WHEEL_YIELD_MS;
        s.pos = actual;
      }
      s.expected = actual;
      if (s.touching || now < s.yieldUntil) {
        s.pos = actual;
        s.raf = requestAnimationFrame(tick);
        return;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (actual >= max - 2) { stop(); return; }
      s.pos += (BASE_PX_PER_SEC * speedRef.current * dt) / 1000; // sub-pixel accumulation = smooth
      window.scrollTo({ top: s.pos, left: window.scrollX, behavior: "instant" });
      s.expected = window.scrollY;
      s.raf = requestAnimationFrame(tick);
    };
    const yieldBriefly = () => { s.yieldUntil = performance.now() + WHEEL_YIELD_MS; };
    const onTouchStart = () => { s.touching = true; };
    const onTouchEnd = (e: TouchEvent) => { s.touching = e.touches.length > 0; yieldBriefly(); };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(e.key)) yieldBriefly();
    };
    window.addEventListener("wheel", yieldBriefly, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    s.raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(s.raf);
      s.touching = false;
      window.removeEventListener("wheel", yieldBriefly);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [playing, stop]);

  const play = useCallback(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY >= max - 2) window.scrollTo(0, 0);
    setPlaying(true);
  }, []);

  const toggle = useCallback(() => (playing ? stop() : play()), [playing, stop, play]);

  const restart = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const s = st.current;
    s.pos = 0;
    s.expected = window.scrollY;
    s.last = performance.now();
    s.touching = false;
    s.yieldUntil = 0;
    setPlaying(true);
  }, []);

  return { playing, toggle, play, stop, restart };
}
