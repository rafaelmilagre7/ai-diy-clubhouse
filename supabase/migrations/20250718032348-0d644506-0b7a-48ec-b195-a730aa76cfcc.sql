-- CORREÇÃO: Criar views de analytics que estão faltando

-- 1. View admin_analytics_overview
CREATE OR REPLACE VIEW public.admin_analytics_overview AS
SELECT 
  COUNT(DISTINCT p.id) as total_users,
  COUNT(DISTINCT CASE WHEN p.created_at >= NOW() - INTERVAL '30 days' THEN p.id END) as new_users_30d,
  COUNT(DISTINCT CASE WHEN p.onboarding_completed = true THEN p.id END) as completed_onboarding,
  COUNT(DISTINCT s.id) as total_solutions,
  COUNT(DISTINCT CASE WHEN s.created_at >= NOW() - INTERVAL '30 days' THEN s.id END) as new_solutions_30d,
  COUNT(DISTINCT ll.id) as total_lessons,
  COUNT(DISTINCT lp.user_id) as active_learners,
  COUNT(DISTINCT CASE WHEN a.created_at >= NOW() - INTERVAL '7 days' THEN a.user_id END) as active_users_7d,
  COALESCE(AVG(CASE WHEN p.created_at >= NOW() - INTERVAL '60 days' THEN 1 ELSE 0 END) * 100, 0) as growth_rate,
  COALESCE(AVG(CASE WHEN lp.completed_at IS NOT NULL THEN 1 ELSE 0 END) * 100, 0) as completion_rate
FROM public.profiles p
LEFT JOIN public.solutions s ON true
LEFT JOIN public.learning_lessons ll ON true  
LEFT JOIN public.learning_progress lp ON lp.user_id = p.id
LEFT JOIN public.analytics a ON a.user_id = p.id
WHERE p.id IS NOT NULL;

-- 2. View user_segmentation_analytics  
CREATE OR REPLACE VIEW public.user_segmentation_analytics AS
SELECT 
  ur.name as segment_name,
  COUNT(p.id) as user_count,
  COUNT(CASE WHEN p.onboarding_completed = true THEN 1 END) as completed_count,
  COUNT(CASE WHEN p.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d,
  COALESCE(AVG(CASE WHEN lp.completed_at IS NOT NULL THEN 1 ELSE 0 END) * 100, 0) as avg_completion_rate
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.role_id = ur.id
LEFT JOIN public.learning_progress lp ON lp.user_id = p.id
WHERE ur.name IS NOT NULL
GROUP BY ur.name, ur.id
ORDER BY user_count DESC;

-- 3. View weekly_activity_patterns (se não existir)
CREATE OR REPLACE VIEW public.weekly_activity_patterns AS
SELECT 
  EXTRACT(DOW FROM created_at) as day_of_week,
  EXTRACT(HOUR FROM created_at) as hour_of_day,
  COUNT(*) as activity_count,
  COUNT(DISTINCT user_id) as unique_users,
  'general' as activity_type
FROM public.analytics
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY 
  EXTRACT(DOW FROM created_at),
  EXTRACT(HOUR FROM created_at)
ORDER BY day_of_week, hour_of_day;

-- 4. View onboarding_analytics (corrigir se necessário)
CREATE OR REPLACE VIEW public.onboarding_analytics AS
SELECT 
  qo.id,
  qo.user_id,
  qo.is_completed,
  qo.current_step,
  qo.created_at as started_at,
  qo.updated_at as last_activity,
  qo.email,
  qo.company_name,
  jsonb_build_object(
    'main_goal', qo.main_goal,
    'ai_knowledge_level', qo.ai_knowledge_level
  ) as business_goals,
  jsonb_build_object(
    'name', qo.name,
    'email', qo.email,
    'whatsapp', qo.whatsapp,
    'country_code', qo.country_code
  ) as personal_info,
  jsonb_build_object(
    'knowledge_level', qo.ai_knowledge_level,
    'uses_ai', qo.uses_ai,
    'has_implemented', qo.has_implemented,
    'previous_tools', qo.previous_tools,
    'desired_ai_areas', qo.desired_ai_areas
  ) as ai_experience,
  jsonb_build_object() as resources_needs,
  jsonb_build_object() as team_info,
  jsonb_build_object() as implementation_preferences,
  jsonb_build_object() as industry_focus
FROM public.quick_onboarding qo
UNION ALL
SELECT 
  op.id,
  op.user_id,
  op.is_completed,
  op.current_step,
  op.created_at as started_at,
  op.updated_at as last_activity,
  p.email,
  COALESCE(op.professional_info->>'company_name', op.company_name) as company_name,
  op.business_goals,
  op.personal_info,
  op.ai_experience,
  jsonb_build_object() as resources_needs,
  jsonb_build_object() as team_info,
  jsonb_build_object() as implementation_preferences,
  jsonb_build_object() as industry_focus
FROM public.onboarding_progress op
LEFT JOIN public.profiles p ON op.user_id = p.id;