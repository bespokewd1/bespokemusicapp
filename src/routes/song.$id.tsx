import { siteUrl } from "@/lib/site";
import { useT } from "@/lib/i18n";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { forwardRef } from "react";
import { ArrowLeft, Heart, Minus, Pencil, Play, Plus, ListPlus, Pause, Trash2, Hash, PenLine, Eraser, StickyNote, FileDown, MoreHorizontal, Maximize, Minimize, SkipBack, SkipForward, ChevronLeft, ChevronRight, Printer, Share2, Mail, Copy, Gauge, SlidersHorizontal, Type, Music2, X, RotateCcw } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AnnotationLayer, INK, type Tool } from "@/components/AnnotationLayer";
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
import { APP_URL } from "@/components/AccountExtras";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { useIsMobile } from "@/hooks/use-mobile";
import { INTRO_DELAYS, loadPlaybackPrefs, savePlaybackPrefs, loadTranspose, loadViewPrefs, playlistNeighbours, saveTranspose, saveViewPrefs, SIZE_MAX, SIZE_MIN } from "@/lib/view-prefs";
import { cn } from "@/lib/utils";
import { track } from "@/lib/track";
import { ScrollPaceSettings } from "@/components/ScrollPaceSettings";
import { DEMO_CATEGORIES, type DemoCategory } from '@/lib/demos';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const Route = createFileRoute("/song/$id")({
  validateSearch: (s: Record<string, unknown>): { pl?: string } => (typeof s["pl"] === "string" && s["pl"] ? { pl: s["pl"] as string } : {}),
  head: ({ params }) => ({
    meta: [
      { property: "og:url", content: siteUrl(`/song/${encodeURIComponent(params.id)}`) },
      { title: "Song — Bespoke Music" },
      { name: "description", content: "Chords and lyrics, cleanly laid out for playing." },
      { property: "og:title", content: "Song — Bespoke Music" },
      { property: "og:description", content: "Chords and lyrics, cleanly laid out for playing." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: siteUrl(`/song/${encodeURIComponent(params.id)}`) }],
  }),
  component: SongPage,
});

type MenuItem = { key: string; label: string; icon: React.ComponentType<{ className?: string }>; onSelect: () => void; disabled?: boolean };

