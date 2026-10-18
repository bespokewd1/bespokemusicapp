import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { SongCard } from '@/components/SongCard';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { demoSongs, type DemoCategory } from '@/lib/demos';
import { useStore } from '@/lib/store';
import { siteUrl } from '@/lib/site';

export const Route = createFileRoute('/demos')({
  head: () => ({ meta: [
    { title: 'Demo Songs — Bespoke Music' },
    { name: 'description', content: 'Try guitar demo songs with chords, transposition and auto-scroll.' },
    { property: 'og:title', content: 'Demo Songs — Bespoke Music' },
    { property: 'og:description', content: 'Explore public guitar demo songs and try the Bespoke Music player.' },
    { property: 'og:url', content: siteUrl('/demos') },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ], links: [{ rel: 'canonical', href: siteUrl('/demos') }] }),
  component: Demos,
});

function Demos() {
  const { allSongs, songsLoaded } = useStore();
  const [category, setCategory] = useState<DemoCategory | undefined>();
  const songs = demoSongs(allSongs, category);
  return <div>
    <PageHeader eyebrow="Explore" title="Demo Songs" />
    <div className="mb-5 flex flex-wrap gap-2" aria-label="Demo categories">
      {([{ value: undefined, label: 'All Demo Songs' }, { value: 'pickup', label: 'Pick Up & Play' }, { value: 'easy', label: 'Easy Songs' }] as const).map(c => <Button key={c.label} variant={category === c.value ? 'secondary' : 'ghost'} aria-pressed={category === c.value} onClick={() => setCategory(c.value)}>{c.label}</Button>)}
    </div>
    {!songsLoaded ? <p role="status">Loading…</p> : songs.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{songs.map(s => <SongCard key={s.id} song={s} />)}</div> : <p className="text-muted-foreground">Demo songs are coming soon.</p>}
  </div>;
}