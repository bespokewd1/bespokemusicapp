import { isChordLine, isChordToken } from './import';
import { isNoteLine, isTabLine, type Song } from './songs';

/** Empty means unknown; never infer tempo from scroll speed. */
export function parseBpm(value: string): number | null {
  if (!value.trim()) return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 400) throw new Error('Enter a BPM from 1 to 400, or leave it empty.');
  return n;
}

export function lyricLine(line: string): string | null {
  if (isTabLine(line) || isNoteLine(line)) return line;
  if (isChordLine(line)) return null;
  const text = line.replace(/\[([^\]]+)\]/g, (marker, chord: string) => isChordToken(chord) ? '' : marker);
  return text.trim() ? text : null;
}

export function searchSongs(songs: Song[], query: string): Song[] {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return songs.filter(s => terms.every(term => `${s.title} ${s.artist}`.toLocaleLowerCase().includes(term)));
}

export function moveItem<T extends { id: string }>(items: T[], from: string, to: string): T[] {
  const a = items.findIndex(p => p.id === from);
  const b = items.findIndex(p => p.id === to);
  if (a < 0 || b < 0 || a === b) return items;
  const next = [...items];
  const [item] = next.splice(a, 1);
  if (!item) return items;
  next.splice(b, 0, item);
  return next;
}