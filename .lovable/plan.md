# Bespoke Music — interactive prototype

Mobile-first songbook prototype. No backend, no real login; sample data and in-memory state only.

## Visual direction
- Warm, timeless "vintage music room": cream paper background, deep walnut/espresso text, brass/amber accent, muted oxblood secondary. Dark mode tokens included.
- Typography: Fraunces (display serif) for titles, Figtree for UI, JetBrains Mono for chords so they align over lyrics.
- Subtle musical touches: fret-line dividers, soundhole-ring motifs on cards.
- Logo: no logo file was attached, so a typographic "Bespoke Music" wordmark is used until you upload yours.

## Navigation
- Mobile: bottom tab bar (Explore, My Songs, Playlists, Tools). Tablet/desktop: top bar with same tabs.
- "Sign in" button opens a friendly mock login prompt; a "Continue as demo user" toggles a fake signed-in state so collection screens can be shown.

## Screens (each its own page)
1. Explore (`/`) — hero with tagline + "No ads. No distractions.", search (filters live), tabs: Pick Up & Play, Easy Songs, All Songs. Song cards show title, artist, key, difficulty, chord chips.
2. Song viewer (`/song/$id`) — title, artist, capo, key; sections (Intro, Verse, Chorus, Bridge) with chords aligned above original lyrics; font size −/+; transpose; Save button (login prompt for visitors); big Play Mode button → distraction-free full screen with large text and optional auto-scroll.
3. Add/Edit Song (`/songs/new`, `/song/$id/edit`) — title, artist, key, capo, difficulty, chord-pro style text area with live preview.
4. My Songs (`/my-songs`) — Saved, My Added Songs, Recently Played tabs; Add Song button. Visitors see a sign-in prompt state.
5. Playlists (`/playlists`, `/playlists/$id`) — playlist cards, Create Playlist dialog, detail with ordered song list and remove/add.
6. Tools (`/tools`) — chord reference with diagram grid (common open chords, SVG fretboards) and a tuner placeholder (animated needle, string selector E A D G B E).

## Sample data
~14 original songs with fictional artists and original lyrics, plus 3 demo playlists.

## Technical details
- TanStack routes per screen; shared layout in root with nav.
- Prototype state in a React context (auth flag, saved ids, added songs, playlists, recent) — no persistence beyond the session.
- Semantic tokens in styles.css; shadcn Dialog/Tabs/Slider as needed; fonts via link in root head.
- Per-route head metadata.
