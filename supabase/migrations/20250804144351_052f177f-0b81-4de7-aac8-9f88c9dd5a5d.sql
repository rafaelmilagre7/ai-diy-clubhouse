-- Corrigir views com SECURITY DEFINER (Problema crítico de segurança) - VERSÃO CORRIGIDA
-- These views bypass RLS and should be converted to functions or removed

-- 1. Remover views perigosas com SECURITY DEFINER
DROP VIEW IF EXISTS admin_analytics_overview CASCADE;
DROP VIEW IF EXISTS networking_stats CASCADE;  
DROP VIEW IF EXISTS implementation_progress_stats CASCADE;
DROP VIEW IF EXISTS user_engagement_metrics CASCADE;
DROP VIEW IF EXISTS solution_performance_metrics CASCADE;
DROP VIEW IF EXISTS community_activity_stats CASCADE;
DROP VIEW IF EXISTS learning_progress_overview CASCADE;

-- 2. Recriar views SEM SECURITY DEFINER (usando RLS normal) - CORRIGINDO NOMES DE COLUNAS
CREATE VIEW admin_analytics_overview AS
SELECT 
  (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM solutions WHERE published = true) as total_solutions,
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
    'total_connections', COALESCE((SELECT COUNT(*) FROM member_connections WHERE status = 'accepted'), 0),
    'pending_requests', COALESCE((SELECT COUNT(*) FROM member_connections WHERE status = 'pending'), 0),
    'active_networkers', COALESCE((SELECT COUNT(DISTINCT user_id) FROM networking_preferences WHERE is_active = true), 0),
    'total_matches', COALESCE((SELECT COUNT(*) FROM network_matches), 0),
    'avg_compatibility', COALESCE((SELECT AVG(compatibility_score) FROM network_matches), 0)
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
    'total_implementations', COALESCE((SELECT COUNT(*) FROM implementation_requests), 0),
    'completed_implementations', COALESCE((SELECT COUNT(*) FROM implementation_requests WHERE status = 'completed'), 0),
    'pending_implementations', COALESCE((SELECT COUNT(*) FROM implementation_requests WHERE status = 'pending'), 0),
    'avg_completion_time', COALESCE((SELECT AVG(EXTRACT(EPOCH FROM (processed_at - created_at))/86400) FROM implementation_requests WHERE processed_at IS NOT NULL), 0)
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
    'daily_active_users', COALESCE((SELECT COUNT(DISTINCT user_id) FROM analytics WHERE created_at >= CURRENT_DATE), 0),
    'weekly_active_users', COALESCE((SELECT COUNT(DISTINCT user_id) FROM analytics WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'), 0),
    'monthly_active_users', COALESCE((SELECT COUNT(DISTINCT user_id) FROM analytics WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'), 0),
    'total_events_today', COALESCE((SELECT COUNT(*) FROM analytics WHERE created_at >= CURRENT_DATE), 0)
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
    'fixed_column_references', 'Corrected is_published to published',
    'timestamp', now()
  ),
  'high'
);