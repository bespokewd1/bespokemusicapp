import { useT } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { GuitarTuner } from "@/components/GuitarTuner";
import { ChordDiagram } from "@/components/ChordDiagram";
import { CHORD_LIBRARY, findChord, QUICK_CHART, searchChords, type Chord, type ChordCategory, type Voicing } from "@/lib/chords";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tools")({
  validateSearch: (s: Record<string, unknown>): { from?: string } => (typeof s["from"] === "string" && s["from"] ? { from: s["from"] as string } : {}),
  head: () => ({
    meta: [
      { title: "Guitar Tools — Chord Library & Tuner | Bespoke Music" },
      { name: "description", content: "Free guitar chord library with diagrams and alternate shapes, plus a real-time digital guitar tuner." },
      { property: "og:title", content: "Guitar Tools — Bespoke Music" },
      { property: "og:description", content: "Chord library with diagrams and a real-time guitar tuner." },
    ],
  }),
  component: Tools,
});

const CATS: ("All" | ChordCategory)[] = ["All", "Major", "Minor", "7th", "Maj7", "Min7", "Sus", "Add9", "6th", "Dim", "Aug", "Slash"];

function Tools() {
  const [tab, setTab] = useState<"tuner" | "chords">("tuner");
  const { t } = useT();
  const { from } = Route.useSearch();
  return (
    <div className="space-y-6">
      {from && (
        <Link to="/song/$id" params={{ id: from }} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-secondary px-4 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> {t("Back to Song")}
        </Link>
      )}
      <PageHeader eyebrow={t("Toolbox")} title={t("Tools")} />
      <div className="grid grid-cols-2 gap-1 rounded-full bg-secondary p-1 sm:max-w-md" role="tablist" aria-label={t("Tools")}>
        {([["tuner", "Guitar Tuner"], ["chords", "Chord Library"]] as const).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn("min-h-11 rounded-full px-4 text-sm font-medium transition", tab === id ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground")}
          >
            {t(label)}
          </button>
        ))}
      </div>
      {tab === "tuner" ? (
        <section aria-label={t("Guitar Tuner")}>
          
          <GuitarTuner />
        </section>
      ) : (
        <ChordLibrary />
      )}
    </div>
  );
}

function ChordLibrary() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [open, setOpen] = useState<Chord | null>(null);
  const { t: tr } = useT();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const results = (q ? searchChords(q) : CHORD_LIBRARY).filter((c) => cat === "All" || c.category === cat);

  return (
    <section aria-labelledby="chords-h" className="space-y-8">
      <div>
        <h2 id="chords-h" className="font-display text-2xl font-semibold">{tr("Guitar Chord Library")}</h2>
        <p className="text-sm text-muted-foreground">{tr("Search any chord — e.g. Am7, Dsus4, D/F#. Tap a chord to see alternate shapes and a triad.")}</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("Search chords")} aria-label={tr("Search chords")} className="h-12 rounded-full bg-card pl-11 text-base" />
      </div>

      {!q && cat === "All" && (
        <div className="space-y-6">
          {QUICK_CHART.map((g) => (
            <div key={g.title}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">{tr(g.title)}</h3>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                {g.chords.map((n) => {
                  const c = findChord(n)!;
                  return <ChordCard key={n} chord={c} onOpen={() => setOpen(c)} small />;
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {CATS.map((t) => (
            <button key={t} onClick={() => setCat(t)} className={cn("min-h-10 shrink-0 rounded-full border border-border px-4 text-sm transition", cat === t ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary")}>
              {t === "All" ? tr("All") : t}
            </button>
          ))}
        </div>
        {results.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {results.map((c) => <ChordCard key={c.name} chord={c} onOpen={() => setOpen(c)} />)}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">{tr("No chord called “{q}” yet. Try a simpler name like Am or G7.", { q })}</p>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={() => setOpen(null)} role="dialog" aria-modal aria-label={tr("{name} shapes", { name: open.name })}>
          <div className="w-full max-w-lg rounded-3xl bg-card p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-3xl font-semibold">{open.name}</h3>
              <button onClick={() => setOpen(null)} className="min-h-11 rounded-full px-4 text-sm text-muted-foreground hover:bg-secondary">{tr("Close")}</button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {open.voicings.map((vc, i) => {
                const label = vc.label === "Triad" ? tr("Triad") : i === 0 ? tr("Standard") : tr("Shape {n}", { n: i + 1 });
                return (
                  <div key={i} className="relative rounded-2xl border border-border p-3">
                    <PlayChord voicing={vc} label={tr("Play {name}, {shape}", { name: open.name, shape: label })} />
                    <ChordDiagram name={label} voicing={vc} size="sm" />
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{tr("Numbers show fingers: 1 index · 2 middle · 3 ring · 4 pinky. O = open, × = don't play.")} {tr("Triads use only the top three strings.")}</p>
          </div>
        </div>
      )}
    </section>
  );
}

function PlayChord({ voicing, label }: { voicing: Voicing; label: string }) {
  const [state, setState] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const { t: tr } = useT();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const play = async () => {
    setState("loading");
    try {
      const { playVoicing } = await import("@/lib/chord-audio");
      await playVoicing(voicing);
      setState("playing");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setState("idle"), 1800);
    } catch {
      setState("error");
    }
  };
  return (
    <>
      <button onClick={play} aria-label={label} title={label} className={cn("absolute left-1.5 top-1.5 grid h-11 w-11 place-items-center rounded-full text-primary transition hover:bg-secondary", state === "playing" && "bg-secondary")}>
        {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : state === "playing" ? <Volume2 className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
      </button>
      {state === "error" && <p role="alert" className="mt-1 text-center text-[11px] text-destructive">{tr("Audio unavailable. Please try again.")}</p>}
    </>
  );
}

function ChordCard({ chord, onOpen, small }: { chord: Chord; onOpen: () => void; small?: boolean }) {
  return (
    <button onClick={onOpen} className="relative rounded-2xl border border-border bg-card p-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
      <ChordDiagram name={chord.name} voicing={chord.voicings[0]!} size={small ? "sm" : "md"} />
      {chord.voicings.length > 1 && <span className="absolute right-2 top-2 rounded-full bg-secondary px-1.5 text-[10px] text-muted-foreground">+{chord.voicings.length - 1}</span>}
    </button>
  );
}
