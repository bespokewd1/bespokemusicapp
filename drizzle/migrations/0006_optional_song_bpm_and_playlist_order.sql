ALTER TABLE public.songs ADD COLUMN bpm integer;
UPDATE public.songs SET bpm = tempo WHERE tempo > 0;
COMMENT ON COLUMN public.songs.tempo IS 'DEPRECATED: replaced by nullable bpm; retained for older app versions';
ALTER TABLE public.songs ADD CONSTRAINT songs_bpm_positive CHECK (bpm IS NULL OR bpm BETWEEN 1 AND 400);
ALTER TABLE public.playlists ADD COLUMN sort_order integer NOT NULL DEFAULT 0;
WITH ordered AS (SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY created_at, id) - 1 AS position FROM public.playlists) UPDATE public.playlists p SET sort_order = ordered.position FROM ordered WHERE ordered.id = p.id;
CREATE FUNCTION public.reorder_playlists(playlist_ids uuid[]) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
  PERFORM id FROM public.playlists WHERE user_id = auth.uid() FOR UPDATE;
  IF cardinality(playlist_ids) <> (SELECT count(*) FROM public.playlists WHERE user_id = auth.uid()) OR cardinality(playlist_ids) <> (SELECT count(DISTINCT x) FROM unnest(playlist_ids) x) OR EXISTS (SELECT 1 FROM unnest(playlist_ids) x WHERE NOT EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = x AND p.user_id = auth.uid())) THEN RAISE EXCEPTION 'Playlist list changed; reload before reordering'; END IF;
  UPDATE public.playlists p SET sort_order = q.position - 1 FROM unnest(playlist_ids) WITH ORDINALITY q(id, position) WHERE p.id = q.id AND p.user_id = auth.uid();
END;
$$;
REVOKE ALL ON FUNCTION public.reorder_playlists(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reorder_playlists(uuid[]) TO authenticated;