import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Heart, Minus, Pencil, Play, Plus, ListPlus, Pause, Trash2, Hash, PenLine, Eraser, StickyNote, FileDown, MoreHorizontal, Maximize, Minimize, SkipBack, SkipForward, ListTree } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AnnotationLayer, type Tool } from "@/components/AnnotationLayer";
import { SongImages } from "@/components/SongImages";
import { ChordDiagram } from "@/components/ChordDiagram";
import { isValidKey, KEY_OPTIONS } from "@/lib/nashville";
import type { Stroke } from "@/lib/store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SongSheet } from "@/components/SongSheet";
import { useStore } from "@/lib/store";
import { transposeChord } from "@/lib/songs";
import { findChord } from "@/lib/chords";
import { exportSongPdf } from "@/lib/pdf";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { useIsMobile } from "@/hooks/use-mobile";
import { loadTranspose, loadViewPrefs, playlistNeighbours, saveTranspose, saveViewPrefs, SIZE_MAX, SIZE_MIN } from "@/lib/view-prefs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/song/$id")({
  validateSearch: (s: Record<string, unknown>): { pl?: string } => (typeof s["pl"] === "string" && s["pl"] ? { pl: s["pl"] as string } : {}),
  head: () => ({
    meta: [
      { title: "Song — Bespoke Music" },
      { name: "description", content: "Chords and lyrics, cleanly laid out for playing." },
      { property: "og:title", content: "Song — Bespoke Music" },
      { property: "og:description", content: "Chords and lyrics, cleanly laid out for playing." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SongPage,
});

type MenuItem = { key: string; label: string; icon: React.ComponentType<{ className?: string }>; onSelect: () => void; disabled?: boolean };

function SongPage() {
  const { id } = Route.useParams();
  const { pl } = Route.useSearch();
  const { user, signedIn, songsLoaded, getSong, saved, toggleSaved, requireAuth, markPlayed, playlists, addToPlaylist, deleteSong, scrollSpeed, setScrollSpeed, loadSongData, saveSongData } = useStore();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const song = getSong(id);
  const [size, setSize] = useState(18);
  const [tr, setTr] = useState(0);
  const [nash, setNash] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const { playing, suspended, toggle, stop } = useAutoScroll(scrollSpeed);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [nashKey, setNashKey] = useState("");
  const [annotate, setAnnotate] = useState(false);
  const [tool, setTool] = useState<Tool>({ kind: "pen", color: "#dc2626" });
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [plOpen, setPlOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [chord, setChord] = useState<string | null>(null);
  const [perf, setPerf] = useState(false);

  // Device-remembered display preferences
  useEffect(() => {
    const p = loadViewPrefs();
    setSize(p.size);
    setNash(p.nashville);
    setPrefsLoaded(true);
  }, []);
  useEffect(() => { if (prefsLoaded) saveViewPrefs({ size, nashville: nash }); }, [size, nash, prefsLoaded]);
  useEffect(() => { setTr(loadTranspose(id)); window.scrollTo(0, 0); }, [id]);
  const changeTr = (t: number) => { const v = ((t + 11) % 23 + 23) % 23 - 11; setTr(v); saveTranspose(id, v); };

  useEffect(() => {
    if (!signedIn) { setStrokes([]); setNotes(""); setSavedNotes(""); return; }
    loadSongData(id).then((d) => { setStrokes(d.annotations); setNotes(d.notes); setSavedNotes(d.notes); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, signedIn]);

  const changeStrokes = (s: Stroke[]) => { setStrokes(s); saveSongData(id, { annotations: s }); };

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

  // Performance mode: hide site chrome, native fullscreen when possible, keep screen awake
  useEffect(() => {
    if (!perf) return;
    const root = document.documentElement;
    root.dataset["perf"] = "1";
    root.requestFullscreen?.().catch(() => {});
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
    const acquire = () => { if (document.visibilityState === "visible") nav.wakeLock?.request("screen").then((l) => { lock = l; }).catch(() => {}); };
    acquire();
    const onVis = () => acquire();
    const onFs = () => { if (!document.fullscreenElement && wasFs) setPerf(false); };
    let wasFs = false;
    const fsCheck = () => { if (document.fullscreenElement) wasFs = true; onFs(); };
    document.addEventListener("visibilitychange", onVis);
    document.addEventListener("fullscreenchange", fsCheck);
    return () => {
      delete root.dataset["perf"];
      document.removeEventListener("visibilitychange", onVis);
      document.removeEventListener("fullscreenchange", fsCheck);
      lock?.release().catch(() => {});
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    };
  }, [perf]);

  if (!songsLoaded) return <div className="mx-auto h-96 max-w-3xl animate-pulse rounded-3xl bg-secondary" />;
  if (!song) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-display text-3xl">Song not found</h1>
        <Link to="/" className="mt-4 inline-block text-primary underline">Back to Home</Link>
      </div>
    );
  }
  const isSaved = signedIn && saved.includes(song.id);
  const isMine = !!user && song.ownerId === user.id;
  const keyNow = isValidKey(song.key) ? transposeChord(song.key, tr) : song.key;
  const baseKey = isValidKey(song.key) ? keyNow : nashKey;
  const nashvilleKey = nash && baseKey ? baseKey : null;
  const playlist = pl ? playlists.find((p) => p.id === pl) : undefined;
  const nb = playlist ? playlistNeighbours(playlist.songIds, song.id) : null;
  const goTo = (sid: string) => { stop(); navigate({ to: "/song/$id", params: { id: sid }, search: pl ? { pl } : {} }); };
  const sections = song.sections.map((s, i) => ({ name: s.name, i })).filter((s) => s.name.trim());

  const close = () => setMoreOpen(false);
  const items: MenuItem[] = [
    { key: "pl", label: "Add to Playlist", icon: ListPlus, onSelect: () => requireAuth("Sign in to add songs to playlists.", () => setPlOpen(true)) },
    { key: "notes", label: savedNotes ? "Song Notes · saved" : "Song Notes", icon: StickyNote, onSelect: () => requireAuth("Sign in to keep private notes.", () => setNotesOpen(true)) },
    ...(isMine ? [{ key: "edit", label: "Edit Song", icon: Pencil, onSelect: () => navigate({ to: "/song/$id/edit", params: { id: song.id } }) }] : []),
    { key: "ann", label: annotate ? "Stop Annotating" : "Annotate", icon: PenLine, onSelect: () => requireAuth("Sign in to annotate songs.", () => setAnnotate((v) => !v)) },
    { key: "pdf", label: "Export PDF", icon: FileDown, onSelect: () => exportSongPdf(song, { transpose: tr }) },
    ...(signedIn && savedNotes.trim() ? [{ key: "pdfn", label: "Export PDF with notes", icon: FileDown, onSelect: () => exportSongPdf(song, { transpose: tr, notes: savedNotes }) }] : []),
  ];
  const jump = (i: number) => { stop(); document.getElementById(`sec-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  const speedLabel = `${scrollSpeed.toFixed(1)}×`;
  const chordInfo = chord ? findChord(chord) : undefined;

  return (
    <div className="mx-auto max-w-3xl">
      {!perf && (
        <button onClick={() => history.back()} className="mb-2 flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      )}

      {nb && playlist && !perf && (
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-soft">
          <Link to="/playlists/$id" params={{ id: playlist.id }} className="min-w-0 truncate text-sm">
            <span className="font-semibold">{playlist.name}</span>
            <span className="text-muted-foreground"> · Song {nb.index + 1} of {nb.total}</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" aria-label="Previous song" disabled={!nb.prev} onClick={() => nb.prev && goTo(nb.prev)}><SkipBack className="h-5 w-5" /></Button>
            <Button variant="secondary" size="icon" className="h-11 w-11 rounded-full" aria-label={playing ? "Pause" : "Play"} onClick={toggle}>{playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}</Button>
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" aria-label="Next song" disabled={!nb.next} onClick={() => nb.next && goTo(nb.next)}><SkipForward className="h-5 w-5" /></Button>
          </div>
        </div>
      )}

      <header className={cn("mb-4", perf && "pt-2")}>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <div className="min-w-0">
            <h1 className="break-words font-display text-3xl font-semibold leading-tight md:text-5xl">{song.title}</h1>
            <p className="mt-0.5 text-base text-muted-foreground md:text-lg">{song.artist}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0 rounded-full" aria-label={isSaved ? "Remove from favourites" : "Add to favourites"} onClick={() => requireAuth("Sign in to save songs to your songbook.", async () => { await toggleSaved(song.id); toast(isSaved ? "Removed from Saved" : "Saved to My Songs"); })}>
            <Heart className={cn("h-6 w-6", isSaved && "fill-primary text-primary")} />
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs md:text-sm">
          <Chip>Key {keyNow}</Chip>
          <Chip>{song.capo ? `Capo ${song.capo}` : "No capo"}</Chip>
          <Chip>{song.tempo} BPM</Chip>
          <Chip>{song.difficulty}</Chip>
        </div>
      </header>

      {/* Playback */}
      {!perf && (
        <div ref={controlsRef} className="mb-3 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-3xl border border-border bg-card p-3 shadow-soft md:p-4">
          <Button size="lg" onClick={toggle} aria-pressed={playing} className="h-12 rounded-full px-5 text-base shadow-lift md:h-14 md:px-6">
            {playing ? <><Pause className="mr-2 h-5 w-5 fill-current" /> Pause</> : <><Play className="mr-2 h-5 w-5 fill-current" /> Play</>}
          </Button>
          <SpeedSlider speed={scrollSpeed} onChange={setScrollSpeed} status={playing ? (suspended ? "Paused while you scroll…" : speedLabel) : speedLabel} active={playing} />
        </div>
      )}

      {/* Toolbar: Size | Transpose | Nashville | More */}
      {!perf && (
        <div className="sticky top-[61px] z-20 -mx-4 mb-6 flex flex-wrap items-center gap-1.5 border-y border-border bg-background/90 px-4 py-2 sm:gap-2 backdrop-blur md:top-[73px]">
          <Stepper label="Size" value={`${size}`} onMinus={() => setSize((s) => Math.max(SIZE_MIN, s - 2))} onPlus={() => setSize((s) => Math.min(SIZE_MAX, s + 2))} />
          <Stepper label="Transpose" value={tr > 0 ? `+${tr}` : `${tr}`} onMinus={() => changeTr(tr - 1)} onPlus={() => changeTr(tr + 1)} />
          {tr !== 0 && <button onClick={() => changeTr(0)} className="min-h-9 shrink-0 rounded-full px-2 text-xs text-muted-foreground underline">Reset</button>}
          <button aria-pressed={nash} onClick={() => setNash((v) => !v)} className={cn("flex min-h-11 shrink-0 items-center gap-1 rounded-full px-3 text-xs font-medium", nash ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
            <Hash className="h-3.5 w-3.5" /> Nashville
          </button>
          {nash && !isValidKey(song.key) && (
            <select aria-label="Song key for Nashville" value={nashKey} onChange={(e) => setNashKey(e.target.value)} className="min-h-9 shrink-0 rounded-full border border-border bg-card px-2 text-xs">
              <option value="">Pick key</option>
              {KEY_OPTIONS.map((k) => <option key={k}>{k}</option>)}
            </select>
          )}
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Full screen" onClick={() => { setAnnotate(false); setPerf(true); }}><Maximize className="h-5 w-5" /></Button>
            {isMobile ? (
              <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="More actions" onClick={() => setMoreOpen(true)}><MoreHorizontal className="h-5 w-5" /></Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="More actions"><MoreHorizontal className="h-5 w-5" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  {items.map((it) => (
                    <DropdownMenuItem key={it.key} onSelect={it.onSelect}><it.icon className="mr-2 h-4 w-4" />{it.label}</DropdownMenuItem>
                  ))}
                  {sections.length > 0 && (<>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground">Jump to section</DropdownMenuLabel>
                    {sections.map((s) => <DropdownMenuItem key={s.i} onSelect={() => jump(s.i)}><ListTree className="mr-2 h-4 w-4" />{s.name}</DropdownMenuItem>)}
                  </>)}
                  {isMine && (<>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setDelOpen(true)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete Song</DropdownMenuItem>
                  </>)}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      {/* Mobile bottom sheet */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-3xl pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <SheetHeader><SheetTitle className="text-left">More</SheetTitle></SheetHeader>
          <div className="mt-2 grid gap-1">
            {items.map((it) => (
              <button key={it.key} onClick={() => { close(); it.onSelect(); }} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-left text-sm font-medium hover:bg-secondary">
                <it.icon className="h-5 w-5 text-primary" />{it.label}
              </button>
            ))}
          </div>
          {sections.length > 0 && (
            <div className="mt-3 border-t border-border pt-3">
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Jump to section</p>
              <div className="mt-2 flex flex-wrap gap-2 px-3">
                {sections.map((s) => <button key={s.i} onClick={() => { close(); setTimeout(() => jump(s.i), 250); }} className="min-h-10 rounded-full bg-secondary px-3 text-sm">{s.name}</button>)}
              </div>
            </div>
          )}
          {isMine && (
            <div className="mt-3 border-t border-border pt-3">
              <button onClick={() => { close(); setDelOpen(true); }} className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-destructive hover:bg-destructive/10">
                <Trash2 className="h-5 w-5" />Delete Song
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add to playlist */}
      <Dialog open={plOpen} onOpenChange={setPlOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add to playlist</DialogTitle></DialogHeader>
          <div className="grid max-h-72 gap-1 overflow-y-auto">
            {playlists.map((p) => {
              const has = p.songIds.includes(song.id);
              return (
                <button key={p.id} disabled={has} onClick={async () => { await addToPlaylist(p.id, song.id); toast(`Added to ${p.name}`); }} className="flex min-h-11 items-center justify-between rounded-xl px-3 text-left text-sm hover:bg-secondary disabled:opacity-60">
                  <span className="truncate">{p.name}</span>{has && <span className="text-xs text-muted-foreground">Added</span>}
                </button>
              );
            })}
          </div>
          <Button variant="secondary" className="rounded-full" onClick={() => { setPlOpen(false); navigate({ to: "/playlists" }); }}><Plus className="mr-1 h-4 w-4" />Create a playlist</Button>
        </DialogContent>
      </Dialog>

      {/* Notes */}
      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Song notes</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">Private — only you can see these.</p>
          <Textarea value={notes} maxLength={5000} onChange={(e) => setNotes(e.target.value)} placeholder="Strumming patterns, vocal reminders, ideas…" className="min-h-40" />
          <div className="flex justify-end">
            <Button className="rounded-full" disabled={notes === savedNotes} onClick={async () => { if (await saveSongData(song.id, { notes })) { setSavedNotes(notes); toast("Notes saved"); } }}>Save notes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={delOpen} onOpenChange={setDelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete “{song.title}”?</AlertDialogTitle><AlertDialogDescription>This permanently removes the song from your library and playlists.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => { await deleteSong(song.id); navigate({ to: "/my-songs" }); }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Chord diagram */}
      <Dialog open={!!chord} onOpenChange={(o) => !o && setChord(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-mono">{chord}</DialogTitle></DialogHeader>
          {chordInfo ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {chordInfo.voicings.map((v, i) => <ChordDiagram key={i} name={i === 0 ? chordInfo.name : `Alt ${i}`} voicing={v} size="sm" />)}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No verified diagram for {chord} yet. Check the Chord Library in Tools for similar shapes.</p>
          )}
        </DialogContent>
      </Dialog>

      {annotate && !perf && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-soft">
          {([["Red", "#dc2626"], ["Yellow", "#facc15"], ["Black", "#111827"]] as const).map(([n, c]) => (
            <button key={c} aria-label={`${n} pen`} aria-pressed={tool.kind === "pen" && tool.color === c} onClick={() => setTool({ kind: "pen", color: c })}
              className={cn("h-8 w-8 rounded-full border-2", tool.kind === "pen" && tool.color === c ? "border-primary ring-2 ring-primary/30" : "border-border")} style={{ background: c }} />
          ))}
          <button aria-label="Eraser" aria-pressed={tool.kind === "eraser"} onClick={() => setTool({ kind: "eraser" })} className={cn("grid h-9 w-9 place-items-center rounded-full", tool.kind === "eraser" ? "bg-primary text-primary-foreground" : "bg-secondary")}>
            <Eraser className="h-4 w-4" />
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="rounded-full" disabled={!strokes.length}>Clear all</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Clear all drawings?</AlertDialogTitle><AlertDialogDescription>This removes every mark on this song. Chords and lyrics stay untouched.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => changeStrokes([])}>Clear all</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button size="sm" className="ml-auto rounded-full" onClick={() => setAnnotate(false)}>Done</Button>
        </div>
      )}

      <AnnotationLayer strokes={strokes} onChange={changeStrokes} active={annotate && !perf} tool={tool}>
        <SongSheet sections={song.sections} fontSize={size} transpose={tr} nashvilleKey={nashvilleKey} onChord={annotate ? undefined : setChord} />
        <SongImages images={song.images ?? []} />
      </AnnotationLayer>
      <div className="h-[40vh]" aria-hidden />

      {/* Performance mode bar */}
      {perf && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <div className="mx-auto grid max-w-3xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
            <Button size="icon" onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="h-12 w-12 rounded-full shadow-lift">
              {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
            </Button>
            <SpeedSlider speed={scrollSpeed} onChange={setScrollSpeed} status={playing && suspended ? "Paused while you scroll…" : speedLabel} active={playing} />
            <Button variant="secondary" className="h-11 rounded-full px-3" onClick={() => setPerf(false)} aria-label="Exit full screen">
              <Minimize className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Exit</span>
            </Button>
          </div>
        </div>
      )}

      {/* Floating play control when main controls are off-screen (never alongside performance bar) */}
      {!perf && (
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
      )}
    </div>
  );
}

function SpeedSlider({ speed, onChange, status, active }: { speed: number; onChange: (v: number) => void; status: string; active: boolean }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Scroll speed</span>
        <span className={cn("font-mono font-semibold", active && "text-primary")} aria-live="polite">{status}</span>
      </div>
      <Slider className="mt-2" min={0.3} max={3} step={0.1} value={[speed]} onValueChange={([v]) => onChange(v ?? 1)} aria-label="Auto-scroll speed" />
      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground"><span>Slow</span><span>Fast</span></div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-border bg-card px-2.5 py-0.5 font-medium">{children}</span>;
}

function Stepper({ label, value, onMinus, onPlus }: { label: string; value: string; onMinus: () => void; onPlus: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-secondary p-1">
      <span className="px-1.5 text-xs font-medium text-muted-foreground sm:px-2">{label}</span>
      <button aria-label={`${label} down`} onClick={onMinus} className="grid h-8 w-8 place-items-center rounded-full bg-card shadow-soft sm:h-9 sm:w-9"><Minus className="h-3.5 w-3.5" /></button>
      <span className="w-6 text-center font-mono text-sm font-semibold sm:w-7">{value}</span>
      <button aria-label={`${label} up`} onClick={onPlus} className="grid h-8 w-8 place-items-center rounded-full bg-card shadow-soft sm:h-9 sm:w-9"><Plus className="h-3.5 w-3.5" /></button>
    </div>
  );
}
