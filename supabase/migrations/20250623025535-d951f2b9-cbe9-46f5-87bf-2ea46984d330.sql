
-- Função para aceitar convite (usuário já logado)
CREATE OR REPLACE FUNCTION public.accept_invite(
  p_token text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite public.invites%ROWTYPE;
  v_user_id uuid;
  v_result jsonb;
BEGIN
  -- Obter ID do usuário autenticado
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Usuário não autenticado'
    );
  END IF;
  
  -- Buscar convite válido
  SELECT * INTO v_invite 
  FROM public.invites 
  WHERE UPPER(token) = UPPER(p_token)
  AND used_at IS NULL 
  AND expires_at > NOW();
  
  IF v_invite.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Convite não encontrado ou expirado'
    );
  END IF;
  
  -- Verificar se o email do convite confere com o usuário logado
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = v_user_id 
    AND LOWER(email) = LOWER(v_invite.email)
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Este convite não foi enviado para o seu email'
    );
  END IF;
  
  -- Marcar convite como usado
  UPDATE public.invites
  SET used_at = NOW(),
      used_by = v_user_id
  WHERE id = v_invite.id;
  
  -- Atualizar role do usuário
  UPDATE public.profiles
  SET role_id = v_invite.role_id
  WHERE id = v_user_id;
  
  -- Verificar se precisa de onboarding
  DECLARE
    requires_onboarding boolean := false;
  BEGIN
    SELECT NOT COALESCE(onboarding_completed, false) 
    INTO requires_onboarding
    FROM public.profiles 
    WHERE id = v_user_id;
  END;
  
  -- Log de auditoria
  PERFORM public.ensure_audit_log(
    'invite_acceptance',
    'accept_success',
    p_token,
    jsonb_build_object(
      'user_id', v_user_id,
      'invite_id', v_invite.id,
      'role_id', v_invite.role_id
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Convite aceito com sucesso!',
    'requires_onboarding', requires_onboarding
  );
  
EXCEPTION
  WHEN OTHERS THEN
    PERFORM public.ensure_audit_log(
      'invite_acceptance',
      'accept_error',
      p_token,
      jsonb_build_object('error', SQLERRM)
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro interno do sistema'
    );
END;
$$;

-- Função para registrar novo usuário com convite
CREATE OR REPLACE FUNCTION public.register_with_invite(
  p_token text,
  p_name text,
  p_password text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite public.invites%ROWTYPE;
  v_user_id uuid;
  v_user_email text;
  v_result jsonb;
BEGIN
  -- Buscar convite válido
  SELECT * INTO v_invite 
  FROM public.invites 
  WHERE UPPER(token) = UPPER(p_token)
  AND used_at IS NULL 
  AND expires_at > NOW();
  
  IF v_invite.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Convite não encontrado ou expirado'
    );
  END IF;
  
  -- Verificar se o email já existe
  IF EXISTS (
    SELECT 1 FROM auth.users WHERE LOWER(email) = LOWER(v_invite.email)
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Já existe uma conta com este email'
    );
  END IF;
  
  -- Criar usuário usando auth.users (simulado - na prática o Supabase faz isso)
  -- Como não podemos inserir diretamente em auth.users, retornamos sucesso
  -- e o frontend deve usar supabase.auth.signUp
  
  -- Por enquanto, retornamos sucesso para permitir que o frontend proceda
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Pronto para criar conta',
    'email', v_invite.email,
    'role_id', v_invite.role_id,
    'requires_onboarding', true
  );
  
EXCEPTION
  WHEN OTHERS THEN
    PERFORM public.ensure_audit_log(
      'invite_registration',
      'register_error',
      p_token,
      jsonb_build_object('error', SQLERRM)
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro interno do sistema'
    );
END;
$$;

-- Função auxiliar para finalizar registro após criação do usuário
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
  -- Buscar convite válido
  SELECT * INTO v_invite 
  FROM public.invites 
  WHERE UPPER(token) = UPPER(p_token)
  AND used_at IS NULL 
  AND expires_at > NOW();
  
  IF v_invite.id IS NULL THEN
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
  
  -- Log de auditoria
  PERFORM public.ensure_audit_log(
    'invite_registration',
    'complete_success',
    p_token,
    jsonb_build_object(
      'user_id', p_user_id,
      'invite_id', v_invite.id,
      'role_id', v_invite.role_id
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Registro completado com sucesso!'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro ao completar registro'
    );
END;
$$;
