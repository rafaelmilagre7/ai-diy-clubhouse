-- Corrigir funções com search_path vulnerável
-- Aplicar SET search_path = 'public' nas funções críticas

-- Exemplo para função is_user_admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id 
    AND ur.name = 'admin'
  );
$$;

-- Aplicar o mesmo padrão para outras funções críticas
CREATE OR REPLACE FUNCTION public.get_user_role_secure(target_user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role_name text;
  user_email text;
BEGIN
  IF target_user_id IS NULL THEN
    RETURN 'anonymous';
  END IF;
  
  SELECT ur.name INTO user_role_name
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id
  LIMIT 1;
  
  IF user_role_name IS NOT NULL THEN
    RETURN user_role_name;
  END IF;
  
  SELECT p.email INTO user_email
  FROM public.profiles p
  WHERE p.id = target_user_id
  LIMIT 1;
  
  IF user_email IS NOT NULL AND user_email LIKE '%@viverdeia.ai' THEN
    RETURN 'admin';
  END IF;
  
  RETURN 'member';
END;
$$;