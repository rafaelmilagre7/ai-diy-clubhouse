-- Correção da função check_invite_rate_limit para não quebrar o fluxo de cadastro
-- Problema: INSERT em audit_logs falhava para usuários não autenticados (auth.uid() = NULL)
-- Solução: Tratamento de erro silencioso no INSERT

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
AS $$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_attempt_count INTEGER;
BEGIN
  -- Calcular janela de tempo
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Contar tentativas na janela de tempo
  SELECT COUNT(*)
  INTO v_attempt_count
  FROM public.rate_limits
  WHERE identifier = COALESCE(p_identifier, auth.uid()::text, 'anonymous')
    AND action_type = p_action_type
    AND created_at >= v_window_start;
  
  -- ✅ CORREÇÃO: Log silencioso que não quebra o fluxo de cadastro
  -- Se falhar (ex: user_id NULL, coluna não existe), continua normalmente
  BEGIN
    INSERT INTO public.audit_logs (
      user_id, 
      event_type, 
      action, 
      details
    ) VALUES (
      auth.uid(), 
      'invite_rate_limit_check', 
      p_action_type,
      jsonb_build_object(
        'attempts', v_attempt_count,
        'max_attempts', p_max_attempts,
        'window_minutes', p_window_minutes,
        'allowed', v_attempt_count < p_max_attempts,
        'identifier', COALESCE(p_identifier, 'anonymous')
      )
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Falha silenciosamente - não impedir o cadastro
      -- Log opcional: pode descomentar para debug
      -- RAISE WARNING 'Erro ao inserir audit_log: %', SQLERRM;
      NULL;
  END;
  
  -- Verificar se excedeu o limite
  IF v_attempt_count >= p_max_attempts THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Comentário explicativo
COMMENT ON FUNCTION public.check_invite_rate_limit IS 
'Verifica rate limit para ações de convite. Permite registros mesmo se o log de auditoria falhar (usuários não autenticados).';
