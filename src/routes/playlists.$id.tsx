import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Play, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SongCard } from "@/components/SongCard";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/playlists/$id")({
  head: () => ({
    meta: [
      { title: "Playlist — Bespoke Music" },
      { name: "description", content: "A playlist of guitar songs ready to play." },
      { property: "og:title", content: "Playlist — Bespoke Music" },
      { property: "og:description", content: "A playlist of guitar songs ready to play." },
    ],
  }),
  component: PlaylistDetail,
});

function PlaylistDetail() {
  const { id } = Route.useParams();
  const { playlists, getSong, allSongs, addToPlaylist, removeFromPlaylist } = useStore();
  const p = playlists.find((x) => x.id === id);
  if (!p) return <p className="py-20 text-center">Playlist not found. <Link to="/playlists" className="text-primary underline">Back</Link></p>;
  const songs = p.songIds.map(getSong).filter(Boolean) as NonNullable<ReturnType<typeof getSong>>[];
  const available = allSongs.filter((s) => !p.songIds.includes(s.id));

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/playlists" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Playlists</Link>
      <div className="bg-hero relative mb-6 overflow-hidden rounded-3xl p-6 text-primary-foreground shadow-lift md:p-10">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border-[14px] border-primary-foreground/10" />
        <p className="text-xs uppercase tracking-[0.2em] opacity-80">Playlist · {songs.length} songs</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">{p.name}</h1>
        {p.description && <p className="mt-1 opacity-85">{p.description}</p>}
        <div className="mt-5 flex gap-2">
          {songs[0] && (
            <Button asChild variant="secondary" className="rounded-full">
              <Link to="/song/$id" params={{ id: songs[0].id }}><Play className="mr-1 h-4 w-4 fill-current" /> Start playing</Link>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="rounded-full"><Plus className="mr-1 h-4 w-4" /> Add songs</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-72 overflow-y-auto">
              {available.map((s) => (
                <DropdownMenuItem key={s.id} onClick={() => addToPlaylist(p.id, s.id)}>{s.title} <span className="ml-2 text-xs text-muted-foreground">{s.artist}</span></DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ol className="space-y-3">
        {songs.map((s, i) => (
          <li key={s.id} className="flex items-center gap-3">
            <span className="w-6 shrink-0 text-right font-display text-lg text-muted-foreground">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <SongCard song={s} action={
                <button aria-label="Remove from playlist" onClick={() => removeFromPlaylist(p.id, s.id)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-destructive"><X className="h-4 w-4" /></button>
              } />
            </div>
          </li>
        ))}
        {!songs.length && <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">Empty for now — tap “Add songs”.</p>}
      </ol>
    </div>
  );
}
