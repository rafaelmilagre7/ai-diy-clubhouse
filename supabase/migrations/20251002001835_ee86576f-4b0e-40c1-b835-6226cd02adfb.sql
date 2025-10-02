-- Função para buscar membros de um master específico
-- Busca independente da paginação principal
CREATE OR REPLACE FUNCTION public.get_master_team_members(
  p_master_user_id uuid,
  p_organization_id uuid
)
RETURNS TABLE(
  id uuid,
  email text,
  name text,
  avatar_url text,
  company_name text,
  industry text,
  created_at timestamp with time zone,
  role_id uuid,
  user_roles jsonb,
  onboarding_completed boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar permissão admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado - apenas administradores';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.name,
    p.avatar_url,
    p.company_name,
    p.industry,
    p.created_at,
    p.role_id,
    jsonb_build_object(
      'id', ur.id,
      'name', ur.name,
      'description', ur.description
    ) as user_roles,
    p.onboarding_completed
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.organization_id = p_organization_id
    AND p.id != p_master_user_id
    AND p.is_master_user = false
  ORDER BY p.name NULLS LAST, p.email;
END;
$$;