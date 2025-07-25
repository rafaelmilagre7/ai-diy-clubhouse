-- CORREÇÃO FINAL - Últimas funções sem search_path
-- Correção das funções que sobraram

-- Funções auxiliares de storage e configuração
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

-- Funções de RPC para community
CREATE OR REPLACE FUNCTION public.delete_community_topic(topic_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar permissões (admin ou autor)
  IF NOT (public.is_user_admin(auth.uid()) OR EXISTS(
    SELECT 1 FROM public.community_topics WHERE id = topic_id AND user_id = auth.uid()
  )) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Permission denied');
  END IF;
  
  -- Deletar posts relacionados primeiro
  DELETE FROM public.community_posts WHERE topic_id = topic_id;
  
  -- Deletar tópico
  DELETE FROM public.community_topics WHERE id = topic_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Topic deleted successfully');
END;
$function$;

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

CREATE OR REPLACE FUNCTION public.toggle_topic_solved(topic_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_status boolean;
  new_status boolean;
BEGIN
  -- Verificar permissões (admin ou autor)
  IF NOT (public.is_user_admin(auth.uid()) OR EXISTS(
    SELECT 1 FROM public.community_topics WHERE id = topic_id AND user_id = auth.uid()
  )) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Permission denied');
  END IF;
  
  -- Obter status atual
  SELECT is_solved INTO current_status
  FROM public.community_topics
  WHERE id = topic_id;
  
  IF current_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Topic not found');
  END IF;
  
  -- Alternar status
  new_status := NOT current_status;
  
  UPDATE public.community_topics
  SET is_solved = new_status,
      updated_at = now()
  WHERE id = topic_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Topic status updated',
    'is_solved', new_status
  );
END;
$function$;

-- Funções legacy para compatibilidade
CREATE OR REPLACE FUNCTION public.deleteforumtopic(topic_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Redirecionar para a nova função
  RETURN public.delete_community_topic(topic_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.deleteforumpost(post_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Redirecionar para a nova função
  RETURN public.delete_community_post(post_id);
END;
$function$;

-- Funções de roles e permissões simples
CREATE OR REPLACE FUNCTION public.is_owner(resource_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT auth.uid() = resource_user_id;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(ur.name, 'member')
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid()
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT public.is_user_admin(auth.uid());
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT public.is_user_admin(auth.uid());
$function$;

CREATE OR REPLACE FUNCTION public.can_access_learning_content(target_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT public.get_user_role_secure(target_user_id) IN ('admin', 'membro_club', 'formacao');
$function$;