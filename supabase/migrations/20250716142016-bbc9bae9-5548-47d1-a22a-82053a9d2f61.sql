-- Corrigir função de inicialização do onboarding para usar dados do usuário como fallback
CREATE OR REPLACE FUNCTION public.initialize_onboarding_for_user(p_user_id uuid, p_invite_token text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  existing_onboarding_id uuid;
  profile_record public.profiles;
  invite_record public.invites;
  auth_user_record record;
  personal_info_data jsonb;
  cleaned_token text;
  user_registered_name text;
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
  
  -- 🎯 BUSCAR DADOS DO AUTH.USERS para nome registrado
  SELECT 
    raw_user_meta_data->>'name' as name,
    raw_user_meta_data->>'full_name' as full_name,
    raw_user_meta_data->>'display_name' as display_name
  INTO auth_user_record
  FROM auth.users
  WHERE id = p_user_id;
  
  -- Extrair nome do usuário registrado
  user_registered_name := COALESCE(
    auth_user_record.name,
    auth_user_record.full_name,
    auth_user_record.display_name,
    profile_record.name
  );
  
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
  
  -- Construir personal_info com lógica de priorização correta
  personal_info_data := '{}'::jsonb;
  
  -- 🎯 EMAIL: Sempre do convite se disponível
  IF invite_record.id IS NOT NULL AND invite_record.email IS NOT NULL THEN
    personal_info_data := personal_info_data || jsonb_build_object(
      'email', invite_record.email,
      'email_from_invite', true
    );
  END IF;
  
  -- 🎯 TELEFONE: Do convite se disponível
  IF invite_record.id IS NOT NULL AND invite_record.whatsapp_number IS NOT NULL THEN
    personal_info_data := personal_info_data || jsonb_build_object(
      'phone', invite_record.whatsapp_number,
      'phone_from_invite', true
    );
  END IF;
  
  -- 🎯 NOME: Prioridade: convite (notes) > usuário registrado > perfil
  IF invite_record.id IS NOT NULL AND invite_record.notes IS NOT NULL 
     AND invite_record.notes ~ '^[A-Za-zÀ-ÿ\s]{2,50}$' THEN
    -- Nome do convite (notes)
    personal_info_data := personal_info_data || jsonb_build_object(
      'name', invite_record.notes,
      'name_from_invite', true
    );
  ELSIF user_registered_name IS NOT NULL THEN
    -- Nome do usuário registrado (não do convite)
    personal_info_data := personal_info_data || jsonb_build_object(
      'name', user_registered_name,
      'name_from_invite', false
    );
  END IF;
  
  -- Marcar se teve dados do convite
  IF invite_record.id IS NOT NULL THEN
    personal_info_data := personal_info_data || jsonb_build_object('from_invite', true);
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
    'user_name_used', user_registered_name,
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
$function$