import { describe, expect, it } from 'vitest';
import { demoSongs } from '@/lib/demos';
import type { Song } from '@/lib/songs';
const demo = (id: string, extra: Partial<Song> = {}): Song => ({ id, title: id, artist: 'Original', key: 'G', capo: 0, difficulty: 'Easy', tempo: null, sections: [], ownerId: null, published: true, demoCategory: 'both', ...extra });
describe('Demo visibility and categories', () => {
  it('never includes personal songs in public demos', () => expect(demoSongs([demo('private', { ownerId: 'member' }), demo('public')]).map(s => s.id)).toEqual(['public']));
  it('hides unpublished demos', () => expect(demoSongs([demo('draft', { published: false }), demo('public')]).map(s => s.id)).toEqual(['public']));
  it('includes Both in Pick Up & Play without relying on difficulty', () => expect(demoSongs([demo('easy', { demoCategory: 'easy' }), demo('pickup', { demoCategory: 'pickup', difficulty: 'Intermediate' }), demo('both')], 'pickup').map(s => s.id)).toEqual(['pickup', 'both']));
  it('includes Both in Easy Songs', () => expect(demoSongs([demo('easy', { demoCategory: 'easy' }), demo('pickup', { demoCategory: 'pickup' }), demo('both')], 'easy').map(s => s.id)).toEqual(['easy', 'both']));
  it('uses persisted demo order', () => expect(demoSongs([demo('second', { sortOrder: 2 }), demo('first', { sortOrder: 1 })]).map(s => s.id)).toEqual(['first', 'second']));
});