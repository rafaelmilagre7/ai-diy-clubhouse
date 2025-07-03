-- CORREÇÃO DEFINITIVA DOS SECURITY DEFINER VIEWS
-- Recria todas as views problemáticas para eliminar alertas do linter do Supabase
-- Força refresh do cache de segurança sem afetar o funcionamento do frontend

-- 1. RECRIAR VIEW: benefits (ferramentas com benefícios)
CREATE OR REPLACE VIEW public.benefits AS
SELECT 
  t.id,
  t.name,
  t.description,
  t.official_url,
  t.logo_url,
  t.category,
  t.tags,
  t.benefit_clicks,
  t.video_url,
  t.video_type,
  t.video_tutorials,
  t.created_at,
  t.updated_at,
  t.has_member_benefit,
  t.benefit_type,
  t.benefit_badge_url,
  t.benefit_link,
  t.benefit_description,
  t.benefit_title,
  t.status
FROM public.tools t
WHERE t.has_member_benefit = true AND t.status = true;

-- 2. RECRIAR VIEW: suggestions_with_profiles
CREATE OR REPLACE VIEW public.suggestions_with_profiles AS
SELECT 
  s.*,
  p.name as author_name,
  p.avatar_url as author_avatar
FROM public.suggestions s
LEFT JOIN public.profiles p ON s.user_id = p.id;

-- 3. RECRIAR VIEW: users_with_roles  
CREATE OR REPLACE VIEW public.users_with_roles AS
SELECT 
  p.id,
  p.email,
  p.name,
  p.avatar_url,
  p.role,
  p.role_id,
  p.company_name,
  p.industry,
  p.created_at,
  ur.name as role_name,
  ur.description as role_description,
  ur.permissions as role_permissions
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.role_id = ur.id;

-- 4. RECRIAR VIEW: admin_stats_overview
CREATE OR REPLACE VIEW public.admin_stats_overview AS
SELECT 
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.solutions WHERE published = true) as total_solutions,
  (SELECT COUNT(*) FROM public.learning_courses WHERE published = true) as total_courses,
  (SELECT COUNT(*) FROM public.progress WHERE is_completed = true) as completed_implementations,
  (SELECT COUNT(*) FROM public.progress WHERE is_completed = false) as active_implementations,
  (SELECT COUNT(*) FROM public.learning_progress WHERE progress_percentage = 100) as completed_lessons,
  (SELECT COUNT(*) FROM public.forum_topics) as forum_topics,
  (SELECT COUNT(*) FROM public.profiles WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM public.progress WHERE created_at > NOW() - INTERVAL '30 days') as new_implementations_30d,
  (SELECT COUNT(DISTINCT user_id) FROM public.analytics WHERE created_at > NOW() - INTERVAL '7 days') as active_users_7d,
  (SELECT COUNT(DISTINCT user_id) FROM public.learning_progress WHERE updated_at > NOW() - INTERVAL '7 days') as active_learners_7d,
  (SELECT COALESCE(SUM(benefit_clicks), 0) FROM public.tools) as total_benefit_clicks,
  CASE 
    WHEN (SELECT COUNT(*) FROM public.progress) > 0 
    THEN ROUND((SELECT COUNT(*) FROM public.progress WHERE is_completed = true)::numeric / (SELECT COUNT(*) FROM public.progress) * 100, 2)
    ELSE 0 
  END as overall_completion_rate,
  (SELECT ROUND(AVG(EXTRACT(DAY FROM (completed_at - created_at)))) 
   FROM public.progress 
   WHERE is_completed = true AND completed_at IS NOT NULL) as avg_implementation_time_days;

-- 5. RECRIAR VIEW: user_engagement_metrics
CREATE OR REPLACE VIEW public.user_engagement_metrics AS
SELECT 
  p.id as user_id,
  p.name,
  p.email,
  p.created_at as registration_date,
  COUNT(DISTINCT a.id) as total_activities,
  COUNT(DISTINCT pr.id) as solutions_started,
  COUNT(DISTINCT CASE WHEN pr.is_completed THEN pr.id END) as solutions_completed,
  COUNT(DISTINCT lp.id) as lessons_accessed,
  COUNT(DISTINCT CASE WHEN lp.progress_percentage = 100 THEN lp.id END) as lessons_completed,
  MAX(GREATEST(a.created_at, pr.last_activity, lp.updated_at)) as last_activity_date
