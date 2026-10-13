import { useCallback, useEffect, useRef, useState } from "react";
import { detectPitch, median } from "@/lib/tuner";

export type MicStatus = "idle" | "starting" | "listening" | "denied" | "unavailable" | "interrupted";

/** Continuous microphone pitch tracking. Mic audio is never routed to speakers. */
export function useTuner() {
  const [status, setStatus] = useState<MicStatus>("idle");
  const [freq, setFreq] = useState<number | null>(null);
  const [error, setError] = useState("");
  const res = useRef<{ ctx?: AudioContext; stream?: MediaStream; raf?: number }>({});

  const stop = useCallback(() => {
    const r = res.current;
    if (r.raf) cancelAnimationFrame(r.raf);
    r.stream?.getTracks().forEach((t) => t.stop());
    r.ctx?.close().catch(() => {});
    res.current = {};
    setFreq(null);
    setStatus((s) => (s === "listening" || s === "starting" ? "idle" : s));
  }, []);

  const start = useCallback(async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unavailable");
      setError(window.isSecureContext ? "This browser can't access a microphone." : "The tuner needs a secure (https) connection.");
      return;
    }
    setStatus("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const ctx = new AudioContext();
      await ctx.resume();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 8192;
      src.connect(analyser); // NOT connected to ctx.destination → no feedback
      res.current = { ctx, stream };
      stream.getTracks().forEach((t) =>
        t.addEventListener("ended", () => {
          stop();
          setStatus("interrupted");
          setError("The microphone was disconnected or taken by another app.");
        }),
      );

      const buf = new Float32Array(analyser.fftSize);
      const recent: number[] = [];
      let lastHeard = 0;
      let frame = 0;
      let shown: number | null = null;
      const tick = () => {
        res.current.raf = requestAnimationFrame(tick);
        if (frame++ % 2) return; // ~30 Hz is plenty, saves battery
        analyser.getFloatTimeDomainData(buf);
        const f = detectPitch(buf, ctx.sampleRate);
        const now = performance.now();
        if (f) {
          // reset smoothing when the pitch jumps (new string plucked)
          if (recent.length && Math.abs(1200 * Math.log2(f / recent[recent.length - 1]!)) > 150) recent.length = 0;
          recent.push(f);
          if (recent.length > 7) recent.shift();
          lastHeard = now;
          const m = median(recent);
          if (shown === null || Math.abs(m - shown) > 0.05) {
            shown = m;
            setFreq(m);
          }
        } else if (shown !== null && now - lastHeard > 1500) {
          recent.length = 0;
          shown = null;
          setFreq(null);
        }
      };
      tick();
      setStatus("listening");
    } catch (e) {
      const name = (e as DOMException)?.name;
      setStatus(name === "NotAllowedError" ? "denied" : "unavailable");
      setError(
        name === "NotAllowedError"
          ? "Microphone access was blocked. Allow it in your browser's site settings, then try again."
          : name === "NotFoundError"
            ? "No microphone was found on this device."
            : "Couldn't start the microphone.",
      );
    }
  }, [stop]);

  useEffect(() => stop, [stop]);
  return { status, freq, error, start, stop };
}
