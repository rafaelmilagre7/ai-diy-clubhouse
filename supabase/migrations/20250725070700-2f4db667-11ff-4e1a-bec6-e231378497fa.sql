-- Corrigir problemas de segurança pendentes (com DROP das funções existentes)

-- 1. Corrigir views SECURITY DEFINER (fazendo DROP primeiro)
DROP VIEW IF EXISTS admin_analytics_overview;
DROP FUNCTION IF EXISTS get_admin_analytics_overview();

CREATE OR REPLACE FUNCTION get_admin_analytics_overview()
RETURNS TABLE(
  total_users bigint,
  new_users_30d bigint,
  active_users_7d bigint,
  completed_onboarding bigint,
  total_solutions bigint,
  new_solutions_30d bigint,
  growth_rate numeric,
  completed_implementations bigint,
  total_lessons bigint,
  active_learners bigint,
  completion_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado - apenas administradores';
  END IF;

  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      COUNT(*)::bigint as total,
      COUNT(CASE WHEN p.created_at > NOW() - INTERVAL '30 days' THEN 1 END)::bigint as new_30d,
      COUNT(CASE WHEN p.updated_at > NOW() - INTERVAL '7 days' THEN 1 END)::bigint as active_7d,
      COUNT(CASE WHEN p.onboarding_completed = true THEN 1 END)::bigint as completed_onb
    FROM public.profiles p
  ),
  solution_stats AS (
    SELECT 
      COUNT(*)::bigint as total,
      COUNT(CASE WHEN s.created_at > NOW() - INTERVAL '30 days' THEN 1 END)::bigint as new_30d
    FROM public.solutions s
  ),
  progress_stats AS (
    SELECT 
      COUNT(DISTINCT user_id)::bigint as active_learners,
      COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END)::bigint as completed
    FROM public.progress
  ),
  lesson_stats AS (
    SELECT COUNT(*)::bigint as total FROM public.learning_lessons
  )
  SELECT 
    us.total,
    us.new_30d,
    us.active_7d,
    us.completed_onb,
    ss.total,
    ss.new_30d,
    CASE 
      WHEN us.total > 0 THEN ROUND((us.new_30d::numeric / us.total::numeric) * 100, 2)
      ELSE 0
    END,
    ps.completed,
    ls.total,
    ps.active_learners,
    CASE 
      WHEN ps.active_learners > 0 THEN ROUND((ps.completed::numeric / ps.active_learners::numeric) * 100, 2)
      ELSE 0
    END
  FROM user_stats us, solution_stats ss, progress_stats ps, lesson_stats ls;
END;
$$;

-- Substituir invite_dashboard_stats view por função segura
DROP VIEW IF EXISTS invite_dashboard_stats;
DROP FUNCTION IF EXISTS get_invite_dashboard_stats();

CREATE OR REPLACE FUNCTION get_invite_dashboard_stats()
RETURNS TABLE(
  total_invites bigint,
  active_invites bigint,
  used_invites bigint,
  expired_invites bigint,
  recent_invites bigint,
  conversion_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado - apenas administradores';
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total,
    COUNT(CASE WHEN used_at IS NULL AND expires_at > NOW() THEN 1 END)::bigint as active,
    COUNT(CASE WHEN used_at IS NOT NULL THEN 1 END)::bigint as used,
    COUNT(CASE WHEN used_at IS NULL AND expires_at <= NOW() THEN 1 END)::bigint as expired,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END)::bigint as recent,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(CASE WHEN used_at IS NOT NULL THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 2)
      ELSE 0
    END as conversion
  FROM public.invites;
END;
$$;