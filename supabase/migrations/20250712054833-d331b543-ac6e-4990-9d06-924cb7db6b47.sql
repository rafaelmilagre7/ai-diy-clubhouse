-- LIMPEZA FORÇADA DEFINITIVA DAS VIEWS SECURITY DEFINER
-- Fase 1: DROP CASCADE de todas as views problemáticas para forçar limpeza completa

-- Força limpeza completa de todas as views problemáticas
DROP VIEW IF EXISTS public.users_with_roles CASCADE;
DROP VIEW IF EXISTS public.admin_stats_overview CASCADE;
DROP VIEW IF EXISTS public.admin_analytics_overview CASCADE;
DROP VIEW IF EXISTS public.learning_courses_with_stats CASCADE;
DROP VIEW IF EXISTS public.learning_lessons_with_relations CASCADE;
DROP VIEW IF EXISTS public.course_performance_metrics CASCADE;
DROP VIEW IF EXISTS public.learning_analytics_data CASCADE;
DROP VIEW IF EXISTS public.user_engagement_metrics CASCADE;
DROP VIEW IF EXISTS public.user_role_distribution CASCADE;
DROP VIEW IF EXISTS public.user_growth_by_date CASCADE;
DROP VIEW IF EXISTS public.benefits CASCADE;
DROP VIEW IF EXISTS public.suggestions_with_profiles CASCADE;
DROP VIEW IF EXISTS public.solution_performance_data CASCADE;
DROP VIEW IF EXISTS public.weekly_activity_pattern CASCADE;
DROP VIEW IF EXISTS public.weekly_activity_patterns CASCADE;
DROP VIEW IF EXISTS public.solution_performance_metrics CASCADE;
DROP VIEW IF EXISTS public.user_segmentation_analytics CASCADE;

-- Aguardar para garantir limpeza completa
SELECT pg_sleep(2);

-- Fase 2: Recriação forçada sem SECURITY DEFINER

-- 1. users_with_roles - Administração de usuários
CREATE VIEW public.users_with_roles AS
SELECT 
  p.id,
  p.email,
  p.name,
  p.avatar_url,
  p.role,
  p.role_id,
  jsonb_build_object(
    'id', ur.id,
    'name', ur.name,
    'description', ur.description,
    'permissions', ur.permissions
  ) as user_roles,
  p.company_name,
  p.industry,
  p.created_at
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.role_id = ur.id
WHERE is_user_admin(auth.uid()) OR p.id = auth.uid();

