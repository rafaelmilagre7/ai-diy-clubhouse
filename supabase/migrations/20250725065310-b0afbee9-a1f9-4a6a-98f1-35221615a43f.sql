-- CONTINUAÇÃO DA CORREÇÃO DE SEGURANÇA: Mais funções
-- Corrigindo as próximas 10 funções

-- Função 6: update_solution_tools_reference_updated_at
CREATE OR REPLACE FUNCTION public.update_solution_tools_reference_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Função 7: update_invite_deliveries_updated_at
CREATE OR REPLACE FUNCTION public.update_invite_deliveries_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Função 8: delete_community_post
CREATE OR REPLACE FUNCTION public.delete_community_post(post_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar permissões (admin ou autor)
  IF NOT (public.is_user_admin(auth.uid()) OR EXISTS(
    SELECT 1 FROM public.community_posts WHERE id = post_id AND user_id = auth.uid()
  )) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Permission denied');
  END IF;
  
  -- Deletar post
  DELETE FROM public.community_posts WHERE id = post_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Post deleted successfully');
END;
$function$;

-- Função 9: increment_topic_views
CREATE OR REPLACE FUNCTION public.increment_topic_views(topic_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.community_topics
  SET view_count = COALESCE(view_count, 0) + 1,
      last_activity_at = now()
  WHERE id = topic_id;
END;
$function$;

-- Função 10: increment_topic_replies
CREATE OR REPLACE FUNCTION public.increment_topic_replies(topic_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.community_topics
  SET reply_count = COALESCE(reply_count, 0) + 1,
      last_activity_at = now()
  WHERE id = topic_id;
END;
$function$;

-- Função 11: is_user_admin_secure
CREATE OR REPLACE FUNCTION public.is_user_admin_secure(target_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = target_user_id 
    AND ur.name = 'admin'
  ) OR EXISTS (
    SELECT 1 
    FROM public.profiles p
    WHERE p.id = target_user_id 
    AND p.email LIKE '%@viverdeia.ai'
  );
$function$;

-- Função 12: create_storage_public_policy_v2
CREATE OR REPLACE FUNCTION public.create_storage_public_policy_v2(bucket_name text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'storage'
AS $function$
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
$function$;

-- Função 13: validate_file_upload
CREATE OR REPLACE FUNCTION public.validate_file_upload(file_name text, file_size bigint, file_type text, bucket_name text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;