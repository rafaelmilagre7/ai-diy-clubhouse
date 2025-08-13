-- Corrigir função reactivate_invite_secure removendo referência à coluna inexistente updated_at
CREATE OR REPLACE FUNCTION public.reactivate_invite_secure(p_invite_id uuid, p_days_extension integer DEFAULT 7)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invite_record RECORD;
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
  
  -- Buscar convite
  SELECT * INTO invite_record
  FROM public.invites
  WHERE id = p_invite_id;
  
  IF invite_record.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Convite não encontrado',
      'error_code', 'NOT_FOUND'
    );
  END IF;
  
  -- Verificar se convite já foi usado
  IF invite_record.used_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Convite já foi utilizado',
      'error_code', 'ALREADY_USED'
    );
  END IF;
  
  -- Calcular nova data de expiração
  new_expires_at := GREATEST(
    invite_record.expires_at,
    now()
  ) + (p_days_extension || ' days')::INTERVAL;
  
  -- Atualizar convite (removido updated_at que não existe)
  UPDATE public.invites
  SET expires_at = new_expires_at
  WHERE id = p_invite_id;
  
  -- Log da reativação
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
    'reactivate_invite',
    p_invite_id::text,
    jsonb_build_object(
      'invite_id', p_invite_id,
      'old_expires_at', invite_record.expires_at,
      'new_expires_at', new_expires_at,
      'days_extension', p_days_extension,
      'reactivated_by', auth.uid()
    ),
    'info'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', format('Convite reativado por %s dias', p_days_extension),
    'data', jsonb_build_object(
      'invite_id', p_invite_id,
      'old_expires_at', invite_record.expires_at,
      'new_expires_at', new_expires_at,
      'days_extension', p_days_extension
    )
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details,
      severity
    ) VALUES (
      auth.uid(),
      'error',
      'reactivate_invite_failed',
      jsonb_build_object(
        'error_message', SQLERRM,
        'error_state', SQLSTATE,
        'invite_id', p_invite_id
      ),
      'high'
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Erro interno: %s', SQLERRM),
      'error_code', 'INTERNAL_ERROR'
    );
END;
$function$;