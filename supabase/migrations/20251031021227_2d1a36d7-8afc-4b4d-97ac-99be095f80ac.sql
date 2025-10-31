-- =========================================
-- CORREÇÃO DE SEGURANÇA: Vulnerabilidade IDOR
-- Bucket: profile-pictures
-- =========================================

-- Remover políticas antigas vulneráveis
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can insert their own profile picture" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;

-- Remover política SELECT existente para recriar
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;

-- 🔒 POLÍTICA 1: INSERT super restritiva
-- Garante que mesmo via cliente direto, só pode criar no próprio folder
CREATE POLICY "Strict profile picture upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- 🔒 POLÍTICA 2: Bloquear UPDATE completamente
-- Força recriação de arquivos via edge function (sem upsert)
CREATE POLICY "Block direct profile picture updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (false);

-- 🔒 POLÍTICA 3: DELETE apenas dos próprios arquivos
CREATE POLICY "Users can delete own profile pictures"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- 🔒 POLÍTICA 4: SELECT público (fotos de perfil são públicas)
CREATE POLICY "Public profile pictures access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profile-pictures');