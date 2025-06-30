
-- CORREÇÃO E OTIMIZAÇÃO DO SISTEMA DE ANALYTICS ADMINISTRATIVO
-- Corrigindo views para trabalhar com dados reais disponíveis

-- 1. VIEW: Estatísticas consolidadas do sistema (corrigida)
DROP VIEW IF EXISTS public.admin_stats_overview;
CREATE OR REPLACE VIEW public.admin_stats_overview AS
SELECT 
  -- Contadores principais
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.solutions WHERE published = true) as total_solutions,
  (SELECT COUNT(*) FROM public.learning_courses WHERE published = true) as total_courses,
  (SELECT COUNT(*) FROM public.progress WHERE is_completed = true) as completed_implementations,
  (SELECT COUNT(*) FROM public.progress WHERE is_completed = false) as active_implementations,
  (SELECT COUNT(*) FROM public.learning_progress WHERE progress_percentage = 100) as completed_lessons,
  (SELECT COUNT(*) FROM public.forum_topics) as forum_topics,
  (SELECT COALESCE(SUM(benefit_clicks), 0) FROM public.tools WHERE benefit_clicks > 0) as total_benefit_clicks,
  
  -- Crescimento mensal (últimos 30 dias)
  (SELECT COUNT(*) FROM public.profiles WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM public.progress WHERE created_at >= NOW() - INTERVAL '30 days') as new_implementations_30d,
  
  -- Métricas de engajamento
  (SELECT COUNT(DISTINCT user_id) FROM public.progress WHERE last_activity >= NOW() - INTERVAL '7 days') as active_users_7d,
  (SELECT COUNT(DISTINCT user_id) FROM public.learning_progress WHERE updated_at >= NOW() - INTERVAL '7 days') as active_learners_7d,
  
  -- Taxa de conclusão geral
  CASE 
    WHEN (SELECT COUNT(*) FROM public.progress) > 0 
    THEN ROUND((SELECT COUNT(*) FROM public.progress WHERE is_completed = true)::numeric / (SELECT COUNT(*) FROM public.progress)::numeric * 100, 2)
    ELSE 0
  END as overall_completion_rate,
  
  -- Tempo médio de implementação (em dias)
  COALESCE((
    SELECT AVG(EXTRACT(DAY FROM (completed_at - created_at)))::integer
    FROM public.progress 
    WHERE is_completed = true AND completed_at IS NOT NULL
  ), 0) as avg_implementation_time_days;

-- 2. VIEW: Crescimento de usuários por dia (últimos 90 dias)
DROP VIEW IF EXISTS public.user_engagement_metrics;
CREATE OR REPLACE VIEW public.user_engagement_metrics AS
SELECT 
  DATE_TRUNC('day', created_at)::date as date,
  TO_CHAR(DATE_TRUNC('day', created_at), 'DD/MM') as name,
  COUNT(*) as new_users
FROM public.profiles
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date;

-- 3. VIEW: Performance de soluções
DROP VIEW IF EXISTS public.solution_performance_data;
CREATE OR REPLACE VIEW public.solution_performance_data AS
SELECT 
  s.id,
  s.title,
  s.category,
  s.difficulty,
  COUNT(pr.id) as total_implementations,
  COUNT(pr.id) FILTER (WHERE pr.is_completed = true) as completed_implementations,
  CASE 
    WHEN COUNT(pr.id) > 0 
    THEN ROUND(COUNT(pr.id) FILTER (WHERE pr.is_completed = true)::numeric / COUNT(pr.id)::numeric * 100, 2)
    ELSE 0
  END as completion_rate
FROM public.solutions s
LEFT JOIN public.progress pr ON s.id = pr.solution_id
WHERE s.published = true
GROUP BY s.id, s.title, s.category, s.difficulty
ORDER BY total_implementations DESC;

-- 4. VIEW: Analytics de aprendizado
DROP VIEW IF EXISTS public.learning_analytics_data;
CREATE OR REPLACE VIEW public.learning_analytics_data AS
SELECT 
  lc.id as course_id,
  lc.title as course_title,
  COUNT(DISTINCT ll.id) as total_lessons,
  COUNT(DISTINCT lp.user_id) as enrolled_users,
  COUNT(lp.id) FILTER (WHERE lp.progress_percentage = 100) as completed_lessons_count,
  COALESCE(AVG(lp.progress_percentage), 0)::integer as avg_progress_percentage
FROM public.learning_courses lc
LEFT JOIN public.learning_modules lm ON lc.id = lm.course_id
LEFT JOIN public.learning_lessons ll ON lm.id = ll.module_id
LEFT JOIN public.learning_progress lp ON ll.id = lp.lesson_id
WHERE lc.published = true
GROUP BY lc.id, lc.title
ORDER BY enrolled_users DESC;

-- 5. VIEW: Atividade por dia da semana
DROP VIEW IF EXISTS public.weekly_activity_pattern;
CREATE OR REPLACE VIEW public.weekly_activity_pattern AS
SELECT 
  EXTRACT(DOW FROM created_at) as day_of_week,
  CASE EXTRACT(DOW FROM created_at)
    WHEN 0 THEN 'Dom'
    WHEN 1 THEN 'Seg'
    WHEN 2 THEN 'Ter'
    WHEN 3 THEN 'Qua'
    WHEN 4 THEN 'Qui'
    WHEN 5 THEN 'Sex'
    WHEN 6 THEN 'Sáb'
  END as day_name,
  COUNT(*) as activity_count
FROM (
  SELECT created_at FROM public.progress WHERE created_at >= NOW() - INTERVAL '30 days'
  UNION ALL
  SELECT created_at FROM public.learning_progress WHERE created_at >= NOW() - INTERVAL '30 days'
  UNION ALL
  SELECT created_at FROM public.forum_topics WHERE created_at >= NOW() - INTERVAL '30 days'
) activities
GROUP BY EXTRACT(DOW FROM created_at)
ORDER BY day_of_week;

-- 6. VIEW: Distribuição de usuários por roles
DROP VIEW IF EXISTS public.user_role_distribution;
CREATE OR REPLACE VIEW public.user_role_distribution AS
SELECT 
  COALESCE(ur.name, 'member') as role_name,
  COUNT(*) as user_count,
  ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM public.profiles)::numeric * 100, 2) as percentage
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.role_id = ur.id
GROUP BY COALESCE(ur.name, 'member')
ORDER BY user_count DESC;

-- Log da correção das views
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details
) VALUES (
  NULL,
  'system_event',
  'admin_analytics_views_fixed',
  jsonb_build_object(
    'views_updated', ARRAY[
      'admin_stats_overview',
      'user_engagement_metrics', 
      'solution_performance_data',
      'learning_analytics_data',
      'weekly_activity_pattern',
      'user_role_distribution'
    ],
    'improvements', 'Corrigidas queries, otimizadas aggregações, melhorado tratamento de dados nulos',
    'created_at', NOW()
  )
);
