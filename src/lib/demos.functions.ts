import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { SongImage } from './songs';
import type { DemoCategory } from './demos';

export const copySong = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { sourceId: string; toDemo?: boolean; category?: DemoCategory }) => {
    if (!input.sourceId || (input.category && !['pickup', 'easy', 'both'].includes(input.category))) throw new Error('Invalid song or category');
    return { sourceId: input.sourceId, toDemo: input.toDemo === true, category: input.category ?? 'both' };
  })
  .handler(async ({ data, context }) => {
    if (data.toDemo) {
      const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
      if (role.error || !role.data) throw new Error('Forbidden');
    }
    const source = await context.supabase.from('songs').select('owner_id,published,images').eq('id', data.sourceId).single();
    if (source.error || !source.data || (data.toDemo ? source.data.owner_id !== context.userId : source.data.owner_id !== null || !source.data.published)) throw new Error('Song not available');
    const existing = await context.supabase.from('songs').select('id').eq('source_song_id', data.sourceId)
      .filter('owner_id', data.toDemo ? 'is' : 'eq', data.toDemo ? null : context.userId).maybeSingle();
    if (existing.error) throw new Error('Could not check existing copy');
    if (existing.data) return existing.data.id;
    const paths: string[] = [];
    const images: SongImage[] = [];
    try {
      const original = (source.data.images ?? []) as unknown as SongImage[];
      for (const image of original) {
        const prefix = data.toDemo ? `${context.userId}/` : 'demo/';
        if (!image.path.startsWith(prefix) || image.path.includes('..')) throw new Error('Invalid source image');
        const file = await context.supabase.storage.from('song-images').download(image.path);
        if (file.error || !file.data) throw new Error('Could not copy image');
        const ext = image.path.split('.').pop() ?? 'png';
        const path = `${data.toDemo ? 'demo' : context.userId}/${crypto.randomUUID()}.${ext}`;
        const upload = await context.supabase.storage.from('song-images').upload(path, file.data, { contentType: file.data.type });
        if (upload.error) throw new Error('Could not copy image');
        paths.push(path);
        images.push({ path, ...(image.caption ? { caption: image.caption } : {}) });
      }
      const result = await context.supabase.rpc('copy_song', { source_id: data.sourceId, to_demo: data.toDemo, category: data.category, copied_images: images as never });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    } catch (error) {
      if (paths.length) await context.supabase.storage.from('song-images').remove(paths);
      throw error;
    }
  });