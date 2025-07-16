-- FASE 4: Correção de Funções sem Search Path - LOTE 1 (20 funções críticas)

-- 1. accept_invite
CREATE OR REPLACE FUNCTION public.accept_invite(token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  invite_record record;
  role_record record;
BEGIN
  -- Buscar convite válido
  SELECT * INTO invite_record
  FROM public.invites
  WHERE token = $1 AND expires_at > now() AND used_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Convite inválido');
  END IF;
  
  -- Buscar dados do role
  SELECT * INTO role_record
  FROM public.user_roles
  WHERE id = invite_record.role_id;
  
  -- Marcar como usado
  UPDATE public.invites
  SET used_at = now()
  WHERE id = invite_record.id;
  
  RETURN jsonb_build_object(
    'success', true,
    'invite_id', invite_record.id,
    'role', role_record.name
  );
END;
$$;

-- 2. activate_invited_user
CREATE OR REPLACE FUNCTION public.activate_invited_user(p_user_id uuid, p_email text, p_name text, p_invite_token text DEFAULT NULL::text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  profile_record public.profiles;
  invite_record public.invites;
BEGIN
  -- Buscar perfil pré-existente pelo email
  SELECT * INTO profile_record
  FROM public.profiles
  WHERE email = p_email AND status = 'invited';
  
  -- Se não encontrou perfil invited, criar perfil normal
  IF profile_record.id IS NULL THEN
    -- Buscar role padrão
    INSERT INTO public.profiles (
      id,
      email,
      name,
      role_id,
      status,
      onboarding_completed,
      created_at,
      updated_at
    )
    SELECT 
      p_user_id,
      p_email,
      p_name,
      ur.id,
      'active',
      false,
      now(),
      now()
    FROM public.user_roles ur
    WHERE ur.name = 'member'
    LIMIT 1;
    
    RETURN json_build_object(
      'status', 'success',
      'message', 'Perfil padrão criado',
      'type', 'new_profile'
    );
  END IF;
  
  -- Atualizar perfil existente para ativo
  UPDATE public.profiles
  SET 
    id = p_user_id, -- Conectar ao auth.users
    name = COALESCE(p_name, name), -- Preservar nome do convite se não informado
    status = 'active',
    updated_at = now()
  WHERE email = p_email AND status = 'invited';
  
  -- Marcar convite como usado se fornecido
  IF p_invite_token IS NOT NULL THEN
    UPDATE public.invites
    SET used_at = now()
    WHERE token = p_invite_token AND email = p_email;
  END IF;
  
  RETURN json_build_object(
    'status', 'success',
    'message', 'Perfil ativado com sucesso',
    'type', 'activated_profile',
    'profile_data', json_build_object(
      'name', COALESCE(p_name, profile_record.name),
      'email', p_email,
      'role_id', profile_record.role_id,
      'whatsapp_number', profile_record.whatsapp_number
    )
  );
END;
$$;

-- 3. admin_complete_user_cleanup
CREATE OR REPLACE FUNCTION public.admin_complete_user_cleanup(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user_email text;
  cleanup_result jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Buscar email do usuário
  SELECT email INTO user_email
  FROM public.profiles
  WHERE id = target_user_id;
  
  IF user_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Usuário não encontrado');
  END IF;
  
  -- Limpar dados do usuário
  DELETE FROM public.profiles WHERE id = target_user_id;
  DELETE FROM public.analytics WHERE user_id = target_user_id;
  DELETE FROM public.progress WHERE user_id = target_user_id;
  DELETE FROM public.onboarding_final WHERE user_id = target_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Usuário limpo completamente',
    'user_email', user_email
  );
END;
$$;

-- 4. admin_force_delete_auth_user  
CREATE OR REPLACE FUNCTION public.admin_force_delete_auth_user(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Esta função seria implementada com RPC do auth quando disponível
  RETURN jsonb_build_object(
    'success', false,
    'message', 'Função não implementada - requer acesso admin do Supabase'
  );
END;
$$;

-- 5. admin_reset_user
CREATE OR REPLACE FUNCTION public.admin_reset_user(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Reset dados do usuário
  UPDATE public.profiles
  SET 
    onboarding_completed = false,
    onboarding_completed_at = NULL,
    updated_at = now()
  WHERE id = target_user_id;
  
  DELETE FROM public.onboarding_final WHERE user_id = target_user_id;
  DELETE FROM public.progress WHERE user_id = target_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Usuário resetado com sucesso'
  );
END;
$$;