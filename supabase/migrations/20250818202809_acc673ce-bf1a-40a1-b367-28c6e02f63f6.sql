-- Corrigir função get_user_permissions com search_path seguro
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id uuid)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_permissions text[];
BEGIN
  -- Buscar permissões através do role do usuário
  SELECT ARRAY_AGG(pd.code)
  INTO user_permissions
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  JOIN public.role_permissions rp ON ur.id = rp.role_id
  JOIN public.permission_definitions pd ON rp.permission_id = pd.id
  WHERE p.id = p_user_id;
  
  RETURN COALESCE(user_permissions, ARRAY[]::text[]);
END;
$$;

-- Corrigir função user_has_permission com search_path seguro
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id uuid, permission_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    JOIN public.role_permissions rp ON ur.id = rp.role_id
    JOIN public.permission_definitions pd ON rp.permission_id = pd.id
    WHERE p.id = user_has_permission.user_id 
    AND pd.code = permission_code
  );
END;
$$;