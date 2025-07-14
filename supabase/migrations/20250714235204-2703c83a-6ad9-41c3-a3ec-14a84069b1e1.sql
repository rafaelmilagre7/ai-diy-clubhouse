-- Verificar e corrigir políticas de storage para imagens da comunidade
-- =====================================================================

-- 1. Criar bucket para imagens da comunidade se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('community-images', 'community-images', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

-- 2. Remover políticas existentes conflitantes
DROP POLICY IF EXISTS "community_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "community_images_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "community_images_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "community_images_auth_delete" ON storage.objects;

-- 3. Criar políticas para leitura pública das imagens
CREATE POLICY "community_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-images');

-- 4. Permitir usuários autenticados fazerem upload
CREATE POLICY "community_images_auth_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'community-images' 
  AND auth.role() = 'authenticated'
);

-- 5. Permitir usuários autenticados atualizarem suas próprias imagens
CREATE POLICY "community_images_auth_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'community-images' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'community-images' 
  AND auth.role() = 'authenticated'
);

-- 6. Permitir usuários autenticados deletarem suas próprias imagens
CREATE POLICY "community_images_auth_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'community-images' 
  AND auth.role() = 'authenticated'
);

-- 7. Verificar se as políticas foram criadas corretamente
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE 'community_images_%';