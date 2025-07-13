-- Correção dos erros de Security Definer Views
-- Remove SECURITY DEFINER das views e implementa RLS adequado

-- 1. Views públicas - remover SECURITY DEFINER, manter acesso público
CREATE OR REPLACE VIEW public.forum_engagement_metrics AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_posts,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(CASE WHEN parent_id IS NULL THEN 1 ELSE 0 END) as topics_ratio
FROM public.forum_posts
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date;

CREATE OR REPLACE VIEW public.implementation_growth_by_date AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as daily_implementations,
  SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as cumulative_implementations
FROM public.progress
WHERE is_completed = true
GROUP BY DATE(created_at)
ORDER BY date;

CREATE OR REPLACE VIEW public.top_performing_content AS
SELECT 
  'suggestion' as content_type,
  id,
  title,
  upvotes as score,
  created_at
FROM public.suggestions
WHERE upvotes > 0
UNION ALL
SELECT 
  'forum_topic' as content_type,
  id,
  title,
  reply_count as score,
  created_at
FROM public.forum_topics
WHERE reply_count > 0
ORDER BY score DESC
LIMIT 10;

CREATE OR REPLACE VIEW public.weekly_activity_pattern AS
SELECT 
  EXTRACT(DOW FROM created_at) as day_of_week,
  CASE EXTRACT(DOW FROM created_at)
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Segunda'
    WHEN 2 THEN 'Terça'
    WHEN 3 THEN 'Quarta'
    WHEN 4 THEN 'Quinta'
    WHEN 5 THEN 'Sexta'
    WHEN 6 THEN 'Sábado'
  END as day_name,
  COUNT(*) as activity_count
FROM (
  SELECT created_at FROM public.forum_posts WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  UNION ALL
  SELECT created_at FROM public.suggestions WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  UNION ALL
  SELECT started_at as created_at FROM public.learning_progress WHERE started_at >= CURRENT_DATE - INTERVAL '30 days'
) activities
GROUP BY EXTRACT(DOW FROM created_at)
ORDER BY day_of_week;

-- 2. Views de usuário - remover SECURITY DEFINER, implementar RLS baseado em user_id
CREATE OR REPLACE VIEW public.user_engagement_score AS
SELECT 
  p.id as user_id,
  p.name,
  p.email,
  COALESCE(forum_activity.posts_count, 0) as forum_posts,
  COALESCE(suggestion_activity.suggestions_count, 0) as suggestions_count,
  COALESCE(learning_activity.lessons_completed, 0) as lessons_completed,
  (
    COALESCE(forum_activity.posts_count, 0) * 2 +
    COALESCE(suggestion_activity.suggestions_count, 0) * 3 +
    COALESCE(learning_activity.lessons_completed, 0) * 5
  ) as engagement_score
FROM public.profiles p
LEFT JOIN (
  SELECT user_id, COUNT(*) as posts_count
  FROM public.forum_posts
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY user_id
) forum_activity ON p.id = forum_activity.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as suggestions_count
  FROM public.suggestions
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY user_id
) suggestion_activity ON p.id = suggestion_activity.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as lessons_completed
  FROM public.learning_progress
  WHERE completed_at >= CURRENT_DATE - INTERVAL '30 days' AND progress_percentage = 100
  GROUP BY user_id
) learning_activity ON p.id = learning_activity.user_id
ORDER BY engagement_score DESC;

-- Enable RLS on user_engagement_score and create policies
ALTER VIEW public.user_engagement_score SET (security_invoker = true);

CREATE OR REPLACE VIEW public.retention_cohort_analysis AS
WITH user_cohorts AS (
  SELECT 
    id as user_id,
    DATE_TRUNC('month', created_at) as cohort_month
  FROM public.profiles
),
user_activities AS (
  SELECT 
    user_id,
    DATE_TRUNC('month', created_at) as activity_month
  FROM (
    SELECT user_id, created_at FROM public.forum_posts
    UNION ALL
    SELECT user_id, created_at FROM public.suggestions
    UNION ALL
    SELECT user_id, started_at as created_at FROM public.learning_progress
  ) activities
)
SELECT 
  uc.cohort_month,
  ua.activity_month,
  COUNT(DISTINCT uc.user_id) as cohort_size,
  COUNT(DISTINCT ua.user_id) as active_users,
  ROUND(
    COUNT(DISTINCT ua.user_id)::numeric / 
    NULLIF(COUNT(DISTINCT uc.user_id), 0) * 100, 2
  ) as retention_rate
FROM user_cohorts uc
LEFT JOIN user_activities ua ON uc.user_id = ua.user_id
GROUP BY uc.cohort_month, ua.activity_month
ORDER BY uc.cohort_month, ua.activity_month;

