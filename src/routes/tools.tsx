import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { ChordDiagram, CHORDS } from "@/components/ChordDiagram";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Guitar Tools — Bespoke Music" },
      { name: "description", content: "Guitar chord reference diagrams and a simple tuner." },
      { property: "og:title", content: "Guitar Tools — Bespoke Music" },
      { property: "og:description", content: "Chord reference diagrams and a guitar tuner." },
    ],
  }),
  component: Tools,
});

const STRINGS = ["E", "A", "D", "G", "B", "e"];
const TYPES = ["All", "Major", "Minor", "7th", "Add"];

function Tools() {
  const [type, setType] = useState("All");
  return (
    <div className="space-y-12">
      <PageHeader eyebrow="Toolbox" title="Tools" />
      <Tuner />
      <section>
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h2 className="font-display text-2xl font-semibold">Chord reference</h2>
        </div>
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {TYPES.map((t) => (
            <button key={t} onClick={() => setType(t)} className={cn("shrink-0 rounded-full border border-border px-4 py-1.5 text-sm", type === t ? "bg-primary text-primary-foreground" : "bg-card")}>
              {t}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {CHORDS.filter((c) => type === "All" || c.type === type).map((c) => <ChordDiagram key={c.name} name={c.name} frets={c.frets} />)}
        </div>
      </section>
    </div>
  );
}

function Tuner() {
  const [string, setString] = useState(0);
  const [on, setOn] = useState(false);
  const [cents, setCents] = useState(0);
  useEffect(() => {
    if (!on) return setCents(0);
    let c = -35;
    const t = setInterval(() => {
      c = c * 0.85 + (Math.random() - 0.5) * 4;
      setCents(c);
    }, 120);
    return () => clearInterval(t);
  }, [on, string]);
  const inTune = on && Math.abs(cents) < 4;

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold">Tuner</h2>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">Preview · Standard EADGBE</span>
      </div>
      <div className="relative mx-auto mt-6 aspect-[2/1] w-full max-w-sm overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 aspect-square rounded-full border-[10px] border-secondary" />
        <div className="absolute bottom-0 left-1/2 h-[88%] w-1 origin-bottom rounded-full bg-primary transition-transform duration-150" style={{ transform: `translateX(-50%) rotate(${cents * 1.6}deg)` }} />
        <div className="absolute bottom-0 left-1/2 h-5 w-5 -translate-x-1/2 translate-y-1/2 rounded-full bg-foreground" />
      </div>
      <p className={cn("mt-4 text-center font-display text-5xl font-semibold", inTune ? "text-primary" : "")}>{STRINGS[string]}</p>
      <p className="text-center text-sm text-muted-foreground">{!on ? "Tap Listen to start" : inTune ? "In tune ✓" : cents < 0 ? "Tune up" : "Tune down"}</p>
      <div className="mt-5 grid grid-cols-6 gap-2">
        {STRINGS.map((s, i) => (
          <button key={i} onClick={() => setString(i)} className={cn("h-12 rounded-xl border border-border font-display text-lg font-semibold", string === i ? "bg-primary text-primary-foreground" : "bg-background")}>{s}</button>
        ))}
      </div>
      <Button onClick={() => setOn((v) => !v)} variant={on ? "outline" : "default"} className="mt-4 h-12 w-full rounded-full">
        <Mic className="mr-2 h-4 w-4" /> {on ? "Stop" : "Listen"}
      </Button>
    </section>
  );
}
