
-- Criar função log_security_access para registrar eventos de acesso
CREATE OR REPLACE FUNCTION public.log_security_access(
  p_table_name text,
  p_operation text, 
  p_resource_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Inserir log na tabela audit_logs
  -- Usar try/catch interno para falhar silenciosamente em caso de erro
  BEGIN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      resource_id,
      details,
      severity,
      timestamp
    ) VALUES (
      auth.uid(),
      'system_event',
      p_operation,
      p_resource_id,
      jsonb_build_object(
        'table_name', p_table_name,
        'operation', p_operation,
        'timestamp', NOW(),
        'resource_id', p_resource_id
      ),
      'info',
      NOW()
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Falhar silenciosamente - não propagar erros para não quebrar o fluxo principal
      NULL;
  END;
END;
$function$;
