import { createFileRoute } from "@tanstack/react-router";
import { SongForm } from "@/components/SongForm";

export const Route = createFileRoute("/songs/new")({
  head: () => ({
    meta: [
      { title: "Add a Song — Bespoke Music" },
      { name: "description", content: "Add your own song with chords and lyrics to your songbook." },
      { property: "og:title", content: "Add a Song — Bespoke Music" },
      { property: "og:description", content: "Add your own song with chords and lyrics." },
    ],
  }),
  component: () => <SongForm />,
});
