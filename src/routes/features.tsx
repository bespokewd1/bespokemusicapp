import { siteUrl } from "@/lib/site";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PenLine, ClipboardPaste, Library, ListMusic, ScrollText, ArrowUpDown, Hash, Highlighter, StickyNote, FileDown, Mic, Grid3x3, DatabaseBackup, Type } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { property: "og:url", content: siteUrl("/features") },
      { title: "Features — Bespoke Music" },
      { name: "description", content: "Everything in Bespoke Music: add songs, playlists, auto-scroll, transpose, tuner, chord library and more." },
      { property: "og:title", content: "Features — Bespoke Music" },
      { property: "og:description", content: "All the tools in your personal guitar songbook." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: siteUrl("/features") }],
  }),
  component: Features,
});

const LIST = [
  { icon: PenLine, t: "Write songs", d: "Type chords and lyrics in a simple editor." },
  { icon: ClipboardPaste, t: "Chords, lyrics & tabs", d: "Paste chord sheets and tabs; chords-over-lyrics convert automatically." },
  { icon: Library, t: "My Songs", d: "A private, searchable collection only you can see." },
  { icon: ListMusic, t: "Playlists", d: "Practice lists, acoustic sets and performance setlists." },
  { icon: ScrollText, t: "Auto-scroll", d: "Hands-free scrolling with adjustable speed." },
  { icon: ArrowUpDown, t: "Transpose & capo", d: "Change the key in one tap; capo position shown on every song." },
  { icon: Type, t: "Adjustable font size", d: "Make chords and lyrics bigger or smaller." },
  { icon: Hash, t: "Nashville numbers", d: "Show chords as numbers for any key." },
  { icon: Highlighter, t: "Annotate", d: "Draw on your song sheets with pens and an eraser." },
  { icon: StickyNote, t: "Private notes", d: "Keep practice notes on every song." },
  { icon: FileDown, t: "PDF export", d: "Print or save a clean chord sheet." },
  { icon: Mic, t: "Guitar tuner", d: "Normal, Drop D and Drop C tuning with your mic." },
  { icon: Grid3x3, t: "Chord library", d: "Searchable chord diagrams." },
  { icon: DatabaseBackup, t: "Backup & restore", d: "Download your library and restore it anytime." },
];

function Features() {
  return (
    <div>
      <PageHeader eyebrow="Free during Beta" title="All Features" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LIST.map((f) => (
          <div key={f.t} className="flex min-w-0 gap-3 rounded-2xl border border-border bg-card p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><f.icon className="h-5 w-5" /></span>
            <span className="min-w-0"><span className="block font-semibold">{f.t}</span><span className="block text-sm text-muted-foreground">{f.d}</span></span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">Coming later: themes and offline access. Bespoke Music currently needs an internet connection.</p>
      <Link to="/" className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground">← Back to Home</Link>
    </div>
  );
}
