import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { rowToSong, useStore } from "@/lib/store";
import type { Song } from "@/lib/songs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Bespoke Music" },
      { name: "description", content: "Private administrator dashboard." },
      { property: "og:title", content: "Admin — Bespoke Music" },
      { property: "og:description", content: "Private administrator dashboard." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

interface Stats {
  total_users: number; new_today: number; new_7d: number; new_30d: number; active_30d: number;
  songs_added: number; playlists: number; daily: { day: string; signups: number; active: number }[];
}
interface UserRow { id: string; email: string | null; display_name: string | null; created_at: string; last_active_at: string; roles: string[] }

function AdminPage() {
  const { ready, isAdmin, signedIn } = useStore();
  if (!ready) return null;
  if (!signedIn || !isAdmin)
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="font-display text-3xl">Not available</h1>
        <p className="mt-2 text-muted-foreground">This page is only for the site administrator.</p>
        <Link to="/" className="mt-4 inline-block text-primary underline">Back to Explore</Link>
      </div>
    );
  return (
    <div>
      <PageHeader eyebrow="Private" title="Admin Dashboard" />
      <Tabs defaultValue="overview">
        <TabsList className="mb-6 h-11 w-full rounded-full bg-secondary p-1 sm:w-auto">
          <TabsTrigger value="overview" className="flex-1 rounded-full px-4">Overview</TabsTrigger>
          <TabsTrigger value="users" className="flex-1 rounded-full px-4">Users</TabsTrigger>
          <TabsTrigger value="content" className="flex-1 rounded-full px-4">Demo songs</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><Overview /></TabsContent>
        <TabsContent value="users"><Users /></TabsContent>
        <TabsContent value="content"><Content /></TabsContent>
      </Tabs>
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    supabase.rpc("admin_stats").then(({ data, error }) => {
      if (error) setErr("Couldn't load statistics.");
      else setStats(data as unknown as Stats);
    });
  }, []);
  if (err) return <p className="text-destructive">{err}</p>;
  if (!stats) return <div className="h-40 animate-pulse rounded-2xl bg-secondary" />;
  const cards: [string, string | number, string?][] = [
    ["Registered users", stats.total_users],
    ["New today", stats.new_today],
    ["New · 7 days", stats.new_7d],
    ["New · 30 days", stats.new_30d],
    ["Active · 30 days", stats.active_30d, "Signed-in visit in the last 30 days"],
    ["Songs added by users", stats.songs_added],
    ["Playlists created", stats.playlists],
    ["Subscriptions", "Not enabled", "Payments aren't set up"],
  ];
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([label, value, hint]) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4 shadow-soft" title={hint}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={cn("mt-1 font-display font-semibold", typeof value === "number" ? "text-3xl" : "text-lg text-muted-foreground")}>{value}</p>
          </div>
        ))}
      </div>
      <BarChart title="New registrations · last 30 days" data={stats.daily.map((d) => ({ label: d.day, value: d.signups }))} />
      <BarChart title="Active users per day · last 30 days" data={stats.daily.map((d) => ({ label: d.day, value: d.active }))} note="Counts each user on the most recent day they were active." />
    </div>
  );
}

