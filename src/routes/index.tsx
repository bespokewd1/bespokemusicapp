import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PenLine, ListMusic, Play, ArrowRight, Plus, Library, ScrollText, Wrench, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SongCard } from "@/components/SongCard";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bespoke Music — Your Personal Guitar Songbook" },
      { name: "description", content: "Add your favourite songs, save chords and lyrics, create playlists, and build your personal guitar collection. No Ads. No Distractions." },
      { property: "og:title", content: "Bespoke Music — Your Personal Guitar Songbook" },
      { property: "og:description", content: "Add your favourite songs, save chords and lyrics, create playlists, and build your personal guitar collection. No Ads. No Distractions." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://bespokemusicapp.lovable.app/" },
      { property: "og:image", content: "https://bespokemusicapp.lovable.app/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Your Music. Your Songs. Your Way." },
      { name: "twitter:description", content: "One place for all your guitar chords, lyrics, and playlists. Save, organize, and play anytime." },
      { name: "twitter:image", content: "https://bespokemusicapp.lovable.app/og-image.png" },
    ],
    links: [{ rel: "canonical", href: "https://bespokemusicapp.lovable.app/" }],
  }),
  component: Explore,
});

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

const FEATURES = [
  { icon: PenLine, title: "Add Your Songs", text: "Write songs manually or copy and paste chords and lyrics." },
  { icon: Library, title: "Build Your Collection", text: "Save your favourite songs and keep everything organized." },
  { icon: ListMusic, title: "Create Playlists", text: "Organize music for practice, acoustic sets, and performances." },
  { icon: ScrollText, title: "Auto-Scroll Play Mode", text: "Let your song sheets scroll automatically while you play guitar." },
  { icon: Wrench, title: "Built-In Guitar Tools", text: "Tune your guitar and browse chord diagrams without leaving the app." },
];

function Explore() {
  const { signedIn, ready } = useStore();
  return (
    <div>
      {ready && signedIn ? <Welcome /> : <MarketingHero />}
      {!(ready && signedIn) && <QuickFeatures />}
      <DemoSongs compact={ready && signedIn} />
      <HowItWorks />
      <footer className="mt-16 border-t border-border pt-6 pb-2 text-center">
        <p className="text-xs text-muted-foreground">
          Built by{" "}
          <a href="https://bespokewebdesign.ca/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
            Bespoke Web Design
          </a>
        </p>
      </footer>
    </div>
  );
}

function MarketingHero() {
  const { requireAuth } = useStore();
  const navigate = useNavigate();
  return (
    <section className="bg-hero relative mb-10 overflow-hidden rounded-3xl px-5 py-8 text-primary-foreground shadow-lift sm:px-8 sm:py-12 md:px-12 md:py-14">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border-[18px] border-primary-foreground/10" />
      <div className="pointer-events-none absolute -right-4 -top-4 h-40 w-40 rounded-full border-[6px] border-primary-foreground/10" />
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] opacity-80 sm:text-xs sm:tracking-[0.25em]">
        No ads. No distractions.
        <span className="shrink-0 rounded-full border border-primary-foreground/40 px-2 py-0.5 text-[10px] tracking-[0.15em]">Beta</span>
      </p>
      <h1 className="mt-3 max-w-xl font-display text-[2rem] font-semibold leading-[1.08] sm:text-5xl md:text-6xl md:leading-[1.05]">
        Your personal <em className="font-normal">guitar songbook.</em>
      </h1>
      <ul className="mt-5 space-y-2 text-base opacity-90 sm:text-lg">
        {["Save your favourite chords & lyrics.", "Create playlists and organize your songs.", "Grow your personal music collection."].map((t) => (
          <li key={t} className="flex items-start gap-2"><Check className="mt-1 h-4 w-4 shrink-0" />{t}</li>
        ))}
      </ul>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" variant="secondary" className="h-12 rounded-full px-6 text-base" onClick={() => requireAuth("Sign in to start your songbook.", () => navigate({ to: "/songs/new" }))}>
          Start Your Songbook
        </Button>
        <Button size="lg" variant="outline" className="h-12 rounded-full border-primary-foreground/50 bg-transparent px-6 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={() => scrollTo("demo-songs")}>
          Try Demo Songs
        </Button>
      </div>
      <p className="mt-4 text-sm opacity-80">Free during Beta. Start building your collection today.</p>
    </section>
  );
}

