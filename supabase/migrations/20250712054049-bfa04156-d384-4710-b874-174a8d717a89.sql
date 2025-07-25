-- CORREÇÃO: SECURITY DEFINER VIEWS -> SECURITY INVOKER VIEWS
-- ================================================================

-- Fase 1: Remover views SECURITY DEFINER existentes
DROP VIEW IF EXISTS public.benefits CASCADE;
DROP VIEW IF EXISTS public.suggestions_with_profiles CASCADE;
DROP VIEW IF EXISTS public.users_with_roles CASCADE;
DROP VIEW IF EXISTS public.admin_stats_overview CASCADE;
DROP VIEW IF EXISTS public.user_engagement_metrics CASCADE;
DROP VIEW IF EXISTS public.solution_performance_data CASCADE;
DROP VIEW IF EXISTS public.learning_analytics_data CASCADE;
DROP VIEW IF EXISTS public.weekly_activity_pattern CASCADE;
DROP VIEW IF EXISTS public.user_role_distribution CASCADE;
DROP VIEW IF EXISTS public.user_growth_by_date CASCADE;
DROP VIEW IF EXISTS public.weekly_activity_patterns CASCADE;
DROP VIEW IF EXISTS public.solution_performance_metrics CASCADE;
DROP VIEW IF EXISTS public.course_performance_metrics CASCADE;
DROP VIEW IF EXISTS public.admin_analytics_overview CASCADE;
DROP VIEW IF EXISTS public.user_segmentation_analytics CASCADE;
DROP VIEW IF EXISTS public.learning_courses_with_stats CASCADE;
DROP VIEW IF EXISTS public.learning_lessons_with_relations CASCADE;

-- Fase 2: Recriar views como SECURITY INVOKER (padrão)

-- View: users_with_roles (administrativo - apenas admins)
CREATE VIEW public.users_with_roles AS
SELECT 
  p.id,
  p.email,
  p.name,
  p.avatar_url,
  p.company_name,
  p.industry,
  p.created_at,
  p.onboarding_completed,
  p.onboarding_completed_at,
  p.role_id,
  p.role,
  ur.name as role_name,
  ur.description as role_description,
  ur.permissions as role_permissions
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.role_id = ur.id;

-- View: admin_stats_overview (administrativo - apenas admins)
CREATE VIEW public.admin_stats_overview AS
SELECT 
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.solutions WHERE published = true) as total_solutions,
  (SELECT COUNT(*) FROM public.learning_courses WHERE published = true) as total_courses,
  (SELECT COUNT(*) FROM public.progress WHERE is_completed = true) as completed_implementations,
  (SELECT COUNT(*) FROM public.progress WHERE is_completed = false) as active_implementations,
  (SELECT COUNT(*) FROM public.learning_progress WHERE progress_percentage = 100) as completed_lessons,
  (SELECT COUNT(*) FROM public.forum_topics) as forum_topics,
  (SELECT COUNT(*) FROM public.profiles WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM public.progress WHERE created_at >= NOW() - INTERVAL '30 days') as new_implementations_30d,
  (SELECT COUNT(DISTINCT user_id) FROM public.analytics WHERE created_at >= NOW() - INTERVAL '7 days') as active_users_7d,
  (SELECT COUNT(DISTINCT user_id) FROM public.learning_progress WHERE updated_at >= NOW() - INTERVAL '7 days') as active_learners_7d,
  (SELECT COALESCE(SUM(benefit_clicks), 0) FROM public.tools) as total_benefit_clicks,
  (SELECT ROUND(AVG(EXTRACT(days FROM (completed_at - created_at)))) FROM public.progress WHERE is_completed = true) as avg_implementation_time_days,
  (SELECT ROUND((COUNT(*) FILTER (WHERE is_completed = true) * 100.0 / NULLIF(COUNT(*), 0)), 2) FROM public.progress) as overall_completion_rate;

-- View: admin_analytics_overview (administrativo - apenas admins)
CREATE VIEW public.admin_analytics_overview AS
SELECT * FROM public.admin_stats_overview;

