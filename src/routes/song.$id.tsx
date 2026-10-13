import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Heart, Minus, Pencil, Play, Plus, ListPlus, Pause, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SongSheet } from "@/components/SongSheet";
import { useStore } from "@/lib/store";
import { transposeChord, uniqueChords } from "@/lib/songs";
import { SPEED_PRESETS, useAutoScroll } from "@/hooks/use-auto-scroll";
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
  const { user, signedIn, songsLoaded, getSong, saved, toggleSaved, requireAuth, markPlayed, playlists, addToPlaylist, deleteSong, scrollSpeed, setScrollSpeed } = useStore();
  const navigate = useNavigate();
  const song = getSong(id);
  const [size, setSize] = useState(18);
  const [tr, setTr] = useState(0);
  const { playing, suspended, toggle, stop } = useAutoScroll(scrollSpeed);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [controlsVisible, setControlsVisible] = useState(true);

  useEffect(() => {
    if (song && signedIn) markPlayed(song.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.id, signedIn]);

  useEffect(() => stop, [id, stop]);

  useEffect(() => {
    const el = controlsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setControlsVisible(!!e?.isIntersecting), { rootMargin: "-64px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [song?.id]);

  if (!songsLoaded) return <div className="mx-auto h-96 max-w-3xl animate-pulse rounded-3xl bg-secondary" />;
  if (!song) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-display text-3xl">Song not found</h1>
        <Link to="/" className="mt-4 inline-block text-primary underline">Back to Explore</Link>
      </div>
    );
  }
  const isSaved = signedIn && saved.includes(song.id);
  const isMine = !!user && song.ownerId === user.id;
  const presetName = (Object.entries(SPEED_PRESETS).find(([, v]) => Math.abs(v - scrollSpeed) < 0.05)?.[0]) ?? `${scrollSpeed.toFixed(1)}×`;

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={() => history.back()} className="mb-4 flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
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

      {/* Playback controls */}
      <div ref={controlsRef} className="mb-4 rounded-3xl border border-border bg-card p-4 shadow-soft">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
          <Button size="lg" onClick={toggle} aria-pressed={playing} className="h-14 rounded-full px-6 text-base shadow-lift">
            {playing ? <><Pause className="mr-2 h-5 w-5 fill-current" /> Pause</> : <><Play className="mr-2 h-5 w-5 fill-current" /> Play</>}
          </Button>
          <div className="min-w-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Scroll speed</span>
              <span className={cn("font-medium", playing && "text-primary")} aria-live="polite">
                {playing ? (suspended ? "Paused while you scroll…" : `Scrolling · ${presetName}`) : presetName}
              </span>
            </div>
            <Slider className="mt-2" min={0.3} max={3} step={0.1} value={[scrollSpeed]} onValueChange={([v]) => setScrollSpeed(v ?? 1)} aria-label="Auto-scroll speed" />
            <div className="mt-2 grid grid-cols-3 gap-1">
              {(Object.keys(SPEED_PRESETS) as (keyof typeof SPEED_PRESETS)[]).map((k) => (
                <button key={k} onClick={() => setScrollSpeed(SPEED_PRESETS[k])} className={cn("min-h-9 rounded-full text-xs font-medium", presetName === k ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-[61px] z-20 -mx-4 mb-6 flex items-center gap-2 overflow-x-auto border-y border-border bg-background/90 px-4 py-2 backdrop-blur md:top-[73px]">
        <Stepper label="Size" onMinus={() => setSize((s) => Math.max(14, s - 2))} onPlus={() => setSize((s) => Math.min(30, s + 2))} value={`${size}`} />
        <Stepper label="Key" onMinus={() => setTr((t) => t - 1)} onPlus={() => setTr((t) => t + 1)} value={tr > 0 ? `+${tr}` : `${tr}`} />
        <div className="ml-auto flex shrink-0 gap-1">
          <Button variant="ghost" size="icon" className="h-11 w-11" aria-label={isSaved ? "Unsave" : "Save"} onClick={() => requireAuth("Sign in to save songs to your songbook.", async () => { await toggleSaved(song.id); toast(isSaved ? "Removed from Saved" : "Saved to My Songs"); })}>
            <Heart className={cn("h-5 w-5", isSaved && "fill-primary text-primary")} />
          </Button>
          {signedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Add to playlist"><ListPlus className="h-5 w-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Add to playlist</DropdownMenuLabel>
                {playlists.length ? playlists.map((p) => (
                  <DropdownMenuItem key={p.id} onClick={async () => { await addToPlaylist(p.id, song.id); toast(`Added to ${p.name}`); }}>{p.name}</DropdownMenuItem>
                )) : <DropdownMenuItem onClick={() => navigate({ to: "/playlists" })}>Create a playlist first</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Add to playlist" onClick={() => requireAuth("Sign in to add songs to playlists.", () => {})}><ListPlus className="h-5 w-5" /></Button>
          )}
          {isMine && (
            <>
              <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Edit" onClick={() => navigate({ to: "/song/$id/edit", params: { id: song.id } })}><Pencil className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Delete" onClick={async () => { if (confirm("Delete this song?")) { await deleteSong(song.id); navigate({ to: "/my-songs" }); } }}><Trash2 className="h-5 w-5" /></Button>
            </>
          )}
        </div>
      </div>

      <SongSheet sections={song.sections} fontSize={size} transpose={tr} />
      <div className="h-[40vh]" aria-hidden />

      {/* Floating control when main controls are off-screen */}
      <button
        onClick={toggle}
        aria-label={playing ? "Pause auto-scroll" : "Play auto-scroll"}
        className={cn(
          "fixed right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lift transition-all duration-200",
          "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-8",
          controlsVisible ? "pointer-events-none scale-75 opacity-0" : "scale-100 opacity-100",
        )}
        tabIndex={controlsVisible ? -1 : 0}
      >
        {playing ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
        {playing && suspended && <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent ring-2 ring-background" />}
      </button>
    </div>
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
      <button aria-label={`${label} down`} onClick={onMinus} className="grid h-9 w-9 place-items-center rounded-full bg-card shadow-soft"><Minus className="h-3.5 w-3.5" /></button>
      <span className="w-7 text-center font-mono text-sm font-semibold">{value}</span>
      <button aria-label={`${label} up`} onClick={onPlus} className="grid h-9 w-9 place-items-center rounded-full bg-card shadow-soft"><Plus className="h-3.5 w-3.5" /></button>
    </div>
  );
}