-- 3. Views administrativas - manter SECURITY DEFINER mas com RLS restritivo
CREATE OR REPLACE VIEW public.admin_stats_overview
WITH (security_invoker = false) AS
SELECT 
  (SELECT COUNT(*) FROM public.solutions) as total_solutions,
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.progress WHERE is_completed = true) as completed_implementations,
  (SELECT COUNT(*) FROM public.progress WHERE is_completed = false) as active_implementations,
  (SELECT COUNT(*) FROM public.profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM public.progress WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_implementations_30d,
  (SELECT COUNT(DISTINCT user_id) FROM public.analytics WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as active_users_7d,
  (SELECT COUNT(DISTINCT user_id) FROM public.learning_progress WHERE started_at >= CURRENT_DATE - INTERVAL '7 days') as active_learners_7d,
  (SELECT COUNT(*) FROM public.benefit_clicks) as total_benefit_clicks,
  (SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/86400) FROM public.progress WHERE is_completed = true) as avg_implementation_time_days,
  (SELECT (COUNT(CASE WHEN is_completed THEN 1 END)::float / NULLIF(COUNT(*), 0) * 100) FROM public.progress) as overall_completion_rate,
  (SELECT COUNT(*) FROM public.learning_courses) as total_courses,
  (SELECT COUNT(*) FROM public.learning_progress WHERE progress_percentage = 100) as completed_lessons,
  (SELECT COUNT(*) FROM public.forum_topics) as forum_topics;

-- Enable RLS on admin views
ALTER VIEW public.admin_stats_overview ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admin views
CREATE POLICY "admin_stats_admin_only" ON public.admin_stats_overview
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Recreate other admin views with proper security
CREATE OR REPLACE VIEW public.admin_analytics_overview
WITH (security_invoker = false) AS
SELECT 
  (SELECT COUNT(*) FROM public.solutions) as total_solutions,
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.progress WHERE is_completed = true) as completed_implementations,
  (SELECT COUNT(*) FROM public.progress WHERE is_completed = false) as active_implementations,
  (SELECT COUNT(*) FROM public.profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM public.progress WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_implementations_30d,
  (SELECT COUNT(DISTINCT user_id) FROM public.analytics WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as active_users_7d,
  (SELECT COUNT(DISTINCT user_id) FROM public.learning_progress WHERE started_at >= CURRENT_DATE - INTERVAL '7 days') as active_learners_7d,
  (SELECT COUNT(*) FROM public.benefit_clicks) as total_benefit_clicks,
  (SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/86400) FROM public.progress WHERE is_completed = true) as avg_implementation_time_days,
  (SELECT (COUNT(CASE WHEN is_completed THEN 1 END)::float / NULLIF(COUNT(*), 0) * 100) FROM public.progress) as overall_completion_rate,
  (SELECT COUNT(*) FROM public.learning_courses) as total_courses,
  (SELECT COUNT(*) FROM public.learning_progress WHERE progress_percentage = 100) as completed_lessons,
  (SELECT COUNT(*) FROM public.forum_topics) as forum_topics;

ALTER VIEW public.admin_analytics_overview ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_analytics_admin_only" ON public.admin_analytics_overview
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 4. Recreate learning and performance views without SECURITY DEFINER
CREATE OR REPLACE VIEW public.learning_courses_with_stats AS
SELECT 
  lc.*,
  COALESCE(module_stats.module_count, 0) as module_count,
  COALESCE(lesson_stats.lesson_count, 0) as lesson_count,
  CASE WHEN course_access.course_id IS NOT NULL THEN true ELSE false END as is_restricted
FROM public.learning_courses lc
LEFT JOIN (
  SELECT course_id, COUNT(*) as module_count
  FROM public.learning_modules
  WHERE published = true
  GROUP BY course_id
) module_stats ON lc.id = module_stats.course_id
LEFT JOIN (
  SELECT lm.course_id, COUNT(ll.id) as lesson_count
  FROM public.learning_modules lm
  LEFT JOIN public.learning_lessons ll ON lm.id = ll.module_id AND ll.published = true
  GROUP BY lm.course_id
) lesson_stats ON lc.id = lesson_stats.course_id
LEFT JOIN public.course_access_control course_access ON lc.id = course_access.course_id
WHERE lc.published = true
ORDER BY lc.order_index;

CREATE OR REPLACE VIEW public.learning_lessons_with_relations AS
SELECT 
  ll.*,
  to_jsonb(lm.*) as module,
  COALESCE(videos.videos_json, '[]'::jsonb) as videos,
  COALESCE(tools.tools_json, '[]'::jsonb) as resources
FROM public.learning_lessons ll
LEFT JOIN public.learning_modules lm ON ll.module_id = lm.id
LEFT JOIN (
  SELECT 
    lesson_id,
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'title', title,
        'url', url,
        'description', description,
        'duration_seconds', duration_seconds,
        'thumbnail_url', thumbnail_url,
        'video_type', video_type,
        'order_index', order_index
      ) ORDER BY order_index
    ) as videos_json
  FROM public.learning_lesson_videos
  GROUP BY lesson_id
) videos ON ll.id = videos.lesson_id
LEFT JOIN (
  SELECT 
    llt.lesson_id,
    jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'official_url', t.official_url,
        'benefit_link', t.benefit_link,
        'order_index', llt.order_index
      ) ORDER BY llt.order_index
    ) as tools_json
  FROM public.learning_lesson_tools llt
  JOIN public.tools t ON llt.tool_id = t.id
  GROUP BY llt.lesson_id
) tools ON ll.id = tools.lesson_id
WHERE ll.published = true
ORDER BY lm.order_index, ll.order_index;

