-- Correção da função get_users_for_broadcast
-- Problema: profiles usa 'id' como user_id, não 'user_id'
CREATE OR REPLACE FUNCTION get_users_for_broadcast(
  p_roles TEXT[] DEFAULT NULL,
  p_created_after TIMESTAMP DEFAULT NULL,
  p_status TEXT DEFAULT 'active'
)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  role_name TEXT
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
'Retorna lista de usuários elegíveis para receber broadcast de notificações (CORRIGIDO)';