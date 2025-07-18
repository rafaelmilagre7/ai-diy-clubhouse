-- =============================================
-- FASE 1.5: COMPLETAR CORREÇÕES CRÍTICAS
-- =============================================

-- 1. GARANTIR PERFIS PARA TODOS OS USUÁRIOS
INSERT INTO public.profiles (id, email, name, role_id, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', 'Usuário'),
  (SELECT id FROM public.user_roles WHERE name IN ('membro_club', 'member', 'membro') ORDER BY name LIMIT 1),
  NOW()
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- 2. GARANTIR role_id para perfis sem role
UPDATE public.profiles 
SET role_id = (
  SELECT id FROM public.user_roles 
  WHERE name IN ('membro_club', 'member', 'membro') 
  ORDER BY name 
  LIMIT 1
)
WHERE role_id IS NULL;

-- 3. CORRIGIR VIEW DE ANALYTICS COM SECURITY INVOKER
DROP VIEW IF EXISTS admin_analytics_overview CASCADE;

CREATE VIEW admin_analytics_overview 
WITH (security_invoker=true)
AS
SELECT 
  (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '7 days') as active_users_7d,
  (SELECT COUNT(*) FROM learning_lessons WHERE published = true) as total_lessons,
  (SELECT COUNT(*) FROM solutions) as total_solutions,
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM profiles WHERE onboarding_completed = true) as completed_onboarding,
  CASE 
    WHEN (SELECT COUNT(*) FROM profiles) > 0 
    THEN (SELECT COUNT(*) FROM profiles WHERE onboarding_completed = true)::numeric / (SELECT COUNT(*) FROM profiles)::numeric * 100
    ELSE 0
  END as completion_rate,
  CASE 
    WHEN (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days') > 0
    THEN (
      (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '30 days')::numeric - 
      (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days')::numeric
    ) / (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days')::numeric * 100
    ELSE 0
  END as growth_rate,
  (SELECT COUNT(*) FROM solutions WHERE created_at >= NOW() - INTERVAL '30 days') as new_solutions_30d,
  (SELECT COUNT(DISTINCT user_id) FROM learning_progress WHERE updated_at >= NOW() - INTERVAL '7 days') as active_learners;

-- 4. LOG DA CORREÇÃO DA FASE 1
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'system_maintenance',
  'auth_system_critical_fix_phase1_completed',
  jsonb_build_object(
    'timestamp', NOW(),
    'actions_completed', ARRAY[
      'cleaned_problematic_triggers',
      'fixed_is_user_admin_function',
      'ensured_all_user_profiles',
      'guaranteed_role_assignments',
      'fixed_analytics_view'
    ],
    'phase', '1_completed'
  )
);

-- 5. VERIFICAR RESULTADO FINAL DA FASE 1
SELECT 
  'Usuários sem perfil' as status,
  COUNT(*) as count
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
UNION ALL
SELECT 
  'Perfis sem role_id' as status,
  COUNT(*) as count  
FROM public.profiles
WHERE role_id IS NULL;