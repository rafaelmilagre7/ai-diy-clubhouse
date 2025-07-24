-- Função para verificar se email rate limit foi excedido
CREATE OR REPLACE FUNCTION public.handle_supabase_email_rate_limit_error(error_message TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  clean_email TEXT;
  invite_exists BOOLEAN := FALSE;
  result JSONB;
BEGIN
  -- Verificar se é erro de rate limit de email
  IF error_message LIKE '%email rate limit exceeded%' OR error_message LIKE '%rate limit%' THEN
    
    -- Log do erro para monitoramento
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details,
      severity
    ) VALUES (
      auth.uid(),
      'supabase_rate_limit_error',
      'email_rate_limit_exceeded',
      jsonb_build_object(
        'error_message', error_message,
        'timestamp', NOW(),
        'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
      ),
      'warning'
    );
    
    RETURN jsonb_build_object(
      'error_type', 'email_rate_limit',
      'retry_after_minutes', 5,
      'suggested_action', 'wait_and_retry',
      'user_message', 'O sistema detectou muitas tentativas de envio de email. Aguarde 5 minutos e tente novamente.',
      'support_message', 'Se o problema persistir, entre em contato com o suporte.'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'error_type', 'unknown',
    'user_message', 'Erro desconhecido. Tente novamente.'
  );
END;
$$;

-- Função para registrar tentativas de cadastro com mais detalhes
CREATE OR REPLACE FUNCTION public.log_registration_attempt(
  p_email TEXT,
  p_success BOOLEAN,
  p_error_details JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'registration_attempt',
    CASE WHEN p_success THEN 'registration_success' ELSE 'registration_failed' END,
    jsonb_build_object(
      'email', p_email,
      'success', p_success,
      'error_details', p_error_details,
      'timestamp', NOW(),
      'ip_info', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
    ),
    CASE WHEN p_success THEN 'info' ELSE 'warning' END
  );
END;
$$;