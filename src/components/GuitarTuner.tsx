import { useT } from "@/lib/i18n";
import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTuner } from "@/hooks/use-tuner";
import { centsToTarget, createInTuneGate, IN_TUNE_CENTS, nearestString, PRESETS, tuningState } from "@/lib/tuner";
import { cn } from "@/lib/utils";

export function GuitarTuner() {
  const [presetId, setPresetId] = useState("standard");
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
  const { status, freq, error, start, stop } = useTuner();
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [manual, setManual] = useState(0);
  const { t } = useT();
  const listening = status === "listening";

  const strings = preset?.strings ?? [];
  const idx = freq ? (mode === "auto" ? nearestString(freq, strings) : manual) : mode === "manual" ? manual : -1;
  const target = idx >= 0 ? strings[idx] ?? null : null;
  const cents = freq && target ? centsToTarget(freq, target.freq) : 0;
  const state = freq ? tuningState(cents) : null;
  const clamped = Math.max(-50, Math.min(50, cents));
  const needle = freq ? clamped * 1.4 : 0; // degrees, ±70°

  // In-tune chime: device-local on/off, gated so it plays once per stable tuning
  const [chimeOn, setChimeOn] = useState(true);
  useEffect(() => { setChimeOn(localStorage.getItem(CHIME_KEY) !== "off"); }, []);
  const gate = useRef(createInTuneGate());
  useEffect(() => {
    if (!listening) return;
    const fire = gate.current(freq && target ? cents : null, target ? `${preset?.id}-${idx}` : null, performance.now());
    if (fire && chimeOn) playChime();
  }, [freq, cents, target, idx, preset?.id, listening, chimeOn]);
  const toggleChime = () => { const v = !chimeOn; setChimeOn(v); localStorage.setItem(CHIME_KEY, v ? "on" : "off"); if (v) { unlockAudio(); setTimeout(playChime, 30); } };

  const pick = (i: number) => { playClick(); setMode("manual"); setManual(i); };
  // Strings low (6th) -> high (1st); headstock 3+3: left pegs = strings 6,5,4 (top→bottom reversed for realism)
  const left = [2, 1, 0];
  const right = [5, 4, 3];

  return (
    <section className="mx-auto w-full max-w-2xl" aria-label={t("Guitar Tuner")}>
      <div className="text-center">
        <h2 className="font-display text-3xl font-semibold md:text-4xl">{t("Tune Your Guitar")}</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{t("Tune your guitar quickly and accurately. Free, online, and no downloads required.")}</p>
      </div>

      <div className="tuner-panel mt-5 rounded-3xl p-4 shadow-lift sm:p-6">
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4" role="radiogroup" aria-label={t("Tuning")}>
          {PRESETS.map((p) => (
            <Button variant="ghost" key={p.id} role="radio" aria-checked={p.id === preset?.id} onClick={() => { playClick(); setPresetId(p.id); }}
              className={cn("h-auto min-h-11 rounded-full border px-2 text-xs font-semibold", p.id === preset?.id ? "border-tuner-fg bg-tuner-fg text-tuner-bg hover:bg-tuner-fg hover:text-tuner-bg" : "border-tuner-off text-tuner-dim hover:bg-tuner-fg/10 hover:text-tuner-fg")}>
              {t(p.name)}
            </Button>
          ))}
        </div>
        <p className="mt-2 text-center font-mono text-xs text-tuner-dim" aria-live="polite">{strings.map((s) => s.note).join(" · ")}</p>

        {/* Gauge */}
        <div className="relative mx-auto mt-5 h-28 w-full max-w-xs overflow-hidden" aria-hidden>
          <svg viewBox="0 0 200 110" className="h-full w-full">
            <path d="M20 100 A80 80 0 0 1 180 100" fill="none" className="stroke-tuner-off" strokeWidth="10" strokeLinecap="round" />
            <path d="M93 21 A80 80 0 0 1 107 21" fill="none" className="stroke-tuner-ok" strokeWidth="10" />
            <g style={{ transform: `rotate(${needle}deg)`, transformOrigin: "100px 100px", transition: "transform 120ms ease-out" }}>
              <line x1="100" y1="100" x2="100" y2="28" strokeWidth="3" strokeLinecap="round" className={state === "in-tune" ? "stroke-tuner-ok" : freq ? "stroke-tuner-warn" : "stroke-tuner-dim"} />
            </g>
            <circle cx="100" cy="100" r="6" className="fill-tuner-fg" />
          </svg>
          <span className="absolute bottom-0 left-0 text-[10px] font-semibold uppercase tracking-widest text-tuner-dim">♭ {t("Flat")}</span>
          <span className="absolute bottom-0 right-0 text-[10px] font-semibold uppercase tracking-widest text-tuner-dim">{t("Sharp")} ♯</span>
        </div>
        <p className={cn("mt-1 text-center text-lg font-bold uppercase tracking-[0.15em]", state === "in-tune" ? "text-tuner-ok" : freq ? "text-tuner-warn" : "text-tuner-dim")} aria-live="polite">
          {!listening ? t("Tap Start Tuning") : !freq ? t("Pluck a string") : state === "in-tune" ? t("In tune ✓") : `${t(state === "flat" ? "Flat · tune up" : "Sharp · tune down")} (${cents > 0 ? "+" : ""}${Math.round(cents)}¢)`}
        </p>
        <p className="text-center font-mono text-xs text-tuner-dim">{freq ? `${freq.toFixed(1)} Hz` : "--- Hz"} · {t("target")} {target ? target.freq.toFixed(1) : "---"} Hz</p>

        {/* Headstock */}
        <div className="mx-auto mt-5 grid max-w-sm grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
          {Pegs({ side: "left", order: left })}
          <svg viewBox="0 0 120 230" className="h-56 w-28 sm:h-64 sm:w-32" aria-hidden>
            <path d="M18 10 Q60 -2 102 10 L96 190 Q60 200 24 190 Z" className="fill-tuner-off" />
            <rect x="30" y="196" width="60" height="34" rx="3" className="fill-tuner-off opacity-70" />
            <rect x="28" y="192" width="64" height="5" className="fill-tuner-fg opacity-60" />
            {[0, 1, 2, 3, 4, 5].map((s) => {
              const x = 38 + s * 8.8;
              const pegIdx = s; // string 6 at left
              const peg = pegIdx < 3 ? { x: 24, y: 52 + (2 - pegIdx) * 50 } : { x: 96, y: 52 + (5 - pegIdx) * 50 };
              const on = idx === pegIdx;
              return (
                <g key={s}>
                  <line x1={x} y1={230} x2={x} y2={196} strokeWidth={on ? 2.2 : 1.2} className={on ? (state === "in-tune" ? "stroke-tuner-ok" : "stroke-tuner-warn") : "stroke-tuner-dim"} />
                  <line x1={x} y1={196} x2={peg.x} y2={peg.y} strokeWidth={on ? 2.2 : 1.2} className={on ? (state === "in-tune" ? "stroke-tuner-ok" : "stroke-tuner-warn") : "stroke-tuner-dim"} />
                  <circle cx={peg.x} cy={peg.y} r="5" className="fill-tuner-fg" />
                </g>
              );
            })}
          </svg>
          {Pegs({ side: "right", order: right })}
        </div>

        <div className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] gap-2">
          <div className="flex rounded-full border border-tuner-off p-1 text-xs font-semibold">
            {(["auto", "manual"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={cn("min-h-10 rounded-full px-3 capitalize", mode === m ? "bg-tuner-fg text-tuner-bg" : "text-tuner-dim")}>{t(m === "auto" ? "Auto" : "Manual")}</button>
            ))}
            <button onClick={toggleChime} aria-pressed={chimeOn} aria-label={t(chimeOn ? "In-tune sound on" : "In-tune sound off")} title={t(chimeOn ? "In-tune sound on" : "In-tune sound off")}
              className={cn("grid min-h-10 w-10 place-items-center rounded-full", chimeOn ? "text-tuner-fg" : "text-tuner-dim")}>
              {chimeOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
          {listening ? (
            <Button variant="outline" onClick={stop} className="h-12 rounded-full border-tuner-off bg-transparent text-tuner-fg hover:bg-tuner-fg/10 hover:text-tuner-fg">
              <MicOff className="mr-2 h-4 w-4" /> {t("Stop")}
            </Button>
          ) : (
            <Button onClick={() => { unlockAudio(); start(); }} disabled={status === "starting"} className="h-12 rounded-full">
              <Mic className="mr-2 h-4 w-4" /> {t(status === "starting" ? "Starting…" : "Start Tuning")}
            </Button>
          )}
        </div>
        {error && <p className="mt-3 text-center text-sm text-tuner-warn">{error}</p>}
        <p className="mt-3 text-center text-xs text-tuner-dim">
          {t(mode === "auto" ? "Auto finds the closest string." : "Manual: tap a peg to tune just that string.")} {t("In tune within ±{n}¢.", { n: IN_TUNE_CENTS })}
        </p>
      </div>
    </section>
  );

  function Pegs({ side, order }: { side: "left" | "right"; order: number[] }) {
    return (
      <div className={cn("flex flex-col gap-5 sm:gap-7", side === "left" ? "items-end" : "items-start")}>
        {order.map((i) => {
          const s = strings[i];
          if (!s) return null;
          const on = idx === i;
          return (
            <button key={i} onClick={() => pick(i)} aria-pressed={on} aria-label={t("String {name}", { name: s.name })}
              className={cn("grid h-14 w-14 place-items-center rounded-full border-2 text-xl font-bold transition sm:h-16 sm:w-16",
                on ? (state === "in-tune" ? "border-tuner-ok bg-tuner-ok text-tuner-bg" : "border-tuner-warn bg-tuner-warn/20 text-tuner-fg") : "border-tuner-off text-tuner-fg hover:border-tuner-fg")}>
              {s.note}
            </button>
          );
        })}
      </div>
    );
  }
}

let clickCtx: AudioContext | null = null;
const CHIME_KEY = "bm-tuner-chime";
function unlockAudio() { try { clickCtx ??= new AudioContext(); void clickCtx.resume(); } catch { /* unsupported */ } }
/** Soft two-note chime (~300ms), generated with Web Audio; never routed through the mic. */
function playChime() {
  try {
    if (!clickCtx || clickCtx.state !== "running") return;
    const ctx = clickCtx, t0 = ctx.currentTime;
    [[1046.5, 0], [1568, 0.07]].forEach(([f, d]) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), t = t0 + d!;
      o.type = "sine"; o.frequency.setValueAtTime(f!, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.27);
    });
  } catch { /* audio unavailable */ }
}
/** Short UI click so users hear the tap. Plays through its own context (not the mic). */
function playClick() {
  try {
    clickCtx ??= new AudioContext();
    const ctx = clickCtx;
    void ctx.resume();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(1800, t);
    o.frequency.exponentialRampToValueAtTime(600, t + 0.03);
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.06);
  } catch { /* audio unavailable */ }
}
