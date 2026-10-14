import { createFileRoute } from "@tanstack/react-router";
import { SongForm } from "@/components/SongForm";

export const Route = createFileRoute("/songs/new")({
  validateSearch: (s: Record<string, unknown>): { pl?: string } => (typeof s["pl"] === "string" && s["pl"] ? { pl: s["pl"] as string } : {}),
  head: () => ({
    meta: [
      { title: "Add a Song — Bespoke Music" },
      { name: "description", content: "Add your own song with chords and lyrics to your songbook." },
      { property: "og:title", content: "Add a Song — Bespoke Music" },
      { property: "og:description", content: "Add your own song with chords and lyrics." },
    ],
  }),
  component: NewSong,
});

function NewSong() {
  const { pl } = Route.useSearch();
  return <SongForm playlistId={pl} />;
}
