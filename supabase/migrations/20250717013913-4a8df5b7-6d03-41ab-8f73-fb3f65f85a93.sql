-- CRIAÇÃO DA FUNÇÃO is_user_admin e correção final
-- ==================================================================

-- 1. Criar função is_user_admin que está faltando
CREATE OR REPLACE FUNCTION public.is_user_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = check_user_id 
    AND ur.name = 'admin'
  );
$$;

-- 2. Atribuir role padrão para usuários com role_id NULL
UPDATE public.profiles 
SET role_id = (
  SELECT id FROM public.user_roles 
  WHERE name IN ('membro_club', 'member', 'membro') 
  ORDER BY name LIMIT 1
)
WHERE role_id IS NULL;

-- 3. Inicialização em massa para usuários órfãos
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