-- Criar função para reativar todos os convites expirados em lote
CREATE OR REPLACE FUNCTION public.reactivate_all_expired_invites_secure(p_days_extension integer DEFAULT 7)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invite_record RECORD;
  reactivated_count INTEGER := 0;
  failed_count INTEGER := 0;
  error_details JSONB := '[]'::JSONB;
  new_expires_at TIMESTAMP WITH TIME ZONE;
  result JSONB;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Acesso negado - apenas administradores',
      'error_code', 'UNAUTHORIZED'
    );
  END IF;
  
  -- Rate limiting básico
  IF NOT public.enhanced_rate_limit_check(
    auth.uid()::text, 
    'bulk_reactivate_invites', 
    3, -- máximo 3 tentativas
    60 -- em 60 minutos
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Muitas tentativas de reativação em lote. Tente novamente em 1 hora.',
      'error_code', 'RATE_LIMITED'
    );
  END IF;
  
  -- Buscar todos os convites expirados e não utilizados
  FOR invite_record IN 
    SELECT id, expires_at, email
    FROM public.invites
    WHERE used_at IS NULL 
    AND expires_at <= now()
    ORDER BY expires_at ASC
    LIMIT 500 -- Limite de segurança para evitar timeout
  LOOP
    BEGIN
      -- Calcular nova data de expiração
      new_expires_at := GREATEST(
        invite_record.expires_at,
        now()
      ) + (p_days_extension || ' days')::INTERVAL;
      
      -- Atualizar convite
      UPDATE public.invites
      SET expires_at = new_expires_at
      WHERE id = invite_record.id;
      
      -- Log individual da reativação
      INSERT INTO public.audit_logs (
        user_id,
        event_type,
        action,
        resource_id,
        details,
        severity
      ) VALUES (
        auth.uid(),
        'invite_management',
        'bulk_reactivate_invite',
        invite_record.id::text,
        jsonb_build_object(
          'invite_id', invite_record.id,
          'email', invite_record.email,
          'old_expires_at', invite_record.expires_at,
          'new_expires_at', new_expires_at,
          'days_extension', p_days_extension,
          'bulk_operation', true
        ),
        'info'
      );
      
      reactivated_count := reactivated_count + 1;
      
    EXCEPTION
      WHEN OTHERS THEN
        failed_count := failed_count + 1;
        error_details := error_details || jsonb_build_object(
          'invite_id', invite_record.id,
          'email', invite_record.email,
          'error', SQLERRM
        );
        -- Continuar com próximo convite mesmo se um falhar
        CONTINUE;
    END;
  END LOOP;
  
  -- Log consolidado da operação
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'invite_management',
    'bulk_reactivate_operation_completed',
    jsonb_build_object(
      'reactivated_count', reactivated_count,
      'failed_count', failed_count,
      'days_extension', p_days_extension,
      'admin_user_id', auth.uid(),
      'errors', error_details
    ),
    CASE WHEN failed_count > 0 THEN 'warning' ELSE 'info' END
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', format('%s convites reativados com sucesso', reactivated_count),
    'data', jsonb_build_object(
      'reactivated_count', reactivated_count,
      'failed_count', failed_count,
      'days_extension', p_days_extension,
      'errors', error_details
    )
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro geral
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details,
      severity
    ) VALUES (
      auth.uid(),
      'error',
      'bulk_reactivate_operation_failed',
      jsonb_build_object(
        'error_message', SQLERRM,
        'error_state', SQLSTATE,
        'reactivated_before_error', reactivated_count
      ),
      'high'
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Erro interno na operação em lote: %s', SQLERRM),
      'error_code', 'INTERNAL_ERROR',
      'partial_success', reactivated_count > 0,
      'reactivated_count', reactivated_count
    );
END;
$function$;