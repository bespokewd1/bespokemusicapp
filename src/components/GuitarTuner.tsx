import { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTuner } from "@/hooks/use-tuner";
import { centsToTarget, IN_TUNE_CENTS, nearestString, PRESETS, tuningState } from "@/lib/tuner";
import { cn } from "@/lib/utils";

const SEGMENTS = 25; // -50 … +50 cents

export function GuitarTuner() {
  const preset = PRESETS[0]!;
  const { status, freq, error, start, stop } = useTuner();
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [manual, setManual] = useState(0);
  const listening = status === "listening";

  const idx = freq ? (mode === "auto" ? nearestString(freq, preset.strings) : manual) : mode === "manual" ? manual : -1;
  const target = idx >= 0 ? preset.strings[idx]! : null;
  const cents = freq && target ? centsToTarget(freq, target.freq) : 0;
  const state = freq ? tuningState(cents) : null;
  const clamped = Math.max(-50, Math.min(50, cents));
  const lit = Math.round(((clamped + 50) / 100) * (SEGMENTS - 1));

  return (
    <section className="tuner-panel mx-auto w-full max-w-xl rounded-3xl p-4 shadow-lift sm:p-6" aria-label="Guitar tuner">
      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-tuner-dim">
        <span className="truncate">{preset.name} · E A D G B E</span>
        <span className="flex shrink-0 items-center gap-1.5" role="status">
          <span className={cn("h-2 w-2 rounded-full", listening ? "animate-pulse bg-tuner-ok" : "bg-tuner-dim")} />
          {listening ? "Listening" : status === "starting" ? "Starting…" : "Mic off"}
        </span>
      </div>

      {/* Display */}
      <div className="tuner-screen mt-4 rounded-2xl px-4 py-5 text-center">
        <div className="flex items-baseline justify-center gap-1">
          <span className={cn("font-mono text-7xl font-bold leading-none transition-colors sm:text-8xl", state === "in-tune" ? "text-tuner-ok" : "text-tuner-fg", !freq && "opacity-30")}>
            {target ? target.note : "–"}
          </span>
          <span className="font-mono text-xl text-tuner-dim">{target ? target.label.slice(-1) : ""}</span>
        </div>
        <div className="mt-2 flex justify-center gap-4 font-mono text-sm text-tuner-dim">
          <span>{freq ? `${freq.toFixed(1)} Hz` : "--- Hz"}</span>
          <span>target {target ? `${target.freq.toFixed(2)}` : "---"}</span>
        </div>

        {/* Segment meter */}
        <div className="mt-5 flex h-10 items-end justify-center gap-[3px]" aria-hidden>
          {Array.from({ length: SEGMENTS }).map((_, i) => {
            const center = i === (SEGMENTS - 1) / 2;
            const on = freq && (i === lit || (state === "in-tune" && Math.abs(i - (SEGMENTS - 1) / 2) <= 1));
            return (
              <span
                key={i}
                className={cn(
                  "w-full max-w-3 rounded-sm transition-all duration-100",
                  center ? "h-10" : i % 4 === 0 ? "h-7" : "h-5",
                  on ? (state === "in-tune" ? "bg-tuner-ok" : "bg-tuner-warn") : "bg-tuner-off",
                )}
              />
            );
          })}
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-widest text-tuner-dim">
          <span>♭ Flat</span><span>0</span><span>Sharp ♯</span>
        </div>

        <p className={cn("mt-4 font-mono text-lg font-bold uppercase tracking-[0.2em]", state === "in-tune" ? "text-tuner-ok" : "text-tuner-warn", !freq && "text-tuner-dim")} aria-live="polite">
          {!listening ? "Tap Start Tuning" : !freq ? "Pluck a string" : state === "in-tune" ? "In tune" : `${cents > 0 ? "+" : ""}${Math.round(cents)}¢ · ${state === "flat" ? "tune up" : "tune down"}`}
        </p>
      </div>

      {/* Strings */}
      <div className="mt-4 grid grid-cols-6 gap-1.5 sm:gap-2">
        {preset.strings.map((s, i) => (
          <button
            key={s.label}
            onClick={() => { setMode("manual"); setManual(i); }}
            aria-pressed={idx === i}
            aria-label={`String ${s.name}, ${s.label}`}
            className={cn(
              "flex min-h-12 flex-col items-center justify-center rounded-xl border font-mono transition",
              idx === i ? (state === "in-tune" ? "border-tuner-ok bg-tuner-ok/15 text-tuner-ok" : "border-tuner-fg/60 bg-tuner-fg/10 text-tuner-fg") : "border-tuner-off text-tuner-dim hover:text-tuner-fg",
            )}
          >
            <span className="text-base font-bold leading-none">{s.note}</span>
            <span className="text-[10px] opacity-70">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-2">
        <div className="flex rounded-full border border-tuner-off p-1 font-mono text-xs">
          {(["auto", "manual"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={cn("min-h-10 rounded-full px-3 uppercase tracking-wider", mode === m ? "bg-tuner-fg text-tuner-bg" : "text-tuner-dim")}>
              {m}
            </button>
          ))}
        </div>
        {listening ? (
          <Button variant="outline" onClick={stop} className="h-12 rounded-full border-tuner-off bg-transparent text-tuner-fg hover:bg-tuner-fg/10 hover:text-tuner-fg">
            <MicOff className="mr-2 h-4 w-4" /> Stop
          </Button>
        ) : (
          <Button onClick={start} disabled={status === "starting"} className="h-12 rounded-full">
            <Mic className="mr-2 h-4 w-4" /> Start Tuning
          </Button>
        )}
      </div>
      {error && <p className="mt-3 text-center text-sm text-tuner-warn">{error}</p>}
      <p className="mt-3 text-center text-xs text-tuner-dim">
        {mode === "auto" ? "Auto finds the closest string." : "Manual: tap a string to tune just that one."} In tune within ±{IN_TUNE_CENTS}¢.
      </p>
    </section>
  );
}
