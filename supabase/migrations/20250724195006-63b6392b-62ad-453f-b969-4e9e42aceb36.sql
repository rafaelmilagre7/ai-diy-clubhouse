-- Criar função de rate limiting específica para convites
CREATE OR REPLACE FUNCTION public.check_invite_rate_limit(
  p_action_type text,
  p_identifier text DEFAULT NULL,
  p_max_attempts integer DEFAULT 20,
  p_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_attempt_count INTEGER;
BEGIN
  -- Configurações muito mais permissivas para convites
  -- 20 tentativas em 60 minutos = muito mais generoso
  
  -- Calculate window start time
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Count attempts in the current window
  SELECT COUNT(*)
  INTO v_attempt_count
  FROM public.rate_limits
  WHERE identifier = COALESCE(p_identifier, auth.uid()::text, 'anonymous')
    AND action_type = p_action_type
    AND created_at >= v_window_start;
  
  -- Log da verificação para debug
  INSERT INTO public.audit_logs (
    user_id, event_type, action, details
  ) VALUES (
    auth.uid(), 
    'invite_rate_limit_check', 
    p_action_type,
    jsonb_build_object(
      'attempts', v_attempt_count,
      'max_attempts', p_max_attempts,
      'window_minutes', p_window_minutes,
      'allowed', v_attempt_count < p_max_attempts
    )
  );
  
  -- Check if limit exceeded
  IF v_attempt_count >= p_max_attempts THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$function$;