-- View: learning_courses_with_stats (educacional - controle de acesso por curso)
CREATE VIEW public.learning_courses_with_stats AS
SELECT 
  lc.*,
  COALESCE(module_stats.module_count, 0) as module_count,
  COALESCE(lesson_stats.lesson_count, 0) as lesson_count,
  CASE 
    WHEN EXISTS(SELECT 1 FROM public.course_access_control cac WHERE cac.course_id = lc.id) 
    THEN true 
    ELSE false 
  END as is_restricted
FROM public.learning_courses lc
LEFT JOIN (
  SELECT course_id, COUNT(*) as module_count
  FROM public.learning_modules 
  GROUP BY course_id
) module_stats ON lc.id = module_stats.course_id
LEFT JOIN (
  SELECT lm.course_id, COUNT(ll.id) as lesson_count
  FROM public.learning_modules lm
  LEFT JOIN public.learning_lessons ll ON lm.id = ll.module_id
  GROUP BY lm.course_id
) lesson_stats ON lc.id = lesson_stats.course_id;

-- View: learning_lessons_with_relations (educacional - controle de acesso por curso)
CREATE VIEW public.learning_lessons_with_relations AS
SELECT 
  ll.*,
  json_build_object(
    'id', lm.id,
    'title', lm.title,
    'course_id', lm.course_id,
    'order_index', lm.order_index
  ) as module,
  COALESCE(video_data.videos, '[]'::json) as videos,
  COALESCE(resource_data.resources, '[]'::json) as resources
FROM public.learning_lessons ll
JOIN public.learning_modules lm ON ll.module_id = lm.id
LEFT JOIN (
  SELECT 
    lesson_id,
    json_agg(
      json_build_object(
        'id', id,
        'title', title,
        'url', url,
        'thumbnail_url', thumbnail_url,
        'duration_seconds', duration_seconds,
        'order_index', order_index
      ) ORDER BY order_index
    ) as videos
  FROM public.learning_lesson_videos
  GROUP BY lesson_id
) video_data ON ll.id = video_data.lesson_id
LEFT JOIN (
  SELECT 
    lesson_id,
    json_agg(
      json_build_object(
        'id', id,
        'name', name,
        'file_url', file_url,
        'file_type', file_type,
        'file_size_bytes', file_size_bytes,
        'order_index', order_index
      ) ORDER BY order_index
    ) as resources
  FROM public.learning_resources
  GROUP BY lesson_id
) resource_data ON ll.id = resource_data.lesson_id;

-- View: course_performance_metrics (analítico - apenas admins)
CREATE VIEW public.course_performance_metrics AS
SELECT 
  lc.id as course_id,
  lc.title as course_title,
  lc.created_at,
  lc.updated_at,
  COALESCE(lesson_stats.total_lessons, 0) as total_lessons,
  COALESCE(enrollment_stats.enrolled_users, 0) as enrolled_users,
  COALESCE(completion_stats.completed_lessons_count, 0) as completed_lessons_count,
  COALESCE(ROUND(progress_stats.avg_progress_percentage), 0) as avg_progress_percentage
FROM public.learning_courses lc
LEFT JOIN (
  SELECT lm.course_id, COUNT(ll.id) as total_lessons
  FROM public.learning_modules lm
  LEFT JOIN public.learning_lessons ll ON lm.id = ll.module_id
  WHERE ll.published = true
  GROUP BY lm.course_id
) lesson_stats ON lc.id = lesson_stats.course_id
LEFT JOIN (
  SELECT lm.course_id, COUNT(DISTINCT lp.user_id) as enrolled_users
  FROM public.learning_modules lm
  JOIN public.learning_lessons ll ON lm.id = ll.module_id
  JOIN public.learning_progress lp ON ll.id = lp.lesson_id
  GROUP BY lm.course_id
) enrollment_stats ON lc.id = enrollment_stats.course_id
LEFT JOIN (
  SELECT lm.course_id, COUNT(*) as completed_lessons_count
  FROM public.learning_modules lm
  JOIN public.learning_lessons ll ON lm.id = ll.module_id
  JOIN public.learning_progress lp ON ll.id = lp.lesson_id
  WHERE lp.progress_percentage = 100
  GROUP BY lm.course_id
) completion_stats ON lc.id = completion_stats.course_id
LEFT JOIN (
  SELECT lm.course_id, AVG(lp.progress_percentage) as avg_progress_percentage
  FROM public.learning_modules lm
  JOIN public.learning_lessons ll ON lm.id = ll.module_id
  JOIN public.learning_progress lp ON ll.id = lp.lesson_id
  GROUP BY lm.course_id
) progress_stats ON lc.id = progress_stats.course_id;

