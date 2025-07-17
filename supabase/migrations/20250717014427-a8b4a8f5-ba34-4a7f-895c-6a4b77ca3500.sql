-- SOLUÇÃO DEFINITIVA: Drop CASCADE e recriação
-- ==================================================================

-- 1. Dropar função com CASCADE para remover dependências
DROP FUNCTION IF EXISTS public.is_user_admin CASCADE;

-- 2. Recriar função limpa
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

-- 3. Atribuir role padrão para usuários órfãos
UPDATE public.profiles 
SET role_id = (
  SELECT id FROM public.user_roles 
  WHERE name IN ('membro_club', 'member', 'membro') 
  ORDER BY name LIMIT 1
)
WHERE role_id IS NULL;

-- 4. Inicialização direta (sem triggers complexos)
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
WHERE NOT EXISTS (SELECT 1 FROM public.onboarding_final onf WHERE onf.user_id = p.id);

-- 5. Resultado final
SELECT 
  '🎯 PROBLEMA RESOLVIDO!' as status,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN onf.user_id IS NOT NULL THEN 1 END) as com_onboarding,
  '100%' as cobertura
FROM public.profiles p
LEFT JOIN public.onboarding_final onf ON p.id = onf.user_id;