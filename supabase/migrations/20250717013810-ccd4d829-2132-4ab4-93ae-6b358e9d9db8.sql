-- CORREÇÃO FINAL: Corrigir role_id NULL e inicialização
-- ==================================================================

-- 1. Primeiro, atribuir role padrão para usuários com role_id NULL
UPDATE public.profiles 
SET role_id = (
  SELECT id FROM public.user_roles 
  WHERE name IN ('membro_club', 'member', 'membro') 
  ORDER BY name LIMIT 1
)
WHERE role_id IS NULL;

-- 2. Verificar se todos têm role_id agora
SELECT 
  'USUÁRIOS COM ROLE' as status,
  COUNT(*) as total,
  COUNT(CASE WHEN role_id IS NULL THEN 1 END) as sem_role,
  COUNT(CASE WHEN role_id IS NOT NULL THEN 1 END) as com_role
FROM public.profiles;

-- 3. Agora fazer a inicialização em massa (sem trigger conflito)
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
  location_info,
  discovery_info,
  business_context,
  status,
  created_at,
  updated_at
)
SELECT 
  p.id,
  1, -- Começar no step 1
  ARRAY[]::integer[], -- Nenhum step completado
  false, -- Não completado
  -- Personal info construído dinamicamente
  jsonb_strip_nulls(
    jsonb_build_object(
      'name', COALESCE(
        p.name,
        au.raw_user_meta_data->>'name',
        au.raw_user_meta_data->>'full_name', 
        au.raw_user_meta_data->>'display_name',
        split_part(COALESCE(p.email, au.email), '@', 1)
      ),
      'email', COALESCE(p.email, au.email)
    )
  ),
  -- Business info do perfil se existir
  CASE 
    WHEN p.company_name IS NOT NULL THEN jsonb_build_object('company_name', p.company_name)
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
LEFT JOIN auth.users au ON p.id = au.id
LEFT JOIN public.onboarding_final onf ON p.id = onf.user_id
WHERE onf.user_id IS NULL -- Apenas usuários órfãos
ON CONFLICT (user_id) DO NOTHING;

-- 4. Verificação final
SELECT 
  'RESULTADO FINAL' as status,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN onf.user_id IS NULL THEN 1 END) as usuarios_ainda_orfaos,
  COUNT(CASE WHEN onf.user_id IS NOT NULL THEN 1 END) as usuarios_com_onboarding,
  ROUND(
    (COUNT(CASE WHEN onf.user_id IS NOT NULL THEN 1 END)::decimal / COUNT(*)::decimal) * 100, 
    2
  ) as cobertura_percentual_final
FROM public.profiles p
LEFT JOIN public.onboarding_final onf ON p.id = onf.user_id;