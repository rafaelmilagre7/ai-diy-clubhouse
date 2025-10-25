-- Função para buscar usuários elegíveis para broadcast
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
    p.user_id,
    p.email,
    ur.name as role_name
  FROM profiles p
  LEFT JOIN user_roles ur ON p.role_id = ur.id
  WHERE 
    (p_roles IS NULL OR ur.name = ANY(p_roles))
    AND (p_created_after IS NULL OR p.created_at >= p_created_after)
    AND (p_status = 'active') -- Apenas usuários ativos
    AND p.user_id IS NOT NULL
  ORDER BY p.created_at DESC;
END;
$$;

-- Função para registrar eventos de broadcast (auditoria)
CREATE OR REPLACE FUNCTION log_broadcast_event(
  p_admin_id UUID,
  p_title TEXT,
  p_total_sent INTEGER,
  p_total_failed INTEGER,
  p_duration_ms INTEGER,
  p_filters JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Registrar em uma tabela de audit_logs (se existir)
  -- Por enquanto, apenas log no servidor
  RAISE NOTICE 'BROADCAST_EVENT: admin=%, title=%, sent=%, failed=%, duration=%ms', 
    p_admin_id, p_title, p_total_sent, p_total_failed, p_duration_ms;
    
  -- Você pode adicionar INSERT em uma tabela de audit_logs aqui se desejar
END;
$$;

-- Comentários
COMMENT ON FUNCTION get_users_for_broadcast IS 
'Retorna lista de usuários elegíveis para receber broadcast de notificações';

COMMENT ON FUNCTION log_broadcast_event IS 
'Registra evento de broadcast para auditoria';