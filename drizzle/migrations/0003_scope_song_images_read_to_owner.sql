DROP POLICY IF EXISTS "song images read" ON storage.objects;

CREATE POLICY "song images read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'song-images'
  AND (
    (storage.foldername(name))[1] = 'demo'
    OR (storage.foldername(name))[1] = auth.uid()::text
  )
);