function SongPage() {
  const { id } = Route.useParams();
  const { pl } = Route.useSearch();
  const { user, signedIn, isAdmin, copyDemo, allSongs, songsLoaded, getSong, saved, toggleSaved, requireAuth, markPlayed, playlists, addToPlaylist, deleteSong, scrollSpeed, loadSongData, saveSongData } = useStore();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t: tx } = useT();
  const song = getSong(id);
  const [size, setSize] = useState(18);
  const [tr, setTr] = useState(0);
  const [nash, setNash] = useState(false);
  const [lyricsOnly, setLyricsOnly] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [pb, setPb] = useState<{ speed: number | null; delay: number }>({ speed: null, delay: 0 });
  useEffect(() => { setPb(loadPlaybackPrefs(id)); }, [id]);
  const speed = pb.speed ?? scrollSpeed;
  const setSpeed = (v: number) => { const n = { ...pb, speed: v }; setPb(n); savePlaybackPrefs(id, n); };
  const setDelay = (d: number) => { const n = { ...pb, delay: d }; setPb(n); savePlaybackPrefs(id, n); };
  const { playing, toggle: rawToggle, play: rawPlay, stop: rawStop, restart: rawRestart } = useAutoScroll(speed);
  const [countdown, setCountdown] = useState(0);
  const cdTimer = useRef<number | undefined>(undefined);
  const cancelCd = () => { window.clearInterval(cdTimer.current); setCountdown(0); };
  const restart = () => { cancelCd(); rawRestart(); };
  const stop = rawStop;
  const play = rawPlay;
  // Intro delay applies only when starting from a stopped state (never on resume after pause).
  const toggle = () => {
    if (countdown) { cancelCd(); return; }
    if (playing) { rawToggle(); return; }
    const atEnd = window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 2;
    if (pb.delay > 0 && (!everPlayed.current || atEnd)) {
      let n = pb.delay; setCountdown(n);
      cdTimer.current = window.setInterval(() => { n -= 1; if (n <= 0) { cancelCd(); rawPlay(); } else setCountdown(n); }, 1000);
      return;
    }
    rawPlay();
  };
  useEffect(() => () => window.clearInterval(cdTimer.current), [id]);
  const everPlayed = useRef(false);
  if (playing) everPlayed.current = true;
  const [barCollapsed, setBarCollapsed] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [nashKey, setNashKey] = useState("");
  const [annotate, setAnnotate] = useState(false);
  const [tool, setTool] = useState<Tool>({ kind: "pen", color: "#dc2626" });
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbarWidth, setToolbarWidth] = useState(0);
  const [notesOpen, setNotesOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [featureOpen, setFeatureOpen] = useState(false);
  const [demoCategory, setDemoCategory] = useState<DemoCategory>('both');
  const [copying, setCopying] = useState(false);
  useEffect(() => {
    const k = `bm-pos-${id}`; const y = sessionStorage.getItem(k);
    if (y && songsLoaded) { sessionStorage.removeItem(k); setTimeout(() => window.scrollTo(0, Number(y)), 100); }
  }, [id, songsLoaded]);
  const [plOpen, setPlOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [chord, setChord] = useState<string | null>(null);
  const [perf, setPerf] = useState(false);
  useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setToolbarWidth(entry?.contentRect.width ?? 0));
    observer.observe(el);
    return () => observer.disconnect();
  }, [song?.id, perf]);


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

  // Two-finger pinch on the song sheet changes the same Size setting (only the sheet grows).
  const sheetRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef(size);
  sizeRef.current = size;
  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    let start = 0, base = 0, cur = 0;
    const dist = (t: TouchList) => Math.hypot(t[0]!.clientX - t[1]!.clientX, t[0]!.clientY - t[1]!.clientY);
    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 2) { start = dist(e.touches); base = sizeRef.current; cur = base; }
    };
    const onMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !start) return;
      e.preventDefault();
      const next = Math.round(Math.min(SIZE_MAX, Math.max(SIZE_MIN, base * (dist(e.touches) / start))));
      if (next !== cur) { cur = next; setSize(next); }
    };
    const onEnd = (e: TouchEvent) => { if (e.touches.length < 2) start = 0; };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => { el.removeEventListener("touchstart", onStart); el.removeEventListener("touchmove", onMove); el.removeEventListener("touchend", onEnd); el.removeEventListener("touchcancel", onEnd); };
  }, [song?.id]);

  const changeStrokes = (s: Stroke[]) => { setStrokes(s); saveSongData(id, { annotations: s }); };

  useEffect(() => {
    if (song && signedIn) { markPlayed(song.id); track(user?.id, "song_opened", song.id); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.id, signedIn]);

  useEffect(() => stop, [id, stop]);
  // Meaningful player usage: auto-scroll ran 20s+ (once per song visit)
  const usedRef = useRef("");
  useEffect(() => {
    if (!playing || usedRef.current === id) return;
    const t = window.setTimeout(() => { usedRef.current = id; track(user?.id, "player_used", id); }, 20000);
    return () => window.clearTimeout(t);
  }, [playing, id, user?.id]);

  // Keyboard: Space starts/pauses auto-scroll (ignored while typing or on focused buttons)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== " ") return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input,textarea,select,button,a,[contenteditable='true'],[role='dialog'],[role='menu'],[role='slider']")) return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

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
        <h1 className="font-display text-3xl">{tx("Song not found")}</h1>
        <Link to="/" className="mt-4 inline-block text-primary underline">{tx("Back to Home")}</Link>
      </div>
    );
  }
  const isSaved = signedIn && saved.includes(song.id);
  const isMine = !!user && song.ownerId === user.id;
  const personalCopy = allSongs.find(s => s.ownerId === user?.id && s.sourceSongId === song.id);
  const keyNow = isValidKey(song.key) ? transposeChord(song.key, tr) : song.key;
  const baseKey = isValidKey(song.key) ? keyNow : nashKey;
  const nashvilleKey = nash && baseKey ? baseKey : null;
  const playlist = pl ? playlists.find((p) => p.id === pl) : undefined;
  const nb = playlist ? playlistNeighbours(playlist.songIds, song.id) : null;
  const goTo = (sid: string) => { stop(); navigate({ to: "/song/$id", params: { id: sid }, search: pl ? { pl } : {} }); };
  const sections = song.sections.map((s, i) => ({ name: s.name, i })).filter((s) => s.name.trim());

  const close = () => setMoreOpen(false);
  const items: MenuItem[] = [
    ...(!isMobile ? [{ key: "fs", label: tx("Full screen"), icon: Maximize, onSelect: () => { setAnnotate(false); setPerf(true); } }] : []),
    ...(signedIn && savedNotes.trim() ? [{ key: "pdfn", label: tx("Download PDF with notes"), icon: FileDown, onSelect: () => exportSongPdf(song, { transpose: tr, notes: savedNotes }) }] : []),
  ];
  const jump = (i: number) => { stop(); document.getElementById(`sec-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  const speedLabel = countdown ? tx("Starting in {n}s", { n: countdown }) : `${speed.toFixed(1)}×`;
  const playIcon = countdown ? <span className="font-mono text-base font-bold">{countdown}</span> : playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />;
  const settingsPop = (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="icon" className="h-11 w-11 shrink-0 rounded-full" aria-label={tx("Playback settings")}><SlidersHorizontal className="h-5 w-5" /></Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="center" className="w-[min(28rem,calc(100vw-2rem))] max-h-[var(--radix-popover-content-available-height)] overflow-y-auto p-4" onOpenAutoFocus={(e) => e.preventDefault()}>
        <ScrollPaceSettings speed={speed} onChange={setSpeed} />
        {!perf && <Button variant="ghost" className="mt-3 w-full justify-start" onClick={restart}><RotateCcw className="h-4 w-4" />{tx("Restart Song")}</Button>}
        <p className="mt-4 text-xs text-muted-foreground">{tx("Intro delay")}</p>
        <div className="mt-1.5 grid grid-cols-4 gap-1.5">
          {INTRO_DELAYS.map((d) => (
            <button key={d} aria-pressed={pb.delay === d} onClick={() => setDelay(d)} className={cn("min-h-10 rounded-full text-sm font-medium", pb.delay === d ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>{d ? `${d}s` : tx("Off")}</button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">{tx("Saved for this song on this device.")}</p>
      </PopoverContent>
    </Popover>
  );
  const chordInfo = chord ? findChord(chord) : undefined;

  const sizeControl = <Stepper label={tx("Size")} value={`${size}`} onMinus={() => setSize((s) => Math.max(SIZE_MIN, s - 2))} onPlus={() => setSize((s) => Math.min(SIZE_MAX, s + 2))} />;
  const keyControl = <div className="flex flex-wrap items-center gap-2">
    <Stepper label={tx("Transpose")} value={tr > 0 ? `+${tr}` : `${tr}`} onMinus={() => changeTr(tr - 1)} onPlus={() => changeTr(tr + 1)} />
    {tr !== 0 && <Button variant="ghost" size="sm" onClick={() => changeTr(0)}>{tx("Reset")}</Button>}
  </div>;
  const primaryTools: (MenuItem & { minWidth: number; active?: boolean })[] = [
    { key: "lyrics", label: tx("Lyrics Only"), icon: Type, active: lyricsOnly, minWidth: 460, onSelect: () => setLyricsOnly(v => !v) },
    { key: "nash", label: tx("Nashville Numbers"), icon: Hash, active: nash, minWidth: 610, onSelect: () => setNash(v => !v) },
    { key: "tuner", label: tx("Guitar Tuner"), icon: Gauge, minWidth: 740, onSelect: () => { stop(); sessionStorage.setItem(`bm-pos-${song.id}`, String(window.scrollY)); navigate({ to: "/tools", search: { from: song.id } }); } },
    { key: "playlist", label: tx("Add to Playlist"), icon: ListPlus, minWidth: 880, onSelect: () => requireAuth("Sign in to add songs to playlists.", () => setPlOpen(true)) },
    { key: "pdf", label: tx("Download PDF"), icon: FileDown, minWidth: 1000, onSelect: () => exportSongPdf(song, { transpose: tr }) },
    { key: "print", label: tx("Print"), icon: Printer, minWidth: 1000, onSelect: () => exportSongPdf(song, { transpose: tr }) },
    { key: "share", label: tx("Share Song"), icon: Share2, minWidth: 1090, onSelect: () => setShareOpen(true) },
  ];
  const visiblePrimary = isMobile ? [] : primaryTools.filter(it => toolbarWidth >= it.minWidth);
  const hiddenPrimary = primaryTools.filter(it => !visiblePrimary.some(shown => shown.key === it.key));
  const secondaryTools: MenuItem[] = [
    { key: "notes", label: tx("Notes"), icon: StickyNote, onSelect: () => requireAuth("Sign in to keep private notes.", () => setNotesOpen(true)) },
    { key: "annotate", label: tx("Annotate"), icon: PenLine, onSelect: () => requireAuth("Sign in to annotate songs.", () => setAnnotate(v => !v)) },
    { key: "save", label: tx(song.ownerId === null ? personalCopy ? 'Open My Copy' : 'Save to My Songs' : isSaved ? "Remove from My Songs" : "Save to My Songs"), icon: Heart, onSelect: () => requireAuth("Sign in to save songs to your songbook.", async () => {
      if (song.ownerId !== null) { await toggleSaved(song.id); return; }
      const copied = personalCopy?.id ?? await copyDemo(song.id);
      if (copied) navigate({ to: '/song/$id', params: { id: copied } });
    }) },
    ...(isAdmin && isMine ? [{ key: 'feature', label: 'Feature as Demo', icon: Music2, onSelect: () => setFeatureOpen(true) }] : []),
    ...items.filter(it => it.key === "fs" || it.key === "pdfn"),
  ];
  const menuRows = (rows: (MenuItem & { active?: boolean })[]) => rows.map(it => <Button key={it.key} variant="ghost" disabled={it.disabled} aria-pressed={it.active} onClick={() => { close(); it.onSelect(); }} className={cn("h-auto min-h-11 justify-start rounded-lg px-3 text-left text-sm font-medium", it.active && "bg-primary/10 text-primary")}><it.icon className="h-4 w-4 text-primary" />{it.label}</Button>);
  const moreBody = (
    <div className="grid gap-3">
      {hiddenPrimary.length > 0 && <div className="grid gap-0.5">
        {hiddenPrimary.some(it => it.key === "lyrics" || it.key === "nash") && <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{tx("Reading & Display")}</p>}
        {menuRows(hiddenPrimary.filter(it => it.key === "lyrics" || it.key === "nash"))}
        {hiddenPrimary.some(it => it.key === "tuner" || it.key === "playlist") && <p className="mb-1 mt-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{tx("Song Tools")}</p>}
        {menuRows(hiddenPrimary.filter(it => it.key === "tuner" || it.key === "playlist"))}
        {hiddenPrimary.some(it => ["pdf", "print", "share"].includes(it.key)) && <p className="mb-1 mt-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{tx("Export & Share")}</p>}
        {menuRows(hiddenPrimary.filter(it => ["pdf", "print", "share"].includes(it.key)))}
      </div>}
      <div className="grid gap-0.5 border-t border-border pt-2">{menuRows(secondaryTools)}</div>
      {sections.length > 0 && <div className="border-t border-border pt-2">
        <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{tx("Jump to section")}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">{sections.map(s => <Button variant="secondary" size="sm" key={s.i} onClick={() => { close(); setTimeout(() => jump(s.i), 250); }}>{s.name}</Button>)}</div>
      </div>}
      {isMine && <Button variant="ghost" className="justify-start text-destructive" onClick={() => { close(); setDelOpen(true); }}><Trash2 className="h-4 w-4" />{tx("Delete Song")}</Button>}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl">
      {!perf && (
        <button onClick={() => history.back()} className="mb-2 flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {tx("Back")}
        </button>
      )}

      {nb && playlist && !perf && (
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-soft">
          <Link to="/playlists/$id" params={{ id: playlist.id }} className="min-w-0 truncate text-sm">
            <span className="font-semibold">{playlist.name}</span>
            <span className="text-muted-foreground"> · {tx("Song {n} of {total}", { n: nb.index + 1, total: nb.total })}</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" aria-label={tx("Previous song")} disabled={!nb.prev} onClick={() => nb.prev && goTo(nb.prev)}><SkipBack className="h-5 w-5" /></Button>
            <Button variant="secondary" size="icon" className="h-11 w-11 rounded-full" aria-label={tx(playing ? "Pause" : "Play")} onClick={toggle}>{playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}</Button>
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" aria-label={tx("Next song")} disabled={!nb.next} onClick={() => nb.next && goTo(nb.next)}><SkipForward className="h-5 w-5" /></Button>
          </div>
        </div>
      )}

      <header className={cn("mx-auto mb-4 max-w-3xl", perf && "pt-2")}>
        <div className="min-w-0">
          <h1 className="break-words font-display text-3xl font-semibold leading-tight md:text-5xl">{song.title}</h1>
          <p className="mt-0.5 text-base text-muted-foreground md:text-lg">{song.artist}</p>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs md:text-sm">
          <Chip>{tx("Key")} {keyNow}</Chip>
          <Chip>{song.capo ? `${tx("Capo")} ${song.capo}` : tx("No capo")}</Chip>
          {song.tempo != null && song.tempo > 0 && <Chip>{song.tempo} BPM</Chip>}
        </div>
      </header>

      {/* Playback */}
      {!perf && (
        <div ref={controlsRef} className="mx-auto mb-3 max-w-3xl hidden md:grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-3xl border border-border bg-card p-3 shadow-soft md:p-4">
          <Button size="lg" onClick={toggle} aria-pressed={playing} className="h-12 rounded-full px-5 text-base shadow-lift md:h-14 md:px-6">
            {countdown ? <span className="font-mono">{countdown}</span> : playing ? <><Pause className="mr-2 h-5 w-5 fill-current" /> {tx("Pause")}</> : <><Play className="mr-2 h-5 w-5 fill-current" /> {tx("Play")}</>}
          </Button>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <SpeedSlider speed={speed} onChange={setSpeed} status={!playing && !countdown && everPlayed.current ? tx("Paused · tap song to resume") : speedLabel} active={playing} />
            {settingsPop}
          </div>
        </div>
      )}

      {/* Both toolbar layouts share actions and state; hidden actions move into More. */}
      {!perf && (
        <div ref={toolbarRef} className="sticky top-[61px] z-20 -mx-4 mb-6 border-y border-border bg-background/90 px-2 py-1.5 backdrop-blur md:top-[73px] md:px-4">
          <div data-mobile-song-toolbar={isMobile ? "" : undefined} data-desktop-song-toolbar={!isMobile ? "" : undefined} className={cn(isMobile ? "grid grid-cols-4 gap-1" : "flex items-center gap-1")}>
            <ToolBtn icon={Pencil} label={tx("Edit")} disabled={!isMine} title={isMine ? tx("Edit") : tx("Only your own songs can be edited")} onClick={() => navigate({ to: "/song/$id/edit", params: { id: song.id } })} />
            <Popover><PopoverTrigger asChild><ToolBtn icon={Music2} label={tx("Key")} /></PopoverTrigger><PopoverContent align="center" className="w-72 max-w-[calc(100vw-2rem)]"><p className="mb-3 text-sm font-medium">{tx("Key")} {keyNow}</p>{keyControl}</PopoverContent></Popover>
            <Popover><PopoverTrigger asChild><ToolBtn icon={Type} label={tx("Size")} /></PopoverTrigger><PopoverContent align="center" className="w-64 max-w-[calc(100vw-2rem)]">{sizeControl}</PopoverContent></Popover>
            {visiblePrimary.map(it => <ToolBtn key={it.key} icon={it.icon} label={it.label} active={it.active ?? false} onClick={it.onSelect} />)}
            {isMobile ? <ToolBtn icon={MoreHorizontal} label={tx("More")} onClick={() => setMoreOpen(true)} /> : <Popover open={moreOpen} onOpenChange={setMoreOpen}>
              <PopoverTrigger asChild><ToolBtn icon={MoreHorizontal} label={tx("More")} className="ml-auto shrink-0" /></PopoverTrigger>
              <PopoverContent align="end" className="w-80 max-h-[70vh] overflow-y-auto p-3">{moreBody}</PopoverContent>
            </Popover>}
          </div>
          {nash && !isValidKey(song.key) && (
            <div className="mt-1.5 flex items-center gap-2 px-1 text-xs">
              <span className="text-muted-foreground">{tx("Nashville needs a key:")}</span>
              <select aria-label={tx("Song key for Nashville")} value={nashKey} onChange={(e) => setNashKey(e.target.value)} className="min-h-9 rounded-full border border-border bg-card px-2 text-xs">
                <option value="">{tx("Pick key")}</option>
                {KEY_OPTIONS.map((k) => <option key={k}>{k}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Mobile bottom sheet */}
      <Sheet open={isMobile && moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <SheetHeader><SheetTitle className="text-left">{tx("More")}</SheetTitle></SheetHeader>
          <div className="mt-2">{moreBody}</div>
        </SheetContent>
      </Sheet>

      {/* Add to playlist */}
      <Dialog open={plOpen} onOpenChange={setPlOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{tx("Add to playlist")}</DialogTitle></DialogHeader>
          <div className="grid max-h-72 gap-1 overflow-y-auto">
            {playlists.map((p) => {
              const has = p.songIds.includes(song.id);
              return (
                <button key={p.id} disabled={has} onClick={async () => { await addToPlaylist(p.id, song.id); toast(tx("Added to {name}", { name: p.name })); }} className="flex min-h-11 items-center justify-between rounded-xl px-3 text-left text-sm hover:bg-secondary disabled:opacity-60">
                  <span className="truncate">{p.name}</span>{has && <span className="text-xs text-muted-foreground">{tx("Added")}</span>}
                </button>
              );
            })}
          </div>
          <Button variant="secondary" className="rounded-full" onClick={() => { setPlOpen(false); navigate({ to: "/playlists" }); }}><Plus className="mr-1 h-4 w-4" />{tx("Create a playlist")}</Button>
        </DialogContent>
      </Dialog>

      {/* Share */}
      <Dialog open={featureOpen} onOpenChange={setFeatureOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Feature as Demo</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Creates a separate public copy. Your personal notes and annotations stay private.</p>
          <Select value={demoCategory} onValueChange={v => setDemoCategory(v as DemoCategory)}><SelectTrigger aria-label="Demo category"><SelectValue /></SelectTrigger><SelectContent>{DEMO_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select>
          <Button disabled={copying} onClick={async () => { setCopying(true); const result = await copyDemo(song.id, true, demoCategory); setCopying(false); if (result) { setFeatureOpen(false); toast.success('Public demo copy created'); } }}>Publish demo copy</Button>
        </DialogContent>
      </Dialog>
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader><DialogTitle>{tx("Share song")}</DialogTitle></DialogHeader>
          {!song.ownerId && song.published !== false ? (() => {
            const url = `${APP_URL}song/${song.id}`;
            return (
              <div className="grid gap-2">
                <a href={`mailto:?subject=${encodeURIComponent(`${song.title} — Bespoke Music`)}&body=${encodeURIComponent(url)}`} className="flex min-h-11 items-center gap-3 rounded-xl bg-secondary px-3 text-sm font-medium"><Mail className="h-4 w-4" />{tx("Email")}</a>
                <button onClick={async () => { try { await navigator.clipboard.writeText(url); toast(tx("Link copied")); } catch { toast(url); } setShareOpen(false); }} className="flex min-h-11 items-center gap-3 rounded-xl bg-secondary px-3 text-left text-sm font-medium"><Copy className="h-4 w-4" />{tx("Copy to Clipboard")}</button>
              </div>
            );
          })() : (
            <p className="text-sm text-muted-foreground">{tx("This song is private to your songbook, so a link wouldn't open for anyone else. Use Download PDF or Print to share a copy instead.")}</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Notes */}
      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{tx("Song notes")}</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">{tx("Private — only you can see these.")}</p>
          <Textarea value={notes} maxLength={5000} onChange={(e) => setNotes(e.target.value)} placeholder={tx("Strumming patterns, vocal reminders, ideas…")} className="min-h-40" />
          <div className="flex justify-end">
            <Button className="rounded-full" disabled={notes === savedNotes} onClick={async () => { if (await saveSongData(song.id, { notes })) { setSavedNotes(notes); toast(tx("Notes saved")); } }}>{tx("Save notes")}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={delOpen} onOpenChange={setDelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{tx("Delete “{title}”?", { title: song.title })}</AlertDialogTitle><AlertDialogDescription>{tx("This permanently removes the song from your library and playlists.")}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{tx("Cancel")}</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => { await deleteSong(song.id); navigate({ to: "/my-songs" }); }}>{tx("Delete")}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Chord diagram */}
      <Dialog open={!!chord} onOpenChange={(o) => !o && setChord(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-mono">{chord}</DialogTitle></DialogHeader>
          {chordInfo ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {chordInfo.voicings.map((v, i) => <ChordDiagram key={i} name={v.label === "Triad" ? tx("Triad") : i === 0 ? chordInfo.name : tx("Shape {n}", { n: i + 1 })} voicing={v} size="sm" />)}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{tx("No verified diagram for {chord} yet. Check the Chord Library in Tools for similar shapes.", { chord: chord ?? "" })}</p>
          )}
        </DialogContent>
      </Dialog>

      {annotate && !perf && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-soft">
          {([["Red", "#dc2626"], ["Yellow", "#facc15"], ["Black", INK]] as const).map(([n, c]) => (
            <button key={c} aria-label={tx(`${n} pen`)} aria-pressed={tool.kind === "pen" && tool.color === c} onClick={() => setTool({ kind: "pen", color: c })}
              className={cn("h-8 w-8 rounded-full border-2", tool.kind === "pen" && tool.color === c ? "border-primary ring-2 ring-primary/30" : "border-border")} style={{ background: c === INK ? "var(--color-foreground)" : c }} />
          ))}
          <button aria-label={tx("Eraser")} aria-pressed={tool.kind === "eraser"} onClick={() => setTool({ kind: "eraser" })} className={cn("grid h-9 w-9 place-items-center rounded-full", tool.kind === "eraser" ? "bg-primary text-primary-foreground" : "bg-secondary")}>
            <Eraser className="h-4 w-4" />
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="rounded-full" disabled={!strokes.length}>{tx("Clear all")}</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>{tx("Clear all drawings?")}</AlertDialogTitle><AlertDialogDescription>{tx("This removes every mark on this song. Chords and lyrics stay untouched.")}</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>{tx("Cancel")}</AlertDialogCancel><AlertDialogAction onClick={() => changeStrokes([])}>{tx("Clear all")}</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button size="sm" className="ml-auto rounded-full" onClick={() => setAnnotate(false)}>{tx("Done")}</Button>
        </div>
      )}

      <div
        ref={sheetRef}
        className="mx-auto max-w-3xl"
        onClick={(e) => {
          // Tap anywhere in the song to resume a paused auto-scroll
          if (!playing && everPlayed.current && !annotate && !(e.target as HTMLElement).closest("button,a,input,select,textarea")) play();
        }}
      >
        <AnnotationLayer strokes={strokes} onChange={changeStrokes} active={annotate && !perf} tool={tool} fontSize={size}>
          <SongSheet sections={song.sections} fontSize={size} transpose={tr} nashvilleKey={nashvilleKey} lyricsOnly={lyricsOnly} onChord={annotate ? undefined : setChord} />
          <SongImages images={song.images ?? []} />
        </AnnotationLayer>
      </div>
      <div className="h-[40vh] md:h-[40vh]" aria-hidden />
      <div className="h-16 md:hidden" aria-hidden />

      {/* Performance mode bar */}
      {perf && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <div className="mx-auto grid max-w-3xl grid-cols-[auto_minmax(0,1fr)_auto] justify-items-start items-center gap-3">
            <Button size="icon" onClick={toggle} aria-label={tx(playing ? "Pause" : "Play")} className="h-12 w-12 rounded-full shadow-lift">{playIcon}</Button>
            <div className="flex min-w-0 items-center gap-1 sm:gap-2">
              <Button variant="secondary" size="icon" className="h-11 w-11 shrink-0 rounded-full" onClick={restart} aria-label={tx("Restart Song")} title={tx("Restart Song")}><RotateCcw className="h-5 w-5" /></Button>
              <span className={cn("truncate font-mono text-sm font-semibold", playing && "text-primary")} aria-live="polite">{speedLabel}</span>
              {settingsPop}
            </div>
            <Button variant="secondary" className="h-11 rounded-full px-3" onClick={() => setPerf(false)} aria-label={tx("Exit Focus")}>
              <X className="mr-1 h-4 w-4" />{tx("Exit Focus")}
            </Button>
          </div>
        </div>
      )}

      {/* Floating Play/Pause | Speed bar when main controls are off-screen (never alongside performance bar) */}
      {/* Mobile upper row: Play | Settings | Focus, sitting just above the tab bar */}
      {!perf && (
        <div data-mobile-player className="fixed inset-x-0 z-30 border-t border-border bg-card/95 px-4 py-1.5 backdrop-blur md:hidden" style={{ bottom: "calc(var(--tabbar-h, 62px) + env(safe-area-inset-bottom))" }}>
          <div className="mx-auto grid max-w-3xl grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-2">
            <Button size="icon" onClick={toggle} aria-label={tx(playing ? "Pause auto-scroll" : "Play auto-scroll")} className="h-11 w-11 rounded-full">{playIcon}</Button>
            <span className={cn("truncate text-xs text-muted-foreground", playing && "text-primary")} aria-live="polite">
              {tx("Auto-scroll")} · <span className="font-mono font-semibold">{!playing && !countdown && everPlayed.current ? tx("Paused") : speedLabel}</span>
            </span>
            {settingsPop}
            <Button variant="secondary" className="h-11 rounded-full px-3" onClick={() => { setAnnotate(false); setPerf(true); }} aria-label={tx("Focus")}>
              <Maximize className="mr-1 h-4 w-4" />{tx("Focus")}
            </Button>
          </div>
        </div>
      )}

      {!perf && !controlsVisible && (
        <div className="fixed z-30 hidden md:bottom-6 md:right-6 md:block">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/95 p-1.5 shadow-lift backdrop-blur">
            <Button size="icon" onClick={toggle} aria-label={tx(playing ? "Pause auto-scroll" : "Play auto-scroll")} className="h-12 w-12 shrink-0 rounded-full">
              {playIcon}
            </Button>
            {!barCollapsed && (
              <div className="w-36 px-1 sm:w-48">
                <div className="flex justify-between text-[11px] text-muted-foreground"><span>{tx("Speed")}</span><span className="font-mono font-semibold text-foreground">{speedLabel}</span></div>
                <Slider className="mt-1.5" min={0.3} max={3} step={0.1} value={[speed]} onValueChange={([v]) => setSpeed(v ?? 1)} aria-label={tx("Auto-scroll speed")} />
              </div>
            )}
            <button onClick={() => setBarCollapsed((v) => !v)} aria-label={tx(barCollapsed ? "Show speed control" : "Hide speed control")} className="grid h-10 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground">
              {barCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SpeedSlider({ speed, onChange, status, active }: { speed: number; onChange: (v: number) => void; status: string; active: boolean }) {
  const { t } = useT();
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t("Scroll speed")}</span>
        <span className={cn("font-mono font-semibold", active && "text-primary")} aria-live="polite">{status}</span>
      </div>
      <Slider className="mt-2" min={0.3} max={3} step={0.1} value={[speed]} onValueChange={([v]) => onChange(v ?? 1)} aria-label={t("Auto-scroll speed")} />
      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground"><span>{t("Slow")}</span><span>{t("Fast")}</span></div>
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
      <button aria-label={`${label} −`} onClick={onMinus} className="grid h-8 w-8 place-items-center rounded-full bg-card shadow-soft sm:h-9 sm:w-9"><Minus className="h-3.5 w-3.5" /></button>
      <span className="w-6 text-center font-mono text-sm font-semibold sm:w-7">{value}</span>
      <button aria-label={`${label} +`} onClick={onPlus} className="grid h-8 w-8 place-items-center rounded-full bg-card shadow-soft sm:h-9 sm:w-9"><Plus className="h-3.5 w-3.5" /></button>
    </div>
  );
}

type ToolBtnProps = { icon: React.ComponentType<{ className?: string }>; label: string; active?: boolean; title?: string; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>;
const ToolBtn = forwardRef<HTMLButtonElement, ToolBtnProps>(function ToolBtn({ icon: Icon, label, active, title, className, ...rest }, ref) {
  return (
    <Button variant="ghost" ref={ref} type="button" title={title ?? label} aria-label={title ?? label} aria-pressed={active} {...rest}
      className={cn("flex h-auto min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-medium transition-colors sm:flex-row sm:gap-1.5 sm:rounded-full sm:px-2 sm:text-xs",
        active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary", className)}>
      <Icon className={cn("h-5 w-5 shrink-0 sm:h-4 sm:w-4", active && Icon === Heart && "fill-current")} />
      <span className="truncate">{label}</span>
    </Button>
  );
});
