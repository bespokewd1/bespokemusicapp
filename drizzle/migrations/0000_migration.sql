CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (display_name, last_active_at) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE POLICY "own profile or admin" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "read own roles or admin" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  IF lower(NEW.email) = 'arjiv28@gmail.com' AND NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.songs (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  owner_id uuid,
  title text NOT NULL,
  artist text NOT NULL DEFAULT 'Unknown artist',
  key text NOT NULL DEFAULT 'G',
  capo int NOT NULL DEFAULT 0,
  difficulty text NOT NULL DEFAULT 'Easy',
  tempo int NOT NULL DEFAULT 90,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  published boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  featured_order int,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX songs_owner_idx ON public.songs(owner_id);
GRANT SELECT ON public.songs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.songs TO authenticated;
GRANT ALL ON public.songs TO service_role;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public demo songs" ON public.songs FOR SELECT TO anon, authenticated
  USING (owner_id IS NULL AND published);
CREATE POLICY "own songs" ON public.songs FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "admin sees demo songs" ON public.songs FOR SELECT TO authenticated
  USING (owner_id IS NULL AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "insert own songs" ON public.songs FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() OR (owner_id IS NULL AND public.has_role(auth.uid(), 'admin')));
CREATE POLICY "update own songs" ON public.songs FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR (owner_id IS NULL AND public.has_role(auth.uid(), 'admin')))
  WITH CHECK (owner_id = auth.uid() OR (owner_id IS NULL AND public.has_role(auth.uid(), 'admin')));
CREATE POLICY "delete own songs" ON public.songs FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR (owner_id IS NULL AND public.has_role(auth.uid(), 'admin')));

CREATE TABLE public.saved_songs (
  user_id uuid NOT NULL,
  song_id text NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, song_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_songs TO authenticated;
GRANT ALL ON public.saved_songs TO service_role;
ALTER TABLE public.saved_songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved" ON public.saved_songs FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.recent_plays (
  user_id uuid NOT NULL,
  song_id text NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  played_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, song_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recent_plays TO authenticated;
GRANT ALL ON public.recent_plays TO service_role;
ALTER TABLE public.recent_plays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own plays" ON public.recent_plays FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  template text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX playlists_user_template ON public.playlists(user_id, template) WHERE template IS NOT NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playlists TO authenticated;
GRANT ALL ON public.playlists TO service_role;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own playlists" ON public.playlists FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.playlist_songs (
  playlist_id uuid NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id text NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 0,
  PRIMARY KEY (playlist_id, song_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playlist_songs TO authenticated;
GRANT ALL ON public.playlist_songs TO service_role;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own playlist songs" ON public.playlist_songs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND p.user_id = auth.uid()));

CREATE TABLE public.user_preferences (
  user_id uuid PRIMARY KEY,
  scroll_speed numeric NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_preferences TO service_role;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own prefs" ON public.user_preferences FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.admin_stats()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM profiles),
    'new_today', (SELECT count(*) FROM profiles WHERE created_at >= date_trunc('day', now())),
    'new_7d', (SELECT count(*) FROM profiles WHERE created_at >= now() - interval '7 days'),
    'new_30d', (SELECT count(*) FROM profiles WHERE created_at >= now() - interval '30 days'),
    'active_30d', (SELECT count(*) FROM profiles WHERE last_active_at >= now() - interval '30 days'),
    'songs_added', (SELECT count(*) FROM songs WHERE owner_id IS NOT NULL),
    'playlists', (SELECT count(*) FROM playlists),
    'daily', (SELECT coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'signups',
        (SELECT count(*) FROM profiles WHERE created_at::date = d::date),
        'active', (SELECT count(*) FROM profiles WHERE last_active_at::date = d::date)) ORDER BY d), '[]'::jsonb)
      FROM generate_series(now()::date - 29, now()::date, interval '1 day') d)
  ) INTO r;
  RETURN r;
END $$;
REVOKE EXECUTE ON FUNCTION public.admin_stats() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.admin_stats() TO authenticated;

