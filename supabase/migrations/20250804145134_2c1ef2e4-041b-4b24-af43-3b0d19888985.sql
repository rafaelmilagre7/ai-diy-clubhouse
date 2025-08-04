-- Corrigir views restantes com possível SECURITY DEFINER - VERSÃO CORRIGIDA

-- Remover e recriar views sem SECURITY DEFINER
DROP VIEW IF EXISTS audit_logs_secure CASCADE;
DROP VIEW IF EXISTS nps_analytics_view CASCADE;
DROP VIEW IF EXISTS user_growth_by_date CASCADE;
DROP VIEW IF EXISTS user_segmentation_analytics CASCADE;
DROP VIEW IF EXISTS weekly_activity_patterns CASCADE;

-- Substituir por funções seguras com verificação de admin
CREATE OR REPLACE FUNCTION get_audit_logs_secure()
RETURNS TABLE(
  log_id uuid,
  user_id uuid,
  event_type text,
  action text,
  log_timestamp timestamp with time zone,
  severity text,
  details jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT is_user_admin_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado - apenas administradores';
  END IF;
  
  RETURN QUERY
  SELECT 
    al.id as log_id,
    al.user_id,
    al.event_type,
    al.action,
    al.timestamp as log_timestamp,
    al.severity,
    al.details
  FROM audit_logs al
  WHERE al.severity IN ('info', 'warning')  -- Não expor logs críticos
  ORDER BY al.timestamp DESC
  LIMIT 1000;
END;
$$;

CREATE OR REPLACE FUNCTION get_nps_analytics_secure()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Acesso negado - apenas administradores');
  END IF;
  
  SELECT jsonb_build_object(
    'total_responses', COALESCE((SELECT COUNT(*) FROM learning_lesson_nps), 0),
    'avg_score', COALESCE((SELECT AVG(score) FROM learning_lesson_nps), 0),
    'promoters', COALESCE((SELECT COUNT(*) FROM learning_lesson_nps WHERE score >= 9), 0),
    'detractors', COALESCE((SELECT COUNT(*) FROM learning_lesson_nps WHERE score <= 6), 0),
    'passives', COALESCE((SELECT COUNT(*) FROM learning_lesson_nps WHERE score BETWEEN 7 AND 8), 0)
  ) INTO result;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION get_user_growth_secure()
RETURNS TABLE(
  date_period date,
  new_users bigint,
  cumulative_users bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT is_user_admin_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado - apenas administradores';
  END IF;
  
  RETURN QUERY
  SELECT 
    DATE(p.created_at) as date_period,
    COUNT(*)::bigint as new_users,
    SUM(COUNT(*)) OVER (ORDER BY DATE(p.created_at))::bigint as cumulative_users
  FROM profiles p
  WHERE p.created_at >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY DATE(p.created_at)
  ORDER BY date_period;
END;
$$;

CREATE OR REPLACE FUNCTION get_user_segmentation_secure()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Acesso negado - apenas administradores');
  END IF;
  
  SELECT jsonb_build_object(
    'by_role', (
      SELECT jsonb_object_agg(ur.name, role_count)
      FROM (
        SELECT ur.name, COUNT(p.id) as role_count
        FROM user_roles ur
        LEFT JOIN profiles p ON p.role_id = ur.id
        GROUP BY ur.name
      ) role_stats
    ),
    'by_onboarding_status', (
      SELECT jsonb_object_agg(
        CASE WHEN onboarding_completed THEN 'completed' ELSE 'pending' END,
        user_count
      )
      FROM (
        SELECT onboarding_completed, COUNT(*) as user_count
        FROM profiles
        GROUP BY onboarding_completed
      ) onboarding_stats
    ),
    'total_users', (SELECT COUNT(*) FROM profiles)
  ) INTO result;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION get_weekly_activity_secure()
RETURNS TABLE(
  week_start date,
  active_users bigint,
  total_events bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT is_user_admin_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado - apenas administradores';
  END IF;
  
  RETURN QUERY
  SELECT 
    DATE_TRUNC('week', a.created_at)::date as week_start,
    COUNT(DISTINCT a.user_id)::bigint as active_users,
    COUNT(*)::bigint as total_events
  FROM analytics a
  WHERE a.created_at >= CURRENT_DATE - INTERVAL '12 weeks'
  GROUP BY DATE_TRUNC('week', a.created_at)
  ORDER BY week_start;
END;
$$;

-- Log da correção
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'security_fix',
  'removed_remaining_security_definer_views',
  jsonb_build_object(
    'action', 'Removed remaining 5 SECURITY DEFINER views',
    'replaced_with', 'Secure functions with admin verification',
    'views_removed', ARRAY['audit_logs_secure', 'nps_analytics_view', 'user_growth_by_date', 'user_segmentation_analytics', 'weekly_activity_patterns'],
    'fixed_reserved_word_issue', 'Renamed timestamp to log_timestamp',
    'timestamp', now()
  ),
  'high'
);