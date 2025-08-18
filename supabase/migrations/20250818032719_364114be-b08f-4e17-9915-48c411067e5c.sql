-- Verificar e corrigir a função can_access_course
CREATE OR REPLACE FUNCTION public.can_access_course(p_course_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role_id uuid;
  is_admin_user boolean := false;
BEGIN
  -- Verificar se o usuário existe e obter sua role
  SELECT p.role_id INTO user_role_id
  FROM public.profiles p
  WHERE p.id = p_user_id;
  
  -- Se usuário não encontrado, negar acesso
  IF user_role_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se é admin (admins têm acesso a tudo)
  SELECT ur.name = 'admin' INTO is_admin_user
  FROM public.user_roles ur
  WHERE ur.id = user_role_id;
  
  IF is_admin_user THEN
    RETURN true;
  END IF;
  
  -- Verificar acesso específico na tabela course_access_control
  RETURN EXISTS (
    SELECT 1
    FROM public.course_access_control cac
    WHERE cac.course_id = p_course_id
    AND cac.role_id = user_role_id
  );
END;
$$;