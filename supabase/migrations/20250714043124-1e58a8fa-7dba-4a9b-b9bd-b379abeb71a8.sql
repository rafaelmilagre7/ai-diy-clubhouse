-- Melhorar função de limpeza de estado de auth e adicionar função de diagnóstico
CREATE OR REPLACE FUNCTION public.diagnose_auth_state(target_user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile public.profiles;
  user_role public.user_roles;
  auth_user_exists boolean;
  onboarding_status jsonb;
  invite_history jsonb;
  result jsonb;
BEGIN
  -- Verificar se o usuário existe no auth.users
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE id = target_user_id
  ) INTO auth_user_exists;

  -- Buscar perfil
  SELECT * INTO user_profile FROM public.profiles WHERE id = target_user_id;
  
  -- Buscar role se perfil existe
  IF user_profile.id IS NOT NULL THEN
    SELECT * INTO user_role FROM public.user_roles WHERE id = user_profile.role_id;
  END IF;

  -- Buscar status de onboarding
  SELECT jsonb_build_object(
    'quick_onboarding_exists', EXISTS(SELECT 1 FROM public.quick_onboarding WHERE user_id = target_user_id),
    'onboarding_final_exists', EXISTS(SELECT 1 FROM public.onboarding_final WHERE user_id = target_user_id),
    'profile_onboarding_completed', user_profile.onboarding_completed
  ) INTO onboarding_status;

  -- Buscar histórico de convites
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', i.id,
      'email', i.email,
      'token', left(i.token, 8) || '***',
      'used_at', i.used_at,
      'expires_at', i.expires_at,
      'role_name', ur.name
    )
  ) INTO invite_history
  FROM public.invites i
  LEFT JOIN public.user_roles ur ON i.role_id = ur.id
  WHERE i.email = user_profile.email;

  -- Montar resultado
  result := jsonb_build_object(
    'user_id', target_user_id,
    'auth_user_exists', auth_user_exists,
    'profile', CASE 
      WHEN user_profile.id IS NOT NULL THEN 
        jsonb_build_object(
          'exists', true,
          'email', user_profile.email,
          'name', user_profile.name,
          'role_id', user_profile.role_id,
          'onboarding_completed', user_profile.onboarding_completed,
          'created_at', user_profile.created_at
        )
      ELSE jsonb_build_object('exists', false)
    END,
    'role', CASE 
      WHEN user_role.id IS NOT NULL THEN 
        jsonb_build_object(
          'id', user_role.id,
          'name', user_role.name,
          'description', user_role.description
        )
      ELSE null
    END,
    'onboarding_status', onboarding_status,
    'invite_history', COALESCE(invite_history, '[]'::jsonb),
    'diagnosis_timestamp', now()
  );

  RETURN result;
END;
$$;

-- Melhorar função de validação de token de convite
CREATE OR REPLACE FUNCTION public.validate_invite_token_safe(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cleaned_token text;
  invite_record public.invites;
  role_record public.user_roles;
  result jsonb;
BEGIN
  -- Limpar e normalizar o token
  cleaned_token := UPPER(REGEXP_REPLACE(TRIM(p_token), '\s+', '', 'g'));
  
  RAISE NOTICE 'Validando token: %', left(cleaned_token, 8) || '***';
  
  -- Buscar convite
  SELECT i.* INTO invite_record
  FROM public.invites i
  WHERE UPPER(REGEXP_REPLACE(i.token, '\s+', '', 'g')) = cleaned_token
  ORDER BY i.created_at DESC
  LIMIT 1;
  
  -- Se não encontrou o convite
  IF invite_record.id IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'token_not_found',
      'message', 'Token de convite não encontrado'
    );
  END IF;
  
  -- Verificar se expirou
  IF invite_record.expires_at < now() THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'expired',
      'message', 'Token de convite expirado',
      'expired_at', invite_record.expires_at
    );
  END IF;
  
  -- Verificar se já foi usado
  IF invite_record.used_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'already_used',
      'message', 'Token de convite já foi utilizado',
      'used_at', invite_record.used_at
    );
  END IF;
  
  -- Buscar informações do role
  SELECT * INTO role_record FROM public.user_roles WHERE id = invite_record.role_id;
  
  -- Token válido
  RETURN jsonb_build_object(
    'valid', true,
    'invite', jsonb_build_object(
      'id', invite_record.id,
      'email', invite_record.email,
      'role_id', invite_record.role_id,
      'expires_at', invite_record.expires_at,
      'created_at', invite_record.created_at,
      'notes', invite_record.notes
    ),
    'role', CASE 
      WHEN role_record.id IS NOT NULL THEN 
        jsonb_build_object(
          'id', role_record.id,
          'name', role_record.name,
          'description', role_record.description
        )
      ELSE null
    END,
    'message', 'Token de convite válido'
  );
END;
$$;

-- Função para limpar dados órfãos
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  orphaned_profiles integer := 0;
  invalid_roles integer := 0;
  duplicate_onboarding integer := 0;
  result jsonb;
BEGIN
  -- Contar perfis órfãos (sem role válido)
  SELECT COUNT(*) INTO orphaned_profiles
  FROM public.profiles p
  WHERE p.role_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.id = p.role_id
  );
  
  -- Contar duplicatas de onboarding
  SELECT COUNT(*) - COUNT(DISTINCT user_id) INTO duplicate_onboarding
  FROM public.quick_onboarding;
  
  -- Limpar perfis órfãos atribuindo role padrão
  UPDATE public.profiles
  SET role_id = (
    SELECT id FROM public.user_roles 
    WHERE name IN ('member', 'membro') 
    ORDER BY name LIMIT 1
  )
  WHERE role_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.id = profiles.role_id
  );
  
  GET DIAGNOSTICS invalid_roles = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'orphaned_profiles_found', orphaned_profiles,
    'invalid_roles_fixed', invalid_roles,
    'duplicate_onboarding_found', duplicate_onboarding,
    'cleanup_timestamp', now()
  );
END;
$$;

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_invites_email_lower ON public.invites(lower(email));
CREATE INDEX IF NOT EXISTS idx_invites_expires_used ON public.invites(expires_at, used_at) WHERE used_at IS NULL;