
-- Função para obter todas as permissões de um usuário
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id UUID)
RETURNS SETOF TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_role AS (
    SELECT role_id
    FROM public.profiles
    WHERE id = user_id
  ),
  all_permissions AS (
    -- Verifica se o usuário tem papel com permissão 'all'
    SELECT 
      CASE 
        WHEN EXISTS (
          SELECT 1 
          FROM user_role ur
          JOIN public.user_roles r ON r.id = ur.role_id
          WHERE r.permissions->>'all' = 'true'
        )
        THEN 'admin.all'::TEXT
        ELSE NULL
      END AS permission_code
    
    UNION ALL
    
    -- Busca permissões específicas do papel do usuário
    SELECT pd.code
    FROM user_role ur
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    JOIN public.permission_definitions pd ON pd.id = rp.permission_id
  )
  SELECT permission_code
  FROM all_permissions
  WHERE permission_code IS NOT NULL;
END;
$$;
