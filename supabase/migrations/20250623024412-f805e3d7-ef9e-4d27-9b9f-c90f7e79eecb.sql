
-- Enhanced invite security validation function
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
  -- Log validation attempt
  PERFORM public.log_invite_validation_attempt(p_token, false, 'validation_started');
  
  -- Find invite
  SELECT * INTO v_invite 
  FROM public.invites 
  WHERE UPPER(token) = UPPER(p_token)
  AND used_at IS NULL 
  AND expires_at > NOW();
  
  -- Check if invite exists
  IF v_invite.id IS NULL THEN
    PERFORM public.log_invite_validation_attempt(p_token, false, 'invite_not_found');
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
      PERFORM public.log_invite_validation_attempt(p_token, false, 'user_not_found');
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'user_not_found',
        'message', 'Usuário não encontrado'
      );
    END IF;
    
    -- Check email match (case insensitive)
    IF LOWER(v_user_email) != LOWER(v_invite.email) THEN
      PERFORM public.log_invite_validation_attempt(p_token, false, 'email_mismatch');
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
  PERFORM public.log_invite_validation_attempt(p_token, true, 'validation_success');
  
  RETURN jsonb_build_object(
    'valid', true,
    'invite_data', row_to_json(v_invite),
    'message', 'Convite válido'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    PERFORM public.log_invite_validation_attempt(p_token, false, SQLERRM);
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'system_error',
      'message', 'Erro interno do sistema'
    );
END;
$$;

-- Enhanced audit log cleanup with retry mechanism
CREATE OR REPLACE FUNCTION public.ensure_audit_log(
  p_event_type text,
  p_action text,
  p_resource_id text DEFAULT NULL,
  p_details jsonb DEFAULT NULL,
  p_retry_count integer DEFAULT 3
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempt integer := 0;
  v_success boolean := false;
BEGIN
  WHILE v_attempt < p_retry_count AND NOT v_success LOOP
    BEGIN
      INSERT INTO public.audit_logs (
        user_id,
        event_type,
        action,
        resource_id,
        details
      ) VALUES (
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
        p_event_type,
        p_action,
        p_resource_id,
        COALESCE(p_details, jsonb_build_object('timestamp', NOW()))
      );
      
      v_success := true;
      
    EXCEPTION
      WHEN OTHERS THEN
        v_attempt := v_attempt + 1;
        IF v_attempt >= p_retry_count THEN
          -- Log to system if all retries failed
          RAISE WARNING 'Failed to create audit log after % attempts: %', p_retry_count, SQLERRM;
        END IF;
        -- Small delay between retries
        PERFORM pg_sleep(0.1 * v_attempt);
    END;
  END LOOP;
  
  RETURN v_success;
END;
$$;

-- Function to log invite validation attempts
CREATE OR REPLACE FUNCTION public.log_invite_validation_attempt(
  p_token text,
  p_success boolean,
  p_details text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'invite_validation',
    CASE WHEN p_success THEN 'success' ELSE 'failure' END,
    p_token,
    jsonb_build_object(
      'success', p_success,
      'details', p_details,
      'timestamp', NOW(),
      'ip_address', inet_client_addr()
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Fail silently to not break the main flow
    NULL;
END;
$$;