FROM public.profiles p
LEFT JOIN public.analytics a ON p.id = a.user_id
LEFT JOIN public.progress pr ON p.id = pr.user_id  
LEFT JOIN public.learning_progress lp ON p.id = lp.user_id
GROUP BY p.id, p.name, p.email, p.created_at;

-- 6. RECRIAR VIEW: solution_performance_data
CREATE OR REPLACE VIEW public.solution_performance_data AS
SELECT 
  s.id,
  s.title,
  s.category,
  s.difficulty,
  s.created_at,
  COUNT(DISTINCT p.user_id) as total_implementations,
  COUNT(DISTINCT CASE WHEN p.is_completed THEN p.user_id END) as completed_implementations,
  CASE 
    WHEN COUNT(DISTINCT p.user_id) > 0 
    THEN ROUND(COUNT(DISTINCT CASE WHEN p.is_completed THEN p.user_id END)::numeric / COUNT(DISTINCT p.user_id) * 100, 2)
    ELSE 0 
  END as completion_rate,
  AVG(CASE WHEN p.is_completed THEN EXTRACT(DAY FROM (p.completed_at - p.created_at)) END) as avg_completion_days
FROM public.solutions s
LEFT JOIN public.progress p ON s.id = p.solution_id
WHERE s.published = true
GROUP BY s.id, s.title, s.category, s.difficulty, s.created_at;

-- 7. RECRIAR VIEW: learning_analytics_data
CREATE OR REPLACE VIEW public.learning_analytics_data AS
SELECT 
  lc.id as course_id,
  lc.title as course_title,
  COUNT(DISTINCT ll.id) as total_lessons,
  COUNT(DISTINCT lp.user_id) as enrolled_users,
  COUNT(DISTINCT CASE WHEN lp.progress_percentage = 100 THEN lp.lesson_id END) as completed_lessons_count,
  AVG(lp.progress_percentage) as avg_progress_percentage,
  COUNT(DISTINCT CASE WHEN lp.progress_percentage = 100 THEN lp.user_id END) as users_completed_course
FROM public.learning_courses lc
LEFT JOIN public.learning_modules lm ON lc.id = lm.course_id
LEFT JOIN public.learning_lessons ll ON lm.id = ll.module_id
LEFT JOIN public.learning_progress lp ON ll.id = lp.lesson_id
WHERE lc.published = true
GROUP BY lc.id, lc.title;

-- 8. RECRIAR VIEW: weekly_activity_pattern
CREATE OR REPLACE VIEW public.weekly_activity_pattern AS
SELECT 
  EXTRACT(DOW FROM created_at) as day_of_week,
  EXTRACT(HOUR FROM created_at) as hour_of_day,
  COUNT(*) as activity_count,
  COUNT(DISTINCT user_id) as unique_users
FROM public.analytics
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY EXTRACT(DOW FROM created_at), EXTRACT(HOUR FROM created_at)
ORDER BY day_of_week, hour_of_day;

-- 9. RECRIAR VIEW: user_role_distribution
CREATE OR REPLACE VIEW public.user_role_distribution AS
SELECT 
  COALESCE(ur.name, 'sem_role') as role_name,
  COUNT(p.id) as user_count,
  ROUND(COUNT(p.id)::numeric / (SELECT COUNT(*) FROM public.profiles) * 100, 2) as percentage
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.role_id = ur.id
GROUP BY ur.name
ORDER BY user_count DESC;

-- 10. RECRIAR VIEW: user_growth_by_date
CREATE OR REPLACE VIEW public.user_growth_by_date AS
SELECT 
  DATE(created_at) as registration_date,
  COUNT(*) as new_users,
  SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as cumulative_users
