import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Playlist } from '@/lib/store';

export function SortablePlaylist({ playlist, index, total, disabled, titles, onMove }: { playlist: Playlist; index: number; total: number; disabled: boolean; titles: string; onMove: (direction: -1 | 1) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: playlist.id, disabled });
  return <article ref={setNodeRef} data-playlist-id={playlist.id} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn('relative min-w-0 rounded-2xl border border-border bg-card shadow-soft', isDragging && 'z-20 ring-2 ring-primary opacity-80')}>
    <div className="flex items-center justify-between border-b border-border p-2">
      <Button variant="ghost" size="icon" disabled={disabled} ref={undefined} {...attributes} {...listeners} aria-label={`Reorder ${playlist.name}`} title={`Reorder ${playlist.name}`} className="h-11 w-11 cursor-grab touch-none active:cursor-grabbing"><GripVertical className="h-5 w-5 text-muted-foreground" /></Button>
      <div className="flex">
        <Button variant="ghost" size="icon" disabled={disabled || index === 0} aria-label={`Move ${playlist.name} up`} title="Move up" onClick={() => onMove(-1)} className="h-11 w-11"><ArrowUp className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" disabled={disabled || index === total - 1} aria-label={`Move ${playlist.name} down`} title="Move down" onClick={() => onMove(1)} className="h-11 w-11"><ArrowDown className="h-4 w-4" /></Button>
      </div>
    </div>
    <Link to="/playlists/$id" params={{ id: playlist.id }} className="block min-h-32 p-4">
      <p className="text-xs text-muted-foreground">{playlist.songIds.length} {playlist.songIds.length === 1 ? 'song' : 'songs'}</p>
      <h3 className="break-words font-display text-xl font-semibold">{playlist.name}</h3>
      <p className="break-words text-sm text-muted-foreground">{playlist.description || 'No description'}</p>
      <p className="mt-2 truncate text-xs text-muted-foreground">{titles}</p>
    </Link>
  </article>;
}