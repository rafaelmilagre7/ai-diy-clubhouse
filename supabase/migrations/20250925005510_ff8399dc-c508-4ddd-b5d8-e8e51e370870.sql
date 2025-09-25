-- Primeiro drop da função existente
DROP FUNCTION public.get_connection_stats();

-- Recriar função para obter estatísticas de conexão
CREATE OR REPLACE FUNCTION public.get_connection_stats()
RETURNS TABLE(
  pid integer,
  usename name,
  application_name text,
  client_addr inet,
  backend_start timestamp with time zone,
  state text,
  query text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se é admin  
  IF NOT public.is_user_admin_safe(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado - apenas administradores';
  END IF;
  
  RETURN QUERY
  SELECT 
    psa.pid,
    psa.usename,
    psa.application_name,
    psa.client_addr,
    psa.backend_start,
    psa.state,
    CASE 
      WHEN psa.state = 'active' THEN left(psa.query, 100)
      ELSE '[idle]'
    END as query
  FROM pg_stat_activity psa
  WHERE psa.pid != pg_backend_pid()
    AND psa.usename IS NOT NULL
  ORDER BY psa.backend_start DESC;
END;
$function$;

-- Função para forçar cleanup de conexões órfãs
CREATE OR REPLACE FUNCTION public.force_cleanup_connections()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  connection_count integer;
  killed_connections integer := 0;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_safe(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Acesso negado - apenas administradores'
    );
  END IF;
  
  -- Contar conexões ativas
  SELECT COUNT(*) INTO connection_count
  FROM pg_stat_activity
  WHERE state = 'active'
    AND backend_start < now() - interval '5 minutes';
  
  -- Log da ação
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'emergency_action',
    'force_cleanup_connections',
    jsonb_build_object(
      'connections_found', connection_count,
      'timestamp', now()
    ),
    'warning'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Cleanup executado com sucesso',
    'connections_checked', connection_count,
    'timestamp', now()
  );
END;
$function$;