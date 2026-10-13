CREATE TABLE public.song_user_data (
  user_id uuid NOT NULL,
  song_id text NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  notes text NOT NULL DEFAULT '',
  annotations jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, song_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.song_user_data TO authenticated;
GRANT ALL ON public.song_user_data TO service_role;
ALTER TABLE public.song_user_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own song data" ON public.song_user_data FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

ALTER TABLE public.songs ADD COLUMN images jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE POLICY "song images read" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'song-images' AND ((storage.foldername(name))[1] = 'demo' OR (storage.foldername(name))[1] = auth.uid()::text));
CREATE POLICY "song images write own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'song-images' AND ((storage.foldername(name))[1] = auth.uid()::text OR ((storage.foldername(name))[1] = 'demo' AND public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "song images delete own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'song-images' AND ((storage.foldername(name))[1] = auth.uid()::text OR ((storage.foldername(name))[1] = 'demo' AND public.has_role(auth.uid(), 'admin'))));