-- Correção Final dos Perfis Órfãos - Versão Definitiva
-- ====================================================

-- 1. Executar função de correção existente
SELECT public.fix_orphaned_invites();

-- 2. Buscar role padrão para usuários sem convite
DO $$
DECLARE
  default_role_id uuid;
BEGIN
  -- Buscar role padrão (membro_club primeiro, depois membro, depois qualquer um)
  SELECT id INTO default_role_id
  FROM public.user_roles 
  WHERE name IN ('membro_club', 'membro', 'member')
  ORDER BY 
    CASE 
      WHEN name = 'membro_club' THEN 1
      WHEN name = 'membro' THEN 2
      WHEN name = 'member' THEN 3
      ELSE 4
    END
  LIMIT 1;
  
  -- Se não encontrou nenhum role padrão, usar o primeiro disponível
  IF default_role_id IS NULL THEN
    SELECT id INTO default_role_id FROM public.user_roles LIMIT 1;
  END IF;
  
  RAISE NOTICE 'Role padrão selecionado: %', default_role_id;
  
  -- 3. Criar perfis para TODOS os usuários órfãos restantes
  INSERT INTO public.profiles (
    id,
    email,
    role_id,
    name,
    created_at,
    updated_at,
    onboarding_completed
  )
  SELECT 
    u.id,
    u.email,
    COALESCE(i.role_id, default_role_id) as role_id,
    COALESCE(
      u.raw_user_meta_data->>'name',
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'display_name',
      split_part(u.email, '@', 1)
    ) as name,
    u.created_at,
    now(),
    false
  FROM auth.users u
  LEFT JOIN public.invites i ON i.token = u.raw_user_meta_data->>'invite_token'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
  )
  ON CONFLICT (id) DO UPDATE SET
    role_id = COALESCE(EXCLUDED.role_id, profiles.role_id),
    name = COALESCE(EXCLUDED.name, profiles.name),
    updated_at = now();
END $$;

-- 4. Inicializar onboarding para todos os usuários que não têm
INSERT INTO public.onboarding_final (
  user_id,
  current_step,
  completed_steps,
  is_completed,
  personal_info,
  business_info,
  ai_experience,
  goals_info,
  personalization,
  status,
  created_at,
  updated_at
)
SELECT 
  p.id,
  1,
  ARRAY[]::integer[],
  COALESCE(p.onboarding_completed, false),
  CASE 
    WHEN p.name IS NOT NULL THEN jsonb_build_object('name', p.name)
    ELSE '{}'::jsonb
  END,
  CASE 
    WHEN p.company_name IS NOT NULL THEN jsonb_build_object('company_name', p.company_name)
    ELSE '{}'::jsonb
  END,
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  CASE 
    WHEN p.onboarding_completed THEN 'completed'
    ELSE 'in_progress'
  END,
  p.created_at,
  now()
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.onboarding_final onf WHERE onf.user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;

-- 5. Sincronizar status de onboarding onde há inconsistências
UPDATE public.onboarding_final 
SET 
  is_completed = true,
  status = 'completed',
  completed_at = COALESCE(completed_at, now()),
  current_step = 7,
  completed_steps = ARRAY[1,2,3,4,5,6],
  updated_at = now()
WHERE user_id IN (
  SELECT p.id 
  FROM public.profiles p 
  WHERE p.onboarding_completed = true
) AND is_completed = false;

-- 6. Sincronizar perfis onde onboarding está completo mas perfil não marca
UPDATE public.profiles 
SET 
  onboarding_completed = true,
  onboarding_completed_at = COALESCE(onboarding_completed_at, now()),
  updated_at = now()
WHERE id IN (
  SELECT onf.user_id 
  FROM public.onboarding_final onf 
  WHERE onf.is_completed = true
) AND onboarding_completed = false;

-- 7. Relatório final de correção
SELECT 
  'RELATÓRIO FINAL DE CORREÇÃO' as titulo,
  (SELECT COUNT(*) FROM auth.users) as total_usuarios_auth,
  (SELECT COUNT(*) FROM public.profiles) as total_perfis_criados,
  (SELECT COUNT(*) FROM public.onboarding_final) as total_onboardings,
  (SELECT COUNT(*) FROM auth.users u WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
  )) as usuarios_ainda_orfaos,
  (SELECT COUNT(*) FROM public.profiles WHERE onboarding_completed = true) as perfis_onboarding_completo,
  (SELECT COUNT(*) FROM public.onboarding_final WHERE is_completed = true) as onboardings_completos,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) > 0 THEN
      ROUND(
        ((SELECT COUNT(*) FROM public.profiles)::decimal / 
         (SELECT COUNT(*) FROM auth.users)::decimal) * 100, 
        2
      )
    ELSE 0 
  END as taxa_cobertura_perfis,
  CASE 
    WHEN (SELECT COUNT(*) FROM public.profiles) > 0 THEN
      ROUND(
        ((SELECT COUNT(*) FROM public.onboarding_final)::decimal / 
         (SELECT COUNT(*) FROM public.profiles)::decimal) * 100, 
        2
      )
    ELSE 0 
  END as taxa_cobertura_onboarding;

-- 8. Log de auditoria da correção
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  timestamp
) VALUES (
  'system_maintenance',
  'orphaned_profiles_correction',
  jsonb_build_object(
    'correction_type', 'final_orphaned_profiles_fix',
    'timestamp', now(),
    'total_users_processed', (SELECT COUNT(*) FROM auth.users),
    'profiles_created', (SELECT COUNT(*) FROM public.profiles),
    'onboardings_initialized', (SELECT COUNT(*) FROM public.onboarding_final)
  ),
  now()
);