function Welcome() {
  const { user, allSongs, playlists, recent, getSong } = useStore();
  const navigate = useNavigate();
  const first = ((user?.user_metadata?.["full_name"] as string) || user?.email || "").split(/[\s@._]/)[0];
  const firstName = first ? first.charAt(0).toUpperCase() + first.slice(1) : "";
  const mine = allSongs.filter((s) => s.ownerId === user?.id).slice(-6).reverse();
  const played = recent.map((id) => getSong(id)).filter(Boolean).slice(0, 3) as NonNullable<ReturnType<typeof getSong>>[];
  const isNew = !mine.length && !playlists.length;
  return (
    <>
      <section className="mb-10 grid gap-6 rounded-3xl border border-border bg-card p-6 shadow-soft md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-10">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">Your songbook</p>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">Welcome back{firstName ? `, ${firstName}` : ""}!</h1>
          <p className="mt-3 max-w-xl text-muted-foreground md:text-lg">
            {isNew ? "Let's start your collection. Add your first song or create a playlist." : "Your songbook is ready. Add songs, create playlists, and keep your music collection growing."}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
          <Button size="lg" className="h-12 rounded-full px-6" onClick={() => navigate({ to: "/songs/new" })}><Plus className="mr-1 h-4 w-4" /> Add Song</Button>
          <Button size="lg" variant="outline" className="h-12 rounded-full px-6" onClick={() => navigate({ to: "/playlists" })}><Plus className="mr-1 h-4 w-4" /> Create Playlist</Button>
        </div>
      </section>

      <SectionHead title="Recently Added Songs" to="/my-songs" />
      {mine.length ? (
        <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{mine.map((s) => <SongCard key={s.id} song={s} />)}</div>
      ) : (
        <Empty text="No songs yet. Add your first song to start your collection." />
      )}

      <SectionHead title="My Playlists" to="/playlists" />
      {playlists.length ? (
        <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.slice(0, 6).map((p) => (
            <Link key={p.id} to="/playlists/$id" params={{ id: p.id }} className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><ListMusic className="h-5 w-5" /></span>
              <span className="min-w-0">
                <span className="block truncate font-display text-lg font-semibold">{p.name}</span>
                <span className="block text-sm text-muted-foreground">{p.songIds.length} {p.songIds.length === 1 ? "song" : "songs"}</span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <Empty text="No playlists yet. Create one for practice, acoustic sets, or performances." />
      )}

      {played.length > 0 && (
        <>
          <SectionHead title="Recently Played" />
          <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{played.map((s) => <SongCard key={s.id} song={s} />)}</div>
        </>
      )}
    </>
  );
}

function SectionHead({ title, to }: { title: string; to?: "/my-songs" | "/playlists" }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="font-display text-xl font-semibold sm:text-2xl">{title}</h2>
      {to && <Link to={to} className="shrink-0 text-sm text-muted-foreground hover:text-foreground">View all →</Link>}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="mb-10 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{text}</p>;
}

function QuickFeatures() {
  return (
    <section className="mb-12">
      <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Everything you need for your personal songbook.</h2>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex min-w-0 gap-3 rounded-2xl border border-border bg-card p-4 lg:flex-col">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><f.icon className="h-5 w-5" /></span>
            <span className="min-w-0">
              <span className="block font-semibold">{f.title}</span>
              <span className="block text-sm text-muted-foreground">{f.text}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function DemoSongs({ compact }: { compact: boolean }) {
  const { allSongs, songsLoaded } = useStore();
  const list = allSongs
    .filter((s) => !s.ownerId && s.published !== false && s.pickUp)
    .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99));
  return (
    <section id="demo-songs" className="scroll-mt-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">Pick Up & Play</p>
      <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">Try Demo Songs</h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        {compact ? "Explore a few sample songs and test the player." : "Free demo songs to try — no sign-in needed. Sign in to add your own songs and playlists — only you can see them."}
      </p>
      {!songsLoaded ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-secondary" />)}</div>
      ) : list.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{list.map((s) => <SongCard key={s.id} song={s} />)}</div>
      ) : (
        <Empty text="Demo songs are coming soon." />
      )}
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="mt-14 scroll-mt-24">
      <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">How Bespoke Music Works</h2>
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-5">
        {[
          { icon: PenLine, title: "Add Your Songs", text: "Write chords and lyrics manually or copy and paste your existing song sheets." },
          { icon: ListMusic, title: "Organize Your Music", text: "Save favourite songs, create playlists, and build your personal collection." },
          { icon: Play, title: "Play Your Way", text: "Use auto-scroll, adjust song keys, and access built-in guitar tools." },
        ].map((s, i) => (
          <div key={s.title} className="flex min-w-0 gap-3 rounded-2xl border border-border bg-card p-5 md:p-6">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><s.icon className="h-5 w-5" /></span>
            <span className="min-w-0">
              <span className="block font-display text-lg font-semibold">{i + 1}. {s.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{s.text}</span>
            </span>
          </div>
        ))}
      </div>
      <Link to="/features" className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        Explore All Features <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
