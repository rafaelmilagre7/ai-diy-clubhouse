-- 🎯 CORREÇÃO CRÍTICA: Função que busca dados do convite automaticamente pelo token
CREATE OR REPLACE FUNCTION public.initialize_onboarding_for_user(p_user_id uuid, p_invite_token text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  existing_onboarding_id uuid;
  profile_record public.profiles;
  invite_record public.invites;
  personal_info_data jsonb;
  cleaned_token text;
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
  
  -- 🎯 BUSCAR DADOS DO CONVITE PELO TOKEN se fornecido
  IF p_invite_token IS NOT NULL THEN
    cleaned_token := UPPER(REGEXP_REPLACE(TRIM(p_invite_token), '\s+', '', 'g'));
    
    SELECT * INTO invite_record
    FROM public.invites
    WHERE UPPER(REGEXP_REPLACE(token, '\s+', '', 'g')) = cleaned_token
    ORDER BY created_at DESC
    LIMIT 1;
    
    RAISE NOTICE 'Buscando convite com token % - Encontrado: %', left(cleaned_token, 8) || '***', invite_record.id IS NOT NULL;
  END IF;
  
  -- Construir personal_info com dados do convite se disponível
  personal_info_data := '{}'::jsonb;
  
  -- 🎯 USAR DADOS REAIS DO CONVITE se encontrado
  IF invite_record.id IS NOT NULL THEN
    -- Email do convite
    IF invite_record.email IS NOT NULL THEN
      personal_info_data := personal_info_data || jsonb_build_object(
        'email', invite_record.email,
        'from_invite', true,
        'email_from_invite', true
      );
    END IF;
    
    -- WhatsApp do convite  
    IF invite_record.whatsapp_number IS NOT NULL THEN
      personal_info_data := personal_info_data || jsonb_build_object(
        'phone', invite_record.whatsapp_number,
        'from_invite', true,
        'phone_from_invite', true
      );
    END IF;
    
    -- Nome das notes se for um nome válido
    IF profile_record.name IS NULL AND invite_record.notes IS NOT NULL THEN
      IF invite_record.notes ~ '^[A-Za-zÀ-ÿ\s]{2,50}$' THEN
        personal_info_data := personal_info_data || jsonb_build_object(
          'name', invite_record.notes,
          'from_invite', true,
          'name_from_invite', true
        );
      END IF;
    END IF;
  END IF;
  
  -- Adicionar nome do perfil se existir e não veio do convite
  IF profile_record.name IS NOT NULL AND (personal_info_data->>'name') IS NULL THEN
    personal_info_data := personal_info_data || jsonb_build_object(
      'name', profile_record.name,
      'name_from_invite', invite_record.id IS NOT NULL
    );
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
    COALESCE(
      CASE 
        WHEN profile_record.company_name IS NOT NULL THEN 
          jsonb_build_object('company_name', profile_record.company_name)
        ELSE '{}'::jsonb
      END,
      '{}'::jsonb
    ),
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
    'invite_token_used', p_invite_token IS NOT NULL,
    'invite_found', invite_record.id IS NOT NULL,
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
$function$;