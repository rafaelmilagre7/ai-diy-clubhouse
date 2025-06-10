
-- Criar função log_security_access para auditoria de segurança
CREATE OR REPLACE FUNCTION public.log_security_access(
  p_table_name text,
  p_operation text,
  p_resource_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir log de acesso de segurança
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    'security_access',
    p_operation,
    p_resource_id,
    jsonb_build_object(
      'table_name', p_table_name,
      'operation', p_operation,
      'timestamp', NOW(),
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Ignorar erros de auditoria silenciosamente para não interromper operações principais
    NULL;
END;
$$;
