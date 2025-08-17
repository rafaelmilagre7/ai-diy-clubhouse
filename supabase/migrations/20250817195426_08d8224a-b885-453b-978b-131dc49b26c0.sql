-- Corrigir função user_has_permission para usar nova estrutura de permissões
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id uuid, permission_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar se usuário é admin (tem todas as permissões)
  IF public.is_user_admin(user_id) THEN
    RETURN true;
  END IF;
  
  -- Verificar permissão específica via nova estrutura role_permissions
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    INNER JOIN public.role_permissions rp ON ur.id = rp.role_id
    INNER JOIN public.permission_definitions pd ON rp.permission_id = pd.id
    WHERE p.id = user_id
    AND pd.code = permission_code
  );
END;
$$;