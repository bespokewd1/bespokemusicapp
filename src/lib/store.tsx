import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type React from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import type { Section, Song, Difficulty, SongImage } from "./songs";

export type Stroke = { color: string; w: number; pts: [number, number][]; fs?: number };
export interface SongUserData { notes: string; annotations: Stroke[] }
export const IMAGE_BUCKET = "song-images";

export interface Playlist {
  id: string;
  name: string;
  description: string;
  template: string | null;
  songIds: string[];
}

export const PLAYLIST_TEMPLATES = [
  { id: "practice", name: "Practice", description: "Songs you're working on every day", icon: "dumbbell" },
  { id: "acoustic", name: "Acoustic Set", description: "Unplugged favourites for a mellow set", icon: "guitar" },
  { id: "to-learn", name: "Songs to Learn", description: "Your wishlist of songs to master next", icon: "graduation" },
  { id: "performance", name: "Performance Set", description: "A setlist ready for the stage", icon: "mic" },
] as const;

type SongRow = {
  id: string; owner_id: string | null; title: string; artist: string; key: string; capo: number;
  difficulty: string; tempo: number; sections: unknown; published: boolean; featured: boolean;
  featured_order: number | null; sort_order: number; images?: unknown;
};

export function rowToSong(r: SongRow): Song {
  return {
    id: r.id, title: r.title, artist: r.artist, key: r.key, capo: r.capo,
    difficulty: r.difficulty as Difficulty, tempo: r.tempo, sections: (r.sections as Section[]) ?? [],
    pickUp: r.featured, ownerId: r.owner_id, published: r.published, featuredOrder: r.featured_order, sortOrder: r.sort_order, images: (r.images as SongImage[]) ?? [],
  };
}

const RETURN_KEY = "bm:return-to";
const SPEED_KEY = "bm:scroll-speed";

interface Store {
  ready: boolean;
  user: User | null;
  signedIn: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loginOpen: boolean;
  loginReason: string;
  setLoginOpen: (v: boolean) => void;
  requireAuth: (reason: string, fn: () => void) => void;
  songsLoaded: boolean;
  allSongs: Song[];
  getSong: (id: string) => Song | undefined;
  reloadSongs: () => Promise<void>;
  saved: string[];
  toggleSaved: (id: string) => Promise<void>;
  added: Song[];
  upsertSong: (song: Omit<Song, "id"> & { id?: string | undefined }, opts?: { demo?: boolean | undefined; featured?: boolean | undefined }) => Promise<string | null>;
  uploadSongImage: (file: File, demo?: boolean) => Promise<string | null>;
  removeSongImage: (path: string) => Promise<void>;
  imageUrl: (path: string) => Promise<string | null>;
  loadSongData: (songId: string) => Promise<SongUserData>;
  saveSongData: (songId: string, patch: Partial<SongUserData>) => Promise<boolean>;
  deleteSong: (id: string) => Promise<void>;
  recent: string[];
  markPlayed: (id: string) => void;
  playlists: Playlist[];
  createPlaylist: (name: string, description: string, template?: string | null) => Promise<string | null>;
  renamePlaylist: (id: string, name: string, description: string) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addToPlaylist: (pid: string, sid: string) => Promise<void>;
  removeFromPlaylist: (pid: string, sid: string) => Promise<void>;
  movePlaylistSong: (pid: string, sid: string, dir: -1 | 1) => Promise<void>;
  scrollSpeed: number;
  setScrollSpeed: (v: number) => void;
}

