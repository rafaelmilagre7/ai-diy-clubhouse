
-- Corrigir constraint de audit_logs para incluir todos os tipos de eventos necessários
-- Remove a constraint existente e cria uma nova com tipos mais abrangentes

ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_event_type_check;

-- Criar nova constraint com todos os tipos de eventos necessários
ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_event_type_check 
CHECK (event_type IN (
  'auth',
  'authentication', 
  'user_registration',
  'invite_process',
  'invite_validation',
  'invite_acceptance',
  'invite_registration',
  'data_access',
  'system_event',
  'security_event',
  'user_action',
  'admin_action',
  'log_info',
  'log_warning',
  'log_error'
));

-- Função auxiliar para validar e inserir logs de auditoria de forma segura
CREATE OR REPLACE FUNCTION public.safe_audit_log(
  p_event_type text,
  p_action text,
  p_resource_id text DEFAULT NULL,
  p_details jsonb DEFAULT NULL,
  p_severity text DEFAULT 'info'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_success boolean := false;
BEGIN
  -- Obter ID do usuário (pode ser NULL para eventos do sistema)
  v_user_id := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);
  
  -- Tentar inserir o log
  BEGIN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      resource_id,
      details,
      severity,
      timestamp
    ) VALUES (
      v_user_id,
      p_event_type,
      p_action,
      p_resource_id,
      COALESCE(p_details, jsonb_build_object('timestamp', NOW())),
      p_severity,
      NOW()
    );
    
    v_success := true;
    
  EXCEPTION
    WHEN check_violation THEN
      -- Log do tipo não permitido - falhar silenciosamente
      v_success := false;
    WHEN OTHERS THEN
      -- Outros erros - falhar silenciosamente
      v_success := false;
  END;
  
  RETURN v_success;
END;
$$;

-- Atualizar função de validação de convite para usar logging seguro
CREATE OR REPLACE FUNCTION public.validate_user_invite_match(
  p_token text,
  p_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite public.invites%ROWTYPE;
  v_user_email text;
  v_result jsonb;
BEGIN
  -- Log validation attempt usando função segura
  PERFORM public.safe_audit_log('invite_validation', 'validation_started', p_token);
  
  -- Find invite
  SELECT * INTO v_invite 
  FROM public.invites 
  WHERE UPPER(token) = UPPER(p_token)
  AND used_at IS NULL 
  AND expires_at > NOW();
  
  -- Check if invite exists
  IF v_invite.id IS NULL THEN
    PERFORM public.safe_audit_log('invite_validation', 'invite_not_found', p_token);
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'invite_not_found',
      'message', 'Convite não encontrado ou expirado'
    );
  END IF;
  
  -- If user provided, validate email match
  IF p_user_id IS NOT NULL THEN
    SELECT email INTO v_user_email 
    FROM auth.users 
    WHERE id = p_user_id;
    
    IF v_user_email IS NULL THEN
      PERFORM public.safe_audit_log('invite_validation', 'user_not_found', p_token);
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'user_not_found',
        'message', 'Usuário não encontrado'
      );
    END IF;
    
    -- Check email match (case insensitive)
    IF LOWER(v_user_email) != LOWER(v_invite.email) THEN
      PERFORM public.safe_audit_log('invite_validation', 'email_mismatch', p_token);
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'email_mismatch',
        'message', format('Este convite foi enviado para %s, mas você está logado como %s', v_invite.email, v_user_email),
        'invite_email', v_invite.email,
        'user_email', v_user_email
      );
    END IF;
  END IF;
  
  -- Success
  PERFORM public.safe_audit_log('invite_validation', 'validation_success', p_token);
  
  RETURN jsonb_build_object(
    'valid', true,
    'invite_data', row_to_json(v_invite),
    'message', 'Convite válido'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    PERFORM public.safe_audit_log('invite_validation', 'validation_error', p_token, 
      jsonb_build_object('error', SQLERRM));
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'system_error',
      'message', 'Erro interno do sistema'
    );
END;
$$;

-- Atualizar função de completar registro de convite para usar logging seguro
CREATE OR REPLACE FUNCTION public.complete_invite_registration(
  p_token text,
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite public.invites%ROWTYPE;
BEGIN
  -- Log de início do processo
  PERFORM public.safe_audit_log('invite_registration', 'complete_started', p_token, 
    jsonb_build_object('user_id', p_user_id));
  
  -- Buscar convite válido
  SELECT * INTO v_invite 
  FROM public.invites 
  WHERE UPPER(token) = UPPER(p_token)
  AND used_at IS NULL 
  AND expires_at > NOW();
  
  IF v_invite.id IS NULL THEN
    PERFORM public.safe_audit_log('invite_registration', 'invite_not_found', p_token);
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Convite não encontrado ou expirado'
    );
  END IF;
  
  -- Marcar convite como usado
  UPDATE public.invites
  SET used_at = NOW(),
      used_by = p_user_id
  WHERE id = v_invite.id;
  
  -- Criar/atualizar perfil do usuário
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role_id,
    onboarding_completed
  ) VALUES (
    p_user_id,
    v_invite.email,
    '', -- Nome será atualizado no onboarding
    v_invite.role_id,
    false
  ) ON CONFLICT (id) DO UPDATE SET
    role_id = v_invite.role_id,
    email = v_invite.email;
  
  -- Log de sucesso
  PERFORM public.safe_audit_log('invite_registration', 'complete_success', p_token,
    jsonb_build_object(
      'user_id', p_user_id,
      'invite_id', v_invite.id,
      'role_id', v_invite.role_id
    ));
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Registro completado com sucesso!'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    PERFORM public.safe_audit_log('invite_registration', 'complete_error', p_token,
      jsonb_build_object('error', SQLERRM, 'user_id', p_user_id));
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro ao completar registro'
    );
END;
$$;
