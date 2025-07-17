-- CRIAR FUNÇÃO COM ASSINATURA CORRETA
-- ==================================================================

-- 1. Criar a função is_user_admin(uuid) que está sendo procurada
CREATE OR REPLACE FUNCTION public.is_user_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = check_user_id
    AND ur.name = 'admin'
  );
END;
$$;

-- 2. Atribuir role padrão para usuários com role_id NULL
UPDATE public.profiles 
SET role_id = (
  SELECT id FROM public.user_roles 
  WHERE name IN ('membro_club', 'member', 'membro') 
  ORDER BY name LIMIT 1
)
WHERE role_id IS NULL;

-- 3. Inicialização direta dos usuários órfãos
INSERT INTO public.onboarding_final (
  user_id, current_step, completed_steps, is_completed,
  personal_info, business_info, ai_experience, goals_info,
  personalization, location_info, discovery_info, business_context,
  status, created_at, updated_at
)
SELECT 
  p.id, 1, ARRAY[]::integer[], false,
  jsonb_build_object('name', COALESCE(p.name, split_part(p.email, '@', 1)), 'email', p.email),
  CASE WHEN p.company_name IS NOT NULL THEN jsonb_build_object('company_name', p.company_name) ELSE '{}'::jsonb END,
  '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
  'in_progress', now(), now()
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.onboarding_final onf WHERE onf.user_id = p.id)
ON CONFLICT (user_id) DO NOTHING;

-- 4. Verificação final
SELECT 
  '✅ CORREÇÃO APLICADA' as status,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN onf.user_id IS NULL THEN 1 END) as sem_onboarding,
  COUNT(CASE WHEN onf.user_id IS NOT NULL THEN 1 END) as com_onboarding
FROM public.profiles p
LEFT JOIN public.onboarding_final onf ON p.id = onf.user_id;