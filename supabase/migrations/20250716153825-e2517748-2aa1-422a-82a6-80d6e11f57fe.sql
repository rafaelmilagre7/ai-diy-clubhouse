-- Ajustar função initialize_onboarding_for_user para novo fluxo
CREATE OR REPLACE FUNCTION public.initialize_onboarding_for_user(
  p_user_id uuid, 
  p_invite_token text DEFAULT NULL
)
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
  
  -- 🎯 NOVO FLUXO: Buscar dados do perfil pré-existente PRIMEIRO
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
    auth_user_record.display_name
  );
  
  -- 🎯 PRIORIDADE NOVA: Dados do perfil > dados do auth > dados do convite
  personal_info_data := jsonb_build_object();
  
  -- Usar dados do perfil pré-existente (criado no convite)
  IF profile_record.id IS NOT NULL THEN
    personal_info_data := personal_info_data || jsonb_build_object(
      'email', profile_record.email,
      'name', COALESCE(profile_record.name, user_registered_name),
      'phone', profile_record.whatsapp_number,
      'from_profile', true
    );
    
    -- Marcar origem dos dados
    IF profile_record.name IS NOT NULL THEN
      personal_info_data := personal_info_data || jsonb_build_object('name_from_profile', true);
    END IF;
    
    IF profile_record.whatsapp_number IS NOT NULL THEN
      personal_info_data := personal_info_data || jsonb_build_object('phone_from_profile', true);
    END IF;
    
    personal_info_data := personal_info_data || jsonb_build_object('email_from_profile', true);
  ELSE
    -- Fallback para dados do auth se não há perfil
    IF user_registered_name IS NOT NULL THEN
      personal_info_data := personal_info_data || jsonb_build_object(
        'name', user_registered_name,
        'name_from_auth', true
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
  
  RAISE NOTICE 'Onboarding inicializado para usuário % com dados do perfil: %', p_user_id, personal_info_data;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Onboarding inicializado com dados do perfil',
    'onboarding_id', existing_onboarding_id,
    'already_existed', false,
    'profile_used', profile_record.id IS NOT NULL,
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
$function$;