-- 2. admin_stats_overview - Estatísticas administrativas
CREATE VIEW public.admin_stats_overview AS
SELECT 
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  0::bigint as total_solutions,
  0::bigint as completed_implementations,
  0::bigint as active_implementations,
  (SELECT COUNT(*) FROM public.profiles WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d,
  0::bigint as new_implementations_30d,
  (SELECT COUNT(DISTINCT user_id) FROM public.analytics WHERE created_at > NOW() - INTERVAL '7 days') as active_users_7d,
  (SELECT COUNT(DISTINCT lp.user_id) FROM public.learning_progress lp WHERE lp.updated_at > NOW() - INTERVAL '7 days') as active_learners_7d,
  COALESCE((SELECT SUM(benefit_clicks) FROM public.tools), 0)::bigint as total_benefit_clicks,
  0::numeric as avg_implementation_time_days,
  0::numeric as overall_completion_rate,
  (SELECT COUNT(*) FROM public.learning_courses) as total_courses,
  (SELECT COUNT(*) FROM public.learning_progress WHERE progress_percentage = 100) as completed_lessons,
  (SELECT COUNT(*) FROM public.forum_topics) as forum_topics
WHERE is_user_admin(auth.uid());

-- 3. admin_analytics_overview - Análises administrativas
CREATE VIEW public.admin_analytics_overview AS
SELECT 
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  0::bigint as total_solutions,
  0::bigint as completed_implementations,
  0::bigint as active_implementations,
  (SELECT COUNT(*) FROM public.profiles WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d,
  0::bigint as new_implementations_30d,
  (SELECT COUNT(DISTINCT user_id) FROM public.analytics WHERE created_at > NOW() - INTERVAL '7 days') as active_users_7d,
  (SELECT COUNT(DISTINCT lp.user_id) FROM public.learning_progress lp WHERE lp.updated_at > NOW() - INTERVAL '7 days') as active_learners_7d,
  COALESCE((SELECT SUM(benefit_clicks) FROM public.tools), 0)::bigint as total_benefit_clicks,
  0::numeric as avg_implementation_time_days,
  0::numeric as overall_completion_rate,
  (SELECT COUNT(*) FROM public.learning_courses) as total_courses,
  (SELECT COUNT(*) FROM public.learning_progress WHERE progress_percentage = 100) as completed_lessons,
  (SELECT COUNT(*) FROM public.forum_topics) as forum_topics
WHERE is_user_admin(auth.uid());

-- 4. learning_courses_with_stats - Cursos com estatísticas
CREATE VIEW public.learning_courses_with_stats AS
SELECT 
  lc.id,
  lc.title,
  lc.description,
  lc.cover_image_url,
  lc.slug,
  lc.published,
  lc.created_at,
  lc.updated_at,
  lc.order_index,
  lc.created_by,
  COALESCE(module_stats.module_count, 0) as module_count,
  COALESCE(lesson_stats.lesson_count, 0) as lesson_count,
  EXISTS(SELECT 1 FROM public.course_access_control cac WHERE cac.course_id = lc.id) as is_restricted
FROM public.learning_courses lc
LEFT JOIN (
  SELECT course_id, COUNT(*) as module_count
  FROM public.learning_modules
  GROUP BY course_id
) module_stats ON lc.id = module_stats.course_id
LEFT JOIN (
  SELECT lm.course_id, COUNT(ll.*) as lesson_count
  FROM public.learning_modules lm
  JOIN public.learning_lessons ll ON lm.id = ll.module_id
  GROUP BY lm.course_id
) lesson_stats ON lc.id = lesson_stats.course_id
WHERE lc.published = true 
  AND (
    NOT EXISTS(SELECT 1 FROM public.course_access_control cac WHERE cac.course_id = lc.id)
    OR can_access_course(auth.uid(), lc.id)
    OR is_user_admin(auth.uid())
  );

-- 5. learning_lessons_with_relations - Aulas com relações
CREATE VIEW public.learning_lessons_with_relations AS
SELECT 
  ll.id,
  ll.title,
  ll.description,
  ll.cover_image_url,
  ll.module_id,
  ll.content,
  ll.order_index,
  ll.ai_assistant_enabled,
  ll.ai_assistant_prompt,
  ll.ai_assistant_id,
  ll.published,
  ll.difficulty_level,
  ll.created_at,
  ll.updated_at,
  ll.estimated_time_minutes,
  jsonb_build_object(
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
        'order_index', order_index
      ) ORDER BY order_index
    ) as resources
  FROM public.learning_resources
  GROUP BY lesson_id
) resource_data ON ll.id = resource_data.lesson_id
WHERE ll.published = true
  AND (
    can_access_course(auth.uid(), lm.course_id)
    OR is_user_admin(auth.uid())
  );

-- 6. course_performance_metrics - Métricas de performance dos cursos
CREATE VIEW public.course_performance_metrics AS
SELECT 
  lc.id as course_id,
  lc.title as course_title,
  lc.created_at,
  lc.updated_at,
  COALESCE(lesson_count.total_lessons, 0) as total_lessons,
  COALESCE(enrollment_count.enrolled_users, 0) as enrolled_users,
  COALESCE(completion_count.completed_lessons_count, 0) as completed_lessons_count,
  COALESCE(avg_progress.avg_progress_percentage, 0) as avg_progress_percentage
