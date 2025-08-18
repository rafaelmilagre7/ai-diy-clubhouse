-- Criar uma função para testar e corrigir uploads de profile pictures
CREATE OR REPLACE FUNCTION public.test_profile_upload_access()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  test_result jsonb;
BEGIN
  -- Verificar se o bucket profile-pictures existe e está acessível
  PERFORM storage.buckets.* FROM storage.buckets WHERE id = 'profile-pictures';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Bucket profile-pictures não encontrado'
    );
  END IF;
  
  -- Verificar políticas RLS
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname LIKE '%profile%'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Políticas RLS para profile-pictures não encontradas'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Bucket profile-pictures está acessível e configurado'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Erro ao verificar: ' || SQLERRM
    );
END;
$$;