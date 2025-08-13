-- Função para reativar convites expirados
CREATE OR REPLACE FUNCTION public.reactivate_invite_secure(
  p_invite_id uuid,
  p_days_extension integer DEFAULT 7
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invite_record RECORD;
  new_expires_at TIMESTAMP WITH TIME ZONE;
  result jsonb;
BEGIN
  -- Verificar se o usuário é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Acesso negado - apenas administradores podem reativar convites'
    );
  END IF;
  
  -- Buscar o convite
  SELECT * INTO invite_record
  FROM public.invites
  WHERE id = p_invite_id;
  
  -- Verificar se o convite existe
  IF invite_record.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Convite não encontrado'
    );
  END IF;
  
  -- Verificar se o convite não foi usado
  IF invite_record.used_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Não é possível reativar um convite que já foi utilizado'
    );
  END IF;
  
  -- Calcular nova data de expiração
  new_expires_at := now() + (p_days_extension || ' days')::INTERVAL;
  
  -- Atualizar o convite
  UPDATE public.invites
  SET 
    expires_at = new_expires_at,
    updated_at = now()
  WHERE id = p_invite_id;
  
  -- Registrar auditoria
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
      'email', invite_record.email,
      'old_expires_at', invite_record.expires_at,
      'new_expires_at', new_expires_at,
      'days_extended', p_days_extension,
      'reactivated_by', auth.uid()
    ),
    'info'
  );
  
  result := jsonb_build_object(
    'success', true,
    'message', format('Convite reativado com sucesso. Nova expiração: %s', new_expires_at::date),
    'new_expires_at', new_expires_at
  );
  
  RETURN result;
  
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
      'error', format('Erro interno: %s', SQLERRM)
    );
END;
$function$;