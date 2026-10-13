import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { useStore } from "@/lib/store";
import { SignedOutState } from "@/components/SignedOutState";

export const Route = createFileRoute("/playlists/")({
  head: () => ({
    meta: [
      { title: "Playlists — Bespoke Music" },
      { name: "description", content: "Organise songs into setlists and playlists for every occasion." },
      { property: "og:title", content: "Playlists — Bespoke Music" },
      { property: "og:description", content: "Organise songs into setlists and playlists." },
    ],
  }),
  component: Playlists,
});

function Playlists() {
  const { signedIn, playlists, requireAuth, createPlaylist, getSong } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader eyebrow="Setlists" title="Playlists">
        <Button className="rounded-full" onClick={() => requireAuth("Sign in to create playlists.", () => setOpen(true))}>
          <Plus className="mr-1 h-4 w-4" /> New
        </Button>
      </PageHeader>
      {!signedIn ? (
        <SignedOutState title="Build your setlists" text="Group songs for campfires, practice sessions or Sunday afternoons." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((p) => (
            <Link key={p.id} to="/playlists/$id" params={{ id: p.id }} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
              <div className="bg-hero relative h-28 p-4 text-primary-foreground">
                <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full border-[10px] border-primary-foreground/15" />
                <p className="text-xs uppercase tracking-[0.2em] opacity-80">{p.songIds.length} songs</p>
              </div>
              <div className="p-4">
                <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{p.description || "No description"}</p>
                <p className="mt-2 truncate text-xs text-muted-foreground">{p.songIds.map((id) => getSong(id)?.title).filter(Boolean).join(" · ")}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader><DialogTitle className="font-display text-2xl">New playlist</DialogTitle></DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              const id = createPlaylist(name.trim(), desc.trim());
              setOpen(false); setName(""); setDesc("");
              navigate({ to: "/playlists/$id", params: { id } });
            }}
          >
            <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rainy day songs" className="h-11" />
            <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short description (optional)" className="h-11" />
            <Button type="submit" className="h-11 w-full rounded-full">Create playlist</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
