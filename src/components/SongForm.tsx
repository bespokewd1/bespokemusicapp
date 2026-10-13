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

const EXAMPLE = "{Verse}\n[G]Write your words and [C]put chords\n[G]in square brackets [D]like this\n\n{Chorus}\n[C]Sing it [G]loud";

export function SongForm({ song }: { song?: Song }) {
  const { upsertSong, requireAuth } = useStore();
  const navigate = useNavigate();
  const [title, setTitle] = useState(song?.title ?? "");
  const [artist, setArtist] = useState(song?.artist ?? "");
  const [key, setKey] = useState(song?.key ?? "G");
  const [capo, setCapo] = useState(song?.capo ?? 0);
  const [difficulty, setDifficulty] = useState<Difficulty>(song?.difficulty ?? "Easy");
  const [text, setText] = useState(song ? sectionsToText(song.sections) : EXAMPLE);
  const sections = textToSections(text);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Give your song a title");
    requireAuth("Sign in to add songs to your songbook.", () => {
      const id = song?.id ?? `my-${Date.now()}`;
      upsertSong({ id, title, artist: artist || "Unknown artist", key, capo, difficulty, tempo: song?.tempo ?? 90, sections });
      toast.success(song ? "Song updated" : "Song added to My Songs");
      navigate({ to: "/song/$id", params: { id } });
    });
  };

  return (
    <div>
      <PageHeader eyebrow={song ? "Edit" : "New song"} title={song ? song.title : "Add a song"} />
      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-2">
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
            <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={14} className="font-mono text-sm" />
            <p className="mt-1 text-xs text-muted-foreground">Use {"{Verse}"} for section names and [C] before a word for chords.</p>
          </Field>
          <div className="flex gap-2">
            <Button type="submit" className="h-11 flex-1 rounded-full">{song ? "Save changes" : "Add song"}</Button>
            <Button type="button" variant="outline" className="h-11 rounded-full" onClick={() => history.back()}>Cancel</Button>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Live preview</p>
          <SongSheet sections={sections} fontSize={16} />
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