INSERT INTO public.songs (id,title,artist,key,capo,difficulty,tempo,sections,published,featured,featured_order,sort_order) VALUES
('porch-light', 'Porch Light Waltz', 'The Juniper Lane', 'G', 0, 'Beginner', 84, '[{"name":"Verse 1","lines":["[G]Leave the porch light [C]burning low","[G]I''ll be home be[D]fore the snow","[G]Every mile a [C]little song","[G]Hum it as I [D]drive a[G]long"]},{"name":"Chorus","lines":["[C]Oh the night is [G]wide and kind","[C]Keep a candle [D]in your mind","[G]Porch light, [Em]porch light","[C]Guide me [D]home to[G]night"]},{"name":"Verse 2","lines":["[G]Kettle singing [C]on the stove","[G]Old guitar and [D]stories told","[G]Wooden floors that [C]creak in tune","[G]Underneath a [D]paper [G]moon"]}]'::jsonb, true, true, 0, 0),
('river-stone', 'River Stone', 'Maple & Rye', 'D', 2, 'Easy', 96, '[{"name":"Intro","lines":["[D] [A] [Bm] [G]"]},{"name":"Verse","lines":["[D]Skipping stones a[A]cross the bend","[Bm]Counting ripples [G]to the end","[D]Summer water, [A]cold and clear","[G]Hold the moment [A]right here"]},{"name":"Chorus","lines":["[G]Roll on, [D]river stone","[A]Every current [Bm]calls you home","[G]Smooth and [D]patient, [A]never alone","[G]Roll on, [A]river [D]stone"]}]'::jsonb, true, true, 1, 1),
('lanterns', 'Lanterns in the Rain', 'Ivy Calloway', 'C', 0, 'Easy', 72, '[{"name":"Verse","lines":["[C]Paper lanterns [Am]in the rain","[F]Glowing softly [G]down the lane","[C]Strangers smiling [Am]on the street","[F]Puddles dancing [G]at our feet"]},{"name":"Chorus","lines":["[F]Light it [C]up, light it [G]up","[Am]Even storms can''t [F]fill the cup","[C]Lanterns [G]in the [Am]rain","[F]Carry us [G]home a[C]gain"]}]'::jsonb, true, true, 2, 2),
('northbound', 'Northbound Train', 'Harlow Brothers', 'E', 0, 'Intermediate', 118, '[{"name":"Verse","lines":["[E]Whistle cuts the [A]morning air","[E]Ticket stub and [B7]nothing to spare","[E]Pine trees blurring [A]past the glass","[E]Let the [B7]old days [E]pass"]},{"name":"Chorus","lines":["[A]Northbound, [E]northbound","[B7]Steel wheels singing [E]that sweet sound","[A]Far from the [E]crowded town","[B7]Ride the northbound [E]train"]},{"name":"Bridge","lines":["[C#m]Maybe I''ll [A]find you there","[E]Waiting by the [B7]station stair"]}]'::jsonb, true, false, null, 3),
('honeycomb', 'Honeycomb Morning', 'Sunny Ferris', 'A', 0, 'Beginner', 100, '[{"name":"Verse","lines":["[A]Honey on the [D]windowsill","[A]Coffee''s warm and [E]time stands still","[A]Birds are writing [D]songs outside","[A]Open up the [E]window [A]wide"]},{"name":"Chorus","lines":["[D]Golden, [A]golden day","[D]Let the [E]worries fade away"]}]'::jsonb, true, true, 4, 4),
('tin-roof', 'Tin Roof Lullaby', 'The Juniper Lane', 'Am', 0, 'Easy', 66, '[{"name":"Verse","lines":["[Am]Rain upon the [F]tin roof sings","[C]Softer than an [G]angel''s wings","[Am]Close your eyes and [F]drift away","[C]Dream until the [G]break of day"]},{"name":"Chorus","lines":["[F]Hush now, [C]hush now","[G]Thunder''s far a[Am]way","[F]Rest now, [C]rest now","[G]Sleep till [Am]day"]}]'::jsonb, true, false, null, 5),
('wildflower-road', 'Wildflower Road', 'Maple & Rye', 'G', 3, 'Intermediate', 108, '[{"name":"Verse","lines":["[G]Dust and daisies [Cadd9]on my boots","[Em]Following the [D]old dirt routes","[G]Every fencepost [Cadd9]tells a tale","[Em]Of a [D]summer [G]trail"]},{"name":"Chorus","lines":["[Cadd9]Down the wildflower [G]road","[D]Lighter than the [Em]load","[Cadd9]Wherever the [G]wind may go","[D]Wildflower [G]road"]}]'::jsonb, true, false, null, 6),
('kitchen-table', 'Kitchen Table', 'Ivy Calloway', 'D', 0, 'Beginner', 88, '[{"name":"Verse","lines":["[D]Gathered round the [G]kitchen table","[D]Telling stories [A]while we''re able","[D]Bread and laughter, [G]mismatched chairs","[D]Love is [A]always [D]there"]},{"name":"Chorus","lines":["[G]Pass the [D]plates around","[A]Best seat in [D]town"]}]'::jsonb, true, true, 7, 7),
('silver-line', 'Silver Line', 'Harlow Brothers', 'Em', 0, 'Easy', 92, '[{"name":"Verse","lines":["[Em]Clouds roll [C]over the hill","[G]Waiting [D]patient and still","[Em]There''s a [C]silver line","[G]Shining [D]every time"]},{"name":"Chorus","lines":["[C]Hold on, [G]hold on","[D]Dark don''t [Em]last too long"]}]'::jsonb, true, false, null, 8),
('campfire', 'Campfire Constellations', 'Sunny Ferris', 'C', 0, 'Beginner', 80, '[{"name":"Verse","lines":["[C]Sparks are rising [F]to the stars","[C]Marshmallows and [G]old guitars","[C]Name the shapes up [F]in the sky","[C]You and [G]me and [C]I"]},{"name":"Chorus","lines":["[F]Burn bright, [C]burn bright","[G]Campfire [C]night"]}]'::jsonb, true, true, 9, 9),
('harbor', 'Harbor Bells', 'The Juniper Lane', 'F', 1, 'Intermediate', 76, '[{"name":"Verse","lines":["[F]Harbor bells at [Bb]break of dawn","[F]Fishing boats are [C]moving on","[Dm]Salt and seagulls, [Bb]rope and tide","[F]Ocean [C]open [F]wide"]},{"name":"Chorus","lines":["[Bb]Ring out, [F]harbor bells","[C]Every wave has [Dm]tales to tell"]}]'::jsonb, true, false, null, 10),
('paper-planes', 'Paper Planes', 'Maple & Rye', 'G', 0, 'Easy', 112, '[{"name":"Verse","lines":["[G]Folded wishes, [D]paper planes","[Em]Flying over [C]window panes","[G]Write your name on [D]every wing","[C]Watch the [D]breezes [G]sing"]},{"name":"Chorus","lines":["[C]Fly a[G]way, fly a[D]way","[Em]Land on [C]brighter [D]days"]}]'::jsonb, true, false, null, 11),
('slow-burn', 'Slow Burn Sunday', 'Ivy Calloway', 'A', 2, 'Intermediate', 70, '[{"name":"Verse","lines":["[A]Record spinning, [C#m]afternoon","[D]Sunlight pouring [E]through the room","[A]Nowhere we would [C#m]rather be","[D]Just the [E]two of [A]we"]},{"name":"Chorus","lines":["[D]Slow burn [A]Sunday","[E]Stay a little [F#m]longer","[D]Slow burn [E]Sun[A]day"]}]'::jsonb, true, false, null, 12),
('hometown', 'Hometown Hymn', 'Harlow Brothers', 'D', 0, 'Beginner', 78, '[{"name":"Verse","lines":["[D]Steeple bells and [G]county fair","[D]Every face is [A]smiling there","[D]Main street lit in [G]evening gold","[D]Stories [A]never [D]old"]},{"name":"Chorus","lines":["[G]Sing it [D]low, sing it [A]slow","[G]Hometown [A]hymn, take me [D]home"]}]'::jsonb, true, true, 13, 13);