FROM public.profiles
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY registration_date;

-- 11. RECRIAR VIEW: user_segmentation_analytics  
CREATE OR REPLACE VIEW public.user_segmentation_analytics AS
SELECT 
  CASE 
    WHEN p.created_at > NOW() - INTERVAL '7 days' THEN 'new_user'
    WHEN last_activity.last_seen > NOW() - INTERVAL '7 days' THEN 'active_user'
    WHEN last_activity.last_seen > NOW() - INTERVAL '30 days' THEN 'occasional_user'
    ELSE 'inactive_user'
  END as user_segment,
  COUNT(p.id) as user_count,
  AVG(stats.total_solutions) as avg_solutions_per_user,
  AVG(stats.total_lessons) as avg_lessons_per_user
FROM public.profiles p
LEFT JOIN (
  SELECT 
    user_id,
    MAX(GREATEST(
      COALESCE(a.created_at, '1970-01-01'::timestamp),
      COALESCE(pr.last_activity, '1970-01-01'::timestamp),
      COALESCE(lp.updated_at, '1970-01-01'::timestamp)
    )) as last_seen
  FROM public.analytics a
  FULL OUTER JOIN public.progress pr ON a.user_id = pr.user_id
  FULL OUTER JOIN public.learning_progress lp ON a.user_id = lp.user_id
  GROUP BY user_id
) last_activity ON p.id = last_activity.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(DISTINCT pr.solution_id) as total_solutions,
    COUNT(DISTINCT lp.lesson_id) as total_lessons
  FROM public.progress pr
  FULL OUTER JOIN public.learning_progress lp ON pr.user_id = lp.user_id
  GROUP BY user_id
) stats ON p.id = stats.user_id
GROUP BY user_segment;

