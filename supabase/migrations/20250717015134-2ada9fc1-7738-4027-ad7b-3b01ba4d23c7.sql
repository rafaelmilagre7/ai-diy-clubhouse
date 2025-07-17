-- ABORDAGEM SIMPLES: Apenas inserir onboarding sem mexer nos triggers
-- ==================================================================

-- 1. Primeiro, criar função is_user_admin com assinatura que não conflita
CREATE OR REPLACE FUNCTION public.check_admin_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id 
    AND ur.name = 'admin'
  );
$$;

-- 2. Inserir onboarding para todos os usuários órfãos
INSERT INTO public.onboarding_final (
  user_id, current_step, completed_steps, is_completed,
  personal_info, business_info, ai_experience, goals_info,
  personalization, location_info, discovery_info, business_context,
  status, created_at, updated_at
)
SELECT 
  p.id, 
  1, 
  ARRAY[]::integer[], 
  false,
  jsonb_build_object(
    'name', COALESCE(p.name, split_part(p.email, '@', 1)), 
    'email', p.email
  ),
  CASE 
    WHEN p.company_name IS NOT NULL THEN 
      jsonb_build_object('company_name', p.company_name) 
    ELSE '{}'::jsonb 
  END,
  '{}'::jsonb, -- ai_experience
  '{}'::jsonb, -- goals_info
  '{}'::jsonb, -- personalization
  '{}'::jsonb, -- location_info
  '{}'::jsonb, -- discovery_info
  '{}'::jsonb, -- business_context
  'in_progress', 
  now(), 
  now()
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.onboarding_final onf WHERE onf.user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Verificar resultado
SELECT 
  '🎯 ONBOARDING CORRIGIDO!' as resultado,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN onf.user_id IS NOT NULL THEN 1 END) as com_onboarding,
  COUNT(CASE WHEN onf.user_id IS NULL THEN 1 END) as sem_onboarding,
  CASE 
    WHEN COUNT(CASE WHEN onf.user_id IS NULL THEN 1 END) = 0 
    THEN '✅ Todos os usuários têm onboarding!' 
    ELSE '❌ Ainda há usuários órfãos' 
  END as status_final
FROM public.profiles p
LEFT JOIN public.onboarding_final onf ON p.id = onf.user_id;