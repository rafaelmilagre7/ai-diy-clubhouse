-- FASE 2: Cleanup de Security Definer Views Restantes

-- 1. Remover todas as views Security Definer problemáticas restantes
DROP VIEW IF EXISTS public.forum_engagement_metrics CASCADE;
DROP VIEW IF EXISTS public.user_engagement_score CASCADE;
DROP VIEW IF EXISTS public.implementation_growth_by_date CASCADE;
DROP VIEW IF EXISTS public.nps_analytics_view CASCADE;
DROP VIEW IF EXISTS public.retention_cohort_analysis CASCADE;
DROP VIEW IF EXISTS public.top_performing_content CASCADE;
DROP VIEW IF EXISTS public.admin_stats_overview CASCADE;
DROP VIEW IF EXISTS public.admin_analytics_overview CASCADE;
DROP VIEW IF EXISTS public.learning_lessons_with_relations CASCADE;
DROP VIEW IF EXISTS public.course_performance_metrics CASCADE;
DROP VIEW IF EXISTS public.learning_analytics_data CASCADE;
DROP VIEW IF EXISTS public.weekly_activity_pattern CASCADE;
DROP VIEW IF EXISTS public.user_engagement_metrics CASCADE;
DROP VIEW IF EXISTS public.user_role_distribution CASCADE;
DROP VIEW IF EXISTS public.user_growth_by_date CASCADE;
DROP VIEW IF EXISTS public.solution_performance_data CASCADE;
DROP VIEW IF EXISTS public.weekly_activity_patterns CASCADE;
DROP VIEW IF EXISTS public.solution_performance_metrics CASCADE;
DROP VIEW IF EXISTS public.user_segmentation_analytics CASCADE;
DROP VIEW IF EXISTS public.networking_metrics CASCADE;

-- 2. Criar função segura para substituir nps_analytics_view (crítica para sistema)
CREATE OR REPLACE FUNCTION public.get_nps_analytics()
RETURNS TABLE(
  id uuid,
  lesson_id uuid,
  user_id uuid,
  score integer,
  feedback text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  user_name text,
  user_email text,
  lesson_title text,
  module_title text,
  course_title text,
  course_id uuid
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Apenas admins podem acessar dados de NPS
  IF NOT public.is_admin_safe() THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    nps.id,
    nps.lesson_id,
    nps.user_id,
    nps.score,
    nps.feedback,
    nps.created_at,
    nps.updated_at,
    p.name as user_name,
    p.email as user_email,
    l.title as lesson_title,
    m.title as module_title,
    c.title as course_title,
    c.id as course_id
  FROM public.learning_lesson_nps nps
  JOIN public.profiles p ON nps.user_id = p.id
  JOIN public.learning_lessons l ON nps.lesson_id = l.id
  JOIN public.learning_modules m ON l.module_id = m.id
  JOIN public.learning_courses c ON m.course_id = c.id
  ORDER BY nps.created_at DESC;
END;
$$;

-- 3. Criar função para analytics administrativas (substituindo admin_analytics_overview)
CREATE OR REPLACE FUNCTION public.get_admin_analytics_overview()
RETURNS TABLE(
  total_users bigint,
  total_solutions bigint,
  active_implementations bigint,
  completed_implementations bigint,
  overall_completion_rate double precision,
  avg_implementation_time_days numeric,
  total_benefit_clicks bigint,
  forum_topics bigint,
  total_courses bigint,
  completed_lessons bigint,
  active_learners_7d bigint,
  active_users_7d bigint,
  new_implementations_30d bigint,
  new_users_30d bigint
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Apenas admins podem acessar analytics administrativas
  IF NOT public.is_admin_safe() THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.profiles)::bigint as total_users,
    (SELECT COUNT(*) FROM public.solutions WHERE published = true)::bigint as total_solutions,
    (SELECT COUNT(*) FROM public.progress WHERE status = 'in_progress')::bigint as active_implementations,
    (SELECT COUNT(*) FROM public.progress WHERE is_completed = true)::bigint as completed_implementations,
    COALESCE(
      (SELECT COUNT(*) * 100.0 / NULLIF(COUNT(*), 0) 
       FROM public.progress WHERE is_completed = true) / 
      NULLIF((SELECT COUNT(*) FROM public.progress), 0), 0
    )::double precision as overall_completion_rate,
    (SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/86400) 
     FROM public.progress WHERE completed_at IS NOT NULL)::numeric as avg_implementation_time_days,
    (SELECT COUNT(*) FROM public.benefit_clicks)::bigint as total_benefit_clicks,
    (SELECT COUNT(*) FROM public.forum_topics)::bigint as forum_topics,
    (SELECT COUNT(*) FROM public.learning_courses WHERE published = true)::bigint as total_courses,
    (SELECT COUNT(*) FROM public.learning_progress WHERE completed_at IS NOT NULL)::bigint as completed_lessons,
    (SELECT COUNT(DISTINCT user_id) FROM public.learning_progress 
     WHERE updated_at > NOW() - INTERVAL '7 days')::bigint as active_learners_7d,
    (SELECT COUNT(DISTINCT user_id) FROM public.analytics 
     WHERE created_at > NOW() - INTERVAL '7 days')::bigint as active_users_7d,
    (SELECT COUNT(*) FROM public.progress 
     WHERE created_at > NOW() - INTERVAL '30 days')::bigint as new_implementations_30d,
    (SELECT COUNT(*) FROM public.profiles 
     WHERE created_at > NOW() - INTERVAL '30 days')::bigint as new_users_30d;
END;
$$;

-- 4. Log da correção FASE 2
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'system_cleanup',
  'phase_2_security_definer_views_cleanup',
  jsonb_build_object(
    'message', 'FASE 2 - Cleanup completo de Security Definer Views',
    'phase', '2_complete',
    'views_removed', 19,
    'functions_created', 2,
    'next_phase', 'phase_3_function_search_path_fix',
    'timestamp', now()
  ),
  auth.uid()
);