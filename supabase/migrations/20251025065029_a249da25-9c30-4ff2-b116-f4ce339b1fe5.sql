-- Corrigir tipo de retorno da função get_users_for_broadcast
-- Necessário DROP e CREATE pois não é possível alterar tipo de retorno

DROP FUNCTION IF EXISTS get_users_for_broadcast(TEXT[], TIMESTAMP, TEXT);

CREATE OR REPLACE FUNCTION get_users_for_broadcast(
  p_roles TEXT[] DEFAULT NULL,
  p_created_after TIMESTAMP DEFAULT NULL,
  p_status TEXT DEFAULT 'active'
)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  role_name VARCHAR(50)
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.email,
    ur.name as role_name
  FROM profiles p
  LEFT JOIN user_roles ur ON p.role_id = ur.id
  WHERE 
    (p_roles IS NULL OR ur.name = ANY(p_roles))
    AND (p_created_after IS NULL OR p.created_at >= p_created_after)
    AND (p_status = 'active')
    AND p.id IS NOT NULL
  ORDER BY p.created_at DESC;
END;
$$;

COMMENT ON FUNCTION get_users_for_broadcast IS 
'Retorna usuários elegíveis para broadcast com tipos corretos';