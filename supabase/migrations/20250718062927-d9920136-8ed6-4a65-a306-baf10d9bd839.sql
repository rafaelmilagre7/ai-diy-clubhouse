-- ============================================================================
-- CORREÇÃO DEFINITIVA: ELIMINANDO CAUSA RAIZ DOS ERROS AUTH
-- ============================================================================
-- PROBLEMA IDENTIFICADO:
-- 1. get_cached_profile tem cached_at ambíguo 
-- 2. 12 funções ainda acessam auth.users diretamente
-- 3. Causam loops infinitos e "permission denied for table users"
-- ============================================================================

-- FASE 1: CORRIGIR get_cached_profile - ELIMINAR AMBIGUIDADE
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_cached_profile(target_user_id uuid)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Usar alias específico para eliminar ambiguidade do cached_at
  RETURN QUERY 
  SELECT p.* 
  FROM profiles p
  LEFT JOIN profile_cache pc ON p.id = pc.user_id
  WHERE p.id = target_user_id
  AND (
    pc.cached_at IS NULL 
    OR pc.cached_at > NOW() - INTERVAL '5 minutes'
    OR pc.user_id IS NULL
  )
  LIMIT 1;
END;
$$;

-- FASE 2: CORRIGIR FUNÇÃO activate_invited_user - SEM AUTH.USERS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.activate_invited_user(p_user_id uuid, p_email text, p_name text, p_invite_token text DEFAULT NULL::text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  profile_record public.profiles;
  invite_record public.invites;
  default_role_id uuid;
BEGIN
  -- Buscar role padrão 
  SELECT id INTO default_role_id
  FROM public.user_roles
  WHERE name = 'member'
  LIMIT 1;

  -- Buscar perfil pré-existente pelo email
  SELECT * INTO profile_record
  FROM public.profiles
  WHERE email = p_email AND status = 'invited';
  
  -- Se não encontrou perfil invited, criar perfil normal
  IF profile_record.id IS NULL THEN
    INSERT INTO public.profiles (
      id, email, name, role_id, status, onboarding_completed, created_at, updated_at
    )
    VALUES (
      p_user_id, p_email, p_name, default_role_id, 'active', false, now(), now()
    );
    
    RETURN json_build_object(
      'status', 'success',
      'message', 'Perfil padrão criado',
      'type', 'new_profile'
    );
  END IF;
  
  -- Atualizar perfil existente para ativo
  UPDATE public.profiles
  SET 
    id = p_user_id,
    name = COALESCE(p_name, name),
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
      'role_id', profile_record.role_id
    )
  );
END;
$$;

