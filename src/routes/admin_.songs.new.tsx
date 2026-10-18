import { siteUrl } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";
import { SongForm } from "@/components/SongForm";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin_/songs/new")({
  ssr: false,
  head: () => ({
    meta: [
      { property: "og:url", content: siteUrl("/admin/songs/new") },
      { title: "New Demo Song — Admin | Bespoke Music" },
      { name: "description", content: "Add a public demo song." },
      { property: "og:title", content: "New Demo Song — Bespoke Music" },
      { property: "og:description", content: "Add a public demo song." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: siteUrl("/admin/songs/new") }],
  }),
  component: NewDemoSong,
});

function NewDemoSong() {
  const { ready, isAdmin } = useStore();
  if (!ready) return null;
  if (!isAdmin) return <p className="py-20 text-center text-muted-foreground">Only the administrator can add demo songs.</p>;
  return <SongForm demo />;
}
