import { useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SongSheet } from "./SongSheet";
import { PageHeader } from "./PageHeader";
import { useStore } from "@/lib/store";
import { sectionsToText, textToSections, type Song } from "@/lib/songs";
import { parseBpm } from '@/lib/song-controls';
import { isUltimateGuitarUrl, toNativeFormat, ultimateGuitarSearchUrl } from "@/lib/import";
import { ClipboardPaste, ClipboardPen, ExternalLink, Globe, ImagePlus, Plus, Undo2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SongImages } from "./SongImages";
import type { SongImage } from "@/lib/songs";
import { clipboardImages, insertPastedText } from "@/lib/clipboard";
import { DEMO_CATEGORIES, type DemoCategory } from '@/lib/demos';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EXAMPLE = "{Verse}\n[G]Write your words and [C]put chords\n[G]in square brackets [D]like this\n\n{Chorus}\n[C]Sing it [G]loud";

const BLOCKS: [string, string][] = [
  ["Chords & Lyrics", "[G]Lyrics with [C]chords"],
  ["Guitar Tab", "e|-----------------|\nB|-----------------|\nG|-----------------|\nD|-----------------|\nA|-----------------|\nE|-----------------|"],
  ["Section Heading", "{Chorus}"],
  ["Notes", "> Your performance note"],
];