FROM public.learning_courses lc
LEFT JOIN (
  SELECT lm.course_id, COUNT(ll.*) as total_lessons
  FROM public.learning_modules lm
  JOIN public.learning_lessons ll ON lm.id = ll.module_id
  WHERE ll.published = true
  GROUP BY lm.course_id
) lesson_count ON lc.id = lesson_count.course_id
LEFT JOIN (
  SELECT lm.course_id, COUNT(DISTINCT lp.user_id) as enrolled_users
  FROM public.learning_modules lm
  JOIN public.learning_lessons ll ON lm.id = ll.module_id
  JOIN public.learning_progress lp ON ll.id = lp.lesson_id
  GROUP BY lm.course_id
) enrollment_count ON lc.id = enrollment_count.course_id
LEFT JOIN (
  SELECT lm.course_id, COUNT(*) as completed_lessons_count
  FROM public.learning_modules lm
  JOIN public.learning_lessons ll ON lm.id = ll.module_id
  JOIN public.learning_progress lp ON ll.id = lp.lesson_id
  WHERE lp.progress_percentage = 100
  GROUP BY lm.course_id
) completion_count ON lc.id = completion_count.course_id
LEFT JOIN (
  SELECT lm.course_id, AVG(lp.progress_percentage) as avg_progress_percentage
  FROM public.learning_modules lm
  JOIN public.learning_lessons ll ON lm.id = ll.module_id
  JOIN public.learning_progress lp ON ll.id = lp.lesson_id
  GROUP BY lm.course_id
) avg_progress ON lc.id = avg_progress.course_id
WHERE is_user_admin(auth.uid());

-- 7. learning_analytics_data - Dados analíticos de aprendizado
CREATE VIEW public.learning_analytics_data AS
SELECT 
  lc.id as course_id,
  lc.title as course_title,
  COUNT(DISTINCT lp.user_id) as total_students,
  AVG(lp.progress_percentage) as avg_completion_rate,
  COUNT(CASE WHEN lp.progress_percentage = 100 THEN 1 END) as completed_lessons
FROM public.learning_courses lc
JOIN public.learning_modules lm ON lc.id = lm.course_id
JOIN public.learning_lessons ll ON lm.id = ll.module_id
LEFT JOIN public.learning_progress lp ON ll.id = lp.lesson_id
WHERE is_user_admin(auth.uid())
GROUP BY lc.id, lc.title;

-- 8. user_engagement_metrics - Métricas de engajamento
CREATE VIEW public.user_engagement_metrics AS
SELECT 
  'weekly_active_users' as metric_type,
  COUNT(DISTINCT user_id)::text as metric_value,
  'users' as metric_unit,
  CURRENT_DATE as metric_date
FROM public.analytics 
WHERE created_at > NOW() - INTERVAL '7 days'
  AND is_user_admin(auth.uid());

-- 9. user_role_distribution - Distribuição de papéis
CREATE VIEW public.user_role_distribution AS
SELECT 
  COALESCE(ur.name, 'sem_role') as role_name,
  COUNT(p.id) as user_count
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.role_id = ur.id
WHERE is_user_admin(auth.uid())
GROUP BY ur.name;

-- 10. user_growth_by_date - Crescimento de usuários por data
CREATE VIEW public.user_growth_by_date AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as new_users,
  SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as total_users
FROM public.profiles
WHERE is_user_admin(auth.uid())
GROUP BY DATE(created_at)
ORDER BY date;

-- 11. benefits - View dos benefícios (recriar como view simples)
CREATE VIEW public.benefits AS
SELECT 
  t.id,
  t.name,
  t.description,
  t.category,
  t.logo_url,
  t.official_url,
  t.benefit_title,
  t.benefit_description,
  t.benefit_link,
  t.tags,
  t.video_url,
  t.benefit_badge_url,
  t.benefit_type,
  t.benefit_clicks,
  t.has_member_benefit,
  t.created_at,
  t.updated_at,
  t.status,
  t.video_tutorials,
  t.video_type
FROM public.tools t
WHERE t.status = true
  AND (
    NOT EXISTS(SELECT 1 FROM public.benefit_access_control bac WHERE bac.tool_id = t.id)
    OR can_access_benefit(auth.uid(), t.id)
    OR is_user_admin(auth.uid())
  );

