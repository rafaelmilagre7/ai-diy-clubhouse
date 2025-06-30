
-- SINCRONIZAÇÃO COMPLETA: ANALYTICS ADMIN - VIEWS PARA DADOS REAIS
-- Criando todas as views necessárias para o sistema de analytics funcionar corretamente

-- 1. VIEW: Crescimento de usuários por data
CREATE OR REPLACE VIEW public.user_growth_by_date AS
SELECT 
  DATE_TRUNC('day', created_at)::date as date,
  TO_CHAR(DATE_TRUNC('day', created_at), 'DD/MM') as name,
  COUNT(*) as novos,
  SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', created_at)) as total
FROM public.profiles
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date;

-- 2. VIEW: Segmentação de usuários por analytics
CREATE OR REPLACE VIEW public.user_segmentation_analytics AS
SELECT 
  COALESCE(ur.name, 'member') as role_name,
  COUNT(*) as user_count,
  COUNT(*) FILTER (WHERE p.created_at >= NOW() - INTERVAL '7 days') as active_users_7d,
  ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM public.profiles)::numeric * 100, 2) as percentage
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.role_id = ur.id
GROUP BY COALESCE(ur.name, 'member')
ORDER BY user_count DESC;

-- 3. VIEW: Padrões de atividade semanal
CREATE OR REPLACE VIEW public.weekly_activity_patterns AS
SELECT 
  EXTRACT(DOW FROM activity_date) as day_of_week,
  CASE EXTRACT(DOW FROM activity_date)
    WHEN 0 THEN 'Dom'
    WHEN 1 THEN 'Seg'
    WHEN 2 THEN 'Ter'
    WHEN 3 THEN 'Qua'
    WHEN 4 THEN 'Qui'
    WHEN 5 THEN 'Sex'
    WHEN 6 THEN 'Sáb'
  END as day,
  COUNT(*) as atividade
FROM (
  SELECT created_at as activity_date FROM public.progress WHERE created_at >= NOW() - INTERVAL '30 days'
  UNION ALL
  SELECT created_at as activity_date FROM public.learning_progress WHERE created_at >= NOW() - INTERVAL '30 days'
  UNION ALL
  SELECT created_at as activity_date FROM public.forum_topics WHERE created_at >= NOW() - INTERVAL '30 days'
  UNION ALL
  SELECT created_at as activity_date FROM public.notifications WHERE created_at >= NOW() - INTERVAL '30 days'
) activities
GROUP BY EXTRACT(DOW FROM activity_date)
ORDER BY day_of_week;

-- 4. VIEW: Métricas de performance de soluções
CREATE OR REPLACE VIEW public.solution_performance_metrics AS
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
  END as completion_rate,
  s.created_at,
  s.updated_at
FROM public.solutions s
LEFT JOIN public.progress pr ON s.id = pr.solution_id
WHERE s.published = true
GROUP BY s.id, s.title, s.category, s.difficulty, s.created_at, s.updated_at
ORDER BY total_implementations DESC;

-- 5. VIEW: Métricas de performance de cursos
CREATE OR REPLACE VIEW public.course_performance_metrics AS
SELECT 
  lc.id as course_id,
  lc.title as course_title,
  COUNT(DISTINCT ll.id) as total_lessons,
  COUNT(DISTINCT lp.user_id) as enrolled_users,
  COUNT(lp.id) FILTER (WHERE lp.progress_percentage = 100) as completed_lessons_count,
  COALESCE(AVG(lp.progress_percentage), 0)::integer as avg_progress_percentage,
  lc.created_at,
  lc.updated_at
FROM public.learning_courses lc
LEFT JOIN public.learning_modules lm ON lc.id = lm.course_id
LEFT JOIN public.learning_lessons ll ON lm.id = ll.module_id AND ll.published = true
LEFT JOIN public.learning_progress lp ON ll.id = lp.lesson_id
WHERE lc.published = true
GROUP BY lc.id, lc.title, lc.created_at, lc.updated_at
ORDER BY enrolled_users DESC;

-- 6. VIEW: Analytics consolidado do overview
CREATE OR REPLACE VIEW public.admin_analytics_overview AS
SELECT 
  -- Contadores principais
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.solutions WHERE published = true) as total_solutions,
  (SELECT COUNT(*) FROM public.learning_courses WHERE published = true) as total_courses,
  (SELECT COUNT(*) FROM public.progress WHERE is_completed = true) as completed_implementations,
  (SELECT COUNT(*) FROM public.progress WHERE is_completed = false) as active_implementations,
  (SELECT COUNT(*) FROM public.learning_progress WHERE progress_percentage = 100) as completed_lessons,
  (SELECT COUNT(*) FROM public.forum_topics) as forum_topics,
  
  -- Crescimento recente
  (SELECT COUNT(*) FROM public.profiles WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM public.progress WHERE created_at >= NOW() - INTERVAL '30 days') as new_implementations_30d,
  
  -- Usuários ativos
  (SELECT COUNT(DISTINCT user_id) FROM public.progress WHERE last_activity >= NOW() - INTERVAL '7 days') as active_users_7d,
  (SELECT COUNT(DISTINCT user_id) FROM public.learning_progress WHERE updated_at >= NOW() - INTERVAL '7 days') as active_learners_7d,
  
  -- Taxa de conclusão geral
  CASE 
    WHEN (SELECT COUNT(*) FROM public.progress) > 0 
    THEN ROUND((SELECT COUNT(*) FROM public.progress WHERE is_completed = true)::numeric / (SELECT COUNT(*) FROM public.progress)::numeric * 100, 2)
    ELSE 0
  END as overall_completion_rate;

-- Log da criação das views de sincronização
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details
) VALUES (
  NULL,
  'system_event',
  'analytics_sync_views_created',
  jsonb_build_object(
    'views_created', ARRAY[
      'user_growth_by_date',
      'user_segmentation_analytics',
      'weekly_activity_patterns',
      'solution_performance_metrics',
      'course_performance_metrics',
      'admin_analytics_overview'
    ],
    'purpose', 'Sincronização completa entre front-end e back-end analytics',
    'created_at', NOW()
  )
);
