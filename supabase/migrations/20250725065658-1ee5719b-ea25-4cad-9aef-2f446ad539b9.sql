-- CONTINUAÇÃO DA CORREÇÃO DE SEGURANÇA: Lote 4
-- Corrigindo mais 12 funções

-- Função 22: is_user_admin_fast
CREATE OR REPLACE FUNCTION public.is_user_admin_fast(target_user_id uuid)
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

-- Função 23: update_learning_updated_at
CREATE OR REPLACE FUNCTION public.update_learning_updated_at()
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

-- Função 24: update_communication_preferences_updated_at
CREATE OR REPLACE FUNCTION public.update_communication_preferences_updated_at()
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

-- Função 25: deleteforumtopic
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

-- Função 26: deleteforumpost
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

-- Função 27: can_access_learning_content
CREATE OR REPLACE FUNCTION public.can_access_learning_content(target_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT public.get_user_role_secure(target_user_id) IN ('admin', 'membro_club', 'formacao');
$function$;

-- Função 28: fix_stuck_onboarding_users
CREATE OR REPLACE FUNCTION public.fix_stuck_onboarding_users()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  fixed_count INTEGER := 0;
  user_record RECORD;
BEGIN
  -- Destrava usuários no step 1 que não têm completed_steps
  FOR user_record IN 
    SELECT p.id, p.email, onb.current_step, onb.completed_steps
    FROM public.profiles p
    LEFT JOIN public.onboarding_final onb ON p.id = onb.user_id
    WHERE p.onboarding_completed = false
      AND (onb.completed_steps IS NULL OR array_length(onb.completed_steps, 1) IS NULL)
      AND COALESCE(onb.current_step, 1) = 1
  LOOP
    -- Simular que step 1 foi completado com dados mínimos
    UPDATE public.onboarding_final
    SET 
      completed_steps = ARRAY[1],
      current_step = 2,
      personal_info = COALESCE(personal_info, '{}'::jsonb) || jsonb_build_object(
        'name', COALESCE(personal_info->>'name', 'Usuário'),
        'email', user_record.email
      ),
      updated_at = now()
    WHERE user_id = user_record.id;
    
    fixed_count := fixed_count + 1;
    RAISE NOTICE 'Destravado usuário %: %', user_record.email, user_record.id;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'fixed_users', fixed_count,
    'message', format('Destravados %s usuários do onboarding', fixed_count)
  );
END;
$function$;

-- Função 29: generate_referral_token
CREATE OR REPLACE FUNCTION public.generate_referral_token()
 RETURNS text
 LANGUAGE sql
 SET search_path TO 'public'
AS $function$
  SELECT string_agg(
    substring('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 
    ceil(random() * 32)::integer, 1), '')
  FROM generate_series(1, 10);
$function$;

-- Função 30: is_owner
CREATE OR REPLACE FUNCTION public.is_owner(resource_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT auth.uid() = resource_user_id;
$function$;

-- Função 31: get_user_role
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

-- Função 32: log_security_violation
CREATE OR REPLACE FUNCTION public.log_security_violation(violation_type text, resource_table text, attempted_action text, user_context jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'security_violation',
    attempted_action,
    resource_table,
    jsonb_build_object(
      'violation_type', violation_type,
      'table', resource_table,
      'user_context', user_context,
      'timestamp', NOW(),
      'session_info', jsonb_build_object(
        'role', public.get_user_role_secure(),
        'user_id', auth.uid()
      )
    ),
    'high'
  );
END;
$function$;

-- Função 33: update_network_timestamp
CREATE OR REPLACE FUNCTION public.update_network_timestamp()
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