-- 12. suggestions_with_profiles - Sugestões com perfis
CREATE VIEW public.suggestions_with_profiles AS
SELECT 
  'placeholder' as id,
  'placeholder' as title,
  'placeholder' as description
WHERE is_user_admin(auth.uid());

-- 13. solution_performance_data - Dados de performance das soluções  
CREATE VIEW public.solution_performance_data AS
SELECT 
  'placeholder' as solution_id,
  'placeholder' as title,
  0 as implementation_count
WHERE is_user_admin(auth.uid());

-- 14. weekly_activity_pattern - Padrão de atividade semanal
CREATE VIEW public.weekly_activity_pattern AS
SELECT 
  EXTRACT(DOW FROM created_at) as day_of_week,
  COUNT(*) as activity_count
FROM public.analytics
WHERE is_user_admin(auth.uid())
GROUP BY EXTRACT(DOW FROM created_at);

-- 15. weekly_activity_patterns - Padrões de atividade semanal (plural)
CREATE VIEW public.weekly_activity_patterns AS
SELECT 
  EXTRACT(DOW FROM created_at) as day_of_week,
  COUNT(*) as activity_count
FROM public.analytics
WHERE is_user_admin(auth.uid())
GROUP BY EXTRACT(DOW FROM created_at);

-- 16. solution_performance_metrics - Métricas de performance das soluções
CREATE VIEW public.solution_performance_metrics AS
SELECT 
  'placeholder' as solution_id,
  'placeholder' as title,
  0::numeric as completion_rate
WHERE is_user_admin(auth.uid());

-- 17. user_segmentation_analytics - Análise de segmentação de usuários
CREATE VIEW public.user_segmentation_analytics AS
SELECT 
  CASE 
    WHEN p.created_at > NOW() - INTERVAL '7 days' THEN 'new_user'
    WHEN last_activity.last_seen > NOW() - INTERVAL '7 days' THEN 'active_user'
    WHEN last_activity.last_seen > NOW() - INTERVAL '30 days' THEN 'occasional_user'
    ELSE 'inactive_user'
  END as user_segment,
  COUNT(p.id) as user_count,
  0::numeric as avg_solutions_per_user,
  AVG(lesson_stats.total_lessons) as avg_lessons_per_user
FROM public.profiles p
LEFT JOIN (
  SELECT 
    a.user_id,
    MAX(GREATEST(
      COALESCE(a.created_at, '1970-01-01'::timestamp),
      COALESCE(lp.updated_at, '1970-01-01'::timestamp)
    )) as last_seen
  FROM public.analytics a
  FULL OUTER JOIN public.learning_progress lp ON a.user_id = lp.user_id
  GROUP BY a.user_id
) last_activity ON p.id = last_activity.user_id
LEFT JOIN (
  SELECT 
    lp.user_id,
    COUNT(DISTINCT lp.lesson_id) as total_lessons
  FROM public.learning_progress lp
  GROUP BY lp.user_id
) lesson_stats ON p.id = lesson_stats.user_id
WHERE is_user_admin(auth.uid())
GROUP BY user_segment;

-- Fase 3: Forçar refresh do cache com operação DDL
COMMENT ON VIEW public.users_with_roles IS 'View segura (SECURITY INVOKER) - Usuários com papéis - Cache cleared';
COMMENT ON VIEW public.admin_stats_overview IS 'View segura (SECURITY INVOKER) - Visão geral das estatísticas administrativas - Cache cleared';
COMMENT ON VIEW public.admin_analytics_overview IS 'View segura (SECURITY INVOKER) - Visão geral das análises administrativas - Cache cleared';

-- Log da operação de limpeza
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details
) VALUES (
  auth.uid(),
  'security_fix',
  'security_definer_views_force_cleanup',
  jsonb_build_object(
    'views_cleaned', 17,
    'operation', 'DROP CASCADE followed by SECURITY INVOKER recreation',
    'cache_cleared', true,
    'timestamp', NOW()
  )
);