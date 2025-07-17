-- CORREÇÃO COMPLETA: role_id NULL + onboarding órfãos
-- ==================================================================

-- 1. Primeiro corrigir usuários com role_id NULL
UPDATE public.profiles 
SET role_id = (
  SELECT id FROM public.user_roles 
  WHERE name IN ('membro_club', 'member', 'membro') 
  ORDER BY name LIMIT 1
)
WHERE role_id IS NULL;

-- 2. Verificar se todos têm role_id válido agora
SELECT 
  'ROLES CORRIGIDOS' as etapa,
  COUNT(*) as total,
  COUNT(CASE WHEN role_id IS NULL THEN 1 END) as sem_role,
  COUNT(CASE WHEN role_id IS NOT NULL THEN 1 END) as com_role
FROM public.profiles;

-- 3. Agora inserir onboarding para usuários órfãos (já deveria funcionar)
INSERT INTO public.onboarding_final (
  user_id, current_step, completed_steps, is_completed,
  personal_info, business_info, ai_experience, goals_info,
  personalization, location_info, discovery_info, business_context,
  status, created_at, updated_at
)
SELECT 
  p.id, 1, ARRAY[]::integer[], false,
  jsonb_build_object(
    'name', COALESCE(p.name, split_part(p.email, '@', 1)), 
    'email', p.email
  ),
  CASE 
    WHEN p.company_name IS NOT NULL THEN 
      jsonb_build_object('company_name', p.company_name) 
    ELSE '{}'::jsonb 
  END,
  '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 
  '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
  'in_progress', now(), now()
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.onboarding_final onf WHERE onf.user_id = p.id)
ON CONFLICT (user_id) DO NOTHING;

-- 4. Resultado final da correção
SELECT 
  '✅ PROBLEMA RESOLVIDO!' as resultado_final,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN onf.user_id IS NOT NULL THEN 1 END) as usuarios_com_onboarding,
  COUNT(CASE WHEN onf.user_id IS NULL THEN 1 END) as usuarios_sem_onboarding,
  CASE 
    WHEN COUNT(CASE WHEN onf.user_id IS NULL THEN 1 END) = 0 
    THEN 'Nenhum usuário ficará mais preso no onboarding!' 
    ELSE 'Ainda há usuários sem onboarding' 
  END as status_onboarding
FROM public.profiles p
LEFT JOIN public.onboarding_final onf ON p.id = onf.user_id;