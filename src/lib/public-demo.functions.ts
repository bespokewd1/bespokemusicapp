import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { readPublicDemo } from './public-demo.server';

export const getPublicDemo = createServerFn({ method: 'GET' })
  .inputValidator((input: unknown) => z.object({ id: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'] ?? process.env['SUPABASE_ANON_KEY'];
    if (!url || !key) throw new Error('Public song service unavailable');
    return readPublicDemo(data.id, url, key);
  });