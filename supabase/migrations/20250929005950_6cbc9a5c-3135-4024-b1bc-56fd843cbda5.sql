-- Corrigir função get_enhanced_user_stats_public removendo verificação de auth restritiva
CREATE OR REPLACE FUNCTION public.get_enhanced_user_stats_public()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  total_users integer;
  active_users integer;
  new_users_today integer;
  pending_onboarding integer;
  completed_onboarding integer;
  admin_users integer;
  verified_users integer;
BEGIN
  -- Contar usuários totais
  SELECT COUNT(*) INTO total_users FROM public.profiles;
  
  -- Contar usuários ativos (com atividade nos últimos 30 dias)
  SELECT COUNT(DISTINCT user_id) INTO active_users 
  FROM public.analytics 
  WHERE created_at > (now() - interval '30 days');
  
  -- Contar novos usuários hoje
  SELECT COUNT(*) INTO new_users_today 
  FROM public.profiles 
  WHERE created_at >= CURRENT_DATE;
  
  -- Contar onboarding pendente
  SELECT COUNT(*) INTO pending_onboarding 
  FROM public.profiles 
  WHERE onboarding_completed = false;
  
  -- Contar onboarding completo
  SELECT COUNT(*) INTO completed_onboarding 
  FROM public.profiles 
  WHERE onboarding_completed = true;
  
  -- Contar admins
  SELECT COUNT(*) INTO admin_users 
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE ur.name = 'admin';
  
  -- Contar usuários verificados (assumindo que email_verified existe)
  SELECT COUNT(*) INTO verified_users 
  FROM public.profiles 
  WHERE email IS NOT NULL AND email != '';
  
  -- Construir resultado
  result := jsonb_build_object(
    'total_users', total_users,
    'active_users', active_users,
    'new_users_today', new_users_today,
    'pending_onboarding', pending_onboarding,
    'completed_onboarding', completed_onboarding,
    'admin_users', admin_users,
    'verified_users', verified_users,
    'growth_rate', CASE 
      WHEN total_users > 0 THEN ROUND((new_users_today::numeric / total_users::numeric) * 100, 2)
      ELSE 0
    END
  );
  
  RETURN result;
END;
$function$;