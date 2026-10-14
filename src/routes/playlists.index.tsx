import { useT } from "@/lib/i18n";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Dumbbell, Guitar, GraduationCap, Mic, Plus, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import imgPractice from "@/assets/pl-practice.jpg";
import imgAcoustic from "@/assets/pl-acoustic.jpg";
import imgLearn from "@/assets/pl-learn.jpg";
import imgLive from "@/assets/pl-live.jpg";
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
const IMAGES = { dumbbell: imgPractice, guitar: imgAcoustic, graduation: imgLearn, mic: imgLive } as const;
const PLAYLIST_REASON = "Sign in to create playlists, save your favourite songs, and keep your music organized.";

function Playlists() {
  const { signedIn, playlists, requireAuth, createPlaylist, getSong } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { t: tr } = useT();

  const openTemplate = (t: (typeof PLAYLIST_TEMPLATES)[number]) =>
    requireAuth(PLAYLIST_REASON, async () => {
      const id = await createPlaylist(t.name, t.description, t.id);
      if (id) navigate({ to: "/playlists/$id", params: { id } });
    });

  const custom = playlists.filter((p) => !p.template);

  return (
    <div>
      <PageHeader eyebrow={tr("Setlists")} title={tr("Playlists")}>
        <Button className="h-11 rounded-full" onClick={() => requireAuth(PLAYLIST_REASON, () => setOpen(true))}>
          <Plus className="mr-1 h-4 w-4" /> {tr("New")}
        </Button>
      </PageHeader>

      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">{tr("Starter playlists")}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-5">
        {PLAYLIST_TEMPLATES.map((t) => {
          const Icon = ICONS[t.icon];
          const mine = playlists.find((p) => p.template === t.id);
          return (
            <button key={t.id} onClick={() => openTemplate(t)} className="group relative isolate flex min-h-36 items-end overflow-hidden rounded-2xl border border-border text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift sm:min-h-44 lg:min-h-56">
              <img src={IMAGES[t.icon]} alt="" width={1088} height={608} loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105" />
              <span className="absolute inset-0 -z-10 bg-gradient-to-t from-foreground/90 via-foreground/55 to-foreground/10" />
              <span className="flex w-full min-w-0 items-end gap-3 p-4 text-background md:p-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-background/90 text-primary"><Icon className="h-5 w-5" /></span>
                <span className="min-w-0">
                  <span className="block truncate font-display text-xl font-semibold md:text-2xl">{mine?.name ?? tr(t.name)}</span>
                  <span className="block text-sm opacity-90">{mine ? tr(mine.songIds.length === 1 ? "{n} song" : "{n} songs", { n: mine.songIds.length }) : tr(t.description)}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {signedIn && (
        <>
          <h2 className="mb-3 mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">{tr("Your playlists")}</h2>
          {custom.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {custom.map((p) => (
                <Link key={p.id} to="/playlists/$id" params={{ id: p.id }} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                  <div className="bg-hero relative h-20 p-4 text-primary-foreground">
                    <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full border-[10px] border-primary-foreground/15" />
                    <p className="text-xs uppercase tracking-[0.2em] opacity-80">{tr(p.songIds.length === 1 ? "{n} song" : "{n} songs", { n: p.songIds.length })}</p>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                    <p className="text-sm text-muted-foreground">{p.description || tr("No description")}</p>
                    <p className="mt-2 truncate text-xs text-muted-foreground">{p.songIds.map((id) => getSong(id)?.title).filter(Boolean).join(" · ")}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <button onClick={() => setOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-8 text-muted-foreground hover:bg-card">
              <ListMusic className="h-5 w-5" /> {tr("Create a custom playlist")}
            </button>
          )}
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader><DialogTitle className="font-display text-2xl">{tr("New playlist")}</DialogTitle></DialogHeader>
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
            <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={tr("e.g. Rainy day songs")} className="h-11" maxLength={80} />
            <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={tr("Short description (optional)")} className="h-11" maxLength={160} />
            <Button type="submit" disabled={busy} className="h-11 w-full rounded-full">{tr("Create playlist")}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
