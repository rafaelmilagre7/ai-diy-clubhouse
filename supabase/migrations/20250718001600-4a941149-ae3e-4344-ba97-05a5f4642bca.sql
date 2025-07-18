-- FASE 2: PADRONIZAÇÃO E OTIMIZAÇÃO DE UPLOADS
-- Etapa 1: Padronizar buckets (remover hífens)
-- Etapa 2: Migração automática de arquivos

-- 1. Renomear buckets com hífens para underscore
UPDATE storage.buckets 
SET id = 'profile_images', name = 'profile_images' 
WHERE id = 'profile-images';

UPDATE storage.buckets 
SET id = 'solution_files', name = 'solution_files' 
WHERE id = 'solution-files';

UPDATE storage.buckets 
SET id = 'learning_materials', name = 'learning_materials' 
WHERE id = 'learning-materials';

UPDATE storage.buckets 
SET id = 'learning_videos', name = 'learning_videos' 
WHERE id = 'learning-videos';

UPDATE storage.buckets 
SET id = 'learning_covers', name = 'learning_covers' 
WHERE id = 'learning-covers';

UPDATE storage.buckets 
SET id = 'tool_logos', name = 'tool_logos' 
WHERE id = 'tool-logos';

UPDATE storage.buckets 
SET id = 'general_storage', name = 'general_storage' 
WHERE id = 'general-storage';

-- 2. Migrar dados de storage.objects (se existir algum objeto nos buckets antigos)
UPDATE storage.objects 
SET bucket_id = 'profile_images' 
WHERE bucket_id = 'profile-images';

UPDATE storage.objects 
SET bucket_id = 'solution_files' 
WHERE bucket_id = 'solution-files';

UPDATE storage.objects 
SET bucket_id = 'learning_materials' 
WHERE bucket_id = 'learning-materials';

UPDATE storage.objects 
SET bucket_id = 'learning_videos' 
WHERE bucket_id = 'learning-videos';

UPDATE storage.objects 
SET bucket_id = 'learning_covers' 
WHERE bucket_id = 'learning-covers';

UPDATE storage.objects 
SET bucket_id = 'tool_logos' 
WHERE bucket_id = 'tool-logos';

UPDATE storage.objects 
SET bucket_id = 'general_storage' 
WHERE bucket_id = 'general-storage';

-- 3. Criar função de validação de buckets padronizados
CREATE OR REPLACE FUNCTION public.validate_bucket_name(bucket_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  allowed_buckets text[] := ARRAY[
    'profile_images',
    'solution_files', 
    'learning_materials',
    'learning_videos',
    'learning_covers',
    'tool_logos',
    'general_storage'
  ];
BEGIN
  -- Normalizar nome do bucket (remover hífens e espaços)
  bucket_name := replace(replace(lower(bucket_name), '-', '_'), ' ', '_');
  
  -- Verificar se está na lista de permitidos
  RETURN bucket_name = ANY(allowed_buckets);
END;
$$;

-- 4. Criar função para listar buckets padronizados
CREATE OR REPLACE FUNCTION public.get_standardized_buckets()
RETURNS TABLE(bucket_id text, bucket_name text, created_at timestamptz, updated_at timestamptz, public boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id::text,
    b.name::text,
    b.created_at,
    b.updated_at,
    b.public
  FROM storage.buckets b
  WHERE b.id IN (
    'profile_images',
    'solution_files',
    'learning_materials', 
    'learning_videos',
    'learning_covers',
    'tool_logos',
    'general_storage'
  )
  ORDER BY b.name;
END;
$$;

-- 5. Criar função de auditoria para uploads
CREATE OR REPLACE FUNCTION public.log_upload_activity(
  p_bucket_name text,
  p_file_path text,
  p_file_size bigint,
  p_file_type text,
  p_success boolean,
  p_error_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    'file_upload',
    CASE WHEN p_success THEN 'upload_success' ELSE 'upload_failure' END,
    p_file_path,
    jsonb_build_object(
      'bucket', p_bucket_name,
      'file_path', p_file_path,
      'file_size', p_file_size,
      'file_type', p_file_type,
      'success', p_success,
      'error_message', p_error_message,
      'timestamp', NOW()
    )
  );
END;
$$;