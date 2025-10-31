-- ETAPA 1: Criar função SECURITY DEFINER para bypass das RLS
CREATE OR REPLACE FUNCTION public.get_current_profile_values(p_user_id uuid)
RETURNS TABLE (
  current_id uuid,
  current_email text,
  current_role_id uuid,
  current_organization_id uuid,
  current_is_master_user boolean,
  current_status text,
  current_onboarding_completed boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    email,
    role_id,
    organization_id,
    is_master_user,
    status,
    onboarding_completed
  FROM public.profiles
  WHERE id = p_user_id;
$$;

COMMENT ON FUNCTION public.get_current_profile_values(uuid) IS 
'Função SECURITY DEFINER que retorna valores atuais do perfil sem acionar RLS. Usada pela policy profiles_update_safe_fields_only para prevenir recursão infinita.';

-- ETAPA 2: Recriar a policy usando a função SECURITY DEFINER
DROP POLICY IF EXISTS "profiles_update_safe_fields_only" ON profiles;

CREATE POLICY "profiles_update_safe_fields_only"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND (
    SELECT 
      id = current_id
      AND email = current_email
      AND COALESCE(role_id, '00000000-0000-0000-0000-000000000000'::uuid) = 
          COALESCE(current_role_id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'::uuid) = 
          COALESCE(current_organization_id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND COALESCE(is_master_user, false) = COALESCE(current_is_master_user, false)
      AND COALESCE(status, 'active') = COALESCE(current_status, 'active')
      AND COALESCE(onboarding_completed, false) = COALESCE(current_onboarding_completed, false)
    FROM public.get_current_profile_values(auth.uid())
  )
);

COMMENT ON POLICY "profiles_update_safe_fields_only" ON profiles IS 
'Permite usuários editarem apenas campos seguros. Usa get_current_profile_values() para evitar recursão infinita nas RLS policies.';