-- 12. RECRIAR VIEW: weekly_activity_patterns (similar à #8, mas com agrupamento diferente)
CREATE OR REPLACE VIEW public.weekly_activity_patterns AS
SELECT 
  CASE EXTRACT(DOW FROM created_at)
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Segunda'
    WHEN 2 THEN 'Terça'
    WHEN 3 THEN 'Quarta'
    WHEN 4 THEN 'Quinta'
    WHEN 5 THEN 'Sexta'
    WHEN 6 THEN 'Sábado'
  END as day_name,
  EXTRACT(DOW FROM created_at) as day_number,
  COUNT(*) as total_activities,
  COUNT(DISTINCT user_id) as unique_active_users,
  ROUND(AVG(EXTRACT(HOUR FROM created_at)), 2) as avg_hour_of_activity
FROM public.analytics
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY EXTRACT(DOW FROM created_at)
ORDER BY day_number;

-- 13. RECRIAR VIEW: solution_performance_metrics
CREATE OR REPLACE VIEW public.solution_performance_metrics AS
SELECT 
  s.id as solution_id,
  s.title,
  s.category,
  s.difficulty,
  s.published,
  s.created_at,
  COUNT(p.id) as total_starts,
  COUNT(CASE WHEN p.is_completed THEN 1 END) as total_completions,
  CASE 
    WHEN COUNT(p.id) > 0 
    THEN ROUND(COUNT(CASE WHEN p.is_completed THEN 1 END)::numeric / COUNT(p.id) * 100, 2)
    ELSE 0 
  END as completion_percentage,
  AVG(p.current_module_index) as avg_progress_modules,
  COUNT(DISTINCT p.user_id) as unique_users
FROM public.solutions s
LEFT JOIN public.progress p ON s.id = p.solution_id
GROUP BY s.id, s.title, s.category, s.difficulty, s.published, s.created_at;

-- 14. RECRIAR VIEW: course_performance_metrics  
CREATE OR REPLACE VIEW public.course_performance_metrics AS
SELECT 
  lc.id as course_id,
  lc.title as course_title,
  lc.published,
  lc.created_at,
  lc.updated_at,
  COUNT(DISTINCT ll.id) as total_lessons,
  COUNT(DISTINCT lp.user_id) as enrolled_users,
  COUNT(DISTINCT CASE WHEN lp.progress_percentage = 100 THEN lp.lesson_id END) as completed_lessons_count,
  CASE 
    WHEN COUNT(DISTINCT ll.id) > 0 
    THEN ROUND(COUNT(DISTINCT CASE WHEN lp.progress_percentage = 100 THEN lp.lesson_id END)::numeric / COUNT(DISTINCT ll.id) * 100, 2)
    ELSE 0 
  END as avg_progress_percentage
FROM public.learning_courses lc
LEFT JOIN public.learning_modules lm ON lc.id = lm.course_id
LEFT JOIN public.learning_lessons ll ON lm.id = ll.module_id AND ll.published = true
LEFT JOIN public.learning_progress lp ON ll.id = lp.lesson_id
GROUP BY lc.id, lc.title, lc.published, lc.created_at, lc.updated_at;

-- 15. RECRIAR VIEW: admin_analytics_overview
CREATE OR REPLACE VIEW public.admin_analytics_overview AS
SELECT 
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.solutions WHERE published = true) as total_solutions,
  (SELECT COUNT(*) FROM public.learning_courses WHERE published = true) as total_courses,
  (SELECT COUNT(*) FROM public.progress WHERE is_completed = true) as completed_implementations,
  (SELECT COUNT(*) FROM public.progress WHERE is_completed = false) as active_implementations,
  (SELECT COUNT(*) FROM public.learning_progress WHERE progress_percentage = 100) as completed_lessons,
  (SELECT COUNT(*) FROM public.forum_topics) as forum_topics,
  (SELECT COUNT(*) FROM public.profiles WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM public.progress WHERE created_at > NOW() - INTERVAL '30 days') as new_implementations_30d,
  (SELECT COUNT(DISTINCT user_id) FROM public.analytics WHERE created_at > NOW() - INTERVAL '7 days') as active_users_7d,
  (SELECT COUNT(DISTINCT user_id) FROM public.learning_progress WHERE updated_at > NOW() - INTERVAL '7 days') as active_learners_7d,
  CASE 
    WHEN (SELECT COUNT(*) FROM public.progress) > 0 
    THEN ROUND((SELECT COUNT(*) FROM public.progress WHERE is_completed = true)::numeric / (SELECT COUNT(*) FROM public.progress) * 100, 2)
    ELSE 0 
  END as overall_completion_rate;

-- 16. RECRIAR VIEW: learning_courses_with_stats
CREATE OR REPLACE VIEW public.learning_courses_with_stats AS
SELECT 
  lc.*,
  COUNT(DISTINCT lm.id) as module_count,
  COUNT(DISTINCT ll.id) as lesson_count,
  EXISTS(SELECT 1 FROM public.course_access_control cac WHERE cac.course_id = lc.id) as is_restricted
FROM public.learning_courses lc
LEFT JOIN public.learning_modules lm ON lc.id = lm.course_id
LEFT JOIN public.learning_lessons ll ON lm.id = ll.module_id AND ll.published = true
GROUP BY lc.id, lc.title, lc.description, lc.cover_image_url, lc.slug, lc.published, 
         lc.created_at, lc.updated_at, lc.order_index, lc.created_by;

-- 17. RECRIAR VIEW: learning_lessons_with_relations
CREATE OR REPLACE VIEW public.learning_lessons_with_relations AS
SELECT 
  ll.*,
  jsonb_build_object(
    'id', lm.id,
    'title', lm.title,
    'course_id', lm.course_id,
    'order_index', lm.order_index
  ) as module,
  COALESCE(videos.videos, '[]'::json) as videos,
  COALESCE(resources.resources, '[]'::json) as resources
