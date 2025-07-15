-- CORREÇÃO COMPLETA DO FLUXO DE CONVITES - PARTE 1: PREPARAÇÃO
-- Primeiro removemos a função existente e depois recriamos tudo

DROP FUNCTION IF EXISTS public.get_user_profile_safe(uuid);

-- 1. Corrigir perfil órfão específico identificado
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
  COALESCE(i.role_id, (SELECT id FROM public.user_roles WHERE name = 'membro' LIMIT 1)) as role_id,
  COALESCE(
    u.raw_user_meta_data->>'name',
    u.raw_user_meta_data->>'full_name',
    split_part(u.email, '@', 1)
  ) as name,
  u.created_at,
  now(),
  false
FROM auth.users u
LEFT JOIN public.invites i ON i.token = u.raw_user_meta_data->>'invite_token'
WHERE u.email = 'heloisa-de-abreu@tuamaeaquelaursa.com'
AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO UPDATE SET
  role_id = EXCLUDED.role_id,
  name = COALESCE(EXCLUDED.name, profiles.name),
  updated_at = now();

-- 2. Inicializar onboarding para este usuário com dados do convite se existir
WITH user_data AS (
  SELECT 
    u.id as user_id,
    u.email,
    u.raw_user_meta_data,
    i.whatsapp_number,
    i.notes
  FROM auth.users u
  LEFT JOIN public.invites i ON i.token = u.raw_user_meta_data->>'invite_token'
  WHERE u.email = 'heloisa-de-abreu@tuamaeaquelaursa.com'
)
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
  user_id,
  1,
  ARRAY[]::integer[],
  false,
  jsonb_build_object(
    'name', COALESCE(
      raw_user_meta_data->>'name',
      raw_user_meta_data->>'full_name',
      split_part(email, '@', 1)
    ),
    'email', email
  ) || CASE 
    WHEN whatsapp_number IS NOT NULL THEN 
      jsonb_build_object('phone', whatsapp_number, 'phone_from_invite', true)
    ELSE '{}'::jsonb
  END,
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  'in_progress',
  now(),
  now()
FROM user_data
WHERE NOT EXISTS (
  SELECT 1 FROM public.onboarding_final 
  WHERE onboarding_final.user_id = user_data.user_id
)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Executar função de limpeza geral para outros órfãos
SELECT public.fix_orphaned_invites();