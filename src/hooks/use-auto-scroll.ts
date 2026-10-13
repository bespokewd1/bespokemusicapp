import { useCallback, useEffect, useRef, useState } from "react";

export const SPEED_PRESETS = { Slow: 0.6, Normal: 1, Fast: 1.8 } as const;
const BASE_PX_PER_SEC = 22;
const RESUME_AFTER_MS = 3000;

/**
 * Window auto-scroll. Manual input (wheel, touch, keys, scrollbar drag) suspends it
 * for 3 s; an explicit pause stays paused. Stops itself at the end of the page.
 */
export function useAutoScroll(speed: number) {
  const [playing, setPlaying] = useState(false);
  const [suspended, setSuspended] = useState(false);
  const st = useRef({ raf: 0, last: 0, carry: 0, resumeAt: 0, expected: -1 });
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const stop = useCallback(() => {
    cancelAnimationFrame(st.current.raf);
    setPlaying(false);
    setSuspended(false);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const s = st.current;
    s.last = performance.now();
    s.carry = 0;
    s.expected = -1;
    const tick = (now: number) => {
      s.raf = requestAnimationFrame(tick);
      const dt = Math.min(100, now - s.last);
      s.last = now;
      if (s.resumeAt) {
        if (now < s.resumeAt) return;
        s.resumeAt = 0;
        s.expected = -1;
        setSuspended(false);
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY >= max - 2) {
        stop();
        return;
      }
      // A scroll position we didn't set means the user scrolled (e.g. dragged the scrollbar)
      if (s.expected >= 0 && Math.abs(window.scrollY - s.expected) > 3) {
        suspend();
        return;
      }
      s.carry += (BASE_PX_PER_SEC * speedRef.current * dt) / 1000;
      const px = Math.floor(s.carry);
      if (px >= 1) {
        s.carry -= px;
        window.scrollTo(0, window.scrollY + px);
        s.expected = window.scrollY;
      }
    };
    const suspend = () => {
      s.resumeAt = performance.now() + RESUME_AFTER_MS;
      s.expected = -1;
      setSuspended(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) suspend();
    };
    window.addEventListener("wheel", suspend, { passive: true });
    window.addEventListener("touchmove", suspend, { passive: true });
    window.addEventListener("keydown", onKey);
    s.raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(s.raf);
      window.removeEventListener("wheel", suspend);
      window.removeEventListener("touchmove", suspend);
      window.removeEventListener("keydown", onKey);
    };
  }, [playing, stop]);

  const toggle = useCallback(() => {
    if (playing) return stop();
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY >= max - 2) window.scrollTo(0, 0); // restart from the top at the end
    st.current.resumeAt = 0;
    setPlaying(true);
  }, [playing, stop]);

  return { playing, suspended, toggle, stop };
}