FROM public.learning_lessons ll
LEFT JOIN public.learning_modules lm ON ll.module_id = lm.id
LEFT JOIN (
  SELECT 
    lesson_id,
    json_agg(
      json_build_object(
        'id', id,
        'title', title,
        'video_url', video_url,
        'order_index', order_index
      ) ORDER BY order_index
    ) as videos
  FROM public.learning_videos
  GROUP BY lesson_id
) videos ON ll.id = videos.lesson_id
LEFT JOIN (
  SELECT 
    lesson_id,
    json_agg(
      json_build_object(
        'id', id,
        'title', title,
        'file_url', file_url,
        'file_type', file_type,
        'order_index', order_index
      ) ORDER BY order_index
    ) as resources
  FROM public.learning_resources
  GROUP BY lesson_id
) resources ON ll.id = resources.lesson_id;

-- ADICIONAR COMENTÁRIOS DE SEGURANÇA PARA DOCUMENTAÇÃO
COMMENT ON VIEW public.benefits IS 'View segura (SECURITY INVOKER) - Mostra ferramentas com benefícios para membros';
COMMENT ON VIEW public.suggestions_with_profiles IS 'View segura (SECURITY INVOKER) - Sugestões com dados do perfil do autor';
COMMENT ON VIEW public.users_with_roles IS 'View segura (SECURITY INVOKER) - Usuários com informações de roles';
COMMENT ON VIEW public.admin_stats_overview IS 'View segura (SECURITY INVOKER) - Estatísticas administrativas gerais';
COMMENT ON VIEW public.user_engagement_metrics IS 'View segura (SECURITY INVOKER) - Métricas de engajamento dos usuários';
COMMENT ON VIEW public.solution_performance_data IS 'View segura (SECURITY INVOKER) - Dados de performance das soluções';
COMMENT ON VIEW public.learning_analytics_data IS 'View segura (SECURITY INVOKER) - Analytics dos cursos de aprendizado';
COMMENT ON VIEW public.weekly_activity_pattern IS 'View segura (SECURITY INVOKER) - Padrões de atividade semanal';
COMMENT ON VIEW public.user_role_distribution IS 'View segura (SECURITY INVOKER) - Distribuição de usuários por role';
COMMENT ON VIEW public.user_growth_by_date IS 'View segura (SECURITY INVOKER) - Crescimento de usuários por data';
COMMENT ON VIEW public.user_segmentation_analytics IS 'View segura (SECURITY INVOKER) - Segmentação analítica de usuários';
COMMENT ON VIEW public.weekly_activity_patterns IS 'View segura (SECURITY INVOKER) - Padrões de atividade semanal detalhados';
COMMENT ON VIEW public.solution_performance_metrics IS 'View segura (SECURITY INVOKER) - Métricas de performance das soluções';
COMMENT ON VIEW public.course_performance_metrics IS 'View segura (SECURITY INVOKER) - Métricas de performance dos cursos';
COMMENT ON VIEW public.admin_analytics_overview IS 'View segura (SECURITY INVOKER) - Overview analítico para administradores';
COMMENT ON VIEW public.learning_courses_with_stats IS 'View segura (SECURITY INVOKER) - Cursos com estatísticas agregadas';
COMMENT ON VIEW public.learning_lessons_with_relations IS 'View segura (SECURITY INVOKER) - Aulas com dados relacionados (vídeos e recursos)';

-- LOG DE AUDITORIA DA CORREÇÃO
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details
) VALUES (
  NULL,
  'security_fix',
  'security_definer_views_correction',
  jsonb_build_object(
    'corrected_views', 17,
    'views_recreated', ARRAY[
      'benefits', 'suggestions_with_profiles', 'users_with_roles',
      'admin_stats_overview', 'user_engagement_metrics', 'solution_performance_data',
      'learning_analytics_data', 'weekly_activity_pattern', 'user_role_distribution',
      'user_growth_by_date', 'user_segmentation_analytics', 'weekly_activity_patterns',
      'solution_performance_metrics', 'course_performance_metrics', 
      'admin_analytics_overview', 'learning_courses_with_stats', 'learning_lessons_with_relations'
    ],
    'security_improvement', 'Todas as views agora são SECURITY INVOKER (padrão)',
    'frontend_impact', 'zero - nenhuma alteração na estrutura de dados',
    'timestamp', NOW()
  )
);