-- CORREÇÃO DE STORAGE: Buckets e Políticas para resolver erros 400
-- =====================================================================

-- 1. Criar buckets essenciais se não existirem
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-images', 'profile-images', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']),
  ('public-assets', 'public-assets', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']),
  ('tool-logos', 'tool-logos', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']),
  ('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'text/plain', 'application/msword'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Remover políticas conflitantes existentes
DROP POLICY IF EXISTS "profile_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_auth_delete" ON storage.objects;
DROP POLICY IF EXISTS "public_assets_public_read" ON storage.objects;
DROP POLICY IF EXISTS "public_assets_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "tool_logos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "tool_logos_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "documents_auth_read" ON storage.objects;
DROP POLICY IF EXISTS "documents_auth_insert" ON storage.objects;

-- 3. Políticas para profile-images (público para leitura)
CREATE POLICY "profile_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "profile_images_auth_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "profile_images_auth_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "profile_images_auth_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
);

-- 4. Políticas para public-assets (totalmente público)
CREATE POLICY "public_assets_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-assets');

CREATE POLICY "public_assets_auth_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public-assets' 
  AND auth.role() = 'authenticated'
);

-- 5. Políticas para tool-logos (público para leitura)
CREATE POLICY "tool_logos_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'tool-logos');

CREATE POLICY "tool_logos_auth_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tool-logos' 
  AND auth.role() = 'authenticated'
);

-- 6. Políticas para documents (privado)
CREATE POLICY "documents_auth_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "documents_auth_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- 7. Verificar buckets criados
SELECT 
  'Storage Buckets Configurados:' as status,
  id as bucket_id,
  name as bucket_name,
  public as is_public,
  file_size_limit,
  array_length(allowed_mime_types, 1) as mime_types_count
FROM storage.buckets 
WHERE id IN ('profile-images', 'public-assets', 'tool-logos', 'documents')
ORDER BY name;