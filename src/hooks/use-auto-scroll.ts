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
  const st = useRef({ raf: 0, last: 0, carry: 0, pos: 0, touching: false, yieldUntil: 0 });
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
    s.carry = 0;
    s.pos = window.scrollY;
    const tick = (now: number) => {
      s.raf = requestAnimationFrame(tick);
      const dt = Math.min(100, now - s.last);
      s.last = now;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY >= max - 2) { stop(); return; }
      if (s.touching || now < s.yieldUntil) { s.pos = window.scrollY; s.carry = 0; return; }
      // Adopt any position the user moved to (e.g. scrollbar drag) and continue from there
      if (Math.abs(window.scrollY - Math.round(s.pos)) > 3) s.pos = window.scrollY;
      s.pos += (BASE_PX_PER_SEC * speedRef.current * dt) / 1000; // sub-pixel accumulation = smooth
      window.scrollTo(0, s.pos);
    };
    const yieldBriefly = () => { s.yieldUntil = performance.now() + WHEEL_YIELD_MS; };
    const onTouchStart = () => { s.touching = true; };
    const onTouchEnd = () => { s.touching = false; yieldBriefly(); };
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

  return { playing, toggle, play, stop };
}
