import { siteUrl } from "@/lib/site";
import { useT } from "@/lib/i18n";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PenLine, ListMusic, Play, ArrowRight, Plus, Library, ScrollText, ClipboardPaste, Wrench, Check, SlidersHorizontal, Music, FileText, ArrowUpDown, PlayCircle, Mic, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SongCard } from "@/components/SongCard";
import { useStore } from "@/lib/store";
import { uniqueChords } from "@/lib/songs";
import { useState } from "react";
import { SearchAction } from '@/components/GlobalSearch';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Personal Guitar Songbook & Chord Library | Bespoke Music" },
      { name: "description", content: "Build your personal guitar songbook. Add chords, lyrics and tabs, create playlists, and play with auto-scroll. No ads. No distractions. Try it free." },
      { property: "og:title", content: "Bespoke Music — Your Personal Guitar Songbook" },
      { property: "og:description", content: "Add your songs, save chords and lyrics, create playlists, and build your own music library. Enjoy auto-scroll and distraction-free playing. Free to try, with no ads." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl() },
      { property: "og:image", content: siteUrl("/og-image.png") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Bespoke Music — Your Personal Guitar Songbook" },
      { name: "twitter:description", content: "Add your songs, save chords and lyrics, create playlists, and build your own music library. Enjoy auto-scroll and distraction-free playing. Free to try, with no ads." },
      { name: "twitter:image", content: siteUrl("/og-image.png") },
    ],
    links: [{ rel: "canonical", href: siteUrl() }],
  }),
  component: Explore,
});

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

const FEATURES = [
  { icon: ClipboardPaste, title: "Easy Song Import", text: "Write songs manually or copy and paste chords and lyrics." },
  { icon: ScrollText, title: "Auto-Scroll Play Mode", text: "Keep playing while your song sheet scrolls automatically." },
  { icon: Wrench, title: "Built-In Guitar Tools", text: "Tune your guitar and access a searchable chord reference." },
];

function Explore() {
  const { signedIn, ready, user, allSongs } = useStore();
  const signed = ready && signedIn;
  if (!signed) return <Landing />;
  const experienced = allSongs.some((s) => s.ownerId === user?.id);
  return (
    <div>
      <Welcome />
      <DemoSongs compact quiet={experienced} />
      {!experienced && <HowItWorks />}
    </div>
  );
}