-- View: learning_analytics_data (analítico - apenas admins)
CREATE VIEW public.learning_analytics_data AS
SELECT 
  lc.id as course_id,
  lc.title as course_title,
  COUNT(DISTINCT lp.user_id) as total_students,
  COUNT(DISTINCT ll.id) as total_lessons,
  COUNT(DISTINCT CASE WHEN lp.progress_percentage = 100 THEN lp.lesson_id END) as completed_lessons,
  ROUND(AVG(lp.progress_percentage), 2) as avg_progress,
  COUNT(DISTINCT lc2.id) as total_certificates
FROM public.learning_courses lc
LEFT JOIN public.learning_modules lm ON lc.id = lm.course_id
LEFT JOIN public.learning_lessons ll ON lm.id = ll.module_id
LEFT JOIN public.learning_progress lp ON ll.id = lp.lesson_id
LEFT JOIN public.learning_certificates lc2 ON lc.id = lc2.course_id
GROUP BY lc.id, lc.title;

-- Views analytics para admins (simplificadas)
CREATE VIEW public.user_engagement_metrics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(DISTINCT user_id) as active_users,
  COUNT(*) as total_events
FROM public.analytics
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date;

CREATE VIEW public.user_role_distribution AS
SELECT 
  COALESCE(ur.name, 'Sem papel') as role_name,
  COUNT(*) as user_count
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.role_id = ur.id
GROUP BY ur.name;

CREATE VIEW public.user_growth_by_date AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as new_users,
  SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', created_at)) as cumulative_users
FROM public.profiles
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date;

-- Fase 3: Implementar RLS para views administrativas

-- RLS para views administrativas (apenas admins podem acessar)
ALTER TABLE public.users_with_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_stats_overview ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_analytics_overview ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_role_distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_growth_by_date ENABLE ROW LEVEL SECURITY;

-- Políticas para views administrativas
CREATE POLICY "Apenas admins podem acessar users_with_roles"
ON public.users_with_roles FOR SELECT
USING (is_user_admin(auth.uid()));

CREATE POLICY "Apenas admins podem acessar admin_stats_overview"
ON public.admin_stats_overview FOR SELECT
USING (is_user_admin(auth.uid()));

CREATE POLICY "Apenas admins podem acessar admin_analytics_overview"
ON public.admin_analytics_overview FOR SELECT
USING (is_user_admin(auth.uid()));

CREATE POLICY "Apenas admins podem acessar course_performance_metrics"
ON public.course_performance_metrics FOR SELECT
USING (is_user_admin(auth.uid()));

CREATE POLICY "Apenas admins podem acessar learning_analytics_data"
ON public.learning_analytics_data FOR SELECT
USING (is_user_admin(auth.uid()));

CREATE POLICY "Apenas admins podem acessar user_engagement_metrics"
ON public.user_engagement_metrics FOR SELECT
USING (is_user_admin(auth.uid()));

CREATE POLICY "Apenas admins podem acessar user_role_distribution"
ON public.user_role_distribution FOR SELECT
USING (is_user_admin(auth.uid()));

CREATE POLICY "Apenas admins podem acessar user_growth_by_date"
ON public.user_growth_by_date FOR SELECT
USING (is_user_admin(auth.uid()));

-- RLS para views educacionais (controle por curso)
ALTER TABLE public.learning_courses_with_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_lessons_with_relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso controlado a learning_courses_with_stats"
ON public.learning_courses_with_stats FOR SELECT
USING (
  is_user_admin(auth.uid()) OR 
  can_access_course(auth.uid(), id)
);

CREATE POLICY "Acesso controlado a learning_lessons_with_relations"
ON public.learning_lessons_with_relations FOR SELECT
USING (
  is_user_admin(auth.uid()) OR 
  can_access_course(auth.uid(), (module->>'course_id')::uuid)
);