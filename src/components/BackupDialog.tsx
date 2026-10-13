import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store";

const SCHEMA_VERSION = 1;

interface BackupFile {
  app: string;
  schemaVersion: number;
  exportedAt: string;
  songs: unknown[];
  playlists: { name: string; description: string; template: string | null; songs: { songIndex: number; position: number }[] }[];
  songUserData: { songIndex: number; notes: string; annotations: unknown }[];
  preferences: { scroll_speed: number } | null;
}

export function BackupDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user, allSongs, playlists, scrollSpeed, reloadSongs } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<BackupFile | null>(null);
  const [busy, setBusy] = useState(false);

  const backup = async () => {
    if (!user) return;
    setBusy(true);
    const mine = allSongs.filter((s) => s.ownerId === user.id);
    const { data: sud } = await supabase.from("song_user_data").select("song_id,notes,annotations");
    const indexOf = new Map(mine.map((s, i) => [s.id, i]));
    const file: BackupFile = {
      app: "bespoke-music",
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      songs: mine.map((s) => ({
        title: s.title, artist: s.artist, key: s.key, capo: s.capo, difficulty: s.difficulty,
        tempo: s.tempo, sections: s.sections, images: s.images ?? [],
      })),
      playlists: playlists.map((p) => ({
        name: p.name, description: p.description, template: p.template,
        songs: p.songIds
          .map((sid, position) => ({ songIndex: indexOf.get(sid) ?? -1, position }))
          .filter((x) => x.songIndex >= 0),
      })),
      songUserData: (sud ?? [])
        .filter((r) => indexOf.has(r.song_id))
        .map((r) => ({ songIndex: indexOf.get(r.song_id)!, notes: r.notes, annotations: r.annotations })),
      preferences: { scroll_speed: scrollSpeed },
    };
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `bespoke-music-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setBusy(false);
    toast("Backup downloaded");
  };

  const onFile = async (f: File) => {
    try {
      const parsed = JSON.parse(await f.text()) as BackupFile;
      if (parsed.app !== "bespoke-music" || typeof parsed.schemaVersion !== "number" || !Array.isArray(parsed.songs) || !Array.isArray(parsed.playlists)) {
        toast.error("This doesn't look like a Bespoke Music backup file");
        return;
      }
      if (parsed.schemaVersion > SCHEMA_VERSION) {
        toast.error("This backup is from a newer version and can't be restored here");
        return;
      }
      setPreview(parsed);
    } catch {
      toast.error("Couldn't read that file — choose the .json backup file");
    }
  };

  const restore = async () => {
    if (!user || !preview) return;
    setBusy(true);
    try {
      const existing = new Set(allSongs.filter((s) => s.ownerId === user.id).map((s) => `${s.title.toLowerCase()}|${s.artist.toLowerCase()}`));
      const newIds: (string | null)[] = [];
      let skipped = 0;
      for (const raw of preview.songs) {
        const s = raw as { title?: string; artist?: string; key?: string; capo?: number; difficulty?: string; tempo?: number; sections?: unknown; images?: unknown };
        if (!s.title || !s.artist) { newIds.push(null); continue; }
        const sig = `${s.title.toLowerCase()}|${(s.artist ?? "").toLowerCase()}`;
        if (existing.has(sig)) { skipped++; newIds.push(null); continue; }
        const { data, error } = await supabase.from("songs").insert({
          owner_id: user.id, title: s.title, artist: s.artist, key: s.key ?? "G", capo: s.capo ?? 0,
          difficulty: s.difficulty ?? "Easy", tempo: s.tempo ?? 90, sections: (s.sections ?? []) as never,
          images: (s.images ?? []) as never, published: true,
        }).select("id").single();
        if (error) { newIds.push(null); continue; }
        existing.add(sig);
        newIds.push(data!.id);
      }
      for (const p of preview.playlists) {
        if (!p.name) continue;
        const { data: pl, error } = await supabase.from("playlists").insert({ user_id: user.id, name: p.name, description: p.description ?? "", template: null }).select("id").single();
        if (error) continue;
        const rows = (p.songs ?? [])
          .map((x) => ({ playlist_id: pl!.id, song_id: newIds[x.songIndex], position: x.position }))
          .filter((x): x is { playlist_id: string; song_id: string; position: number } => !!x.song_id);
        if (rows.length) await supabase.from("playlist_songs").insert(rows);
      }
      for (const d of preview.songUserData ?? []) {
        const sid = newIds[d.songIndex];
        if (!sid) continue;
        await supabase.from("song_user_data").upsert(
          { user_id: user.id, song_id: sid, notes: d.notes ?? "", annotations: (d.annotations ?? []) as never, updated_at: new Date().toISOString() },
          { onConflict: "user_id,song_id" },
        );
      }
      await reloadSongs();
      toast.success(`Restored ${newIds.filter(Boolean).length} songs and ${preview.playlists.length} playlists${skipped ? ` · ${skipped} duplicates skipped` : ""}`);
      setPreview(null);
      onOpenChange(false);
    } catch {
      toast.error("Restore failed — your existing library was not changed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setPreview(null); onOpenChange(v); }}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Backup &amp; Restore</DialogTitle>
          <DialogDescription>Download your whole library as a file, or restore it on any device. Images and drawings aren't included in the file.</DialogDescription>
        </DialogHeader>
        {preview ? (
          <div className="space-y-3">
            <p className="rounded-xl bg-secondary p-3 text-sm">
              This backup contains <strong>{preview.songs.length} songs</strong> and <strong>{preview.playlists.length} playlists</strong>
              {preview.exportedAt && <> · exported {new Date(preview.exportedAt).toLocaleDateString()}</>}.
            </p>
            <p className="text-xs text-muted-foreground">Songs that already exist in your library (same title and artist) are skipped — nothing you have is overwritten.</p>
            <div className="flex gap-2">
              <Button variant="outline" className="h-11 flex-1 rounded-full" onClick={() => setPreview(null)}>Cancel</Button>
              <Button className="h-11 flex-1 rounded-full" disabled={busy} onClick={restore}>{busy ? "Restoring…" : "Restore library"}</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Button className="h-12 w-full rounded-full" disabled={busy} onClick={backup}>
              <Download className="mr-2 h-4 w-4" /> {busy ? "Preparing…" : "Backup Library"}
            </Button>
            <Button variant="outline" className="h-12 w-full rounded-full" onClick={() => fileRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Restore Library
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.target.value = "";
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
