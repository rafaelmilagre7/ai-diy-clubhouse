-- CORREÇÃO FINAL: APENAS DADOS (assumindo função já existe)
-- ==================================================================

-- 1. Estado inicial
SELECT 
  '📊 VERIFICAÇÃO INICIAL' as status,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN role_id IS NULL THEN 1 END) as sem_role,
  COUNT(CASE WHEN role_id IS NOT NULL THEN 1 END) as com_role
FROM public.profiles;

-- 2. Garantir que existe role 'member'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE name = 'member') THEN
    INSERT INTO public.user_roles (id, name, description, permissions)
    VALUES (
      gen_random_uuid(),
      'member',
      'Membro padrão do sistema',
      '{"read": true, "basic_access": true}'::jsonb
    );
  END IF;
END
$$;

-- 3. Corrigir todos os usuários com role_id NULL
UPDATE public.profiles 
SET role_id = (
  SELECT id FROM public.user_roles 
  WHERE name = 'member'
  LIMIT 1
),
updated_at = now()
WHERE role_id IS NULL;

-- 4. Corrigir usuários com role_id inválido (referência órfã)
UPDATE public.profiles 
SET role_id = (
  SELECT id FROM public.user_roles 
  WHERE name = 'member'
  LIMIT 1
),
updated_at = now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.id = profiles.role_id
);

-- 5. Estado após correção de roles
SELECT 
  '🔧 APÓS CORREÇÃO DE ROLES' as etapa,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN role_id IS NULL THEN 1 END) as ainda_sem_role
FROM public.profiles;

-- 6. Inserir onboarding para usuários órfãos
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
    'name', COALESCE(p.name, split_part(p.email, '@', 1), 'Usuário'), 
    'email', p.email,
    'auto_generated', true,
    'migration_date', now()::text
  ),
  CASE 
    WHEN p.company_name IS NOT NULL AND TRIM(p.company_name) != '' THEN 
      jsonb_build_object('company_name', p.company_name) 
    ELSE '{}'::jsonb 
  END,
  '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 
  '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
  'in_progress', 
  now(), 
  now()
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.onboarding_final onf 
  WHERE onf.user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;

-- 7. RESULTADO FINAL DEFINITIVO
SELECT 
  '🎉 CORREÇÃO CONCLUÍDA!' as resultado,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN p.role_id IS NULL THEN 1 END) as usuarios_sem_role,
  COUNT(CASE WHEN onf.user_id IS NULL THEN 1 END) as usuarios_sem_onboarding,
  COUNT(CASE WHEN p.role_id IS NOT NULL AND onf.user_id IS NOT NULL THEN 1 END) as usuarios_ok,
  CASE 
    WHEN COUNT(CASE WHEN p.role_id IS NULL THEN 1 END) = 0 
         AND COUNT(CASE WHEN onf.user_id IS NULL THEN 1 END) = 0 
    THEN '✅ PROBLEMA TOTALMENTE RESOLVIDO!' 
    ELSE '⚠️ Ainda há usuários problemáticos'
  END as status_final
FROM public.profiles p
LEFT JOIN public.onboarding_final onf ON p.id = onf.user_id;