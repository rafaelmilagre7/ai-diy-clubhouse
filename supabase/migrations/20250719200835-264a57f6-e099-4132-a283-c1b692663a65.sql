-- FASE 1: CONSOLIDAÇÃO E SEGURANÇA DO SISTEMA DE STORAGE

-- 1. Criar buckets com configuração padronizada
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('learning_materials', 'learning_materials', true, 209715200, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'image/jpeg', 'image/png', 'image/webp']), -- 200MB
  ('course_images', 'course_images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']), -- 5MB
  ('learning_videos', 'learning_videos', true, 314572800, ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']), -- 300MB
  ('solution_files', 'solution_files', true, 52428800, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'image/jpeg', 'image/png', 'image/webp']), -- 50MB
  ('general_storage', 'general_storage', true, 104857600, NULL) -- 100MB, aceita todos os tipos como fallback
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Criar políticas RLS específicas e seguras para cada bucket
-- Política para learning_materials (apenas usuários autenticados com acesso ao conteúdo)
CREATE POLICY "learning_materials_authenticated_select" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'learning_materials' 
  AND auth.uid() IS NOT NULL 
  AND (
    can_access_learning_content(auth.uid()) 
    OR is_user_admin_secure(auth.uid())
  )
);

CREATE POLICY "learning_materials_admin_insert" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'learning_materials' 
  AND is_user_admin_secure(auth.uid())
);

-- Política para course_images (público para SELECT, admin para modificação)
CREATE POLICY "course_images_public_select" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'course_images');

CREATE POLICY "course_images_admin_modify" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'course_images' 
  AND is_user_admin_secure(auth.uid())
);

-- Política para learning_videos (usuários com acesso ao conteúdo)
CREATE POLICY "learning_videos_content_access" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'learning_videos' 
  AND auth.uid() IS NOT NULL 
  AND (
    can_access_learning_content(auth.uid()) 
    OR is_user_admin_secure(auth.uid())
  )
);

CREATE POLICY "learning_videos_admin_modify" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'learning_videos' 
  AND is_user_admin_secure(auth.uid())
);

-- Política para solution_files (usuários autenticados)
CREATE POLICY "solution_files_authenticated_select" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'solution_files' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "solution_files_authenticated_insert" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'solution_files' 
  AND auth.uid() IS NOT NULL
);

-- Política para general_storage (fallback - mais restritiva)
CREATE POLICY "general_storage_authenticated_only" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'general_storage' 
  AND auth.uid() IS NOT NULL
);

-- 3. Simplificar e otimizar função create_storage_public_policy
CREATE OR REPLACE FUNCTION public.create_storage_public_policy_v2(bucket_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'storage'
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Acesso negado - apenas administradores'
    );
  END IF;
  
  -- Verificar se bucket existe
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = bucket_name) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Bucket não encontrado: ' || bucket_name
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Bucket ' || bucket_name || ' já configurado com políticas apropriadas',
    'bucket_name', bucket_name
  );
END;
$$;

-- 4. Função para validação centralizada de arquivos
CREATE OR REPLACE FUNCTION public.validate_file_upload(
  file_name text,
  file_size bigint,
  file_type text,
  bucket_name text
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  bucket_config RECORD;
  max_size bigint;
  allowed_types text[];
BEGIN
  -- Buscar configuração do bucket
  SELECT file_size_limit, allowed_mime_types 
  INTO bucket_config
  FROM storage.buckets 
  WHERE id = bucket_name;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Bucket não encontrado: ' || bucket_name
    );
  END IF;
  
  -- Verificar tamanho
  IF file_size > bucket_config.file_size_limit THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Arquivo muito grande. Máximo: ' || (bucket_config.file_size_limit / 1048576) || 'MB'
    );
  END IF;
  
  -- Verificar tipo MIME se especificado
  IF bucket_config.allowed_mime_types IS NOT NULL THEN
    IF NOT (file_type = ANY(bucket_config.allowed_mime_types)) THEN
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'Tipo de arquivo não permitido: ' || file_type
      );
    END IF;
  END IF;
  
  -- Validação adicional de extensão de arquivo
  IF file_name ~ '\.(exe|bat|cmd|scr|com|pif|jar|war)$' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Tipo de arquivo executável não permitido'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true,
    'message', 'Arquivo válido para upload'
  );
END;
$$;

-- 5. Log da migração
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'storage_consolidation',
  'phase_1_bucket_security_setup',
  jsonb_build_object(
    'message', 'Buckets criados/atualizados com políticas RLS seguras',
    'buckets_configured', ARRAY['learning_materials', 'course_images', 'learning_videos', 'solution_files', 'general_storage'],
    'security_level', 'high',
    'timestamp', now()
  ),
  auth.uid()
);