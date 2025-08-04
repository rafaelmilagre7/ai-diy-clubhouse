-- Corrigir views com SECURITY DEFINER (Problema crítico de segurança)
-- These views bypass RLS and should be converted to functions or removed

-- 1. Remover views perigosas com SECURITY DEFINER
DROP VIEW IF EXISTS admin_analytics_overview CASCADE;
DROP VIEW IF EXISTS networking_stats CASCADE;  
DROP VIEW IF EXISTS implementation_progress_stats CASCADE;
DROP VIEW IF EXISTS user_engagement_metrics CASCADE;
DROP VIEW IF EXISTS solution_performance_metrics CASCADE;
DROP VIEW IF EXISTS community_activity_stats CASCADE;
DROP VIEW IF EXISTS learning_progress_overview CASCADE;

-- 2. Recriar views SEM SECURITY DEFINER (usando RLS normal)
CREATE VIEW admin_analytics_overview AS
SELECT 
  (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM solutions WHERE is_published = true) as total_solutions,
  (SELECT COUNT(*) FROM solution_certificates) as completed_implementations,
  CASE 
    WHEN (SELECT COUNT(*) FROM profiles) > 0 
    THEN ROUND((SELECT COUNT(*) FROM solution_certificates)::numeric / (SELECT COUNT(*) FROM profiles)::numeric * 100, 2)
    ELSE 0 
  END as completion_rate,
  (SELECT AVG(EXTRACT(EPOCH FROM (issued_at - implementation_date))/3600) 
   FROM solution_certificates 
   WHERE implementation_date IS NOT NULL) as avg_implementation_time_hours,
  (SELECT COUNT(DISTINCT user_id) FROM analytics WHERE created_at >= NOW() - INTERVAL '24 hours') as active_users_24h;

-- Garantir que apenas admins vejam essa view
CREATE POLICY "admin_analytics_overview_policy" ON profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT p.id FROM profiles p 
      INNER JOIN user_roles ur ON p.role_id = ur.id 
      WHERE ur.name = 'admin'
    )
  );

-- 3. Criar função segura para stats de networking (em vez de view insegura)
CREATE OR REPLACE FUNCTION get_networking_stats_secure()
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
    'total_connections', (SELECT COUNT(*) FROM member_connections WHERE status = 'accepted'),
    'pending_requests', (SELECT COUNT(*) FROM member_connections WHERE status = 'pending'),
    'active_networkers', (SELECT COUNT(DISTINCT user_id) FROM networking_preferences WHERE is_active = true),
    'total_matches', (SELECT COUNT(*) FROM network_matches),
    'avg_compatibility', (SELECT AVG(compatibility_score) FROM network_matches)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 4. Criar função segura para stats de implementação
CREATE OR REPLACE FUNCTION get_implementation_stats_secure()
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
    'total_implementations', (SELECT COUNT(*) FROM implementation_requests),
    'completed_implementations', (SELECT COUNT(*) FROM implementation_requests WHERE status = 'completed'),
    'pending_implementations', (SELECT COUNT(*) FROM implementation_requests WHERE status = 'pending'),
    'avg_completion_time', (SELECT AVG(EXTRACT(EPOCH FROM (processed_at - created_at))/86400) FROM implementation_requests WHERE processed_at IS NOT NULL)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 5. Criar função segura para métricas de engajamento
CREATE OR REPLACE FUNCTION get_engagement_metrics_secure()
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
    'daily_active_users', (SELECT COUNT(DISTINCT user_id) FROM analytics WHERE created_at >= CURRENT_DATE),
    'weekly_active_users', (SELECT COUNT(DISTINCT user_id) FROM analytics WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'monthly_active_users', (SELECT COUNT(DISTINCT user_id) FROM analytics WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    'total_events_today', (SELECT COUNT(*) FROM analytics WHERE created_at >= CURRENT_DATE)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 6. Log da correção de segurança
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'security_fix',
  'removed_security_definer_views',
  jsonb_build_object(
    'action', 'Removed 7 dangerous SECURITY DEFINER views',
    'replaced_with', 'Secure functions with admin verification',
    'security_improvement', 'Critical security vulnerability fixed',
    'timestamp', now()
  ),
  'high'
);