/** Signed-out landing: hero → Try It Yourself → 3 steps → features → final CTA. */
function Landing() {
  const { requireAuth, allSongs, songsLoaded } = useStore();
  const { t } = useT();
  const navigate = useNavigate();
  const [all, setAll] = useState(false);
  const signUp = () => requireAuth("Create your free Beta account.", () => navigate({ to: "/my-songs" }));
  const demos = allSongs.filter((s) => !s.ownerId && s.published !== false && s.pickUp).sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99));
  const shown = all ? demos : demos.slice(0, 1);
  const steps = [
    ["Add Your Songs", "Copy and paste your chords and lyrics, or write your own."],
    ["Organize Your Music", "Save favourites and build playlists for practice or performances."],
    ["Play Without Distractions", "Transpose, adjust text size, and use auto-scroll."],
  ];
  const feats = [
    [FileText, "Chords & Lyrics"], [ListMusic, "Playlists"], [ArrowUpDown, "Transpose"],
    [PlayCircle, "Auto-Scroll"], [Music, "Chord Library"], [Mic, "Guitar Tuner"],
  ] as const;
  return (
    <div className="mx-auto max-w-3xl">
      <section className="pt-2 text-left md:pt-8 md:text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-foreground">{t("Your music. Your songbook.")}</p>
        <h1 className="mt-2 font-display text-[2.1rem] font-semibold leading-[1.08] sm:text-5xl md:text-6xl">{t("Your personal guitar songbook.")}</h1>
        <p className="mt-3 text-muted-foreground md:mx-auto md:max-w-xl md:text-lg">{t("Save your chords and lyrics, create playlists, and play your favourite songs in one place.")}</p>
        <div className="mt-5 grid gap-2.5 sm:flex sm:justify-center">
          <Button size="lg" className="h-12 rounded-full px-7 text-base" onClick={signUp}>{t("Start Your Songbook — Free")}</Button>
          <Button size="lg" variant="outline" className="h-12 rounded-full px-7 text-base" onClick={() => scrollTo("demo-songs")}>{t("Try Demo Songs")}</Button>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">{t("Free during Beta · No credit card required")}</p>
        <p className="mt-1 flex justify-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-primary" />{t("No ads")}</span>
          <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-primary" />{t("No distractions")}</span>
        </p>
      </section>

      <section id="demo-songs" className="mt-10 scroll-mt-24">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold sm:text-2xl">{t("Try It Yourself")}</h2>
            <p className="text-sm text-muted-foreground">{t("No account needed")}</p>
          </div>
          {demos.length > 1 && <button onClick={() => setAll((v) => !v)} className="shrink-0 text-sm text-muted-foreground hover:text-foreground">{t(all ? "Show less" : "View all →")}</button>}
        </div>
        {!songsLoaded ? <div className="h-24 animate-pulse rounded-2xl bg-secondary" /> : shown.length ? (
          <div className="grid gap-2.5">
            {shown.map((s) => (
              <Link key={s.id} to="/song/$id" params={{ id: s.id }} className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><Music className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-lg font-semibold">{s.title}</span>
                  <span className="block truncate text-sm text-muted-foreground">{s.artist}</span>
                  <span className="mt-1 block truncate font-mono text-xs font-semibold text-primary">{uniqueChords(s).slice(0, 5).join(" · ")}</span>
                </span>
                <PlayCircle className="h-7 w-7 shrink-0 text-primary" />
              </Link>
            ))}
          </div>
        ) : <Empty text="Demo songs are coming soon." />}
        <p className="mt-2.5 text-sm text-muted-foreground">{t("Test auto-scroll, transpose chords, and adjust your reading size.")}</p>
      </section>

      <section id="how-it-works" className="mt-10 scroll-mt-24 border-t border-border pt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-foreground">{t("How It Works")}</p>
        <h2 className="mt-1 font-display text-xl font-semibold sm:text-2xl">{t("From chords to your songbook in 3 steps.")}</h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-3">
          {steps.map(([title, text], i) => (
            <li key={title} className="flex min-w-0 gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary font-display font-semibold text-primary">{i + 1}</span>
              <span className="min-w-0">
                <span className="block font-semibold">{t(title!)}</span>
                <span className="block text-sm text-muted-foreground">{t(text!)}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><Music className="h-4 w-4 text-primary" />{t("Made for musicians")}</h2>
        <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          {feats.map(([Icon, label]) => (
            <li key={label} className="flex min-w-0 items-center gap-2 text-sm"><Icon className="h-4 w-4 shrink-0 text-primary" /><span className="truncate">{t(label)}</span></li>
          ))}
        </ul>
        <Link to="/features" className="mt-3 inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground">{t("Explore All Features")}<ChevronRight className="h-3.5 w-3.5" /></Link>
      </section>

      <section className="mt-10 text-center">
        <h2 className="font-display text-2xl font-semibold">{t("Build a songbook that's yours.")}</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{t("Keep your songs, chords, and playlists organized and ready to play.")}</p>
        <Button size="lg" className="mt-4 h-12 w-full rounded-full px-7 text-base sm:w-auto" onClick={signUp}>{t("Create Your Free Account")}</Button>
        <p className="mt-2 text-xs text-muted-foreground">{t("No credit card required during Beta.")}</p>
      </section>
    </div>
  );
}

function MarketingHero() {
  const { requireAuth } = useStore();
  const { t } = useT();
  const navigate = useNavigate();
  return (
    <section className="bg-hero relative mb-10 overflow-hidden rounded-3xl px-5 py-8 text-primary-foreground shadow-lift sm:px-8 sm:py-12 md:px-12 md:py-14">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border-[18px] border-primary-foreground/10" />
      <div className="pointer-events-none absolute -right-4 -top-4 h-40 w-40 rounded-full border-[6px] border-primary-foreground/10" />
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] opacity-80 sm:text-xs sm:tracking-[0.25em]">
        {t("No ads. No distractions.")}
        <span className="shrink-0 rounded-full border border-primary-foreground/40 px-2 py-0.5 text-[10px] tracking-[0.15em]">{t("Beta")}</span>
      </p>
      <h1 className="mt-3 max-w-xl font-display text-[2rem] font-semibold leading-[1.08] sm:text-5xl md:text-6xl md:leading-[1.05]">
        {t("Your personal")} <em className="font-normal">{t("guitar songbook.")}</em>
      </h1>
      <ul className="mt-5 space-y-2 text-base opacity-90 sm:text-lg">
        {["Save your favourite chords & lyrics.", "Create playlists for practice and performances.", "Grow your collection, all in one place."].map((b) => (
          <li key={b} className="flex items-start gap-2"><Check className="mt-1 h-4 w-4 shrink-0" />{t(b)}</li>
        ))}
      </ul>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" variant="secondary" className="h-12 rounded-full px-6 text-base" onClick={() => requireAuth("Sign in to start your songbook.", () => navigate({ to: "/my-songs" }))}>
          {t("Start Your Free Songbook")}
        </Button>
        <Button size="lg" variant="outline" className="h-12 rounded-full border-primary-foreground/50 bg-transparent px-6 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={() => scrollTo("demo-songs")}>
          {t("Try Demo Songs")}
        </Button>
      </div>
      <p className="mt-4 text-sm opacity-80">{t("Free during Beta. Your personal songs and playlists stay private.")}</p>
    </section>
  );
}

function Welcome() {
  const { user, allSongs, playlists, recent, getSong } = useStore();
  const { t } = useT();
  const navigate = useNavigate();
  const first = ((user?.user_metadata?.["full_name"] as string) || user?.email || "").split(/[\s@._]/)[0];
  const firstName = first ? first.charAt(0).toUpperCase() + first.slice(1) : "";
  const mine = allSongs.filter((s) => s.ownerId === user?.id).slice(-3).reverse();
  const played = recent.map((id) => getSong(id)).filter(Boolean) as NonNullable<ReturnType<typeof getSong>>[];
  const last = played[0];
  const isNew = !mine.length;
  // "Recently used" = playlists holding the most recently played songs, then newest
  const rank = (ids: string[]) => { const i = recent.findIndex((r) => ids.includes(r)); return i < 0 ? 999 : i; };
  const pls = [...playlists].map((p, i) => ({ p, i })).sort((a, b) => rank(a.p.songIds) - rank(b.p.songIds) || b.i - a.i).slice(0, 2).map((x) => x.p);
  return (
    <>
      <section className="mb-6 grid grid-cols-1 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-semibold leading-tight sm:text-3xl">
            {isNew ? t("Let's start your songbook") : firstName ? t("Welcome back, {name}!", { name: firstName }) : t("Welcome back!")}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{t(isNew ? "Add your first song — paste chords and lyrics or write from scratch." : "Pick up where you left off.")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="h-11 rounded-full px-5" onClick={() => navigate({ to: "/songs/new" })}><Plus className="mr-1 h-4 w-4" /> {t("Add Song")}</Button>
          <Button variant="outline" className="h-11 rounded-full px-5" onClick={() => navigate({ to: "/playlists" })}><Plus className="mr-1 h-4 w-4" /> {t("Create Playlist")}</Button>
          <SearchAction />
        </div>
      </section>

      {last && (
        <Link to="/song/$id" params={{ id: last.id }} className="mb-8 flex min-w-0 items-center gap-4 rounded-2xl bg-hero p-4 text-primary-foreground shadow-lift transition hover:-translate-y-0.5 sm:p-5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary-foreground/15"><Play className="h-5 w-5 fill-current" /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] opacity-80">{t("Continue Playing")}</span>
            <span className="block truncate font-display text-xl font-semibold">{last.title}</span>
            <span className="block truncate text-sm opacity-80">{last.artist} · {t("Key")} {last.key}</span>
          </span>
        </Link>
      )}

      {isNew ? (
        <Empty text="No songs yet. Add your first song to start your collection." />
      ) : (
        <>
          <SectionHead title="Recent Songs" to="/my-songs" />
          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{mine.map((s) => <SongCard key={s.id} song={s} compact />)}</div>
        </>
      )}

      <SectionHead title="My Playlists" to="/playlists" />
      {pls.length ? (
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {pls.map((p) => (
            <Link key={p.id} to="/playlists/$id" params={{ id: p.id }} className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><ListMusic className="h-5 w-5" /></span>
              <span className="min-w-0">
                <span className="block truncate font-display text-lg font-semibold">{p.name}</span>
                <span className="block text-sm text-muted-foreground">{t(p.songIds.length === 1 ? "{n} song" : "{n} songs", { n: p.songIds.length })}</span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <Empty text="No playlists yet. Create one for practice, acoustic sets, or performances." />
      )}
    </>
  );
}

function SectionHead({ title, to }: { title: string; to?: "/my-songs" | "/playlists" }) {
  const { t } = useT();
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="font-display text-xl font-semibold sm:text-2xl">{t(title)}</h2>
      {to && <Link to={to} className="shrink-0 text-sm text-muted-foreground hover:text-foreground">{t("View all →")}</Link>}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  const { t } = useT();
  return <p className="mb-8 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{t(text)}</p>;
}

function QuickFeatures() {
  const { t } = useT();
  return (
    <section className="mb-12">
      <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{t("Built for musicians who play.")}</h2>
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex min-w-0 gap-3 rounded-2xl border border-border bg-card p-4 md:flex-col md:p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><f.icon className="h-5 w-5" /></span>
            <span className="min-w-0">
              <span className="block font-semibold">{t(f.title)}</span>
              <span className="block text-sm text-muted-foreground">{t(f.text)}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function DemoSongs({ compact, quiet }: { compact: boolean; quiet?: boolean }) {
  const { allSongs, songsLoaded } = useStore();
  const { t } = useT();
  const list = allSongs
    .filter((s) => !s.ownerId && s.published !== false && s.pickUp)
    .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99));
  if (quiet) {
    return (
      <section id="demo-songs" className="mt-4 scroll-mt-24 rounded-2xl border border-border p-4">
        <p className="text-sm text-muted-foreground">{t("Demo songs")}:{" "}
          {list.map((s, i) => <span key={s.id}>{i > 0 && " · "}<Link to="/song/$id" params={{ id: s.id }} className="font-medium text-foreground hover:text-primary">{s.title}</Link></span>)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{t("New here?")} <Link to="/help" className="text-primary hover:underline">{t("See how Bespoke Music works")}</Link></p>
      </section>
    );
  }
  return (
    <section id="demo-songs" className="scroll-mt-24">
      {compact && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">{t("Pick Up & Play")}</p>}
      <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{t(compact ? "Try Demo Songs" : "Pick Up & Play")}</h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        {t(compact ? "Explore a few sample songs and test the player." : "Try real song sheets with no sign-in required.")}
      </p>
      {!songsLoaded ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-secondary" />)}</div>
      ) : list.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{list.map((s) => <SongCard key={s.id} song={s} compact={compact} />)}</div>
      ) : (
        <Empty text="Demo songs are coming soon." />
      )}
    </section>
  );
}

export function _SignUpCta() {
  const { requireAuth } = useStore();
  const navigate = useNavigate();
  return (
    <section className="mt-12 flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft md:flex-row md:items-center md:justify-between md:p-8">
      <div className="min-w-0">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Ready to build your own songbook?</h2>
        <p className="mt-1 text-muted-foreground">Save your songs, create playlists, and keep your collection yours.</p>
      </div>
      <div className="shrink-0 text-center">
        <Button size="lg" className="h-12 w-full rounded-full px-6 md:w-auto" onClick={() => requireAuth("Create your free Beta account.", () => navigate({ to: "/my-songs" }))}>
          Create Your Free Beta Account
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">Free during Beta.</p>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { signedIn, ready, requireAuth } = useStore();
  const { t } = useT();
  const navigate = useNavigate();
  const steps = [
    { icon: PenLine, title: "Add Your Songs", text: "Copy and paste your chords, lyrics, or guitar tabs from your own collection or another source you're permitted to use. You can also create songs from scratch." },
    { icon: ListMusic, title: "Organize Your Collection", text: "Save favourites, create playlists, and arrange songs for practice, rehearsals, jam sessions, or performances." },
    { icon: SlidersHorizontal, title: "Make It Yours", text: "Adjust chord keys, capo settings, font sizes, scroll speed, and add personal notes or annotations to suit your playing style." },
    { icon: Play, title: "Play Anywhere", text: "Open your songbook, follow your chords and lyrics, and use auto-scroll for hands-free playing." },
  ];
  return (
    <section id="how-it-works" className="mt-14 scroll-mt-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">{t("How It Works")}</p>
      <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{t("Your music collection, all in one place.")}</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">{t("Save your chords, lyrics, and tabs, organize the songs you love, and keep everything ready whenever it's time to play.")}</p>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
        {steps.map((s, i) => (
          <div key={s.title} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-card p-5 md:p-6">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><s.icon className="h-5 w-5" /></span>
            <span className="min-w-0">
              <span className="block font-display text-lg font-semibold">{i + 1}. {t(s.title)}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{t(s.text)}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="mt-5 text-muted-foreground">{t("Your collection grows with you, whether you're practising at home, jamming with friends, or preparing for a performance.")}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        {!(ready && signedIn) && (
          <Button className="h-12 rounded-full px-6" onClick={() => requireAuth("Create your free Beta account.", () => navigate({ to: "/my-songs" }))}>{t("Start Building Your Songbook")}</Button>
        )}
        <button onClick={() => scrollTo("demo-songs")} className="text-sm font-medium text-primary hover:underline">{t("Try a Demo Song")}</button>
        <Link to="/features" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          {t("Explore All Features")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
