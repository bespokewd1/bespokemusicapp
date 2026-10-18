import { siteUrl } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";
import { SongForm } from "@/components/SongForm";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/song_/$id/edit")({
  head: ({ params }) => ({
    meta: [
      { property: "og:url", content: siteUrl(`/song/${encodeURIComponent(params.id)}/edit`) },
      { title: "Edit Song — Bespoke Music" },
      { name: "description", content: "Edit chords and lyrics for a song in your songbook." },
      { property: "og:title", content: "Edit Song — Bespoke Music" },
      { property: "og:description", content: "Edit chords and lyrics for a song." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: siteUrl(`/song/${encodeURIComponent(params.id)}/edit`) }],
  }),
  component: EditSong,
});

function EditSong() {
  const { id } = Route.useParams();
  const { getSong, songsLoaded } = useStore();
  const song = getSong(id);
  if (!songsLoaded) return <p role="status" className="py-20 text-center text-muted-foreground">Loading song…</p>;
  if (!song) return <p className="py-20 text-center">Song not found.</p>;
  return <SongForm song={song} />;
}
