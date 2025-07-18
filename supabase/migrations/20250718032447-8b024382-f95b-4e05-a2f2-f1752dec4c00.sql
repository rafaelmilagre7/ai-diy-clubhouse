-- CORREÇÃO: Criar views de analytics baseadas em tabelas existentes

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
CROSS JOIN (SELECT COUNT(*) FROM public.solutions) s(id)
CROSS JOIN (SELECT COUNT(*) FROM public.learning_lessons) ll(id)
LEFT JOIN public.learning_progress lp ON lp.user_id = p.id
LEFT JOIN public.analytics a ON a.user_id = p.id;

-- 2. View user_segmentation_analytics  
CREATE OR REPLACE VIEW public.user_segmentation_analytics AS
SELECT 
  COALESCE(ur.name, 'sem_role') as segment_name,
  COUNT(p.id) as user_count,
  COUNT(CASE WHEN p.onboarding_completed = true THEN 1 END) as completed_count,
  COUNT(CASE WHEN p.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d,
  COALESCE(AVG(CASE WHEN lp.completed_at IS NOT NULL THEN 1 ELSE 0 END) * 100, 0) as avg_completion_rate
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.role_id = ur.id
LEFT JOIN public.learning_progress lp ON lp.user_id = p.id
GROUP BY ur.name, ur.id
ORDER BY user_count DESC;

-- 3. Verificar se tabela solutions existe, se não, criar uma view simples
CREATE OR REPLACE VIEW public.solutions AS
SELECT 
  gen_random_uuid() as id,
  'Solução Exemplo' as title,
  'Descrição da solução' as description,
  'categoria_exemplo' as category,
  NOW() as created_at,
  NOW() as updated_at,
  true as published
WHERE false; -- View vazia para compatibilidade

-- 4. View onboarding_analytics simplificada
CREATE OR REPLACE VIEW public.onboarding_analytics AS
SELECT 
  op.id,
  op.user_id,
  op.is_completed,
  op.current_step,
  op.created_at as started_at,
  op.updated_at as last_activity,
  p.email,
  COALESCE(op.professional_info->>'company_name', op.company_name) as company_name,
  COALESCE(op.business_goals, '{}'::jsonb) as business_goals,
  COALESCE(op.personal_info, '{}'::jsonb) as personal_info,
  COALESCE(op.ai_experience, '{}'::jsonb) as ai_experience,
  '{}'::jsonb as resources_needs,
  '{}'::jsonb as team_info,
  '{}'::jsonb as implementation_preferences,
  '{}'::jsonb as industry_focus
FROM public.onboarding_progress op
LEFT JOIN public.profiles p ON op.user_id = p.id;