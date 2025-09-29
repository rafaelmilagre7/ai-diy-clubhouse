-- Corrigir campos faltantes na função get_enhanced_user_stats_public
CREATE OR REPLACE FUNCTION public.get_enhanced_user_stats_public()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  total_users integer;
  masters integer;
  team_members integer;
  organizations integer;
  individual_users integer;
  active_users integer;
  new_users_today integer;
  pending_onboarding integer;
  completed_onboarding integer;
  admin_users integer;
  verified_users integer;
BEGIN
  -- Contar usuários totais
  SELECT COUNT(*) INTO total_users FROM public.profiles;
  
  -- Contar masters (is_master_user = true OU role = 'master')
  SELECT COUNT(*) INTO masters 
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.is_master_user = true OR ur.name = 'master';
  
  -- Contar membros de equipe
  SELECT COUNT(*) INTO team_members 
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE ur.name IN ('team_member', 'membro_equipe', 'equipe');
  
  -- Contar organizações ativas
  SELECT COUNT(*) INTO organizations FROM public.organizations;
  
  -- Contar usuários individuais (não masters e sem organização)
  SELECT COUNT(*) INTO individual_users 
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE (p.is_master_user = false OR p.is_master_user IS NULL)
    AND (p.organization_id IS NULL)
    AND (ur.name != 'master' OR ur.name IS NULL);
  
  -- Contar usuários ativos (com atividade nos últimos 30 dias)
  SELECT COUNT(DISTINCT user_id) INTO active_users 
  FROM public.analytics 
  WHERE created_at > (now() - interval '30 days');
  
  -- Se analytics estiver vazio, usar usuários criados recentemente
  IF active_users = 0 THEN
    SELECT COUNT(*) INTO active_users 
    FROM public.profiles 
    WHERE created_at > (now() - interval '30 days');
  END IF;
  
  -- Contar novos usuários hoje
  SELECT COUNT(*) INTO new_users_today 
  FROM public.profiles 
  WHERE created_at >= CURRENT_DATE;
  
  -- Contar onboarding pendente
  SELECT COUNT(*) INTO pending_onboarding 
  FROM public.profiles 
  WHERE onboarding_completed = false OR onboarding_completed IS NULL;
  
  -- Contar onboarding completo
  SELECT COUNT(*) INTO completed_onboarding 
  FROM public.profiles 
  WHERE onboarding_completed = true;
  
  -- Contar admins
  SELECT COUNT(*) INTO admin_users 
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE ur.name = 'admin';
  
  -- Contar usuários verificados
  SELECT COUNT(*) INTO verified_users 
  FROM public.profiles 
  WHERE email IS NOT NULL AND email != '';
  
  -- Construir resultado com TODOS os campos necessários
  result := jsonb_build_object(
    -- Campos principais esperados pelo frontend
    'total_users', total_users,
    'masters', masters,
    'team_members', team_members,
    'organizations', organizations, 
    'individual_users', individual_users,
    
    -- Campos adicionais
    'active_users', active_users,
    'inactive_users', total_users - active_users,
    'new_users_today', new_users_today,
    'new_users_7d', COALESCE((
      SELECT COUNT(*) FROM public.profiles 
      WHERE created_at > (now() - interval '7 days')
    ), 0),
    'new_users_30d', COALESCE((
      SELECT COUNT(*) FROM public.profiles 
      WHERE created_at > (now() - interval '30 days')
    ), 0),
    'onboarding_completed', completed_onboarding,
    'onboarding_pending', pending_onboarding,
    'admin_users', admin_users,
    'verified_users', verified_users,
    
    -- Métricas calculadas
    'growth_rate', CASE 
      WHEN total_users > 0 THEN ROUND((new_users_today::numeric / total_users::numeric) * 100, 2)
      ELSE 0
    END,
    'onboarding_completion_rate', CASE 
      WHEN total_users > 0 THEN ROUND((completed_onboarding::numeric / total_users::numeric) * 100, 2)
      ELSE 0
    END
  );
  
  RETURN result;
END;
$function$;