
-- FASE 1: CORREÇÕES CRÍTICAS - Views de Analytics e Estruturas Faltantes

-- 1. Criar view admin_analytics_overview (faltante)
CREATE OR REPLACE VIEW public.admin_analytics_overview AS
SELECT 
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.profiles WHERE created_at >= now() - interval '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM public.profiles WHERE created_at >= now() - interval '7 days') as active_users_7d,
  (SELECT COUNT(*) FROM public.profiles WHERE onboarding_completed = true) as completed_onboarding,
  (SELECT COUNT(*) FROM public.solutions WHERE published = true) as total_solutions,
  (SELECT COUNT(*) FROM public.solutions WHERE created_at >= now() - interval '30 days' AND published = true) as new_solutions_30d,
  (SELECT COUNT(*) FROM public.learning_lessons) as total_lessons,
  (SELECT COUNT(DISTINCT user_id) FROM public.learning_progress WHERE last_accessed_at >= now() - interval '7 days') as active_learners,
  (SELECT COUNT(*) FROM public.implementation_checkpoints WHERE progress_percentage = 100) as completed_implementations,
  (SELECT 
    CASE 
      WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE progress_percentage = 100)::numeric / COUNT(*)) * 100, 2)
      ELSE 0 
    END
   FROM public.implementation_checkpoints) as completion_rate,
  (SELECT 
    CASE 
      WHEN COUNT(*) FILTER (WHERE created_at >= now() - interval '60 days' AND created_at < now() - interval '30 days') > 0 
      THEN ROUND(((COUNT(*) FILTER (WHERE created_at >= now() - interval '30 days')::numeric / 
                   COUNT(*) FILTER (WHERE created_at >= now() - interval '60 days' AND created_at < now() - interval '30 days')) - 1) * 100, 2)
      ELSE 0 
    END
   FROM public.profiles) as growth_rate;

-- 2. Criar view system_health_metrics (para monitoramento)
CREATE OR REPLACE VIEW public.system_health_metrics AS
SELECT 
  'database_status' as metric_name,
  'healthy' as metric_value,
  now() as last_updated
UNION ALL
SELECT 
  'total_users' as metric_name,
  (SELECT COUNT(*)::text FROM public.profiles) as metric_value,
  now() as last_updated
UNION ALL
SELECT 
  'active_sessions' as metric_name,
  (SELECT COUNT(DISTINCT user_id)::text FROM public.audit_logs WHERE timestamp >= now() - interval '1 hour') as metric_value,
  now() as last_updated;

-- 3. Criar view user_activity_summary (para dashboard)
CREATE OR REPLACE VIEW public.user_activity_summary AS
SELECT 
  p.id as user_id,
  p.name,
  p.email,
  p.created_at as joined_at,
  p.onboarding_completed,
  COALESCE(activity.last_activity, p.created_at) as last_activity,
  COALESCE(activity.total_activities, 0) as total_activities,
  COALESCE(progress.completed_solutions, 0) as completed_solutions,
  COALESCE(progress.active_implementations, 0) as active_implementations
FROM public.profiles p
LEFT JOIN (
  SELECT 
    user_id,
    MAX(created_at) as last_activity,
    COUNT(*) as total_activities
  FROM public.analytics 
  GROUP BY user_id
) activity ON p.id = activity.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) FILTER (WHERE progress_percentage = 100) as completed_solutions,
    COUNT(*) FILTER (WHERE progress_percentage < 100 AND progress_percentage > 0) as active_implementations
  FROM public.implementation_checkpoints
  GROUP BY user_id
) progress ON p.id = progress.user_id;

-- 4. Corrigir função check_system_health (faltante)
CREATE OR REPLACE FUNCTION public.check_system_health()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  health_data jsonb;
BEGIN
  SELECT jsonb_build_object(
    'database_status', 'healthy',
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'active_users_24h', (SELECT COUNT(DISTINCT user_id) FROM public.analytics WHERE created_at >= now() - interval '24 hours'),
    'system_errors_24h', (SELECT COUNT(*) FROM public.audit_logs WHERE severity = 'critical' AND timestamp >= now() - interval '24 hours'),
    'storage_status', 'operational',
    'last_check', now()
  ) INTO health_data;
  
  RETURN health_data;
END;
$function$;

-- 5. Criar função para diagnostics do Supabase
CREATE OR REPLACE FUNCTION public.get_supabase_diagnostics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Acesso negado');
  END IF;
  
  SELECT jsonb_build_object(
    'connection_status', 'connected',
    'auth_status', CASE WHEN auth.uid() IS NOT NULL THEN 'authenticated' ELSE 'unauthenticated' END,
    'rls_policies_count', (
      SELECT COUNT(*) 
      FROM pg_policies 
      WHERE schemaname = 'public'
    ),
    'functions_count', (
      SELECT COUNT(*) 
      FROM pg_proc p 
      JOIN pg_namespace n ON p.pronamespace = n.oid 
      WHERE n.nspname = 'public'
    ),
    'tables_count', (
      SELECT COUNT(*) 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    ),
    'storage_buckets', (
      SELECT COUNT(*) 
      FROM storage.buckets
    ),
    'last_migration', (
      SELECT version 
      FROM supabase_migrations.schema_migrations 
      ORDER BY created_at DESC 
      LIMIT 1
    ),
    'check_time', now()
  ) INTO result;
  
  RETURN result;
END;
$function$;

-- 6. Política de acesso para as novas views
CREATE POLICY "admin_analytics_overview_admin_only" ON public.admin_analytics_overview
FOR SELECT USING (public.is_user_admin(auth.uid()));

-- 7. Log da correção
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'database_fix',
  'phase_1_critical_corrections',
  jsonb_build_object(
    'message', 'FASE 1 - Correções críticas: Views de analytics e funções de diagnóstico criadas',
    'views_created', ARRAY['admin_analytics_overview', 'system_health_metrics', 'user_activity_summary'],
    'functions_created', ARRAY['check_system_health', 'get_supabase_diagnostics'],
    'timestamp', now()
  ),
  auth.uid()
);
