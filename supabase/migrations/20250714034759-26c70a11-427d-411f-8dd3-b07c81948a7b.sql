-- Corrigir problemas de storage e estrutura (parte 1)

-- 1. Criar bucket learning-videos se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('learning-videos', 'learning-videos', true, 314572800, ARRAY['video/mp4', 'video/webm', 'video/quicktime'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 314572800,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime'];

-- 2. Políticas de storage para learning-videos
DROP POLICY IF EXISTS "Learning videos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload learning videos" ON storage.objects;

CREATE POLICY "Learning videos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'learning-videos');

CREATE POLICY "Authenticated users can upload learning videos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'learning-videos' AND auth.role() = 'authenticated');

-- 3. Melhorar configuração de buckets certificates
UPDATE storage.buckets 
SET public = true, 
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['application/pdf', 'image/png', 'image/jpeg']
WHERE id = 'certificates';

-- 4. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_invites_token_clean ON public.invites 
USING btree (UPPER(REGEXP_REPLACE(token, '\s+', '', 'g')));

CREATE INDEX IF NOT EXISTS idx_invites_expires_used ON public.invites 
USING btree (expires_at, used_at) WHERE used_at IS NULL;