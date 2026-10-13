import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Library, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { SongCard } from "@/components/SongCard";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/my-songs")({
  head: () => ({
    meta: [
      { title: "My Songs — Bespoke Music" },
      { name: "description", content: "Your saved songs, your own additions and recently played." },
      { property: "og:title", content: "My Songs — Bespoke Music" },
      { property: "og:description", content: "Your saved songs, additions and recently played." },
    ],
  }),
  component: MySongs,
});

export function SignedOutState({ title, text }: { title: string; text: string }) {
  const { requireAuth } = useStore();
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-dashed border-border bg-card p-10 text-center">
      <span className="soundhole mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full text-primary"><Library className="h-6 w-6" /></span>
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-muted-foreground">{text}</p>
      <Button className="mt-6 rounded-full" onClick={() => requireAuth("", () => {})}>Sign in to get started</Button>
    </div>
  );
}

function MySongs() {
  const { signedIn, saved, added, recent, getSong, requireAuth } = useStore();
  const [tab, setTab] = useState("saved");
  const ids = tab === "saved" ? saved : tab === "added" ? added.map((a) => a.id) : recent;
  const list = ids.map(getSong).filter(Boolean) as NonNullable<ReturnType<typeof getSong>>[];

  return (
    <div>
      <PageHeader eyebrow="Your collection" title="My Songs">
        <Button asChild={signedIn} className="rounded-full" onClick={signedIn ? undefined : () => requireAuth("Sign in to add your own songs.", () => {})}>
          {signedIn ? <Link to="/songs/new"><Plus className="mr-1 h-4 w-4" />Add Song</Link> : <span><Plus className="mr-1 h-4 w-4" />Add Song</span>}
        </Button>
      </PageHeader>
      {!signedIn ? (
        <SignedOutState title="Your songs live here" text="Save favourites, add your own arrangements and pick up where you left off." />
      ) : (
        <>
          <Tabs value={tab} onValueChange={setTab} className="mb-5">
            <TabsList className="h-11 w-full rounded-full bg-secondary p-1 sm:w-auto">
              <TabsTrigger value="saved" className="flex-1 rounded-full px-4">Saved</TabsTrigger>
              <TabsTrigger value="added" className="flex-1 rounded-full px-4">My Added</TabsTrigger>
              <TabsTrigger value="recent" className="flex-1 rounded-full px-4">Recent</TabsTrigger>
            </TabsList>
          </Tabs>
          {list.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{list.map((s) => <SongCard key={s.id} song={s} />)}</div>
          ) : (
            <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
              {tab === "added" ? <>Nothing here yet. <Link to="/songs/new" className="text-primary underline">Add your first song</Link>.</> : "Nothing here yet — explore and start playing."}
            </p>
          )}
        </>
      )}
    </div>
  );
}
