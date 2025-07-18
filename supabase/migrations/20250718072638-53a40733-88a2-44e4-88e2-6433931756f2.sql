
-- CORREÇÃO CRÍTICA: Remover SECURITY DEFINER das views problemáticas
-- Estas views estão causando loops de carregamento e problemas de segurança

-- 1. Remover e recriar admin_analytics_overview sem SECURITY DEFINER
DROP VIEW IF EXISTS public.admin_analytics_overview CASCADE;

CREATE VIEW public.admin_analytics_overview
WITH (security_invoker=true) AS
SELECT 
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.solutions WHERE published = true) as total_solutions,
  (SELECT COUNT(*) FROM public.learning_lessons WHERE published = true) as total_lessons,
  (SELECT COUNT(*) FROM public.profiles WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM public.profiles WHERE created_at > NOW() - INTERVAL '7 days') as active_users_7d,
  (SELECT COUNT(*) FROM public.onboarding_final WHERE is_completed = true) as completed_onboarding,
  (SELECT COUNT(*) FROM public.progress WHERE is_completed = true) as completed_implementations,
  (SELECT COUNT(*) FROM public.solutions WHERE created_at > NOW() - INTERVAL '30 days') as new_solutions_30d,
  (SELECT COUNT(*) FROM public.learning_progress WHERE updated_at > NOW() - INTERVAL '7 days') as active_learners,
  -- Calcular taxas
  CASE 
    WHEN (SELECT COUNT(*) FROM public.profiles) > 0 
    THEN ROUND(((SELECT COUNT(*) FROM public.onboarding_final WHERE is_completed = true)::numeric / (SELECT COUNT(*) FROM public.profiles)::numeric) * 100, 2)
    ELSE 0 
  END as completion_rate,
  CASE 
    WHEN (SELECT COUNT(*) FROM public.profiles WHERE created_at <= NOW() - INTERVAL '30 days') > 0
    THEN ROUND(((SELECT COUNT(*) FROM public.profiles WHERE created_at > NOW() - INTERVAL '30 days')::numeric / (SELECT COUNT(*) FROM public.profiles WHERE created_at <= NOW() - INTERVAL '30 days')::numeric) * 100, 2)
    ELSE 100
  END as growth_rate;

-- 2. Remover e recriar user_segmentation_analytics sem SECURITY DEFINER
DROP VIEW IF EXISTS public.user_segmentation_analytics CASCADE;

CREATE VIEW public.user_segmentation_analytics
WITH (security_invoker=true) AS
SELECT 
  ur.name as role_name,
  COUNT(p.id) as user_count,
  COUNT(CASE WHEN p.created_at > NOW() - INTERVAL '7 days' THEN 1 END) as new_users_7d,
  COUNT(CASE WHEN p.created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d,
  COUNT(CASE WHEN p.onboarding_completed = true THEN 1 END) as completed_onboarding
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.role_id = ur.id
GROUP BY ur.name
ORDER BY user_count DESC;

-- 3. Adicionar RLS policies para as views se necessário
-- Como são views agregadas sem dados sensíveis específicos de usuário, 
-- vamos permitir acesso para usuários autenticados

-- 4. Log da correção
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'security_fix',
  'remove_security_definer_views',
  jsonb_build_object(
    'message', 'Removido SECURITY DEFINER das views problemáticas',
    'views_corrected', ARRAY['admin_analytics_overview', 'user_segmentation_analytics'],
    'security_invoker', true,
    'timestamp', now()
  ),
  auth.uid()
);
