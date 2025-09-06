-- Função admin para corrigir email no auth.users
CREATE OR REPLACE FUNCTION admin_correct_auth_email(
  target_user_id uuid,
  new_email text,
  admin_notes text DEFAULT 'Email correction'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
AS $$
DECLARE
  current_email text;
  result jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Acesso negado - apenas administradores'
    );
  END IF;
  
  -- Buscar email atual no auth.users
  SELECT email INTO current_email
  FROM auth.users
  WHERE id = target_user_id;
  
  IF current_email IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Usuário não encontrado no auth.users'
    );
  END IF;
  
  -- Backup do estado atual
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    target_user_id,
    'auth_email_correction',
    'auth_users_email_update',
    jsonb_build_object(
      'user_id', target_user_id,
      'old_auth_email', current_email,
      'new_auth_email', new_email,
      'admin_notes', admin_notes,
      'corrected_by', auth.uid(),
      'correction_timestamp', now()
    ),
    'critical'
  );
  
  -- Atualizar email no auth.users
  UPDATE auth.users 
  SET 
    email = new_email,
    updated_at = now()
  WHERE id = target_user_id;
  
  -- Invalidar todas as sessões ativas do usuário
  DELETE FROM auth.sessions 
  WHERE user_id = target_user_id;
  
  -- Registrar sucesso
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    target_user_id,
    'auth_email_correction',
    'auth_correction_completed',
    jsonb_build_object(
      'user_id', target_user_id,
      'final_auth_email', new_email,
      'sessions_invalidated', true,
      'correction_status', 'success',
      'timestamp', now()
    ),
    'info'
  );
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Email corrigido no auth.users com sucesso',
    'user_id', target_user_id,
    'old_email', current_email,
    'new_email', new_email,
    'sessions_invalidated', true
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
      target_user_id,
      'auth_email_correction',
      'auth_correction_error',
      jsonb_build_object(
        'error', SQLERRM,
        'error_detail', SQLSTATE,
        'timestamp', now()
      ),
      'error'
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Erro interno: ' || SQLERRM
    );
END;
$$;