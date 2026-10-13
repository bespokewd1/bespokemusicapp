import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Heart, Minus, Pencil, Play, Plus, X, ListPlus, Pause } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SongSheet } from "@/components/SongSheet";
import { useStore } from "@/lib/store";
import { transposeChord, uniqueChords } from "@/lib/songs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/song/$id")({
  head: () => ({
    meta: [
      { title: "Song — Bespoke Music" },
      { name: "description", content: "Chords and lyrics, cleanly laid out for playing." },
      { property: "og:title", content: "Song — Bespoke Music" },
      { property: "og:description", content: "Chords and lyrics, cleanly laid out for playing." },
    ],
  }),
  component: SongPage,
});

function SongPage() {
  const { id } = Route.useParams();
  const { signedIn, getSong, saved, toggleSaved, requireAuth, markPlayed, playlists, addToPlaylist, added } = useStore();
  const navigate = useNavigate();
  const song = getSong(id);
  const [size, setSize] = useState(18);
  const [tr, setTr] = useState(0);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (song) markPlayed(song.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!song) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-display text-3xl">Song not found</h1>
        <Link to="/" className="mt-4 inline-block text-primary underline">Back to Explore</Link>
      </div>
    );
  }
  const isSaved = signedIn && saved.includes(song.id);
  const isMine = added.some((a) => a.id === song.id);

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={() => history.back()} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <header className="mb-6">
        <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">{song.title}</h1>
        <p className="mt-1 text-lg text-muted-foreground">{song.artist}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Meta label="Key" value={transposeChord(song.key, tr)} />
          <Meta label="Capo" value={song.capo ? `Fret ${song.capo}` : "None"} />
          <Meta label="Level" value={song.difficulty} />
          <Meta label="Tempo" value={`${song.tempo} bpm`} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {uniqueChords(song).map((c) => (
            <span key={c} className="rounded-md bg-secondary px-2 py-0.5 font-mono text-sm font-bold text-primary">{transposeChord(c, tr)}</span>
          ))}
        </div>
      </header>

      <Button size="lg" className="mb-4 h-14 w-full rounded-full text-base shadow-lift" onClick={() => setPlay(true)}>
        <Play className="mr-2 h-5 w-5 fill-current" /> Play Mode
      </Button>

      <div className="sticky top-[61px] z-20 -mx-4 mb-6 flex items-center gap-2 overflow-x-auto border-y border-border bg-background/90 px-4 py-2 backdrop-blur">
        <Stepper label="Size" onMinus={() => setSize((s) => Math.max(14, s - 2))} onPlus={() => setSize((s) => Math.min(30, s + 2))} value={`${size}`} />
        <Stepper label="Transpose" onMinus={() => setTr((t) => t - 1)} onPlus={() => setTr((t) => t + 1)} value={tr > 0 ? `+${tr}` : `${tr}`} />
        <div className="ml-auto flex shrink-0 gap-1">
          <Button variant="ghost" size="icon" aria-label="Save" onClick={() => requireAuth("Sign in to save this song.", () => { toggleSaved(song.id); toast(isSaved ? "Removed from Saved" : "Saved to My Songs"); })}>
            <Heart className={cn("h-5 w-5", isSaved && "fill-primary text-primary")} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Add to playlist" onClick={(e) => { if (!useStoreSignedIn(e)) return; }}>
                <ListPlus className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <PlaylistMenu songId={song.id} playlists={playlists} add={addToPlaylist} requireAuth={requireAuth} />
          </DropdownMenu>
          <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => requireAuth("Sign in to edit songs.", () => navigate({ to: "/song/$id/edit", params: { id: song.id } }))}>
            <Pencil className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <SongSheet sections={song.sections} fontSize={size} transpose={tr} />
      {isMine && <p className="mt-10 text-xs text-muted-foreground">You added this song.</p>}

      {play && <PlayMode title={song.title} artist={song.artist} sections={song.sections} transpose={tr} onClose={() => setPlay(false)} />}
    </div>
  );
}

// Dropdown opens regardless; menu items gate on auth.
function useStoreSignedIn(_e: unknown) {
  return true;
}

function PlaylistMenu({ songId, playlists, add, requireAuth }: { songId: string; playlists: { id: string; name: string }[]; add: (p: string, s: string) => void; requireAuth: (r: string, f: () => void) => void }) {
  return (
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Add to playlist</DropdownMenuLabel>
      {playlists.map((p) => (
        <DropdownMenuItem key={p.id} onClick={() => requireAuth("Sign in to add songs to playlists.", () => { add(p.id, songId); toast(`Added to ${p.name}`); })}>
          {p.name}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-border bg-card px-3 py-1">
      <span className="text-muted-foreground">{label} </span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

function Stepper({ label, value, onMinus, onPlus }: { label: string; value: string; onMinus: () => void; onPlus: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-1 py-1">
      <span className="px-2 text-xs font-medium text-muted-foreground">{label}</span>
      <button aria-label={`${label} down`} onClick={onMinus} className="grid h-8 w-8 place-items-center rounded-full bg-card shadow-soft"><Minus className="h-3.5 w-3.5" /></button>
      <span className="w-7 text-center font-mono text-sm font-semibold">{value}</span>
      <button aria-label={`${label} up`} onClick={onPlus} className="grid h-8 w-8 place-items-center rounded-full bg-card shadow-soft"><Plus className="h-3.5 w-3.5" /></button>
    </div>
  );
}

function PlayMode({ title, artist, sections, transpose, onClose }: { title: string; artist: string; sections: Parameters<typeof SongSheet>[0]["sections"]; transpose: number; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrolling, setScrolling] = useState(false);
  const [size, setSize] = useState(24);
  useEffect(() => {
    if (!scrolling) return;
    const t = setInterval(() => ref.current?.scrollBy({ top: 1 }), 50);
    return () => clearInterval(t);
  }, [scrolling]);
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{artist}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setSize((s) => Math.max(16, s - 2))} aria-label="Smaller"><Minus className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setSize((s) => Math.min(40, s + 2))} aria-label="Larger"><Plus className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Exit Play Mode"><X className="h-5 w-5" /></Button>
        </div>
      </div>
      <div ref={ref} className="flex-1 overflow-y-auto px-5 py-8">
        <div className="mx-auto max-w-3xl pb-[60vh]">
          <SongSheet sections={sections} fontSize={size} transpose={transpose} />
        </div>
      </div>
      <Button size="lg" onClick={() => setScrolling((v) => !v)} className="absolute bottom-6 left-1/2 h-14 -translate-x-1/2 rounded-full px-8 shadow-lift">
        {scrolling ? <><Pause className="mr-2 h-5 w-5" /> Pause scroll</> : <><Play className="mr-2 h-5 w-5" /> Auto-scroll</>}
      </Button>
    </div>
  );
}
