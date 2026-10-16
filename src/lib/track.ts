import { supabase } from "@/integrations/supabase/client";

export type AppEvent = "first_song" | "return_visit" | "song_opened" | "playlist_created" | "player_used";

/** Fire-and-forget usage event for the signed-in user (admins read the totals). */
export function track(userId: string | null | undefined, event: AppEvent, songId?: string) {
  if (!userId) return;
  supabase.from("app_events").insert({ user_id: userId, event, song_id: songId ?? null }).then(() => {}, () => {});
}

/** Records one return visit per user per day on this device. */
export function trackReturnVisit(userId: string) {
  try {
    const k = `bm-visit-${userId}`;
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(k) === today) return;
    localStorage.setItem(k, today);
  } catch { /* ignore */ }
  track(userId, "return_visit");
}
