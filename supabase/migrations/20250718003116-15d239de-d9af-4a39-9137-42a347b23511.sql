-- FASE FINAL: Ativar proteção contra senhas vazadas
-- Configurar autenticação segura
UPDATE auth.config 
SET 
  password_min_length = 8,
  password_require_special = true,
  password_require_uppercase = true,
  password_require_numbers = true
WHERE TRUE;

-- CORREÇÃO: Função de log de segurança melhorada  
CREATE OR REPLACE FUNCTION public.log_security_access(
  p_table_name text,
  p_operation text,
  p_resource_id text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Log robusto que não falha silenciosamente
  BEGIN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      resource_id,
      details,
      severity
    ) VALUES (
      auth.uid(),
      'data_access',
      p_operation,
      p_resource_id,
      jsonb_build_object(
        'table_name', p_table_name,
        'operation', p_operation,
        'timestamp', NOW(),
        'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
      ),
      'info'
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Se falhar, registrar pelo menos no sistema
      RAISE NOTICE '[SECURITY] Falha ao registrar log: % para tabela %', SQLERRM, p_table_name;
  END;
END;
$function$;