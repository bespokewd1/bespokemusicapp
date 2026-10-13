import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SongCard } from "@/components/SongCard";
import { useStore } from "@/lib/store";
import { uniqueChords } from "@/lib/songs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Explore Songs — Bespoke Music" },
      { name: "description", content: "Add your favourite songs, save chords and lyrics, create playlists, and build your personal guitar collection. No Ads. No Distractions." },
      { property: "og:title", content: "Bespoke Music — Your Personal Guitar Songbook" },
      { property: "og:description", content: "Add your favourite songs, save chords and lyrics, create playlists, and build your personal guitar collection. No Ads. No Distractions." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://bespokemusicapp.lovable.app/" },
      { property: "og:image", content: "https://bespokemusicapp.lovable.app/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Your Music. Your Songs. Your Way." },
      { name: "twitter:description", content: "One place for all your guitar chords, lyrics, and playlists. Save, organize, and play anytime." },
      { name: "twitter:image", content: "https://bespokemusicapp.lovable.app/og-image.png" },
    ],
    links: [{ rel: "canonical", href: "https://bespokemusicapp.lovable.app/" }],
  }),
  component: Explore,
});

function Explore() {
  const { allSongs, songsLoaded } = useStore();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("pick");
  const query = q.trim().toLowerCase();
  const list = allSongs
    .filter((s) => !s.ownerId && s.published !== false)
    .filter((s) => (tab === "pick" ? s.pickUp : true))
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
        <p className="text-xs font-semibold uppercase tracking-[0.25em] opacity-80">
          No ads. No distractions.
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
        </TabsList>
      </Tabs>
      <p className="mb-4 text-sm text-muted-foreground">
        Free demo songs to try. Sign in to add your own songs and playlists — only you can see them.
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
