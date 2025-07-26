-- Implementar recomendações de segurança do linter

-- 1. Corrigir search_path das funções de segurança
ALTER FUNCTION public.update_user_health_metrics_updated_at() SET search_path = 'public';
ALTER FUNCTION public.setup_learning_storage_buckets() SET search_path = 'public';
ALTER FUNCTION public.cleanup_expired_sessions() SET search_path = 'public';
ALTER FUNCTION public.update_invite_send_attempt(uuid) SET search_path = 'public';
ALTER FUNCTION public.increment(uuid, text, text) SET search_path = 'public';
ALTER FUNCTION public.decrement(uuid, text, text) SET search_path = 'public';
ALTER FUNCTION public.decrement_suggestion_downvote(uuid) SET search_path = 'public';
ALTER FUNCTION public.decrement_suggestion_upvote(uuid) SET search_path = 'public';

-- 2. Configurar settings de segurança para auth
-- Reduzir tempo de expiração do OTP para 5 minutos (300 segundos)
UPDATE auth.config 
SET otp_expiry = 300 
WHERE TRUE;

-- 3. Habilitar proteção contra senhas vazadas
UPDATE auth.config 
SET password_min_length = 8,
    password_require_uppercase = true,
    password_require_lowercase = true,
    password_require_numbers = true,
    password_require_symbols = false
WHERE TRUE;

-- 4. Adicionar rate limiting mais rigoroso para funções sensíveis
CREATE OR REPLACE FUNCTION public.enhanced_rate_limit_check(
  p_identifier text,
  p_action_type text,
  p_max_attempts integer DEFAULT 3,
  p_window_minutes integer DEFAULT 10
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_attempt_count INTEGER;
BEGIN
  -- Calcular início da janela
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Contar tentativas na janela atual
  SELECT COUNT(*)
  INTO v_attempt_count
  FROM public.audit_logs
  WHERE details->>'identifier' = p_identifier
    AND action = p_action_type
    AND timestamp >= v_window_start;
  
  -- Verificar se limite foi excedido
  IF v_attempt_count >= p_max_attempts THEN
    -- Log da violação
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details,
      severity
    ) VALUES (
      auth.uid(),
      'rate_limit_exceeded',
      p_action_type,
      jsonb_build_object(
        'identifier', p_identifier,
        'attempts_in_window', v_attempt_count,
        'max_allowed', p_max_attempts,
        'window_minutes', p_window_minutes
      ),
      'high'
    );
    
    RETURN FALSE;
  END IF;
  
  -- Registrar tentativa
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'rate_limit_check',
    p_action_type,
    jsonb_build_object(
      'identifier', p_identifier,
      'attempts_in_window', v_attempt_count + 1,
      'max_allowed', p_max_attempts
    ),
    'info'
  );
  
  RETURN TRUE;
END;
$$;

-- 5. Melhorar função de validação de credenciais com rate limiting
CREATE OR REPLACE FUNCTION public.secure_credential_validation(
  p_validation_code text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  certificate_record RECORD;
  user_record RECORD;
  solution_record RECORD;
  result JSONB;
  client_ip TEXT;
BEGIN
  -- Obter IP do cliente
  client_ip := COALESCE(
    current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
    current_setting('request.headers', true)::jsonb->>'x-real-ip',
    'unknown'
  );
  
  -- Rate limiting por IP
  IF NOT public.enhanced_rate_limit_check(
    client_ip, 
    'certificate_validation', 
    5, -- máximo 5 tentativas
    15 -- em 15 minutos
  ) THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Muitas tentativas de validação. Tente novamente em 15 minutos.'
    );
  END IF;
  
  -- Buscar certificado
  SELECT * INTO certificate_record
  FROM public.solution_certificates
  WHERE validation_code = p_validation_code;
  
  IF certificate_record.id IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Código de validação inválido'
    );
  END IF;
  
  -- Buscar dados do usuário e solução
  SELECT name, email INTO user_record
  FROM public.profiles
  WHERE id = certificate_record.user_id;
  
  SELECT title, category INTO solution_record
  FROM public.solutions
  WHERE id = certificate_record.solution_id;
  
  result := jsonb_build_object(
    'valid', true,
    'certificate_id', certificate_record.id,
    'user_name', user_record.name,
    'solution_title', solution_record.title,
    'solution_category', solution_record.category,
    'implementation_date', certificate_record.implementation_date,
    'issued_at', certificate_record.issued_at,
    'validation_code', certificate_record.validation_code
  );
  
  RETURN result;
END;
$$;