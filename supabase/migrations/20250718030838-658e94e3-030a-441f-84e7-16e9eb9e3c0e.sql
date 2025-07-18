-- FASE 5: Corrigir função de logging que já existe

-- Primeiro remover a função existente para recriá-la
DROP FUNCTION IF EXISTS public.log_security_violation(text, text, text, jsonb);

-- Recriar a função com parâmetros corretos
CREATE OR REPLACE FUNCTION public.log_security_violation(
  violation_type text,
  resource_table text,
  attempted_action text,
  user_context jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'security_violation',
    attempted_action,
    resource_table,
    jsonb_build_object(
      'violation_type', violation_type,
      'table', resource_table,
      'user_context', user_context,
      'timestamp', NOW(),
      'session_info', jsonb_build_object(
        'role', public.get_user_role(),
        'user_id', auth.uid()
      )
    ),
    'high'
  );
END;
$$;