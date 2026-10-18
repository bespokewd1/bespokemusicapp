import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ArrowUp, ArrowDown, ListMusic, type LucideIcon } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Playlist } from '@/lib/store';
import { useT } from '@/lib/i18n';

export function SortablePlaylist({ playlist, index, total, disabled, titles, image, icon: Icon = ListMusic, onMove }: { playlist: Playlist; index: number; total: number; disabled: boolean; titles: string; image: string; icon?: LucideIcon; onMove: (direction: -1 | 1) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: playlist.id, disabled });
  const { t } = useT();
  return <article ref={setNodeRef} data-playlist-id={playlist.id} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn('group relative isolate min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift', isDragging && 'z-20 ring-2 ring-primary opacity-80')}>
    <img src={image} alt="" width={1088} height={608} loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-500 motion-safe:group-hover:scale-105" />
    <span className="absolute inset-0 -z-10 bg-gradient-to-t from-playlist-scrim/95 via-playlist-scrim/65 to-playlist-scrim/30" />
    <div className="flex items-center justify-between p-2 text-playlist-foreground">
      <Button variant="ghost" size="icon" disabled={disabled} {...attributes} {...listeners} aria-label={`Reorder ${playlist.name}`} title={`Reorder ${playlist.name}`} className="h-11 w-11 cursor-grab touch-none text-playlist-foreground hover:bg-playlist-foreground/15 hover:text-playlist-foreground active:cursor-grabbing"><GripVertical className="h-5 w-5" /></Button>
      <div className="flex">
        <Button variant="ghost" size="icon" disabled={disabled || index === 0} aria-label={`Move ${playlist.name} up`} title="Move up" onClick={() => onMove(-1)} className="h-11 w-11 text-playlist-foreground hover:bg-playlist-foreground/15 hover:text-playlist-foreground"><ArrowUp className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" disabled={disabled || index === total - 1} aria-label={`Move ${playlist.name} down`} title="Move down" onClick={() => onMove(1)} className="h-11 w-11 text-playlist-foreground hover:bg-playlist-foreground/15 hover:text-playlist-foreground"><ArrowDown className="h-4 w-4" /></Button>
      </div>
    </div>
    <Link to="/playlists/$id" params={{ id: playlist.id }} className="flex min-h-28 items-end gap-3 p-4 text-playlist-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:min-h-36 md:p-6 lg:min-h-44">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-card/90 text-primary"><Icon className="h-5 w-5" /></span>
      <div className="min-w-0">
        <h3 className="break-words font-display text-xl font-semibold md:text-2xl">{playlist.name}</h3>
        <p className="break-words text-sm opacity-90">{playlist.description}</p>
        <p className="mt-1 text-xs opacity-90">{t(playlist.songIds.length === 1 ? '{n} song' : '{n} songs', { n: playlist.songIds.length })}</p>
        {titles && <p className="mt-1 truncate text-xs opacity-80">{titles}</p>}
      </div>
    </Link>
  </article>;
}