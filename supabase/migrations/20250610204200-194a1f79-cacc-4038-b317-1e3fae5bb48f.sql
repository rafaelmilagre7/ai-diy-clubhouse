
-- Corrigir função para validar inconsistências nos roles dos usuários
CREATE OR REPLACE FUNCTION public.validate_profile_roles()
RETURNS TABLE(
  user_id uuid,
  email text,
  user_role text,
  user_role_id uuid,
  expected_role_name text,
  expected_role_id uuid,
  issue_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.email,
    p.role as user_role,
    p.role_id as user_role_id,
    COALESCE(ur.name, 'ROLE_NOT_FOUND') as expected_role_name,
    p.role_id as expected_role_id,
    CASE 
      WHEN p.role IS NULL AND p.role_id IS NULL THEN 'both_null'
      WHEN p.role IS NOT NULL AND p.role_id IS NULL THEN 'missing_role_id'
      WHEN p.role IS NULL AND p.role_id IS NOT NULL THEN 'missing_role'
      WHEN p.role IS NOT NULL AND p.role_id IS NOT NULL AND ur.id IS NULL THEN 'invalid_role_id'
      WHEN p.role IS NOT NULL AND p.role_id IS NOT NULL AND ur.id IS NOT NULL AND p.role != ur.name THEN 'role_mismatch'
      ELSE 'unknown'
    END as issue_type
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE 
    -- Casos problemáticos
    (p.role IS NULL AND p.role_id IS NULL) OR
    (p.role IS NOT NULL AND p.role_id IS NULL) OR
    (p.role IS NULL AND p.role_id IS NOT NULL) OR
    (p.role_id IS NOT NULL AND ur.id IS NULL) OR
    (p.role IS NOT NULL AND p.role_id IS NOT NULL AND ur.id IS NOT NULL AND p.role != ur.name)
  ORDER BY p.created_at DESC;
END;
$$;
