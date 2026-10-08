import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { SONGS, type Song } from "./songs";

export interface Playlist {
  id: string;
  name: string;
  description: string;
  songIds: string[];
}

interface Store {
  signedIn: boolean;
  signIn: () => void;
  signOut: () => void;
  loginOpen: boolean;
  loginReason: string;
  setLoginOpen: (v: boolean) => void;
  /** Runs fn if signed in, otherwise shows the login prompt. */
  requireAuth: (reason: string, fn: () => void) => void;
  allSongs: Song[];
  getSong: (id: string) => Song | undefined;
  saved: string[];
  toggleSaved: (id: string) => void;
  added: Song[];
  upsertSong: (song: Song) => void;
  recent: string[];
  markPlayed: (id: string) => void;
  playlists: Playlist[];
  createPlaylist: (name: string, description: string) => string;
  addToPlaylist: (pid: string, sid: string) => void;
  removeFromPlaylist: (pid: string, sid: string) => void;
}

const Ctx = createContext<Store | null>(null);

const DEMO_PLAYLISTS: Playlist[] = [
  { id: "campfire", name: "Campfire Night", description: "Easy singalongs for around the fire", songIds: ["campfire", "porch-light", "kitchen-table", "hometown"] },
  { id: "sunday", name: "Slow Sunday", description: "Mellow fingerpicking moods", songIds: ["tin-roof", "slow-burn", "lanterns"] },
  { id: "practice", name: "Practice Set", description: "Working on barre chords", songIds: ["northbound", "harbor", "wildflower-road"] },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginReason, setLoginReason] = useState("");
  const [saved, setSaved] = useState<string[]>(["river-stone", "lanterns", "honeycomb"]);
  const [added, setAdded] = useState<Song[]>([]);
  const [recent, setRecent] = useState<string[]>(["porch-light", "silver-line"]);
  const [playlists, setPlaylists] = useState<Playlist[]>(DEMO_PLAYLISTS);

  const allSongs = useMemo(() => [...added, ...SONGS.filter((s) => !added.some((a) => a.id === s.id))], [added]);

  const requireAuth = useCallback(
    (reason: string, fn: () => void) => {
      if (signedIn) fn();
      else {
        setLoginReason(reason);
        setLoginOpen(true);
      }
    },
    [signedIn],
  );

  const value: Store = {
    signedIn,
    signIn: () => {
      setSignedIn(true);
      setLoginOpen(false);
    },
    signOut: () => setSignedIn(false),
    loginOpen,
    loginReason,
    setLoginOpen,
    requireAuth,
    allSongs,
    getSong: (id) => allSongs.find((s) => s.id === id),
    saved,
    toggleSaved: (id) => setSaved((p) => (p.includes(id) ? p.filter((x) => x !== id) : [id, ...p])),
    added,
    upsertSong: (song) => setAdded((p) => [song, ...p.filter((x) => x.id !== song.id)]),
    recent,
    markPlayed: (id) => setRecent((p) => [id, ...p.filter((x) => x !== id)].slice(0, 12)),
    playlists,
    createPlaylist: (name, description) => {
      const id = `pl-${Date.now()}`;
      setPlaylists((p) => [{ id, name, description, songIds: [] }, ...p]);
      return id;
    },
    addToPlaylist: (pid, sid) =>
      setPlaylists((p) => p.map((pl) => (pl.id === pid && !pl.songIds.includes(sid) ? { ...pl, songIds: [...pl.songIds, sid] } : pl))),
    removeFromPlaylist: (pid, sid) =>
      setPlaylists((p) => p.map((pl) => (pl.id === pid ? { ...pl, songIds: pl.songIds.filter((x) => x !== sid) } : pl))),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside provider");
  return v;
}
