-- CORREÇÃO FINAL COMPLETA: Resolver usuários restantes
-- ==================================================================

-- 1. Verificar estado atual antes da correção
SELECT 
  '📊 ESTADO ATUAL' as status,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN role_id IS NULL THEN 1 END) as sem_role,
  COUNT(CASE WHEN role_id IS NOT NULL THEN 1 END) as com_role
FROM public.profiles;

-- 2. Forçar correção de todos role_id NULL (caso ainda existam)
UPDATE public.profiles 
SET role_id = (
  SELECT id FROM public.user_roles 
  WHERE name IN ('member', 'membro', 'membro_club') 
  ORDER BY 
    CASE 
      WHEN name = 'member' THEN 1
      WHEN name = 'membro' THEN 2  
      WHEN name = 'membro_club' THEN 3
      ELSE 4
    END
  LIMIT 1
)
WHERE role_id IS NULL;

-- 3. Se não existir role padrão, criar um
INSERT INTO public.user_roles (id, name, description, permissions)
SELECT 
  gen_random_uuid(),
  'member',
  'Membro padrão do sistema',
  '{"read": true}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE name IN ('member', 'membro', 'membro_club')
);

-- 4. Garantir que TODOS os perfis tenham role válido
UPDATE public.profiles 
SET role_id = (
  SELECT id FROM public.user_roles 
  WHERE name = 'member'
  LIMIT 1
)
WHERE role_id IS NULL OR NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.id = profiles.role_id
);

-- 5. Inserir onboarding para TODOS os usuários órfãos restantes
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
    'email', p.email,
    'from_correction', true
  ),
  CASE 
    WHEN p.company_name IS NOT NULL THEN 
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
ON CONFLICT (user_id) DO UPDATE SET
  personal_info = EXCLUDED.personal_info || onboarding_final.personal_info,
  business_info = EXCLUDED.business_info || onboarding_final.business_info,
  updated_at = now();

-- 6. Verificação final completa
SELECT 
  '🎉 CORREÇÃO FINAL CONCLUÍDA!' as resultado,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN p.role_id IS NULL THEN 1 END) as usuarios_sem_role,
  COUNT(CASE WHEN onf.user_id IS NULL THEN 1 END) as usuarios_sem_onboarding,
  COUNT(CASE WHEN p.role_id IS NOT NULL AND onf.user_id IS NOT NULL THEN 1 END) as usuarios_completos,
  CASE 
    WHEN COUNT(CASE WHEN p.role_id IS NULL THEN 1 END) = 0 
         AND COUNT(CASE WHEN onf.user_id IS NULL THEN 1 END) = 0 
    THEN '✅ TODOS OS PROBLEMAS RESOLVIDOS!' 
    ELSE '⚠️ Ainda há problemas a resolver' 
  END as status_final
FROM public.profiles p
LEFT JOIN public.onboarding_final onf ON p.id = onf.user_id;

-- 7. Listar qualquer usuário problemático restante
SELECT 
  '🔍 USUÁRIOS PROBLEMÁTICOS (se houver)' as debug,
  p.id,
  p.email,
  p.role_id,
  CASE WHEN onf.user_id IS NULL THEN 'SEM_ONBOARDING' ELSE 'COM_ONBOARDING' END as onboarding_status
FROM public.profiles p
LEFT JOIN public.onboarding_final onf ON p.id = onf.user_id
WHERE p.role_id IS NULL OR onf.user_id IS NULL
ORDER BY p.created_at;