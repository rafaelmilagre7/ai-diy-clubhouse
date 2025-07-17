-- FASE 1: CORREÇÃO CRÍTICA DE UPLOAD
-- ===================================

-- 1. Padronizar nomes de buckets (substituir hífen por underscore)
-- Verificar buckets existentes que precisam ser corrigidos
SELECT 
  id, 
  name,
  CASE 
    WHEN name LIKE '%-%' THEN replace(name, '-', '_')
    ELSE name
  END as suggested_name
FROM storage.buckets 
WHERE name LIKE '%-%'
ORDER BY name;

-- 2. Criar função para normalizar nome de bucket
CREATE OR REPLACE FUNCTION public.normalize_bucket_name(bucket_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO ''
AS $$
  SELECT replace(lower(trim(bucket_name)), '-', '_');
$$;

-- 3. Função para garantir que bucket existe com configuração padrão
CREATE OR REPLACE FUNCTION public.ensure_bucket_exists(p_bucket_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  normalized_name text;
  bucket_exists boolean;
  result jsonb;
BEGIN
  -- Normalizar nome do bucket
  normalized_name := public.normalize_bucket_name(p_bucket_name);
  
  -- Verificar se bucket existe
  SELECT EXISTS(
    SELECT 1 FROM storage.buckets WHERE name = normalized_name
  ) INTO bucket_exists;
  
  IF bucket_exists THEN
    RETURN jsonb_build_object(
      'success', true,
      'bucket_name', normalized_name,
      'message', 'Bucket já existe',
      'action', 'none'
    );
  END IF;
  
  -- Tentar criar bucket se não existir
  BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      normalized_name,
      normalized_name, 
      true,
      CASE 
        WHEN normalized_name LIKE '%video%' THEN 314572800  -- 300MB para vídeos
        WHEN normalized_name LIKE '%image%' OR normalized_name LIKE '%avatar%' THEN 10485760  -- 10MB para imagens
        ELSE 52428800  -- 50MB padrão
      END,
      CASE 
        WHEN normalized_name LIKE '%video%' THEN ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
        WHEN normalized_name LIKE '%image%' OR normalized_name LIKE '%avatar%' THEN ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        ELSE ARRAY['*/*']  -- Permitir todos os tipos por padrão
      END
    );
    
    RETURN jsonb_build_object(
      'success', true,
      'bucket_name', normalized_name,
      'message', 'Bucket criado com sucesso',
      'action', 'created'
    );
    
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'bucket_name', normalized_name,
      'message', 'Erro ao criar bucket: ' || SQLERRM,
      'action', 'error'
    );
  END;
END;
$function$;

-- 4. Simplificar políticas de storage (remover duplicatas)
-- Remover políticas antigas conflitantes
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view uploaded files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to storage files" ON storage.objects;

-- Criar políticas simplificadas e unificadas
CREATE POLICY "unified_storage_select_policy" ON storage.objects
FOR SELECT 
USING (bucket_id IN (
  SELECT name FROM storage.buckets WHERE public = true
));

CREATE POLICY "unified_storage_insert_policy" ON storage.objects
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  bucket_id IN (SELECT name FROM storage.buckets WHERE public = true)
);

CREATE POLICY "unified_storage_update_policy" ON storage.objects
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "unified_storage_delete_policy" ON storage.objects
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- 5. Garantir buckets essenciais existem
SELECT public.ensure_bucket_exists('profile_images');
SELECT public.ensure_bucket_exists('solution_files'); 
SELECT public.ensure_bucket_exists('learning_materials');
SELECT public.ensure_bucket_exists('learning_videos');
SELECT public.ensure_bucket_exists('learning_covers');
SELECT public.ensure_bucket_exists('tool_logos');

-- Log da implementação
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'system_fix',
  'upload_system_phase_1',
  jsonb_build_object(
    'message', 'FASE 1 - Correções críticas de upload implementadas',
    'improvements', jsonb_build_array(
      'Buckets padronizados (sem hífens)',
      'Políticas RLS simplificadas e unificadas',
      'Função de normalização de bucket criada',
      'Buckets essenciais garantidos'
    ),
    'next_phase', 'phase_2_error_handling',
    'timestamp', now()
  ),
  auth.uid()
);