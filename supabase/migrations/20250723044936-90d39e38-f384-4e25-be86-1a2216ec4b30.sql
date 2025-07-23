-- Criar função RPC para estatísticas do onboarding para admins
CREATE OR REPLACE FUNCTION public.get_onboarding_stats_admin()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_users integer;
  completed integer;
  pending integer;
  legacy_users integer;
  result jsonb;
BEGIN
  -- Verificar se usuário é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Acesso negado - apenas administradores');
  END IF;

  -- Contar total de usuários
  SELECT COUNT(*) INTO total_users FROM public.profiles;

  -- Contar usuários que completaram onboarding
  SELECT COUNT(*) INTO completed 
  FROM public.profiles 
  WHERE onboarding_completed = true;

  -- Contar usuários pendentes
  pending := total_users - completed;

  -- Contar usuários legacy (têm registro de onboarding mas não completaram)
  SELECT COUNT(*) INTO legacy_users
  FROM public.profiles p
  INNER JOIN public.onboarding_final onb ON p.id = onb.user_id
  WHERE p.onboarding_completed = false
    AND onb.created_at < '2025-07-23'::date
    AND (
      onb.completed_steps IS NOT NULL 
      AND array_length(onb.completed_steps, 1) > 0
    );

  result := jsonb_build_object(
    'total_users', total_users,
    'completed', completed,
    'pending', pending,
    'legacy_users', legacy_users,
    'completion_rate', CASE 
      WHEN total_users > 0 THEN ROUND((completed::numeric / total_users::numeric) * 100, 1)
      ELSE 0
    END,
    'updated_at', now()
  );

  RETURN result;
END;
$$;