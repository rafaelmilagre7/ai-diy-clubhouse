-- 🎯 CORREÇÃO: Melhorar função initialize_onboarding_for_user para marcar corretamente campos do convite
CREATE OR REPLACE FUNCTION public.initialize_onboarding_for_user(p_user_id uuid, p_invite_data jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  existing_onboarding_id uuid;
  profile_record public.profiles;
  personal_info_data jsonb;
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
  
  -- Construir personal_info com dados do convite se disponível
  personal_info_data := '{}'::jsonb;
  
  -- Adicionar nome do perfil se existir
  IF profile_record.name IS NOT NULL THEN
    personal_info_data := personal_info_data || jsonb_build_object('name', profile_record.name);
  END IF;
  
  -- 🎯 CORREÇÃO: Marcar corretamente os campos que vieram do convite
  IF p_invite_data != '{}'::jsonb THEN
    -- Email do convite
    IF p_invite_data->>'email' IS NOT NULL THEN
      personal_info_data := personal_info_data || jsonb_build_object(
        'email', p_invite_data->>'email',
        'from_invite', true,
        'email_from_invite', true
      );
    END IF;
    
    -- WhatsApp do convite
    IF p_invite_data->>'whatsapp_number' IS NOT NULL THEN
      personal_info_data := personal_info_data || jsonb_build_object(
        'phone', p_invite_data->>'whatsapp_number',
        'from_invite', true,
        'phone_from_invite', true
      );
    END IF;
    
    -- 🎯 CORREÇÃO: Tentar extrair nome das notes se não tiver nome no perfil
    IF profile_record.name IS NULL AND p_invite_data->>'notes' IS NOT NULL THEN
      -- Verificar se as notes contêm um nome (formato simples)
      IF p_invite_data->>'notes' ~ '^[A-Za-zÀ-ÿ\s]{2,50}$' THEN
        personal_info_data := personal_info_data || jsonb_build_object(
          'name', p_invite_data->>'notes',
          'from_invite', true,
          'name_from_invite', true
        );
      END IF;
    ELSIF profile_record.name IS NOT NULL THEN
      -- Se tem nome no perfil, marcar se veio do convite
      personal_info_data := personal_info_data || jsonb_build_object(
        'name_from_invite', true
      );
    END IF;
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
  
  RAISE NOTICE 'Onboarding inicializado para usuário % com dados do convite: %', p_user_id, personal_info_data;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Onboarding inicializado com sucesso',
    'onboarding_id', existing_onboarding_id,
    'already_existed', false,
    'invite_data_used', p_invite_data != '{}'::jsonb,
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