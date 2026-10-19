import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

/** Public reads only: RLS plus explicit publication and owner filters. */
export async function readPublicDemo(id: string, url: string, key: string) {
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
      headers.set('apikey', key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data, error } = await client.from('songs')
    .select('id,title,artist,key,capo,difficulty,bpm,sections,published,updated_at')
    .eq('id', id).is('owner_id', null).eq('published', true).maybeSingle();
  if (error) throw new Error('Could not load public demo');
  return data;
}