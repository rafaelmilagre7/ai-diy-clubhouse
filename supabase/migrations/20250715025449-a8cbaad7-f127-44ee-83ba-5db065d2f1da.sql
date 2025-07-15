-- Corrigir função initialize_onboarding_for_user para usar campos corretos da tabela
CREATE OR REPLACE FUNCTION public.initialize_onboarding_for_user(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_onboarding_id uuid;
  profile_record public.profiles;
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
  
  -- Criar registro de onboarding inicial com campos corretos da tabela
  INSERT INTO public.onboarding_final (
    user_id,
    current_step,
    completed_steps,
    is_completed,
    personal_info,
    business_info,
    ai_experience,
    goals_info,  -- Campo correto da tabela
    personalization,  -- Campo correto da tabela
    status,
    created_at,
    updated_at
  )
  VALUES (
    p_user_id,
    1, -- Começar no step 1
    ARRAY[]::integer[], -- Nenhum step completado ainda
    false, -- Não completado
    COALESCE(
      CASE 
        WHEN profile_record.name IS NOT NULL THEN 
          jsonb_build_object('name', profile_record.name)
        ELSE '{}'::jsonb
      END,
      '{}'::jsonb
    ), -- Info pessoal inicial do perfil se existir
    COALESCE(
      CASE 
        WHEN profile_record.company_name IS NOT NULL THEN 
          jsonb_build_object('company_name', profile_record.company_name)
        ELSE '{}'::jsonb
      END,
      '{}'::jsonb
    ), -- Info empresarial inicial do perfil se existir
    '{}'::jsonb, -- Experiência com IA vazia
    '{}'::jsonb, -- Objetivos vazios
    '{}'::jsonb, -- Preferências/personalização vazias
    'in_progress', -- Status em progresso
    now(),
    now()
  )
  RETURNING id INTO existing_onboarding_id;
  
  RAISE NOTICE 'Onboarding inicializado para usuário % com ID %', p_user_id, existing_onboarding_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Onboarding inicializado com sucesso',
    'onboarding_id', existing_onboarding_id,
    'already_existed', false
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