-- FASE 2: CORREÇÃO DE BUCKETS E FUNÇÕES DE UPLOAD
-- Apenas criar as funções necessárias (buckets já estão padronizados)

-- 1. Função de validação de buckets padronizados
CREATE OR REPLACE FUNCTION public.validate_bucket_name(bucket_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- 2. Função para listar buckets padronizados
CREATE OR REPLACE FUNCTION public.get_standardized_buckets()
RETURNS TABLE(bucket_id text, bucket_name text, created_at timestamptz, updated_at timestamptz, public boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- 3. Função de auditoria para uploads
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
SET search_path TO 'public'
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