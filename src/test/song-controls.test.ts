import { describe, expect, it } from 'vitest';
import { lyricLine, moveItem, parseBpm, searchSongs } from '@/lib/song-controls';
import { SONGS } from '@/lib/songs';

describe('optional BPM', () => {
  it('clears unknown tempo instead of inventing one', () => { expect(parseBpm('')).toBeNull(); });
  it('accepts positive whole BPM and rejects invalid values', () => {
    expect(parseBpm('120')).toBe(120);
    for (const value of ['0', '-10', '401', '12.5', 'oops']) expect(() => parseBpm(value)).toThrow();
  });
});
describe('reversible lyrics projection', () => {
  it('hides inline chords without losing spacing or words', () => { expect(lyricLine('[G]My   own [C]lyrics')).toBe('My   own lyrics'); });
  it('hides traditional and bracketed chord-only rows', () => { expect(lyricLine('G   C   D')).toBeNull(); expect(lyricLine('[G] [C] [D]')).toBeNull(); });
  it('retains tabs and notes without corrupting markers', () => { expect(lyricLine('e|--3--5--|')).toBe('e|--3--5--|'); expect(lyricLine('> Play [G] softly')).toBe('> Play [G] softly'); });
  it('preserves nonchord markers and original data', () => { const line = '[C]Hello [whisper]'; expect(lyricLine(line)).toBe('Hello [whisper]'); expect(line).toBe('[C]Hello [whisper]'); });
});
describe('song search', () => {
  it('matches title and artist case-insensitively', () => { expect(searchSongs(SONGS, 'PORCH juniper').map(s => s.id)).toEqual(['porch-light']); });
  it('only searches the provided accessible library', () => { expect(searchSongs(SONGS.slice(0, 1), 'River')).toEqual([]); });
});
describe('playlist ordering', () => {
  it('moves playlists without mutating contents', () => { const rows = [{ id: 'a', songIds: ['1', '2'] }, { id: 'b', songIds: ['3'] }, { id: 'c', songIds: [] }]; const moved = moveItem(rows, 'c', 'a'); expect(moved.map(p => p.id)).toEqual(['c', 'a', 'b']); expect(moved[1]?.songIds).toEqual(['1', '2']); expect(rows.map(p => p.id)).toEqual(['a', 'b', 'c']); });
});