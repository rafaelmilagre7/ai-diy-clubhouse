-- Política para permitir inserção no bucket solution-resources
DROP POLICY IF EXISTS "Allow authenticated users to upload solution resources" ON storage.objects;

CREATE POLICY "Allow authenticated users to upload solution resources"
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'solution-resources' 
  AND auth.uid() IS NOT NULL
);

-- Política para visualização pública de recursos de soluções
DROP POLICY IF EXISTS "Allow public read access to solution resources" ON storage.objects;

CREATE POLICY "Allow public read access to solution resources"
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'solution-resources');

-- Política para admins gerenciarem recursos
DROP POLICY IF EXISTS "Allow admins to manage solution resources" ON storage.objects;

CREATE POLICY "Allow admins to manage solution resources"
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'solution-resources' 
  AND EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);