-- Criar função de validação de admin para a edge function
CREATE OR REPLACE FUNCTION public.validate_admin_access(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role_name text;
  user_email text;
  is_admin_result boolean := false;
BEGIN
  -- Buscar role do usuário
  SELECT ur.name INTO user_role_name
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = user_id
  LIMIT 1;
  
  -- Buscar email do usuário
  SELECT p.email INTO user_email
  FROM public.profiles p
  WHERE p.id = user_id
  LIMIT 1;
  
  -- Verificar se é admin por role ou email @viverdeia.ai
  is_admin_result := (user_role_name = 'admin') OR (user_email LIKE '%@viverdeia.ai');
  
  RETURN jsonb_build_object(
    'is_admin', is_admin_result,
    'user_role', COALESCE(user_role_name, 'member'),
    'user_email', COALESCE(user_email, 'not_found'),
    'validation_method', CASE 
      WHEN user_role_name = 'admin' THEN 'role_based'
      WHEN user_email LIKE '%@viverdeia.ai' THEN 'email_based'
      ELSE 'not_admin'
    END
  );
END;
$$;