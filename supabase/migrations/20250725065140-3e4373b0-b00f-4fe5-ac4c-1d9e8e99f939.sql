-- CORREÇÃO DE SEGURANÇA: Adicionar search_path seguro às funções
-- Isso previne ataques de schema poisoning

-- Função 1: update_solution_comments_updated_at
CREATE OR REPLACE FUNCTION public.update_solution_comments_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Função 2: is_user_admin_safe
CREATE OR REPLACE FUNCTION public.is_user_admin_safe(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id AND ur.name = 'admin'
  );
$function$;

-- Função 3: update_admin_communications_updated_at
CREATE OR REPLACE FUNCTION public.update_admin_communications_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Função 4: get_current_user_role_safe
CREATE OR REPLACE FUNCTION public.get_current_user_role_safe()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(ur.name, 'member')
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid()
  LIMIT 1;
$function$;

-- Função 5: delete_community_topic
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