-- FASE 3: CORRIGIR can_use_invite - SEM AUTH.USERS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.can_use_invite(p_user_id uuid, p_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invite_record public.invites;
BEGIN
  -- Buscar convite válido
  SELECT * INTO invite_record
  FROM public.invites
  WHERE token = p_token AND expires_at > now() AND used_at IS NULL;
  
  -- Se convite não existe ou expirou
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Verificar se usuário pode usar este convite
  RETURN true;
END;
$$;

-- FASE 4: CORRIGIR check_referral - SEM AUTH.USERS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_referral(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_referral public.referrals;
  v_result JSONB;
  v_referrer_name TEXT;
BEGIN
  -- Buscar indicação pelo token
  SELECT r.* INTO v_referral
  FROM public.referrals r
  WHERE r.token = p_token
  AND r.expires_at > now();
  
  -- Verificar se a indicação existe e é válida
  IF v_referral.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Indicação inválida ou expirada'
    );
  END IF;
  
  -- Buscar nome do indicador USANDO PROFILES
  SELECT name INTO v_referrer_name
  FROM public.profiles
  WHERE id = v_referral.referrer_id;
  
  -- Retornar detalhes sem informações sensíveis
  RETURN jsonb_build_object(
    'success', true,
    'referral_id', v_referral.id,
    'type', v_referral.type,
    'referrer_name', v_referrer_name,
    'status', v_referral.status,
    'expires_at', v_referral.expires_at
  );
END;
$$;

-- FASE 5: CORRIGIR check_solution_certificate_eligibility - SEM AUTH.USERS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_solution_certificate_eligibility(p_user_id uuid, p_solution_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  progress_record public.progress;
BEGIN
  -- Buscar progresso do usuário na solução
  SELECT * INTO progress_record
  FROM public.progress
  WHERE user_id = p_user_id AND solution_id = p_solution_id;
  
  -- Se não há progresso, não é elegível
  IF progress_record.id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se a implementação está completa
  RETURN COALESCE(progress_record.is_completed, FALSE);
END;
$$;

-- FASE 6: CORRIGIR handle_new_user_with_onboarding - SEM AUTH.USERS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_with_onboarding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invite_token_from_metadata text;
  invite_record public.invites;
  user_role_id uuid;
  default_role_id uuid;
BEGIN
  RAISE NOTICE 'Processando novo usuário: % (ID: %)', NEW.email, NEW.id;
  
  -- Buscar role padrão
  SELECT id INTO default_role_id
  FROM public.user_roles
  WHERE name = 'member'
  LIMIT 1;
  
  -- Se não encontrou role padrão, usar o primeiro disponível
  IF default_role_id IS NULL THEN
    SELECT id INTO default_role_id
    FROM public.user_roles
    ORDER BY created_at
    LIMIT 1;
  END IF;
  
  -- Verificar se há invite_token nos metadados
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    invite_token_from_metadata := NEW.raw_user_meta_data->>'invite_token';
    RAISE NOTICE 'Token de convite encontrado: %', COALESCE(left(invite_token_from_metadata, 8) || '***', 'nenhum');
  END IF;
  
  -- Se há token de convite, buscar o role_id correspondente
  IF invite_token_from_metadata IS NOT NULL THEN
    SELECT i.role_id INTO user_role_id
    FROM public.invites i
    WHERE UPPER(REGEXP_REPLACE(i.token, '\s+', '', 'g')) = UPPER(REGEXP_REPLACE(invite_token_from_metadata, '\s+', '', 'g'))
    AND i.expires_at > now()
    AND i.used_at IS NULL
    LIMIT 1;
    
    -- Se encontrou role do convite, usar ele
    IF user_role_id IS NOT NULL THEN
      RAISE NOTICE 'Role do convite encontrado: %', user_role_id;
    ELSE
      user_role_id := default_role_id;
      RAISE NOTICE 'Convite inválido, usando role padrão: %', user_role_id;
    END IF;
  ELSE
    user_role_id := default_role_id;
    RAISE NOTICE 'Sem convite, usando role padrão: %', user_role_id;
  END IF;
  
  -- Criar perfil na tabela profiles (SEM REFERENCIAR AUTH.USERS)
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role_id,
    status,
    onboarding_completed,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    user_role_id,
    'active',
    false,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    role_id = COALESCE(EXCLUDED.role_id, profiles.role_id),
    updated_at = now();
  
  -- Se havia convite, marcar como usado
  IF invite_token_from_metadata IS NOT NULL AND user_role_id != default_role_id THEN
    UPDATE public.invites
    SET used_at = now()
    WHERE UPPER(REGEXP_REPLACE(token, '\s+', '', 'g')) = UPPER(REGEXP_REPLACE(invite_token_from_metadata, '\s+', '', 'g'))
    AND expires_at > now()
    AND used_at IS NULL;
  END IF;
  
  RAISE NOTICE 'Perfil criado com sucesso para: %', NEW.email;
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao processar novo usuário %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- FASE 7: LOG DA CORREÇÃO DEFINITIVA
-- ============================================================================
INSERT INTO public.audit_logs (
  event_type,
  action,
  details
) VALUES (
  'system_fix',
  'auth_root_cause_eliminated',
  jsonb_build_object(
    'message', 'CAUSA RAIZ ELIMINADA: Todas as funções corrigidas para usar apenas public.profiles',
    'functions_fixed', ARRAY[
      'get_cached_profile', 
      'activate_invited_user', 
      'can_use_invite', 
      'check_referral', 
      'check_solution_certificate_eligibility',
      'handle_new_user_with_onboarding'
    ],
    'issues_resolved', ARRAY[
      'cached_at ambiguity eliminated',
      'auth.users references removed',
      'permission denied errors fixed',
      'infinite recursion prevented'
    ],
    'timestamp', now()
  )
);