-- Drop e recria a função setup_learning_storage_buckets
DROP FUNCTION IF EXISTS public.setup_learning_storage_buckets();

CREATE OR REPLACE FUNCTION public.setup_learning_storage_buckets()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  bucket_config record;
  created_buckets text[] := ARRAY[]::text[];
  failed_buckets text[] := ARRAY[]::text[];
  error_messages text[] := ARRAY[]::text[];
  result jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Acesso negado - apenas administradores'
    );
  END IF;

  -- Configurações dos buckets necessários
  FOR bucket_config IN
    SELECT unnest(ARRAY[
      'learning_materials',
      'course_images', 
      'learning_videos',
      'solution_files',
      'learning_covers'
    ]) as bucket_name,
    unnest(ARRAY[
      209715200,  -- 200MB para learning_materials
      52428800,   -- 50MB para course_images
      314572800,  -- 300MB para learning_videos
      314572800,  -- 300MB para solution_files
      52428800    -- 50MB para learning_covers
    ]) as file_size_limit
  LOOP
    BEGIN
      -- Verificar se bucket já existe
      IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = bucket_config.bucket_name) THEN
        -- Criar bucket
        INSERT INTO storage.buckets (id, name, public, file_size_limit)
        VALUES (
          bucket_config.bucket_name,
          bucket_config.bucket_name,
          true,
          bucket_config.file_size_limit
        );
        
        created_buckets := array_append(created_buckets, bucket_config.bucket_name);
      ELSE
        -- Atualizar configurações se necessário
        UPDATE storage.buckets 
        SET 
          public = true,
          file_size_limit = bucket_config.file_size_limit
        WHERE id = bucket_config.bucket_name;
        
        created_buckets := array_append(created_buckets, bucket_config.bucket_name || ' (atualizado)');
      END IF;
      
    EXCEPTION
      WHEN OTHERS THEN
        failed_buckets := array_append(failed_buckets, bucket_config.bucket_name);
        error_messages := array_append(error_messages, 
          'Erro no bucket ' || bucket_config.bucket_name || ': ' || SQLERRM);
    END;
  END LOOP;

  -- Construir resultado
  result := jsonb_build_object(
    'success', array_length(failed_buckets, 1) IS NULL OR array_length(failed_buckets, 1) = 0,
    'buckets_configured', created_buckets,
    'created_at', now()
  );
  
  IF array_length(failed_buckets, 1) > 0 THEN
    result := result || jsonb_build_object(
      'failed_buckets', failed_buckets,
      'errors', error_messages,
      'message', 'Alguns buckets não puderam ser configurados: ' || array_to_string(error_messages, ', ')
    );
  ELSE
    result := result || jsonb_build_object(
      'message', 'Todos os buckets foram configurados com sucesso'
    );
  END IF;

  RETURN result;
END;
$$;