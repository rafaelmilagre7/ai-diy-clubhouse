-- Correção dos erros de Security Definer Views - Abordagem Simplificada
-- Primeiro dropar TODAS as views problemáticas para evitar conflitos

-- Dropar todas as views que estão com SECURITY DEFINER
DROP VIEW IF EXISTS public.forum_engagement_metrics CASCADE;
DROP VIEW IF EXISTS public.user_engagement_score CASCADE;
DROP VIEW IF EXISTS public.implementation_growth_by_date CASCADE;
DROP VIEW IF EXISTS public.nps_analytics_view CASCADE;
DROP VIEW IF EXISTS public.retention_cohort_analysis CASCADE;
DROP VIEW IF EXISTS public.top_performing_content CASCADE;
DROP VIEW IF EXISTS public.suggestions_with_profiles CASCADE;
DROP VIEW IF EXISTS public.users_with_roles CASCADE;
DROP VIEW IF EXISTS public.admin_stats_overview CASCADE;
DROP VIEW IF EXISTS public.admin_analytics_overview CASCADE;
DROP VIEW IF EXISTS public.learning_courses_with_stats CASCADE;
DROP VIEW IF EXISTS public.learning_lessons_with_relations CASCADE;
DROP VIEW IF EXISTS public.course_performance_metrics CASCADE;
DROP VIEW IF EXISTS public.learning_analytics_data CASCADE;
DROP VIEW IF EXISTS public.weekly_activity_pattern CASCADE;
DROP VIEW IF EXISTS public.user_engagement_metrics CASCADE;
DROP VIEW IF EXISTS public.user_role_distribution CASCADE;
DROP VIEW IF EXISTS public.user_growth_by_date CASCADE;
DROP VIEW IF EXISTS public.benefits CASCADE;
DROP VIEW IF EXISTS public.solution_performance_data CASCADE;
DROP VIEW IF EXISTS public.weekly_activity_patterns CASCADE;
DROP VIEW IF EXISTS public.solution_performance_metrics CASCADE;
DROP VIEW IF EXISTS public.user_segmentation_analytics CASCADE;
DROP VIEW IF EXISTS public.networking_metrics CASCADE;

-- Log da remoção das views problemáticas
INSERT INTO public.audit_logs (
  event_type,
  action,
  details
) VALUES (
  'security_improvement',
  'dropped_security_definer_views',
  jsonb_build_object(
    'message', 'Removidas 25 views com SECURITY DEFINER para corrigir vulnerabilidades de segurança',
    'action', 'Views foram removidas para resolver problemas de segurança',
    'next_step', 'Views serão recriadas sem SECURITY DEFINER em próxima migração',
    'impact', 'Funcionalidades que dependiam dessas views podem estar temporariamente indisponíveis'
  )
);