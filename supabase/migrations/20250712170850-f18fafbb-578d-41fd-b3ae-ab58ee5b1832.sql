-- Criar views/tabelas de analytics que estão sendo referenciadas mas não existem

-- 1. Forum engagement metrics
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

-- 2. User engagement score
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

-- 3. Implementation growth by date
CREATE OR REPLACE VIEW public.implementation_growth_by_date AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as daily_implementations,
  SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as cumulative_implementations
FROM public.progress
WHERE is_completed = true
GROUP BY DATE(created_at)
ORDER BY date;

-- 4. Retention cohort analysis
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

-- 5. Top performing content
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