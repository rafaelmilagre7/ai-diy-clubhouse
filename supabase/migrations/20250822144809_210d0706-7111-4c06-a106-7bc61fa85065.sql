-- Função RPC para obter estatísticas de conexão detalhadas
CREATE OR REPLACE FUNCTION get_connection_stats()
RETURNS TABLE (
  pid integer,
  usename text,
  application_name text,
  client_addr inet,
  backend_start timestamp with time zone,
  state text,
  query_start timestamp with time zone,
  state_change timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    pg_stat_activity.pid,
    pg_stat_activity.usename,
    pg_stat_activity.application_name,
    pg_stat_activity.client_addr,
    pg_stat_activity.backend_start,
    pg_stat_activity.state,
    pg_stat_activity.query_start,
    pg_stat_activity.state_change
  FROM pg_stat_activity 
  WHERE pg_stat_activity.pid <> pg_backend_pid()
  ORDER BY pg_stat_activity.backend_start;
$$;

-- Criar índices otimizados para audit_logs para melhorar performance de limpeza
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp_cleanup 
ON audit_logs(timestamp) 
WHERE timestamp < (now() - interval '30 days');

CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type_severity 
ON audit_logs(event_type, severity, timestamp);

-- Trigger para limpeza automática de audit_logs (executar de forma assíncrona)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Executar limpeza apenas 1% das vezes para não impactar performance
  IF random() < 0.01 THEN
    -- Deletar logs com mais de 30 dias em background
    DELETE FROM audit_logs 
    WHERE timestamp < (now() - interval '30 days')
    AND id IN (
      SELECT id FROM audit_logs 
      WHERE timestamp < (now() - interval '30 days')
      LIMIT 100  -- Deletar em pequenos lotes
    );
  END IF;
  
  RETURN NULL;
END;
$$;

-- Aplicar trigger após inserções (com probabilidade baixa para não impactar performance)
DROP TRIGGER IF EXISTS trigger_cleanup_audit_logs ON audit_logs;
CREATE TRIGGER trigger_cleanup_audit_logs
  AFTER INSERT ON audit_logs
  FOR EACH STATEMENT
  EXECUTE FUNCTION cleanup_old_audit_logs();