const g = globalThis as { __bmStoreCtx?: React.Context<Store | null> };
const Ctx = (g.__bmStoreCtx ??= createContext<Store | null>(null));

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginReason, setLoginReason] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [songsLoaded, setSongsLoaded] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [scrollSpeed, setSpeedState] = useState(1);

  const uid = user?.id ?? null;

  const reloadSongs = useCallback(async () => {
    const { data, error } = await supabase.from("songs").select("*").order("sort_order").order("created_at", { ascending: false });
    if (error) toast.error("Couldn't load songs");
    setSongs((data ?? []).map((r) => rowToSong(r as SongRow)));
    setSongsLoaded(true);
  }, []);

  const loadUserData = useCallback(async (id: string) => {
    const [sv, rp, pl, pr, roles] = await Promise.all([
      supabase.from("saved_songs").select("song_id").order("created_at", { ascending: false }),
      supabase.from("recent_plays").select("song_id").order("played_at", { ascending: false }).limit(20),
      supabase.from("playlists").select("id,name,description,template,playlist_songs(song_id,position)").order("created_at"),
      supabase.from("user_preferences").select("scroll_speed").maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", id),
    ]);
    setSaved((sv.data ?? []).map((r) => r.song_id));
    setRecent((rp.data ?? []).map((r) => r.song_id));
    setPlaylists(
      (pl.data ?? []).map((p) => ({
        id: p.id, name: p.name, description: p.description, template: p.template,
        songIds: [...(p.playlist_songs ?? [])].sort((a, b) => a.position - b.position).map((x) => x.song_id),
      })),
    );
    if (pr.data) setSpeedState(Number(pr.data.scroll_speed));
    setIsAdmin((roles.data ?? []).some((r) => r.role === "admin"));
    supabase.from("profiles").update({ last_active_at: new Date().toISOString() }).eq("id", id).then(() => {});
  }, []);

  useEffect(() => {
    const stored = Number(localStorage.getItem(SPEED_KEY));
    if (stored) setSpeedState(stored);
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED" && event !== "INITIAL_SESSION") return;
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN") {
        setLoginOpen(false);
        const back = sessionStorage.getItem(RETURN_KEY);
        sessionStorage.removeItem(RETURN_KEY);
        if (back && back.startsWith("/") && back !== window.location.pathname) window.location.assign(back);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    reloadSongs();
    if (uid) loadUserData(uid);
    else {
      setSaved([]); setRecent([]); setPlaylists([]); setIsAdmin(false);
    }
  }, [uid, reloadSongs, loadUserData]);

  const requireAuth = useCallback((reason: string, fn: () => void) => {
    if (uid) fn();
    else {
      setLoginReason(reason);
      setLoginOpen(true);
    }
  }, [uid]);

  const signInWithGoogle = async () => {
    sessionStorage.setItem(RETURN_KEY, window.location.pathname);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      sessionStorage.removeItem(RETURN_KEY);
      toast.error("Google sign-in didn't complete. Please try again.");
    }
  };

  const fail = (msg: string) => (e: { message: string } | null) => {
    if (e) {
      toast.error(msg);
      return true;
    }
    return false;
  };

  const value: Store = {
    ready, user, signedIn: !!uid, isAdmin,
    signInWithGoogle,
    signOut: async () => {
      await supabase.auth.signOut();
      window.location.assign("/");
    },
    loginOpen, loginReason, setLoginOpen, requireAuth,
    songsLoaded,
    allSongs: songs,
    getSong: (id) => songs.find((s) => s.id === id),
    reloadSongs,
    saved,
    toggleSaved: async (id) => {
      if (!uid) return;
      const has = saved.includes(id);
      setSaved((p) => (has ? p.filter((x) => x !== id) : [id, ...p]));
      const { error } = has
        ? await supabase.from("saved_songs").delete().eq("user_id", uid).eq("song_id", id)
        : await supabase.from("saved_songs").insert({ user_id: uid, song_id: id });
      if (fail("Couldn't update Saved")(error)) setSaved((p) => (has ? [id, ...p] : p.filter((x) => x !== id)));
    },
    added: songs.filter((s) => uid && s.ownerId === uid),
    upsertSong: async (song, opts) => {
      if (!uid) return null;
      const row = {
        title: song.title, artist: song.artist, key: song.key, capo: song.capo, difficulty: song.difficulty,
        tempo: song.tempo, sections: song.sections as unknown as never, images: (song.images ?? []) as unknown as never,
        updated_at: new Date().toISOString(),
        ...(opts?.featured !== undefined ? { featured: opts.featured } : {}),
      };
      const q = song.id
        ? supabase.from("songs").update(row).eq("id", song.id).select("id").single()
        : supabase.from("songs").insert({ ...row, owner_id: opts?.demo ? null : uid, published: !opts?.demo }).select("id").single();
      const { data, error } = await q;
      if (fail("Couldn't save the song")(error)) return null;
      await reloadSongs();
      return data!.id;
    },
    uploadSongImage: async (file, demo) => {
      if (!uid) return null;
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { toast.error("Use a JPG, PNG or WebP image"); return null; }
      if (file.size > 5 * 1024 * 1024) { toast.error("Images must be under 5 MB"); return null; }
      const ext = file.type.split("/")[1]!.replace("jpeg", "jpg");
      const path = `${demo ? "demo" : uid}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, { contentType: file.type });
      if (fail("Couldn't upload the image")(error)) return null;
      return path;
    },
    removeSongImage: async (path) => {
      await supabase.storage.from(IMAGE_BUCKET).remove([path]);
    },
    imageUrl: async (path) => {
      const { data } = await supabase.storage.from(IMAGE_BUCKET).createSignedUrl(path, 3600);
      return data?.signedUrl ?? null;
    },
    loadSongData: async (songId) => {
      if (!uid) return { notes: "", annotations: [] };
      const { data } = await supabase.from("song_user_data").select("notes,annotations").eq("song_id", songId).maybeSingle();
      return { notes: data?.notes ?? "", annotations: (data?.annotations as Stroke[] | undefined) ?? [] };
    },
    saveSongData: async (songId, patch) => {
      if (!uid) return false;
      const { error } = await supabase.from("song_user_data").upsert(
        { user_id: uid, song_id: songId, ...patch, annotations: patch.annotations as never, updated_at: new Date().toISOString() },
        { onConflict: "user_id,song_id" },
      );
      return !fail("Couldn't save")(error);
    },
    deleteSong: async (id) => {
      const { error } = await supabase.from("songs").delete().eq("id", id);
      if (!fail("Couldn't delete the song")(error)) await reloadSongs();
    },
    recent,
    markPlayed: (id) => {
      if (!uid) return;
      setRecent((p) => [id, ...p.filter((x) => x !== id)].slice(0, 20));
      supabase.from("recent_plays").upsert({ user_id: uid, song_id: id, played_at: new Date().toISOString() }).then(() => {});
    },
    playlists,
    createPlaylist: async (name, description, template = null) => {
      if (!uid) return null;
      if (template) {
        const existing = playlists.find((p) => p.template === template);
        if (existing) return existing.id;
      }
      const { data, error } = await supabase.from("playlists").insert({ user_id: uid, name, description, template }).select("id").single();
      if (fail("Couldn't create the playlist")(error)) return null;
      setPlaylists((p) => [...p, { id: data!.id, name, description, template, songIds: [] }]);
      return data!.id;
    },
    renamePlaylist: async (id, name, description) => {
      const { error } = await supabase.from("playlists").update({ name, description }).eq("id", id);
      if (!fail("Couldn't rename")(error)) setPlaylists((p) => p.map((x) => (x.id === id ? { ...x, name, description } : x)));
    },
    deletePlaylist: async (id) => {
      const { error } = await supabase.from("playlists").delete().eq("id", id);
      if (!fail("Couldn't delete")(error)) setPlaylists((p) => p.filter((x) => x.id !== id));
    },
    addToPlaylist: async (pid, sid) => {
      const pl = playlists.find((p) => p.id === pid);
      if (!pl || pl.songIds.includes(sid)) return;
      const { error } = await supabase.from("playlist_songs").insert({ playlist_id: pid, song_id: sid, position: pl.songIds.length });
      if (!fail("Couldn't add the song")(error)) setPlaylists((p) => p.map((x) => (x.id === pid ? { ...x, songIds: [...x.songIds, sid] } : x)));
    },
    removeFromPlaylist: async (pid, sid) => {
      const { error } = await supabase.from("playlist_songs").delete().eq("playlist_id", pid).eq("song_id", sid);
      if (!fail("Couldn't remove the song")(error)) setPlaylists((p) => p.map((x) => (x.id === pid ? { ...x, songIds: x.songIds.filter((y) => y !== sid) } : x)));
    },
    movePlaylistSong: async (pid, sid, dir) => {
      const pl = playlists.find((p) => p.id === pid);
      if (!pl) return;
      const i = pl.songIds.indexOf(sid);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= pl.songIds.length) return;
      const ids = [...pl.songIds];
      [ids[i], ids[j]] = [ids[j]!, ids[i]!];
      setPlaylists((p) => p.map((x) => (x.id === pid ? { ...x, songIds: ids } : x)));
      await Promise.all(ids.map((s, pos) => supabase.from("playlist_songs").update({ position: pos }).eq("playlist_id", pid).eq("song_id", s)));
    },
    scrollSpeed,
    setScrollSpeed: (v) => {
      setSpeedState(v);
      try { localStorage.setItem(SPEED_KEY, String(v)); } catch { /* storage unavailable */ }
      if (uid) supabase.from("user_preferences").upsert({ user_id: uid, scroll_speed: v, updated_at: new Date().toISOString() }).then(() => {});
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside provider");
  return v;
}