function BarChart({ title, data, note }: { title: string; data: { label: string; value: number }[]; note?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>
      <div className="flex h-32 items-end gap-[3px]" role="img" aria-label={`${title}: ${total} total`}>
        {data.map((d) => (
          <div key={d.label} className="group relative flex-1">
            <div className="w-full rounded-t-sm bg-primary/80 transition-colors group-hover:bg-primary" style={{ height: `${Math.max(2, (d.value / max) * 128)}px`, opacity: d.value ? 1 : 0.2 }} />
            <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background group-hover:block">{d.label.slice(5)} · {d.value}</span>
          </div>
        ))}
      </div>
      {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
    </section>
  );
}

function Users() {
  const [rows, setRows] = useState<UserRow[] | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"created_at" | "last_active_at" | "display_name">("created_at");
  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("id,email,display_name,created_at,last_active_at"),
      supabase.from("user_roles").select("user_id,role"),
    ]).then(([p, r]) => {
      if (p.error) return toast.error("Couldn't load users");
      setRows((p.data ?? []).map((u) => ({ ...u, roles: (r.data ?? []).filter((x) => x.user_id === u.id).map((x) => x.role) })));
    });
  }, []);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (rows ?? [])
      .filter((u) => !t || u.email?.toLowerCase().includes(t) || u.display_name?.toLowerCase().includes(t))
      .sort((a, b) => (sort === "display_name" ? (a.display_name ?? "").localeCompare(b.display_name ?? "") : (b[sort] ?? "").localeCompare(a[sort] ?? "")));
  }, [rows, q, sort]);
  if (!rows) return <div className="h-40 animate-pulse rounded-2xl bg-secondary" />;
  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" className="h-11" />
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-11 rounded-md border border-input bg-card px-3 text-sm" aria-label="Sort users">
          <option value="created_at">Newest first</option>
          <option value="last_active_at">Recently active</option>
          <option value="display_name">Name A–Z</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Joined</th><th className="p-3">Last active</th><th className="p-3">Role</th><th className="p-3">Subscription</th></tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3 font-medium">{u.display_name ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="p-3">{new Date(u.last_active_at).toLocaleDateString()}</td>
                <td className="p-3">{u.roles.includes("admin") ? <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">Admin</span> : "User"}</td>
                <td className="p-3 text-muted-foreground">Not enabled</td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No users match.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Content() {
  const { reloadSongs } = useStore();
  const [songs, setSongs] = useState<Song[] | null>(null);
  const load = useCallback(async () => {
    const { data, error } = await supabase.from("songs").select("*").is("owner_id", null).order("sort_order");
    if (error) return toast.error("Couldn't load demo songs");
    setSongs((data ?? []).map((r) => rowToSong(r as never)));
  }, []);
  useEffect(() => { load(); }, [load]);

  const update = async (id: string, patch: Record<string, unknown>) => {
    const { error } = await supabase.from("songs").update(patch).eq("id", id);
    if (error) toast.error("Update failed");
    await Promise.all([load(), reloadSongs()]);
  };
  const featured = (songs ?? []).filter((s) => s.pickUp).sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
  const moveFeatured = async (id: string, dir: -1 | 1) => {
    const i = featured.findIndex((s) => s.id === id);
    const j = i + dir;
    if (j < 0 || j >= featured.length) return;
    const ids = featured.map((s) => s.id);
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    await Promise.all(ids.map((sid, pos) => supabase.from("songs").update({ featured_order: pos }).eq("id", sid)));
    await Promise.all([load(), reloadSongs()]);
  };

  if (!songs) return <div className="h-40 animate-pulse rounded-2xl bg-secondary" />;
  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button asChild className="h-11 rounded-full"><Link to="/admin/songs/new"><Plus className="mr-1 h-4 w-4" /> New demo song</Link></Button>
      </div>
      <section>
        <h3 className="mb-3 font-display text-lg font-semibold">Pick Up &amp; Play order</h3>
        <ol className="space-y-2">
          {featured.map((s, i) => (
            <li key={s.id} className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 pl-4">
              <span className="w-5 text-muted-foreground">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate font-medium">{s.title}</span>
              <Button variant="ghost" size="icon" aria-label="Move up" disabled={i === 0} onClick={() => moveFeatured(s.id, -1)}><ArrowUp className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" aria-label="Move down" disabled={i === featured.length - 1} onClick={() => moveFeatured(s.id, 1)}><ArrowDown className="h-4 w-4" /></Button>
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h3 className="mb-3 font-display text-lg font-semibold">All demo songs</h3>
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {songs.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-2 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{s.title} {!s.published && <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">Draft</span>}</p>
                <p className="truncate text-xs text-muted-foreground">{s.artist} · {s.key} · {s.difficulty}</p>
              </div>
              <Button variant="ghost" size="icon" aria-label={s.pickUp ? "Unfeature" : "Feature"} onClick={() => update(s.id, { featured: !s.pickUp, featured_order: s.pickUp ? null : featured.length })}>
                <Star className={cn("h-4 w-4", s.pickUp && "fill-primary text-primary")} />
              </Button>
              <Button variant="ghost" size="icon" aria-label={s.published ? "Unpublish" : "Publish"} onClick={() => update(s.id, { published: !s.published })}>
                {s.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button asChild variant="ghost" size="icon" aria-label="Edit"><Link to="/song/$id/edit" params={{ id: s.id }}><Pencil className="h-4 w-4" /></Link></Button>
              <Button variant="ghost" size="icon" aria-label="Delete" onClick={async () => {
                if (!confirm(`Delete “${s.title}” for everyone?`)) return;
                const { error } = await supabase.from("songs").delete().eq("id", s.id);
                if (error) toast.error("Delete failed");
                await Promise.all([load(), reloadSongs()]);
              }}><Trash2 className="h-4 w-4" /></Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
