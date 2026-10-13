import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Dumbbell, Guitar, GraduationCap, Mic, Plus, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { PLAYLIST_TEMPLATES, useStore } from "@/lib/store";

export const Route = createFileRoute("/playlists/")({
  head: () => ({
    meta: [
      { title: "Playlists — Bespoke Music" },
      { name: "description", content: "Organise songs into practice lists, acoustic sets and performance setlists." },
      { property: "og:title", content: "Playlists — Bespoke Music" },
      { property: "og:description", content: "Organise songs into setlists and playlists." },
    ],
  }),
  component: Playlists,
});

const ICONS = { dumbbell: Dumbbell, guitar: Guitar, graduation: GraduationCap, mic: Mic } as const;
const PLAYLIST_REASON = "Sign in to create playlists, save your favourite songs, and keep your music organized.";

function Playlists() {
  const { signedIn, playlists, requireAuth, createPlaylist, getSong } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const openTemplate = (t: (typeof PLAYLIST_TEMPLATES)[number]) =>
    requireAuth(PLAYLIST_REASON, async () => {
      const id = await createPlaylist(t.name, t.description, t.id);
      if (id) navigate({ to: "/playlists/$id", params: { id } });
    });

  const custom = playlists.filter((p) => !p.template);

  return (
    <div>
      <PageHeader eyebrow="Setlists" title="Playlists">
        <Button className="h-11 rounded-full" onClick={() => requireAuth(PLAYLIST_REASON, () => setOpen(true))}>
          <Plus className="mr-1 h-4 w-4" /> New
        </Button>
      </PageHeader>

      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">Starter playlists</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PLAYLIST_TEMPLATES.map((t) => {
          const Icon = ICONS[t.icon];
          const mine = playlists.find((p) => p.template === t.id);
          return (
            <button key={t.id} onClick={() => openTemplate(t)} className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><Icon className="h-5 w-5" /></span>
              <span className="min-w-0">
                <span className="block font-display text-lg font-semibold">{mine?.name ?? t.name}</span>
                <span className="block text-sm text-muted-foreground">{mine ? `${mine.songIds.length} songs` : t.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      {signedIn && (
        <>
          <h2 className="mb-3 mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">Your playlists</h2>
          {custom.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {custom.map((p) => (
                <Link key={p.id} to="/playlists/$id" params={{ id: p.id }} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                  <div className="bg-hero relative h-20 p-4 text-primary-foreground">
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
          ) : (
            <button onClick={() => setOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-8 text-muted-foreground hover:bg-card">
              <ListMusic className="h-5 w-5" /> Create a custom playlist
            </button>
          )}
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader><DialogTitle className="font-display text-2xl">New playlist</DialogTitle></DialogHeader>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!name.trim() || busy) return;
              setBusy(true);
              const id = await createPlaylist(name.trim(), desc.trim());
              setBusy(false);
              if (!id) return;
              setOpen(false); setName(""); setDesc("");
              navigate({ to: "/playlists/$id", params: { id } });
            }}
          >
            <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rainy day songs" className="h-11" maxLength={80} />
            <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short description (optional)" className="h-11" maxLength={160} />
            <Button type="submit" disabled={busy} className="h-11 w-full rounded-full">Create playlist</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
