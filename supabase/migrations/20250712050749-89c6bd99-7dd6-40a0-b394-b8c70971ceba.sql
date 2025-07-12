-- CORREÇÃO: POLÍTICA DE STORAGE PARA CERTIFICADOS
-- ===================================================

-- Verificar se as políticas de storage estão corretas para o bucket certificates
-- Remover políticas conflitantes se existirem

-- 1. Políticas para o bucket 'certificates'
-- Permitir leitura pública
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('certificates', 'certificates', true, 52428800, ARRAY['application/pdf', 'image/png', 'image/jpeg', 'text/html'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'image/png', 'image/jpeg', 'text/html'];

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Certificados são publicamente acessíveis" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload" ON storage.objects;
DROP POLICY IF EXISTS "certificates_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "certificates_insert_policy" ON storage.objects;

-- Criar políticas simples e eficazes
CREATE POLICY "certificates_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'certificates');

CREATE POLICY "certificates_auth_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'certificates' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "certificates_auth_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'certificates' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'certificates' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "certificates_auth_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'certificates' 
  AND auth.role() = 'authenticated'
);

-- Verificar se as políticas foram criadas
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE 'certificates_%';