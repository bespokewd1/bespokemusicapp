import { createFileRoute } from '@tanstack/react-router';
import { readPublicDemo } from '@/lib/public-demo.server';
import { renderDemoOg } from '@/lib/demo-og.server';
import logo from '@/assets/demo-share-pick.png.asset.json';
import font from '@/assets/demo-share-font.ttf.asset.json';
import { siteUrl } from '@/lib/site';

export const Route = createFileRoute('/api/public/demo-og/$id')({
  server: { handlers: { GET: async ({ params, request }) => {
    if (!params.id || params.id.length > 200) return new Response('Not found', { status: 404 });
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'] ?? process.env['SUPABASE_ANON_KEY'];
    if (!url || !key) return new Response('Share preview unavailable', { status: 503 });
    const demo = await readPublicDemo(params.id, url, key);
    if (!demo) return new Response('Demo not available', { status: 404, headers: { 'Cache-Control': 'no-store' } });
    const etag = `"${encodeURIComponent(demo.id)}-${encodeURIComponent(demo.updated_at)}-1"`;
    if (request.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers: { ETag: etag } });
    const [fontResponse, logoResponse] = await Promise.all([fetch(siteUrl(font.url)), fetch(siteUrl(logo.url))]);
    if (!fontResponse.ok || !logoResponse.ok) return new Response('Share artwork unavailable', { status: 503 });
    const bytes = await renderDemoOg(demo.title, demo.artist, new Uint8Array(await fontResponse.arrayBuffer()), new Uint8Array(await logoResponse.arrayBuffer()));
    return new Response(new Blob([Uint8Array.from(bytes)], { type: 'image/png' }), { headers: {
      'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=0, must-revalidate', ETag: etag,
      'X-Content-Type-Options': 'nosniff',
    } });
  } } },
});