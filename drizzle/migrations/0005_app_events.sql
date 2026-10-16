CREATE TABLE public.app_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event text NOT NULL CHECK (event IN ('first_song','return_visit','song_opened','playlist_created','player_used')),
  song_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.app_events TO authenticated;
GRANT ALL ON public.app_events TO service_role;
ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insert own events" ON public.app_events FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins read events" ON public.app_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX app_events_created_idx ON public.app_events (created_at DESC);