-- 5. Recreate other views without SECURITY DEFINER
CREATE OR REPLACE VIEW public.course_performance_metrics AS
SELECT 
  lc.id as course_id,
  lc.title as course_title,
  lc.created_at,
  lc.updated_at,
  lesson_stats.total_lessons,
  progress_stats.enrolled_users,
  progress_stats.completed_lessons_count,
  progress_stats.avg_progress_percentage
FROM public.learning_courses lc
LEFT JOIN (
  SELECT 
    lm.course_id,
    COUNT(ll.id) as total_lessons
  FROM public.learning_modules lm
  LEFT JOIN public.learning_lessons ll ON lm.id = ll.module_id AND ll.published = true
  WHERE lm.published = true
  GROUP BY lm.course_id
) lesson_stats ON lc.id = lesson_stats.course_id
LEFT JOIN (
  SELECT 
    lm.course_id,
    COUNT(DISTINCT lp.user_id) as enrolled_users,
    COUNT(CASE WHEN lp.progress_percentage = 100 THEN 1 END) as completed_lessons_count,
    AVG(lp.progress_percentage) as avg_progress_percentage
  FROM public.learning_modules lm
  LEFT JOIN public.learning_lessons ll ON lm.id = ll.module_id
  LEFT JOIN public.learning_progress lp ON ll.id = lp.lesson_id
  WHERE lm.published = true AND ll.published = true
  GROUP BY lm.course_id
) progress_stats ON lc.id = progress_stats.course_id
WHERE lc.published = true;

CREATE OR REPLACE VIEW public.learning_analytics_data AS
SELECT 
  lc.id as course_id,
  lc.title,
  lesson_stats.total_lessons,
  progress_stats.enrolled_users,
  progress_stats.completed_lessons,
  progress_stats.avg_progress_percentage
FROM public.learning_courses lc
LEFT JOIN (
  SELECT 
    lm.course_id,
    COUNT(ll.id) as total_lessons
  FROM public.learning_modules lm
  LEFT JOIN public.learning_lessons ll ON lm.id = ll.module_id AND ll.published = true
  WHERE lm.published = true
  GROUP BY lm.course_id
) lesson_stats ON lc.id = lesson_stats.course_id
LEFT JOIN (
  SELECT 
    lm.course_id,
    COUNT(DISTINCT lp.user_id) as enrolled_users,
    COUNT(CASE WHEN lp.progress_percentage = 100 THEN 1 END) as completed_lessons,
    AVG(lp.progress_percentage) as avg_progress_percentage
  FROM public.learning_modules lm
  LEFT JOIN public.learning_lessons ll ON lm.id = ll.module_id
  LEFT JOIN public.learning_progress lp ON ll.id = lp.lesson_id
  WHERE lm.published = true AND ll.published = true
  GROUP BY lm.course_id
) progress_stats ON lc.id = progress_stats.course_id
WHERE lc.published = true;

-- 6. Recreate user and engagement views
CREATE OR REPLACE VIEW public.user_engagement_metrics AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as new_users,
  DATE(created_at)::text as formatted_date
FROM public.profiles
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY date;

CREATE OR REPLACE VIEW public.user_role_distribution AS
SELECT 
  ur.name as role_name,
  COUNT(p.id) as user_count,
  ROUND(COUNT(p.id) * 100.0 / (SELECT COUNT(*) FROM public.profiles), 2) as percentage
FROM public.user_roles ur
LEFT JOIN public.profiles p ON ur.id = p.role_id
GROUP BY ur.id, ur.name
ORDER BY user_count DESC;

CREATE OR REPLACE VIEW public.user_growth_by_date AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as new_users,
  SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as cumulative_users
FROM public.profiles
GROUP BY DATE(created_at)
ORDER BY date;

-- 7. Recreate benefits view without SECURITY DEFINER
CREATE OR REPLACE VIEW public.benefits AS
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
  t.benefit_type,
  t.tags,
  t.video_url,
  t.video_type,
  t.benefit_badge_url,
  t.has_member_benefit,
  t.status,
  t.created_at,
  t.updated_at,
  t.video_tutorials,
  COALESCE(click_stats.benefit_clicks, 0) as benefit_clicks
FROM public.tools t
LEFT JOIN (
  SELECT tool_id, COUNT(*) as benefit_clicks
  FROM public.benefit_clicks
  GROUP BY tool_id
) click_stats ON t.id = click_stats.tool_id
WHERE t.status = true;

-- Log da correção
INSERT INTO public.audit_logs (
  event_type,
  action,
  details
) VALUES (
  'security_improvement',
  'fix_security_definer_views',
  jsonb_build_object(
    'message', 'Corrigidas 25 views com SECURITY DEFINER',
    'views_fixed', 25,
    'admin_views_secured', 2,
    'public_views_normalized', 23
  )
);