import { siteUrl } from "@/lib/site";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Pencil, Play, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SongCard } from "@/components/SongCard";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/playlists/$id")({
  head: ({ params }) => ({
    meta: [
      { property: "og:url", content: siteUrl(`/playlists/${encodeURIComponent(params.id)}`) },
      { title: "Playlist — Bespoke Music" },
      { name: "description", content: "A playlist of guitar songs ready to play." },
      { property: "og:title", content: "Playlist — Bespoke Music" },
      { property: "og:description", content: "A playlist of guitar songs ready to play." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: siteUrl(`/playlists/${encodeURIComponent(params.id)}`) }],
  }),
  component: PlaylistDetail,
});

function PlaylistDetail() {
  const { id } = Route.useParams();
  const { ready, signedIn, playlists, getSong, allSongs, addToPlaylist, removeFromPlaylist, movePlaylistSong, renamePlaylist, deletePlaylist } = useStore();
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const p = playlists.find((x) => x.id === id);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  if (!ready) return null;
  if (!p)
    return (
      <p className="py-20 text-center text-muted-foreground">
        {signedIn ? "Playlist not found." : "Sign in to see your playlists."} <Link to="/playlists" className="text-primary underline">Back to Playlists</Link>
      </p>
    );

  const songs = p.songIds.map(getSong).filter(Boolean) as NonNullable<ReturnType<typeof getSong>>[];
  const available = allSongs.filter((s) => !p.songIds.includes(s.id));

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/playlists" className="mb-4 flex min-h-11 items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Playlists</Link>
      <div className="bg-hero relative mb-6 overflow-hidden rounded-3xl p-6 text-primary-foreground shadow-lift md:p-10">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border-[14px] border-primary-foreground/10" />
        <p className="text-xs uppercase tracking-[0.2em] opacity-80">Playlist · {songs.length} songs</p>
        <h1 className="mt-2 break-words font-display text-4xl font-semibold">{p.name}</h1>
        {p.description && <p className="mt-1 opacity-85">{p.description}</p>}
        <div className="relative mt-5 flex flex-wrap gap-2">
          {songs[0] && (
            <Button asChild variant="secondary" className="h-11 rounded-full">
              <Link to="/song/$id" params={{ id: songs[0].id }} search={{ pl: p.id }}><Play className="mr-1 h-4 w-4 fill-current" /> Start playing</Link>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="h-11 rounded-full"><Plus className="mr-1 h-4 w-4" /> Add songs</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-72 w-72 max-w-[calc(100vw-2rem)] overflow-y-auto">
              <DropdownMenuItem onClick={() => navigate({ to: "/songs/new", search: { pl: p.id } })} className="font-semibold text-primary">
                <Plus className="mr-1 h-4 w-4" /> New song…
              </DropdownMenuItem>
              {available.length > 0 && <DropdownMenuSeparator />}
              {available.map((s) => (
                <DropdownMenuItem key={s.id} onClick={() => addToPlaylist(p.id, s.id)}><span className="truncate">{s.title}</span> <span className="ml-2 truncate text-xs text-muted-foreground">{s.artist}</span></DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="secondary" size="icon" className="h-11 w-11 rounded-full" aria-label="Rename playlist" onClick={() => { setName(p.name); setDesc(p.description); setEdit(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" className="h-11 w-11 rounded-full" aria-label="Delete playlist" onClick={async () => {
            if (!confirm(`Delete “${p.name}”? Songs stay in your library.`)) return;
            await deletePlaylist(p.id);
            navigate({ to: "/playlists" });
          }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ol className="space-y-3">
        {songs.map((s, i) => (
          <li key={s.id} className="flex items-center gap-2">
            <div className="flex shrink-0 flex-col">
              <button aria-label="Move up" disabled={i === 0} onClick={() => movePlaylistSong(p.id, s.id, -1)} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
              <button aria-label="Move down" disabled={i === songs.length - 1} onClick={() => movePlaylistSong(p.id, s.id, 1)} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
            </div>
            <div className="min-w-0 flex-1">
              <SongCard song={s} playlistId={p.id} action={
                <button aria-label="Remove from playlist" onClick={() => removeFromPlaylist(p.id, s.id)} className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"><X className="h-4 w-4" /></button>
              } />
            </div>
          </li>
        ))}
        {!songs.length && <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">Empty for now — tap “Add songs”.</p>}
      </ol>

      <Dialog open={edit} onOpenChange={setEdit}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader><DialogTitle className="font-display text-2xl">Edit playlist</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={async (e) => { e.preventDefault(); if (!name.trim()) return; await renamePlaylist(p.id, name.trim(), desc.trim()); setEdit(false); }}>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11" maxLength={80} aria-label="Name" />
            <Input value={desc} onChange={(e) => setDesc(e.target.value)} className="h-11" maxLength={160} aria-label="Description" placeholder="Description" />
            <Button type="submit" className="h-11 w-full rounded-full">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
