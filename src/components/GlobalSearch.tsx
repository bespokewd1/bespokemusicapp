import { createContext, useContext, useDeferredValue, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Command, CommandInput, CommandList, CommandItem } from '@/components/ui/command';
import { useStore } from '@/lib/store';
import { searchSongs } from '@/lib/song-controls';

const SearchContext = createContext<(() => void) | null>(null);

export function SearchAction({ compact = false }: { compact?: boolean }) {
  const open = useContext(SearchContext);
  return <Button variant="outline" onClick={() => open?.()} aria-label="Search songs" title="Search songs" className="h-11 shrink-0 rounded-full px-3 sm:px-4">
    <Search className="h-4 w-4" /><span className={compact ? 'hidden lg:inline' : 'hidden sm:inline'}>Search</span>
  </Button>;
}

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const { allSongs, signedIn, songsLoaded } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);
  // allSongs is the existing RLS-protected read; never fetch an unrestricted library.
  const results = useMemo(() => searchSongs(allSongs, deferred).slice(0, 100), [allSongs, deferred]);
  return <SearchContext.Provider value={() => { setQuery(''); setOpen(true); }}>
    {children}
    <Dialog open={signedIn && open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pr-12"><DialogTitle>Search songs</DialogTitle><DialogDescription>Your songs and available demos</DialogDescription></DialogHeader>
        <Command shouldFilter={false}>
          <CommandInput value={query} onValueChange={setQuery} placeholder="Search by title or artist…" aria-label="Search by title or artist" />
          <CommandList className="max-h-[55vh] p-2">
            {!songsLoaded ? <p role="status" className="p-6 text-center text-sm text-muted-foreground">Loading songs…</p> : !results.length ? <p role="status" className="p-6 text-center text-sm text-muted-foreground">{query.trim() ? 'No songs match your search.' : 'No songs yet.'}</p> : results.map(song => <CommandItem key={song.id} value={song.id} onSelect={() => { setOpen(false); navigate({ to: '/song/$id', params: { id: song.id } }); }} className="min-h-14">
              <span className="min-w-0"><span className="block truncate font-semibold">{song.title}</span><span className="block truncate text-sm text-muted-foreground">{song.artist}</span></span>
            </CommandItem>)}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  </SearchContext.Provider>;
}