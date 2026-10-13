import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GuitarTuner } from "@/components/GuitarTuner";
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

const TYPES = ["All", "Major", "Minor", "7th", "Add"];

function Tools() {
  const [type, setType] = useState("All");
  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Toolbox" title="Tools" />
      <h2 className="-mb-8 font-display text-2xl font-semibold">Guitar Tuner</h2>
      <GuitarTuner />
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

