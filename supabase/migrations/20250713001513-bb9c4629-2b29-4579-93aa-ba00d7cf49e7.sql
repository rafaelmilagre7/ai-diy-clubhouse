-- Recriar views essenciais sem SECURITY DEFINER
-- Esta migração recria as views mais importantes com segurança adequada

-- 1. Views básicas de engajamento do fórum
CREATE VIEW public.forum_engagement_metrics AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_posts,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(CASE WHEN parent_id IS NULL THEN 1 ELSE 0 END) as topics_ratio
FROM public.forum_posts
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date;

-- 2. Score de engajamento de usuários
CREATE VIEW public.user_engagement_score AS
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

-- 3. Crescimento de implementações
CREATE VIEW public.implementation_growth_by_date AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as daily_implementations,
  SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as cumulative_implementations
FROM public.progress
WHERE is_completed = true
GROUP BY DATE(created_at)
ORDER BY date;

-- 4. Conteúdo com melhor performance
CREATE VIEW public.top_performing_content AS
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

-- 5. Usuários com roles (simplificada)
CREATE VIEW public.users_with_roles AS
SELECT 
  p.id,
  p.name,
  p.email,
  p.created_at,
  p.role,
  p.role_id,
  ur.name as role_name,
  ur.description as role_description
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.role_id = ur.id;

-- 6. Métricas de usuário por data
CREATE VIEW public.user_engagement_metrics AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as new_users,
  DATE(created_at)::text as formatted_date
FROM public.profiles
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY date;

-- 7. Distribuição de roles
CREATE VIEW public.user_role_distribution AS
SELECT 
  ur.name as role_name,
  COUNT(p.id) as user_count,
  ROUND(COUNT(p.id) * 100.0 / (SELECT COUNT(*) FROM public.profiles), 2) as percentage
FROM public.user_roles ur
LEFT JOIN public.profiles p ON ur.id = p.role_id
GROUP BY ur.id, ur.name
ORDER BY user_count DESC;

-- 8. Crescimento de usuários
CREATE VIEW public.user_growth_by_date AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as new_users,
  SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as cumulative_users
FROM public.profiles
GROUP BY DATE(created_at)
ORDER BY date;

-- 9. Padrão de atividade semanal
CREATE VIEW public.weekly_activity_pattern AS
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

-- 10. View de benefícios (baseada na tabela tools)
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

-- Log da criação das views seguras
INSERT INTO public.audit_logs (
  event_type,
  action,
  details
) VALUES (
  'security_improvement',
  'recreated_views_without_security_definer',
  jsonb_build_object(
    'message', 'Recriadas 10 views essenciais sem SECURITY DEFINER',
    'views_created', ARRAY[
      'forum_engagement_metrics',
      'user_engagement_score', 
      'implementation_growth_by_date',
      'top_performing_content',
      'users_with_roles',
      'user_engagement_metrics',
      'user_role_distribution',
      'user_growth_by_date',
      'weekly_activity_pattern',
      'benefits'
    ],
    'security_improvement', 'Views agora executam com permissões do usuário que faz a consulta'
  )
);