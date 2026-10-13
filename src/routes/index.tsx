import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SongCard } from "@/components/SongCard";
import { useStore } from "@/lib/store";
import { uniqueChords } from "@/lib/songs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Explore Songs — Bespoke Music" },
      { name: "description", content: "Browse guitar songs with chords and lyrics. Pick up and play — no ads, no distractions." },
      { property: "og:title", content: "Explore Songs — Bespoke Music" },
      { property: "og:description", content: "Your personal guitar songbook. No ads. No distractions." },
    ],
  }),
  component: Explore,
});

function Explore() {
  const { allSongs, songsLoaded, user } = useStore();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("pick");
  const query = q.trim().toLowerCase();
  const list = allSongs
    .filter((s) => !s.ownerId || s.ownerId === user?.id)
    .filter((s) => (tab === "pick" ? s.pickUp : tab === "easy" ? s.difficulty !== "Intermediate" : true))
    .filter(
      (s) =>
        !query ||
        s.title.toLowerCase().includes(query) ||
        s.artist.toLowerCase().includes(query) ||
        uniqueChords(s).some((c) => c.toLowerCase() === query),
    )
    .sort((a, b) => (tab === "pick" ? (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99) : 0));

  return (
    <div>
      <section className="bg-hero relative mb-8 overflow-hidden rounded-3xl px-6 py-10 text-primary-foreground shadow-lift md:px-12 md:py-14">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border-[18px] border-primary-foreground/10" />
        <div className="pointer-events-none absolute -right-4 -top-4 h-40 w-40 rounded-full border-[6px] border-primary-foreground/10" />
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] opacity-80">
          <Sparkles className="h-3.5 w-3.5" /> No ads. No distractions.
        </p>
        <h1 className="mt-3 max-w-xl font-display text-4xl font-semibold leading-[1.05] md:text-6xl">
          Your personal <em className="font-normal">guitar songbook.</em>
        </h1>
        <div className="relative mt-6 max-w-lg">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search songs, artists or a chord (e.g. G)"
            className="h-12 rounded-full border-0 bg-card pl-11 text-base text-foreground shadow-soft"
          />
        </div>
      </section>

      <Tabs value={tab} onValueChange={setTab} className="mb-5">
        <TabsList className="h-11 w-full rounded-full bg-secondary p-1 sm:w-auto">
          <TabsTrigger value="pick" className="flex-1 rounded-full px-4">Pick Up & Play</TabsTrigger>
          <TabsTrigger value="easy" className="flex-1 rounded-full px-4">Easy Songs</TabsTrigger>
          <TabsTrigger value="all" className="flex-1 rounded-full px-4">All Songs</TabsTrigger>
        </TabsList>
      </Tabs>
      <p className="mb-4 text-sm text-muted-foreground">
        {tab === "pick" && "Three or four chords, big singalong energy. Perfect for a quick strum."}
        {tab === "easy" && "Friendly open chords and steady rhythms."}
        {tab === "all" && `${list.length} songs in the library.`}
      </p>

      {!songsLoaded ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-secondary" />)}</div>
      ) : list.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => <SongCard key={s.id} song={s} />)}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          No songs match “{q}”. Try another title or chord.
        </p>
      )}
    </div>
  );
}
