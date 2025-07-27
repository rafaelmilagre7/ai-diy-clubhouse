-- Criar view admin_analytics_overview para estatísticas gerais (versão corrigida com ROUND)
CREATE OR REPLACE VIEW admin_analytics_overview AS
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM solutions) as total_solutions,
  (SELECT COUNT(*) FROM progress WHERE is_completed = true) as completed_implementations,
  (SELECT ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600)::numeric, 2) FROM progress WHERE is_completed = true AND completed_at IS NOT NULL) as avg_implementation_time_hours,
  (SELECT ROUND(
    (COUNT(*) FILTER (WHERE is_completed = true)::numeric / NULLIF(COUNT(*), 0)) * 100, 2
  ) FROM progress) as completion_rate,
  (SELECT COUNT(*) FROM progress WHERE last_activity >= NOW() - INTERVAL '24 hours') as active_users_24h;

-- Criar view weekly_activity_patterns para padrões de atividade semanal
CREATE OR REPLACE VIEW weekly_activity_patterns AS
WITH activity_data AS (
  SELECT 
    EXTRACT(DOW FROM created_at) as day_of_week,
    COUNT(*) as activity_count
  FROM (
    SELECT created_at FROM analytics
    UNION ALL
    SELECT created_at FROM progress
    UNION ALL
    SELECT created_at FROM community_topics
    UNION ALL
    SELECT created_at FROM community_posts
  ) all_activities
  WHERE created_at >= NOW() - INTERVAL '90 days'
  GROUP BY EXTRACT(DOW FROM created_at)
)
SELECT 
  day_of_week,
  CASE day_of_week
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Segunda'
    WHEN 2 THEN 'Terça'
    WHEN 3 THEN 'Quarta'
    WHEN 4 THEN 'Quinta'
    WHEN 5 THEN 'Sexta'
    WHEN 6 THEN 'Sábado'
  END as day_name,
  activity_count
FROM activity_data
ORDER BY day_of_week;

-- Criar view user_growth_by_date para crescimento de usuários
CREATE OR REPLACE VIEW user_growth_by_date AS
WITH date_series AS (
  SELECT generate_series(
    (NOW() - INTERVAL '90 days')::date,
    NOW()::date,
    '1 day'::interval
  )::date as date
),
daily_signups AS (
  SELECT 
    created_at::date as date,
    COUNT(*) as new_users
  FROM profiles
  WHERE created_at >= NOW() - INTERVAL '90 days'
  GROUP BY created_at::date
)
SELECT 
  ds.date,
  COALESCE(daily_signups.new_users, 0) as users,
  ds.date::text as name,
  SUM(COALESCE(daily_signups.new_users, 0)) OVER (ORDER BY ds.date) as total_users
FROM date_series ds
LEFT JOIN daily_signups ON ds.date = daily_signups.date
ORDER BY ds.date;

-- Criar view solution_performance_metrics para métricas de performance das soluções
CREATE OR REPLACE VIEW solution_performance_metrics AS
SELECT 
  s.id,
  s.title as name,
  s.category,
  COUNT(p.id) as total_implementations,
  COUNT(p.id) FILTER (WHERE p.is_completed = true) as completed_implementations,
  ROUND(
    (COUNT(p.id) FILTER (WHERE p.is_completed = true)::numeric / NULLIF(COUNT(p.id), 0)) * 100, 2
  ) as completion_rate,
  ROUND(AVG(EXTRACT(EPOCH FROM (p.completed_at - p.created_at))/3600)::numeric, 2) as avg_completion_time_hours
FROM solutions s
LEFT JOIN progress p ON s.id = p.solution_id
GROUP BY s.id, s.title, s.category
ORDER BY total_implementations DESC;

-- Criar view user_segmentation_analytics para segmentação de usuários
CREATE OR REPLACE VIEW user_segmentation_analytics AS
SELECT 
  ur.name as segment,
  ur.description,
  COUNT(p.id) as user_count,
  ROUND((COUNT(p.id)::numeric / (SELECT COUNT(*) FROM profiles)) * 100, 2) as percentage
FROM user_roles ur
LEFT JOIN profiles p ON ur.id = p.role_id
GROUP BY ur.id, ur.name, ur.description
ORDER BY user_count DESC;