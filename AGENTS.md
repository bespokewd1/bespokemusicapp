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
- Chord voicings live as structured data in src/lib/chords.ts (unit-tested), rendered by ChordDiagram.
- Tuner pitch math/detection lives in pure src/lib/tuner.ts (unit-tested); mic/Web Audio wiring in src/hooks/use-tuner.ts, never routed to speakers.
- Song-viewer display prefs (size, Nashville, per-song transpose) are device-local in src/lib/view-prefs.ts; scroll speed stays in user_preferences — avoids new tables for cosmetic settings.
