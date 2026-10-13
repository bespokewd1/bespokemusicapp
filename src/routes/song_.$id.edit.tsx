import { createFileRoute } from "@tanstack/react-router";
import { SongForm } from "@/components/SongForm";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/song_/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Song — Bespoke Music" },
      { name: "description", content: "Edit chords and lyrics for a song in your songbook." },
      { property: "og:title", content: "Edit Song — Bespoke Music" },
      { property: "og:description", content: "Edit chords and lyrics for a song." },
    ],
  }),
  component: EditSong,
});

function EditSong() {
  const { id } = Route.useParams();
  const song = useStore().getSong(id);
  if (!song) return <p className="py-20 text-center">Song not found.</p>;
  return <SongForm song={song} />;
}
