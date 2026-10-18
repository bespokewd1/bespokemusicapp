CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id=_user_id AND r.role=_role)
 AND (_role <> 'admin' OR EXISTS (SELECT 1 FROM auth.users u WHERE u.id=_user_id AND lower(u.email)='arjiv28@gmail.com' AND u.email_confirmed_at IS NOT NULL));
$$;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS demo_category text NOT NULL DEFAULT 'both';
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS source_song_id text;
UPDATE public.songs SET demo_category=CASE WHEN featured AND difficulty IN ('Easy','Beginner') THEN 'both' WHEN featured THEN 'pickup' ELSE 'easy' END WHERE owner_id IS NULL;
ALTER TABLE public.songs ADD CONSTRAINT songs_demo_category_valid CHECK (demo_category IN ('pickup','easy','both'));
CREATE UNIQUE INDEX songs_independent_copy_unique ON public.songs (coalesce(owner_id::text,'demo'),source_song_id) WHERE source_song_id IS NOT NULL;
CREATE OR REPLACE FUNCTION public.copy_song(source_id text, to_demo boolean DEFAULT false, category text DEFAULT 'both', copied_images jsonb DEFAULT '[]'::jsonb)
RETURNS text LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE src public.songs; result text; target_owner uuid; target_prefix text;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 IF category NOT IN ('pickup','easy','both') THEN RAISE EXCEPTION 'Invalid demo category'; END IF;
 IF to_demo AND NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
 SELECT * INTO src FROM public.songs WHERE id=source_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Song not available'; END IF;
 IF to_demo THEN
  IF src.owner_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'Only your own personal songs can be featured'; END IF;
  target_owner:=NULL; target_prefix:='demo/';
 ELSE
  IF src.owner_id IS NOT NULL OR NOT src.published THEN RAISE EXCEPTION 'Published demo required'; END IF;
  target_owner:=auth.uid(); target_prefix:=auth.uid()::text || '/';
 END IF;
 IF jsonb_typeof(copied_images)<>'array' OR jsonb_array_length(copied_images)>10 OR EXISTS (SELECT 1 FROM jsonb_array_elements(copied_images) i WHERE i->>'path' IS NULL OR left(i->>'path',length(target_prefix))<>target_prefix OR i->>'path' LIKE '%..%') THEN RAISE EXCEPTION 'Invalid image ownership'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(coalesce(target_owner::text,'demo') || ':' || source_id,0));
 SELECT id INTO result FROM public.songs WHERE source_song_id=source_id AND owner_id IS NOT DISTINCT FROM target_owner;
 IF result IS NOT NULL THEN RETURN result; END IF;
 INSERT INTO public.songs(owner_id,title,artist,key,capo,difficulty,bpm,sections,images,published,featured,demo_category,source_song_id)
 VALUES(target_owner,src.title,src.artist,src.key,src.capo,src.difficulty,src.bpm,
 CASE WHEN to_demo THEN (SELECT coalesce(jsonb_agg(jsonb_build_object('name',sec->>'name','lines',(SELECT coalesce(jsonb_agg(line),'[]'::jsonb) FROM jsonb_array_elements(sec->'lines') line WHERE (line #>> '{}') !~ '^\s*>'))),'[]'::jsonb) FROM jsonb_array_elements(src.sections) sec) ELSE src.sections END,
 copied_images,true,to_demo AND category IN ('pickup','both'),category,source_id) RETURNING id INTO result;
 IF NOT to_demo THEN INSERT INTO public.saved_songs(user_id,song_id) VALUES(auth.uid(),result) ON CONFLICT DO NOTHING; END IF;
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.copy_song(text,boolean,text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.copy_song(text,boolean,text,jsonb) TO authenticated;
CREATE OR REPLACE FUNCTION public.reorder_demos(song_ids text[]) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
 PERFORM id FROM public.songs WHERE owner_id IS NULL FOR UPDATE;
 IF cardinality(song_ids)<>(SELECT count(*) FROM public.songs WHERE owner_id IS NULL) OR cardinality(song_ids)<>(SELECT count(DISTINCT x) FROM unnest(song_ids) x) OR EXISTS(SELECT 1 FROM unnest(song_ids) x WHERE NOT EXISTS(SELECT 1 FROM public.songs s WHERE s.id=x AND s.owner_id IS NULL)) THEN RAISE EXCEPTION 'Demo list changed; reload before reordering'; END IF;
 UPDATE public.songs s SET sort_order=q.position-1,featured_order=q.position-1 FROM unnest(song_ids) WITH ORDINALITY q(id,position) WHERE s.id=q.id AND s.owner_id IS NULL;
END; $$;
REVOKE ALL ON FUNCTION public.reorder_demos(text[]) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.reorder_demos(text[]) TO authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.songs,public.saved_songs TO authenticated;
GRANT SELECT ON public.songs TO anon;
GRANT ALL ON public.songs,public.saved_songs TO service_role;