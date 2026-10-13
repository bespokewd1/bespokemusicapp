import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SongSheet } from "./SongSheet";
import { PageHeader } from "./PageHeader";
import { useStore } from "@/lib/store";
import { sectionsToText, textToSections, type Difficulty, type Song } from "@/lib/songs";
import { isUltimateGuitarUrl, toNativeFormat, ultimateGuitarSearchUrl } from "@/lib/import";
import { ClipboardPaste, ClipboardPen, ExternalLink, Globe, ImagePlus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SongImages } from "./SongImages";
import type { SongImage } from "@/lib/songs";

const EXAMPLE = "{Verse}\n[G]Write your words and [C]put chords\n[G]in square brackets [D]like this\n\n{Chorus}\n[C]Sing it [G]loud";

export function SongForm({ song, demo }: { song?: Song; demo?: boolean }) {
  const { upsertSong, requireAuth, uploadSongImage, removeSongImage, signedIn, allSongs, user } = useStore();
  const isDemo = !!demo || (!!song && !song.ownerId);
  const [images, setImages] = useState<SongImage[]>(song?.images ?? []);
  const [featured, setFeatured] = useState(song?.pickUp ?? false);
  const [uploading, setUploading] = useState(false);
  const addFiles = (files: File[]) => requireAuth("Sign in to add images.", async () => {
    setUploading(true);
    for (const f of files.slice(0, 10 - images.length)) {
      const path = await uploadSongImage(f, isDemo);
      if (path) setImages((p) => [...p, { path }]);
    }
    setUploading(false);
  });
  const onPaste = (e: React.ClipboardEvent) => {
    const files = [...e.clipboardData.files].filter((f) => f.type.startsWith("image/"));
    if (files.length) { e.preventDefault(); addFiles(files); }
  };
  const navigate = useNavigate();
  const [title, setTitle] = useState(song?.title ?? "");
  const [artist, setArtist] = useState(song?.artist ?? "");
  const [key, setKey] = useState(song?.key ?? "G");
  const [capo, setCapo] = useState(song?.capo ?? 0);
  const [difficulty, setDifficulty] = useState<Difficulty>(song?.difficulty ?? "Easy");
  const [text, setText] = useState(song ? sectionsToText(song.sections) : EXAMPLE);
  const sections = textToSections(text);
  const [busy, setBusy] = useState(false);
  const [method, setMethod] = useState<null | "manual" | "paste" | "ug">(null);
  const [paste, setPaste] = useState("");
  const [ugQuery, setUgQuery] = useState("");
  const [ugUrl, setUgUrl] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Give your song a title");
      return;
    }
    requireAuth("Sign in to add songs to your songbook.", async () => {
      if (!song && user) {
        const dup = allSongs.some(
          (s) => s.ownerId === user.id && s.title.toLowerCase() === title.trim().toLowerCase() && s.artist.toLowerCase() === (artist.trim() || "Unknown artist").toLowerCase(),
        );
        if (dup && !window.confirm("You already have a song with this title and artist. Add it anyway?")) return;
      }
      setBusy(true);
      const id = await upsertSong(
        { id: song?.id, title: title.trim().slice(0, 120), artist: artist.trim().slice(0, 120) || "Unknown artist", key, capo: Math.max(0, Math.min(12, capo || 0)), difficulty, tempo: song?.tempo ?? 90, sections, images },
        { demo, featured: isDemo ? featured : undefined },
      );
      setBusy(false);
      if (!id) return;
      toast.success(song ? "Song updated" : demo ? "Demo song added (unpublished)" : "Song added to My Songs");
      if (demo) navigate({ to: "/admin" });
      else navigate({ to: "/song/$id", params: { id } });
    });
  };

  if (!song && method === null) {
    return (
      <div>
        <PageHeader eyebrow="New song" title="Add a song" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {([
            ["manual", ClipboardPen, "Create Manually", "Type title, artist and chords yourself."],
            ["paste", ClipboardPaste, "Copy & Paste", "Paste chords-over-lyrics; we convert it."],
            ["ug", Globe, "From Ultimate Guitar", "Find a song there, then paste it in."],
          ] as const).map(([m, Icon, t, d]) => (
            <button key={m} type="button" onClick={() => { setMethod(m); if (m !== "manual") setText(""); }} className="rounded-2xl border border-border bg-card p-5 text-left shadow-soft transition-colors hover:border-primary">
              <Icon className="mb-3 h-6 w-6 text-primary" />
              <p className="font-semibold">{t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const ugValid = !ugUrl.trim() || isUltimateGuitarUrl(ugUrl);

  return (
    <div>
      <PageHeader eyebrow={song ? "Edit" : "New song"} title={song ? song.title : "Add a song"} />
      {!song && method !== "manual" && (
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
          <Field label="Paste chords & lyrics">
            <Textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={8} className="font-mono text-sm" placeholder={"[Verse]\nG        C\nWrite your words here"} />
          </Field>
          <Button type="button" className="h-11 rounded-full" disabled={!paste.trim()} onClick={() => { setText(toNativeFormat(paste)); toast.success("Converted — check the editor below"); }}>
            Convert to editor
          </Button>
        </div>
      )}
      <form onSubmit={submit} className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Song title" className="h-11" /></Field>
          <Field label="Artist"><Input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artist" className="h-11" /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Key"><Input value={key} onChange={(e) => setKey(e.target.value)} className="h-11" /></Field>
            <Field label="Capo"><Input type="number" min={0} max={12} value={capo} onChange={(e) => setCapo(+e.target.value)} className="h-11" /></Field>
            <Field label="Level">
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className="h-11 w-full rounded-md border border-input bg-card px-2 text-sm">
                <option>Beginner</option><option>Easy</option><option>Intermediate</option>
              </select>
            </Field>
          </div>
          <Field label="Chords & lyrics">
            <Textarea value={text} onPaste={onPaste} onChange={(e) => setText(e.target.value)} rows={14} className="font-mono text-sm" />
            <p className="mt-1 text-xs text-muted-foreground">Use {"{Verse}"} for section names and [C] before a word for chords.</p>
          </Field>
          <Field label="Images (tabs, chord charts, screenshots)">
            <label onPaste={onPaste} tabIndex={0} className="flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border bg-card p-4 text-center text-sm text-muted-foreground hover:border-primary">
              <ImagePlus className="h-5 w-5 text-primary" />
              {uploading ? "Uploading…" : "Tap to upload, or paste an image here (JPG, PNG, WebP · max 5 MB)"}
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" disabled={uploading} onChange={(e) => { addFiles([...(e.target.files ?? [])]); e.target.value = ""; }} />
            </label>
            <SongImages images={images} onRemove={(path) => { setImages((p) => p.filter((i) => i.path !== path)); if (signedIn && !song?.images?.some((i) => i.path === path)) removeSongImage(path); }} />
          </Field>
          {isDemo && (
            <label className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4">
              <span className="text-sm font-medium">Show in Pick Up &amp; Play</span>
              <Switch checked={featured} onCheckedChange={setFeatured} />
            </label>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={busy} className="h-11 flex-1 rounded-full">{song ? "Save changes" : "Add song"}</Button>
            <Button type="button" variant="outline" className="h-11 rounded-full" onClick={() => history.back()}>Cancel</Button>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
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