export function SongForm({ song, demo, playlistId }: { song?: Song; demo?: boolean; playlistId?: string | undefined }) {
  const { addToPlaylist, playlists, upsertSong, copyDemo, isAdmin, requireAuth, uploadSongImage, removeSongImage, signedIn, allSongs, user } = useStore();
  const [destination, setDestination] = useState(demo || song?.ownerId === null ? 'demo' : 'personal');
  const isDemo = isAdmin && destination === 'demo';
  const [category, setCategory] = useState<DemoCategory>(song?.demoCategory ?? 'both');
  const [images, setImages] = useState<SongImage[]>(song?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const uploadInput = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);
  const addFiles = (files: File[]) => requireAuth("Sign in to add images.", async () => {
    if (uploadingRef.current) { toast("Wait for the current image upload to finish, then paste again."); return; }
    if (images.length >= 10) { toast.error("You can add up to 10 images."); return; }
    uploadingRef.current = true;
    setUploading(true);
    try {
      for (const f of files.slice(0, 10 - images.length)) {
        const path = await uploadSongImage(f, isDemo);
        if (path) setImages((p) => [...p, { path }]);
      }
    } finally {
      uploadingRef.current = false;
      setUploading(false);
    }
  });
  const onPaste = (e: React.ClipboardEvent) => {
    const files = clipboardImages(e.clipboardData);
    if (!files.length) return;
    // A mixed copy (screenshot + text) carries both: keep the text paste working
    // by inserting it manually at the cursor, and attach the image alongside.
    e.preventDefault();
    addFiles(files);
    const el = e.currentTarget;
    const pasted = e.clipboardData.getData("text/plain");
    if (el instanceof HTMLTextAreaElement && pasted) {
      const start = el.selectionStart ?? text.length;
      const end = el.selectionEnd ?? start;
      setText((current) => insertPastedText(current, pasted, start, end));
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + pasted.length;
      });
    }
  };
  const navigate = useNavigate();
  const [title, setTitle] = useState(song?.title ?? "");
  const [artist, setArtist] = useState(song?.artist ?? "");
  const [key, setKey] = useState(song?.key ?? "G");
  const [capo, setCapo] = useState(song?.capo ?? 0);
  const [bpm, setBpm] = useState(song?.tempo?.toString() ?? '');
  const [text, setText] = useState(song ? sectionsToText(song.sections) : EXAMPLE);
  const sections = textToSections(text);
  const [busy, setBusy] = useState(false);
  const [method, setMethod] = useState<null | "manual" | "paste" | "ug">(null);
  const [ugQuery, setUgQuery] = useState("");
  const [ugUrl, setUgUrl] = useState("");
  const [beforeConvert, setBeforeConvert] = useState<string | null>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const insertBlock = (tpl: string) => {
    const el = editor.current;
    const at = el ? el.selectionEnd : text.length;
    const before = text.slice(0, at);
    const pre = before && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
    const next = before + pre + tpl + "\n" + text.slice(at);
    setText(next);
    requestAnimationFrame(() => { if (el) { el.focus(); const pos = (before + pre + tpl).length; el.setSelectionRange(pos, pos); } });
  };
  const playlist = playlistId ? playlists.find((x) => x.id === playlistId) : undefined;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingRef.current) { toast("Wait for your images to finish uploading."); return; }
    if (!title.trim()) {
      toast.error("Give your song a title");
      return;
    }
    let tempo: number | null;
    try { tempo = parseBpm(bpm); } catch (error) { toast.error(error instanceof Error ? error.message : 'Invalid BPM'); return; }
    requireAuth("Sign in to add songs to your songbook.", async () => {
      if (!song && user) {
        const dup = allSongs.some(
          (s) => s.ownerId === user.id && s.title.toLowerCase() === title.trim().toLowerCase() && s.artist.toLowerCase() === (artist.trim() || "Unknown artist").toLowerCase(),
        );
        if (dup && !window.confirm("You already have a song with this title and artist. Add it anyway?")) return;
      }
      setBusy(true);
      const id = await upsertSong(
        { id: song?.id, ownerId: song?.ownerId, title: title.trim().slice(0, 120), artist: artist.trim().slice(0, 120) || "Unknown artist", key, capo: Math.max(0, Math.min(12, capo || 0)), difficulty: song?.difficulty ?? 'Easy', tempo, sections, images, demoCategory: category },
        { demo: !!demo || song?.ownerId === null },
      );
      if (!id) { setBusy(false); return; }
      if (isDemo && !demo && song?.ownerId !== null) {
        const demoId = await copyDemo(id, true, category);
        setBusy(false);
        if (!demoId) return;
        toast.success('Public demo copy created; your personal song stays private');
        navigate({ to: '/admin' });
        return;
      }
      setBusy(false);
      if (!song && playlist && !isDemo) await addToPlaylist(playlist.id, id);
      toast.success(song ? "Song updated" : demo ? "Demo song added (unpublished)" : playlist ? `Song added to ${playlist.name}` : "Song added to My Songs");
      if (isDemo) navigate({ to: "/admin" });
      else navigate({ to: "/song/$id", params: { id }, search: playlist ? { pl: playlist.id } : {} });
    });
  };

  if (!song && method === null) {
    return (
      <div>
        <PageHeader eyebrow={playlist ? `New song · ${playlist.name}` : "New song"} title="Add a song" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {([
            ["paste", ClipboardPaste, "Copy & Paste", "Paste your chords and lyrics from your own source. We'll help format them into a readable song sheet.", ["Paste chords & lyrics", "Convert & Preview", "Add title & artist, then Save"], true],
            ["manual", ClipboardPen, "Create Manually", "Build your own chord sheet from scratch.", ["Enter title & artist", "Add chords, lyrics & sections", "Optional key, capo, then Save"], false],
            ["ug", Globe, "Import from Ultimate Guitar", "Bring in chord sheets you are permitted to use, by pasting them in.", ["Find the song on Ultimate Guitar", "Copy content you may use", "Paste here & Convert"], false],
          ] as const).map(([m, Icon, t, d, steps, rec]) => (
            <Button key={m} type="button" variant="ghost" onClick={() => { setMethod(m); if (m !== "manual") setText(""); }}
              className={`relative block h-auto whitespace-normal rounded-2xl border bg-card p-5 text-left shadow-soft transition-colors hover:border-primary ${rec ? "border-primary ring-1 ring-primary/30" : "border-border"}`}>
              {rec && <span className="absolute right-4 top-4 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">Recommended</span>}
              <Icon className="mb-3 h-6 w-6 text-primary" />
              <p className="font-semibold">{t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              <ol className="mt-3 space-y-1 text-xs text-muted-foreground">
                {steps.map((s, i) => <li key={s}><span className="mr-1.5 font-mono font-semibold text-primary">{i + 1}</span>{s}</li>)}
              </ol>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  const ugValid = !ugUrl.trim() || isUltimateGuitarUrl(ugUrl);

  return (
    <div>
      <PageHeader eyebrow={song ? "Edit" : "New song"} title={song ? song.title : "Add a song"} />
      {!song && method === "ug" && (
        <div className="mb-6 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
          {method === "ug" && (
            <>
              <p className="text-sm text-muted-foreground">Search Ultimate Guitar in a new tab, copy chords you have permission to use, then paste them below.</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input value={ugQuery} onChange={(e) => setUgQuery(e.target.value)} placeholder="Song title or artist" className="h-11" />
                <Button type="button" variant="outline" className="h-11 rounded-full" disabled={!ugQuery.trim()} onClick={() => window.open(ultimateGuitarSearchUrl(ugQuery), "_blank", "noopener")}>
                  <ExternalLink className="mr-1 h-4 w-4" />Search
                </Button>
              </div>
              <Field label="Or paste the song's Ultimate Guitar link (optional)">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input value={ugUrl} onChange={(e) => setUgUrl(e.target.value)} placeholder="https://tabs.ultimate-guitar.com/…" className="h-11" aria-invalid={!ugValid} />
                  <Button type="button" variant="outline" className="h-11 rounded-full" disabled={!ugUrl.trim() || !ugValid} onClick={() => window.open(ugUrl.trim(), "_blank", "noopener")}>
                    <ExternalLink className="mr-1 h-4 w-4" />Open
                  </Button>
                </div>
                {!ugValid && <p className="text-xs text-destructive">Use an https://www.ultimate-guitar.com or tabs.ultimate-guitar.com link.</p>}
              </Field>
            </>
          )}
        </div>
      )}
      <form onSubmit={submit} className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="min-w-0 space-y-4">
          <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Song title" className="h-11" /></Field>
          <Field label="Artist"><Input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artist" className="h-11" /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Key"><Input value={key} onChange={(e) => setKey(e.target.value)} className="h-11" /></Field>
            <Field label="Capo"><Input type="number" min={0} max={12} value={capo} onChange={(e) => setCapo(+e.target.value)} className="h-11" /></Field>
            <Field label="BPM (Tempo)"><Input aria-label="BPM (Tempo)" type="number" min={1} max={400} step={1} value={bpm} onChange={(e) => setBpm(e.target.value)} placeholder="Optional" className="h-11" /></Field>
          </div>
          <Field label="Song Composition">
            <p className="text-xs text-muted-foreground">Paste or type your lyrics, chords, guitar tabs, or images—all in one place.</p>
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" size="sm" disabled={uploading || images.length >= 10} onClick={() => uploadInput.current?.click()}><ImagePlus className="h-4 w-4" />Insert Image</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="h-9 rounded-full"><Plus className="mr-1 h-4 w-4" />Insert</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {BLOCKS.map(([label, tpl]) => <DropdownMenuItem key={label} onClick={() => insertBlock(tpl)}>{label}</DropdownMenuItem>)}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Textarea ref={editor} wrap="off" spellCheck={false} value={text} onPaste={onPaste} onChange={(e) => setText(e.target.value)} rows={14} placeholder="Paste your song content here..." className="overflow-x-auto whitespace-pre font-mono text-sm" />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" disabled={!text.trim()} onClick={() => { setBeforeConvert(text); setText(toNativeFormat(text)); }}>Auto Format</Button>
              {beforeConvert !== null && <Button type="button" variant="ghost" size="sm" onClick={() => { setText(beforeConvert); setBeforeConvert(null); }}><Undo2 className="h-4 w-4" />Keep Original</Button>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Use {"{Verse}"} or [Chorus] for sections, [C] before a word for chords, tab lines like e|--3--| for tabs, and "&gt; " for notes.</p>
          </Field>
          <div>
            <input ref={uploadInput} aria-label="Insert song images" type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" disabled={uploading} onChange={(e) => { addFiles([...(e.target.files ?? [])]); e.target.value = ""; }} />
            {uploading && <p role="status" className="text-sm text-muted-foreground">Uploading…</p>}
            <SongImages images={images} onRemove={(path) => { setImages((p) => p.filter((i) => i.path !== path)); if (signedIn && !song?.images?.some((i) => i.path === path)) removeSongImage(path); }} />
          </div>
          {isAdmin && !demo && !song && <Field label="Save Destination">
            <Select value={destination} onValueChange={setDestination}><SelectTrigger aria-label="Save Destination"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="personal">My Personal Songs</SelectItem><SelectItem value="demo">Public Demo Songs</SelectItem></SelectContent></Select>
          </Field>}
          {isDemo && <Field label="Demo category"><Select value={category} onValueChange={v => setCategory(v as DemoCategory)}><SelectTrigger aria-label="Demo category"><SelectValue /></SelectTrigger><SelectContent>{DEMO_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></Field>}
          <div className="flex gap-2">
            <Button type="submit" disabled={busy || uploading} className="h-11 flex-1 rounded-full">{song ? "Save changes" : "Add song"}</Button>
            <Button type="button" variant="outline" className="h-11 rounded-full" onClick={() => history.back()}>Cancel</Button>
          </div>
        </div>
        <div className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Live preview</p>
          <SongSheet sections={sections} fontSize={16} />
          <SongImages images={images} />
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
