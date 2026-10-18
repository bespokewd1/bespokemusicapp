import type { Song } from './songs';

export type DemoCategory = 'pickup' | 'easy' | 'both';
export const DEMO_CATEGORIES = [
  { value: 'pickup', label: 'Pick Up & Play' },
  { value: 'easy', label: 'Easy Songs' },
  { value: 'both', label: 'Both' },
] as const;

export function demoSongs(songs: Song[], category?: DemoCategory) {
  return songs.filter(s => s.ownerId === null && s.published !== false &&
    (!category || s.demoCategory === category || s.demoCategory === 'both'))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}