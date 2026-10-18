<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- App data lives in Lovable Cloud tables guarded by RLS; src/lib/store.tsx is the single client data layer — keeps ownership checks in the database, not the UI.
- Admin rights come only from public.user_roles (owner granted by the signup trigger); admin stats use the security-definer admin_stats() — never trust client-side role checks.
- Demo songs are songs rows with owner_id NULL; personal songs carry owner_id — one table keeps playlists/saves uniform.
- Demo copies use authenticated copySong plus invoker copy_song and source_song_id uniqueness; cloned image paths keep copies independent, and private notes/annotations never publish. Demo categories are separate from difficulty; reorder_demos atomically validates the complete demo list.
- Chord voicings live as structured data in src/lib/chords.ts (unit-tested), rendered by ChordDiagram.
- Tuner pitch math/detection lives in pure src/lib/tuner.ts (unit-tested); mic/Web Audio wiring in src/hooks/use-tuner.ts, never routed to speakers.
- Playback restart lives in useAutoScroll and is shared by settings and Focus controls; resetting its position and timing preserves the current speed without duplicating playback state.
- Song-viewer display prefs (size, Nashville, per-song transpose, per-song speed/intro delay) are device-local in src/lib/view-prefs.ts; scroll speed stays in user_preferences — avoids new tables for cosmetic settings.
- Expanded playback settings use ScrollPaceSettings with the tested display-only scroll-pace guide; presets use existing one-decimal multipliers so saved preferences and scroll physics remain unchanged.
- UI text is translated via useT() from src/lib/i18n.tsx with French strings keyed by the English source in src/lib/i18n-fr.ts (missing keys fall back to English); language is device-local — avoids a translation library and keeps English as the single source.
- Extra chord shapes (CAGED barre shapes, top-string triads) are generated from templates in src/lib/chords.ts and unit-tested against chord tones — avoids hand-typing hundreds of voicings.
- Offline mode uses vite-plugin-pwa (generateSW, /sw.js) registered only from src/lib/pwa.ts, never in dev/preview/iframes; pages and data reads are NetworkFirst — keeps the live app fresh while letting opened songs load offline.
- Theme is a `.dark` class set before paint by THEME_INIT_SCRIPT in src/lib/theme.tsx (saved choice, else device preference) — avoids a flash and a theme library.
- Feedback goes into public.feedback (anyone may insert, only admins read via has_role) and is read in the admin Feedback tab — no email service needed.
- Clipboard image extraction lives in the tested src/lib/clipboard.ts helper; SongForm uses one text editor and the existing ordered image attachments, keeping images outside the chord parser and retaining saved-song compatibility.
- Song tempo uses nullable songs.bpm, mapped to Song.tempo; legacy tempo stays for older clients, so clearing BPM never invents a tempo.
- Shared search is mounted once in AppShell and consumes the existing RLS-scoped store; bounded deferred results keep growing libraries responsive.
- Playlist order uses playlists.sort_order and the invoker reorder_playlists RPC; validating the complete owned ID list makes reordering atomic without touching song positions.
- Signed-in sortable playlist cards reuse the visitor template artwork, with theme-stable photo contrast tokens; presentation changes preserve the existing ordering and data layer.
- Lyrics Only projects existing lines through song-controls into SongSheet; original sections, tabs, notes and attachments remain untouched.
- Song toolbars share a single ordered action list and size/key handlers; measured desktop width moves secondary controls into More without duplicate buttons or playback state.
- Auto-scroll uses one RAF loop and distinguishes its own writes from external position changes; continued native momentum extends the handoff before resuming at the settled position.
- Public sharing and per-page SEO addresses use src/lib/site.ts; auth redirects remain current-origin and sitemap lists public static pages only — keeps domain changes centralized without exposing personal collection IDs.
- About and footer reuse FeedbackDialog and the store's existing sign-in dialog; the tested About invitation predicate waits for account readiness so members never see a signup prompt.
