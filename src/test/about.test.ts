import { describe, expect, it } from 'vitest';
import { showSongbookInvitation } from '@/lib/about';

describe('About songbook invitation', () => {
  it('offers signup only to signed-out visitors after account loading', () => {
    expect(showSongbookInvitation(true, false)).toBe(true);
    expect(showSongbookInvitation(true, true)).toBe(false);
    expect(showSongbookInvitation(false, false)).toBe(false);
  });
});