-- CORREÇÃO DO TRIGGER: Remover referências a campos deletados
-- ==================================================================

-- 1. Corrigir trigger sync_onboarding_final_to_profile
CREATE OR REPLACE FUNCTION public.sync_onboarding_final_to_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log para debug
  RAISE NOTICE 'Sincronizando onboarding_final para profile do usuário: %', NEW.user_id;
  
  -- Atualizar perfil APENAS com dados dos campos JSONB
  UPDATE public.profiles
  SET 
    name = COALESCE(NEW.personal_info->>'name', name),
    company_name = COALESCE(
      NEW.business_info->>'company_name', 
      NEW.business_info->>'companyName',
      company_name
    ),
    industry = COALESCE(
      NEW.business_info->>'company_sector', 
      NEW.business_info->>'business_sector',
      industry
    ),
    onboarding_completed = NEW.is_completed,
    onboarding_completed_at = CASE 
      WHEN NEW.is_completed THEN COALESCE(NEW.completed_at, now()) 
      ELSE NULL 
    END,
    updated_at = now()
  WHERE id = NEW.user_id;
  
  -- Atualizar status baseado no progresso
  IF NEW.status IS NULL OR NEW.status = 'in_progress' THEN
    NEW.status := CASE 
      WHEN NEW.is_completed = true THEN 'completed'
      WHEN NEW.current_step >= 6 THEN 'final_step'
      WHEN NEW.current_step >= 1 THEN 'in_progress'
      ELSE 'not_started'
    END;
  END IF;
  
  -- Log resultado
  IF FOUND THEN
    RAISE NOTICE 'Profile atualizado com sucesso para usuário: %', NEW.user_id;
  ELSE
    RAISE WARNING 'Profile não encontrado para usuário: %', NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. Agora corrigir a função initialize_onboarding_for_user
CREATE OR REPLACE FUNCTION public.initialize_onboarding_for_user(p_user_id uuid, p_invite_data jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_onboarding_id uuid;
  profile_record public.profiles;
  auth_user_record record;
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
  
  -- Buscar dados do auth.users para pré-preenchimento
  SELECT 
    email,
    raw_user_meta_data->>'name' as meta_name,
    raw_user_meta_data->>'full_name' as meta_full_name,
    raw_user_meta_data->>'display_name' as meta_display_name
  INTO auth_user_record
  FROM auth.users
  WHERE id = p_user_id;
  
  -- Construir personal_info com prioridade: perfil > auth.users > convite
  personal_info_data := '{}'::jsonb;
  
  -- Email: perfil > auth.users > convite
  IF profile_record.email IS NOT NULL THEN
    personal_info_data := personal_info_data || jsonb_build_object('email', profile_record.email);
  ELSIF auth_user_record.email IS NOT NULL THEN
    personal_info_data := personal_info_data || jsonb_build_object('email', auth_user_record.email);
  ELSIF p_invite_data->>'email' IS NOT NULL THEN
    personal_info_data := personal_info_data || jsonb_build_object('email', p_invite_data->>'email');
  END IF;
  
  -- Nome: perfil > auth.users metadados > convite notes
  IF profile_record.name IS NOT NULL THEN
    personal_info_data := personal_info_data || jsonb_build_object('name', profile_record.name);
  ELSIF auth_user_record.meta_name IS NOT NULL THEN
    personal_info_data := personal_info_data || jsonb_build_object('name', auth_user_record.meta_name);
  ELSIF auth_user_record.meta_full_name IS NOT NULL THEN
    personal_info_data := personal_info_data || jsonb_build_object('name', auth_user_record.meta_full_name);
  ELSIF auth_user_record.meta_display_name IS NOT NULL THEN
    personal_info_data := personal_info_data || jsonb_build_object('name', auth_user_record.meta_display_name);
  ELSIF p_invite_data->>'notes' IS NOT NULL AND p_invite_data->>'notes' ~ '^[A-Za-zÀ-ÿ\s]{2,50}$' THEN
    personal_info_data := personal_info_data || jsonb_build_object('name', p_invite_data->>'notes');
  ELSIF auth_user_record.email IS NOT NULL THEN
    -- Fallback: usar parte do email como nome
    personal_info_data := personal_info_data || jsonb_build_object('name', split_part(auth_user_record.email, '@', 1));
  END IF;
  
  -- WhatsApp do convite
  IF p_invite_data->>'whatsapp_number' IS NOT NULL THEN
    personal_info_data := personal_info_data || jsonb_build_object('phone', p_invite_data->>'whatsapp_number');
  END IF;
  
  -- Criar registro de onboarding inicial com campos JSONB corretos
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
    location_info,
    discovery_info, 
    business_context,
    status,
    created_at,
    updated_at
  )
  VALUES (
    p_user_id,
    1, -- Começar no step 1
    ARRAY[]::integer[], -- Nenhum step completado ainda
    false, -- Não completado
    personal_info_data, -- Info pessoal pré-preenchida
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
    '{}'::jsonb, -- Personalização vazia  
    '{}'::jsonb, -- Localização vazia
    '{}'::jsonb, -- Discovery vazia
    '{}'::jsonb, -- Business context vazio
    'in_progress', -- Status em progresso
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

-- 3. Inicialização em massa para usuários órfãos
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
  location_info,
  discovery_info,
  business_context,
  status,
  created_at,
  updated_at
)
SELECT 
  p.id,
  1, -- Começar no step 1
  ARRAY[]::integer[], -- Nenhum step completado
  false, -- Não completado
  -- Personal info construído dinamicamente
  jsonb_strip_nulls(
    jsonb_build_object(
      'name', COALESCE(
        p.name,
        au.raw_user_meta_data->>'name',
        au.raw_user_meta_data->>'full_name', 
        au.raw_user_meta_data->>'display_name',
        split_part(COALESCE(p.email, au.email), '@', 1)
      ),
      'email', COALESCE(p.email, au.email)
    )
  ),
  -- Business info do perfil se existir
  CASE 
    WHEN p.company_name IS NOT NULL THEN jsonb_build_object('company_name', p.company_name)
    ELSE '{}'::jsonb
  END,
  '{}'::jsonb, -- ai_experience
  '{}'::jsonb, -- goals_info  
  '{}'::jsonb, -- personalization
  '{}'::jsonb, -- location_info
  '{}'::jsonb, -- discovery_info
  '{}'::jsonb, -- business_context
  'in_progress',
  now(),
  now()
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
LEFT JOIN public.onboarding_final onf ON p.id = onf.user_id
WHERE onf.user_id IS NULL -- Apenas usuários órfãos
ON CONFLICT (user_id) DO NOTHING;