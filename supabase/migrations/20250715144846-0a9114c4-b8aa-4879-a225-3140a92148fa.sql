-- Atualizar função initialize_onboarding_for_user para extrair dados completos do convite
CREATE OR REPLACE FUNCTION public.initialize_onboarding_for_user(p_user_id uuid, p_invite_data jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_onboarding_id uuid;
  profile_record public.profiles;
  personal_info_data jsonb;
  business_info_data jsonb;
  invite_record public.invites;
BEGIN
  -- Verificar se já existe onboarding
  SELECT id INTO existing_onboarding_id
  FROM public.onboarding_final
  WHERE user_id = p_user_id;
  
  -- Se já existe, retornar sucesso
  IF existing_onboarding_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Onboarding já existe',
      'onboarding_id', existing_onboarding_id,
      'already_existed', true
    );
  END IF;
  
  -- Buscar dados do perfil
  SELECT * INTO profile_record
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Buscar dados do convite se possível (via email do perfil)
  IF profile_record.email IS NOT NULL THEN
    SELECT * INTO invite_record
    FROM public.invites
    WHERE email = profile_record.email
    AND used_at IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  -- Construir personal_info com dados do perfil e convite
  personal_info_data := '{}'::jsonb;
  
  -- Adicionar dados do perfil
  IF profile_record.name IS NOT NULL THEN
    personal_info_data := personal_info_data || jsonb_build_object('name', profile_record.name);
  END IF;
  
  IF profile_record.email IS NOT NULL THEN
    personal_info_data := personal_info_data || jsonb_build_object('email', profile_record.email);
  END IF;
  
  -- Adicionar dados do convite se disponível
  IF invite_record.id IS NOT NULL THEN
    personal_info_data := personal_info_data || jsonb_build_object('from_invite', true);
    
    -- WhatsApp do convite
    IF invite_record.whatsapp_number IS NOT NULL THEN
      personal_info_data := personal_info_data || jsonb_build_object(
        'phone', invite_record.whatsapp_number,
        'phone_from_invite', true
      );
    END IF;
    
    -- Tentar extrair nome das notes se não tiver nome no perfil
    IF profile_record.name IS NULL AND invite_record.notes IS NOT NULL THEN
      -- Verificar se as notes contêm um nome (formato simples)
      IF invite_record.notes ~ '^[A-Za-zÀ-ÿ\s]{2,50}$' THEN
        personal_info_data := personal_info_data || jsonb_build_object(
          'name', invite_record.notes,
          'name_from_invite', true
        );
      END IF;
    END IF;
  END IF;
  
  -- Adicionar dados do parâmetro p_invite_data se fornecido
  IF p_invite_data != '{}'::jsonb THEN
    personal_info_data := personal_info_data || p_invite_data;
  END IF;
  
  -- Construir business_info inicial
  business_info_data := '{}'::jsonb;
  IF profile_record.company_name IS NOT NULL THEN
    business_info_data := jsonb_build_object('company_name', profile_record.company_name);
  END IF;
  
  -- Criar registro de onboarding inicial
  INSERT INTO public.onboarding_final (
    user_id,
    current_step,
    completed_steps,
    is_completed,
    personal_info,
    business_info,
    ai_experience,
    goals_info,
    personalization,
    status,
    created_at,
    updated_at
  )
  VALUES (
    p_user_id,
    1,
    ARRAY[]::integer[],
    false,
    personal_info_data,
    business_info_data,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    'in_progress',
    now(),
    now()
  )
  RETURNING id INTO existing_onboarding_id;
  
  RAISE NOTICE 'Onboarding inicializado para usuário % com dados: %', p_user_id, personal_info_data;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Onboarding inicializado com sucesso',
    'onboarding_id', existing_onboarding_id,
    'already_existed', false,
    'invite_data_used', invite_record.id IS NOT NULL OR p_invite_data != '{}'::jsonb,
    'personal_info_preloaded', personal_info_data
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao inicializar onboarding para %: %', p_user_id, SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro ao inicializar onboarding: ' || SQLERRM
    );
END;
$$;

-- Criar função para aplicar convite E inicializar onboarding em uma transação
CREATE OR REPLACE FUNCTION public.use_invite_with_onboarding(invite_token text, user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_record public.invites;
  cleaned_token text;
  role_record public.user_roles;
  onboarding_result jsonb;
  invite_data jsonb;
BEGIN
  -- Limpar o token
  cleaned_token := upper(regexp_replace(invite_token, '\s+', '', 'g'));
  
  RAISE NOTICE 'Aplicando convite % para usuário %', left(cleaned_token, 8) || '***', user_id;
  
  -- Buscar convite válido
  SELECT * INTO invite_record
  FROM public.invites
  WHERE upper(regexp_replace(token, '\s+', '', 'g')) = cleaned_token
  AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Verificar se encontrou o convite
  IF invite_record.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'token_not_found',
      'message', 'Token de convite não encontrado ou expirado'
    );
  END IF;
  
  -- Verificar se já foi usado
  IF invite_record.used_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'already_used',
      'message', 'Token de convite já foi utilizado'
    );
  END IF;
  
  -- Buscar informações do role
  SELECT * INTO role_record FROM public.user_roles WHERE id = invite_record.role_id;
  
  -- Criar/atualizar perfil com dados do convite
  INSERT INTO public.profiles (id, email, role_id, name, created_at, updated_at)
  VALUES (
    user_id,
    invite_record.email,
    invite_record.role_id,
    CASE 
      WHEN invite_record.notes ~ '^[A-Za-zÀ-ÿ\s]{2,50}$' THEN invite_record.notes
      ELSE NULL
    END,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    role_id = invite_record.role_id,
    email = EXCLUDED.email,
    name = COALESCE(profiles.name, EXCLUDED.name),
    updated_at = now();
  
  -- Marcar convite como usado
  UPDATE public.invites
  SET used_at = now()
  WHERE id = invite_record.id;
  
  -- Preparar dados do convite para o onboarding
  invite_data := jsonb_build_object(
    'email', invite_record.email,
    'from_invite', true
  );
  
  IF invite_record.whatsapp_number IS NOT NULL THEN
    invite_data := invite_data || jsonb_build_object(
      'phone', invite_record.whatsapp_number,
      'phone_from_invite', true
    );
  END IF;
  
  IF invite_record.notes IS NOT NULL AND invite_record.notes ~ '^[A-Za-zÀ-ÿ\s]{2,50}$' THEN
    invite_data := invite_data || jsonb_build_object(
      'name', invite_record.notes,
      'name_from_invite', true
    );
  END IF;
  
  -- Inicializar onboarding com dados do convite
  SELECT public.initialize_onboarding_for_user(user_id, invite_data) INTO onboarding_result;
  
  RAISE NOTICE 'Convite aplicado e onboarding inicializado para usuário %', user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Convite aplicado e onboarding inicializado com sucesso',
    'invite_id', invite_record.id,
    'role_id', invite_record.role_id,
    'role_name', role_record.name,
    'onboarding_result', onboarding_result,
    'invite_data_preloaded', invite_data
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao aplicar convite: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro interno ao aplicar convite: ' || SQLERRM
    );
END;
$$;