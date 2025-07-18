-- CORREÇÃO: Criar views de analytics simplificadas baseadas em tabelas existentes

-- 1. View admin_analytics_overview com dados básicos
CREATE OR REPLACE VIEW public.admin_analytics_overview AS
SELECT 
  COUNT(DISTINCT p.id) as total_users,
  COUNT(DISTINCT CASE WHEN p.created_at >= NOW() - INTERVAL '30 days' THEN p.id END) as new_users_30d,
  COUNT(DISTINCT CASE WHEN p.onboarding_completed = true THEN p.id END) as completed_onboarding,
  0 as total_solutions, -- placeholder
  0 as new_solutions_30d, -- placeholder
  COUNT(DISTINCT ll.id) as total_lessons,
  COUNT(DISTINCT lp.user_id) as active_learners,
  COUNT(DISTINCT CASE WHEN a.created_at >= NOW() - INTERVAL '7 days' THEN a.user_id END) as active_users_7d,
  COALESCE(AVG(CASE WHEN p.created_at >= NOW() - INTERVAL '60 days' THEN 1 ELSE 0 END) * 100, 0) as growth_rate,
  COALESCE(AVG(CASE WHEN lp.completed_at IS NOT NULL THEN 1 ELSE 0 END) * 100, 0) as completion_rate
FROM public.profiles p
LEFT JOIN public.learning_lessons ll ON true
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