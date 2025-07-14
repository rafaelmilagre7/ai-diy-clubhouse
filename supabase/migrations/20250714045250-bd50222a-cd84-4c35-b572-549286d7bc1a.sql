-- ================================
-- CORREÇÃO FLUXO CONVITE + ONBOARDING  
-- ================================

-- 1. Função para inicializar onboarding automaticamente
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
  
  -- Criar registro de onboarding inicial
  INSERT INTO public.onboarding_final (
    user_id,
    current_step,
    completed_steps,
    is_completed,
    personal_info,
    business_info,
    ai_experience,
    goals,
    preferences,
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
    '{}'::jsonb, -- Preferências vazias
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

-- 2. Função melhorada para aplicar convite E inicializar onboarding
CREATE OR REPLACE FUNCTION public.use_invite_with_onboarding(invite_token text, user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_result jsonb;
  onboarding_result jsonb;
BEGIN
  RAISE NOTICE 'Aplicando convite com onboarding para usuário: %', user_id;
  
  -- 1. Aplicar convite usando função existente
  SELECT public.use_invite_enhanced(invite_token, user_id) INTO invite_result;
  
  -- Verificar se convite foi aplicado com sucesso
  IF (invite_result->>'status')::text != 'success' THEN
    RETURN invite_result;
  END IF;
  
  RAISE NOTICE 'Convite aplicado com sucesso, inicializando onboarding...';
  
  -- 2. Inicializar onboarding automaticamente
  SELECT public.initialize_onboarding_for_user(user_id) INTO onboarding_result;
  
  -- 3. Retornar resultado combinado
  RETURN json_build_object(
    'status', 'success',
    'message', 'Convite aplicado e onboarding inicializado',
    'invite_result', invite_result,
    'onboarding_result', onboarding_result
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao aplicar convite com onboarding: %', SQLERRM;
    RETURN json_build_object(
      'status', 'error',
      'message', 'Erro no processo: ' || SQLERRM
    );
END;
$$;

-- 3. Função para recuperar usuários existentes (executar uma vez)
CREATE OR REPLACE FUNCTION public.fix_existing_users_onboarding()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  fixed_count integer := 0;
  onboarding_result jsonb;
BEGIN
  RAISE NOTICE 'Iniciando correção de usuários existentes sem onboarding...';
  
  -- Para cada usuário que tem perfil mas não tem onboarding
  FOR user_record IN 
    SELECT p.id, p.email, p.name, p.company_name
    FROM public.profiles p
    WHERE NOT EXISTS (
      SELECT 1 FROM public.onboarding_final of 
      WHERE of.user_id = p.id
    )
    AND p.id IS NOT NULL
  LOOP
    RAISE NOTICE 'Corrigindo usuário: % (%)', user_record.email, user_record.id;
    
    -- Inicializar onboarding para este usuário
    SELECT public.initialize_onboarding_for_user(user_record.id) INTO onboarding_result;
    
    IF (onboarding_result->>'success')::boolean THEN
      fixed_count := fixed_count + 1;
      RAISE NOTICE 'Usuário % corrigido com sucesso', user_record.email;
    ELSE
      RAISE NOTICE 'Falha ao corrigir usuário %: %', user_record.email, onboarding_result->>'message';
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Correção concluída',
    'users_fixed', fixed_count
  );
END;
$$;

-- 4. Trigger melhorado para novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user_with_onboarding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_token_from_metadata text;
  invite_record public.invites;
  user_role_id uuid;
  onboarding_result jsonb;
BEGIN
  RAISE NOTICE 'Processando novo usuário: %', NEW.id;
  
  -- Verificar se há invite_token nos metadados
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    invite_token_from_metadata := NEW.raw_user_meta_data->>'invite_token';
    RAISE NOTICE 'Token de convite encontrado: %', 
      CASE WHEN invite_token_from_metadata IS NOT NULL 
        THEN left(invite_token_from_metadata, 6) || '***' 
        ELSE 'nenhum' 
      END;
  END IF;
  
  -- Se há token de convite, buscar o role_id correspondente
  IF invite_token_from_metadata IS NOT NULL THEN
    SELECT i.* INTO invite_record
    FROM public.invites i
    WHERE UPPER(REGEXP_REPLACE(i.token, '\s+', '', 'g')) = UPPER(REGEXP_REPLACE(invite_token_from_metadata, '\s+', '', 'g'))
    AND i.expires_at > now()
    AND i.used_at IS NULL
    LIMIT 1;
    
    IF invite_record.id IS NOT NULL THEN
      user_role_id := invite_record.role_id;
      RAISE NOTICE 'Role encontrado para convite: %', user_role_id;
    ELSE
      RAISE NOTICE 'Convite não encontrado ou inválido';
    END IF;
  END IF;
  
  -- Se não tem role_id do convite, usar role padrão 'member'
  IF user_role_id IS NULL THEN
    SELECT id INTO user_role_id 
    FROM public.user_roles 
    WHERE name IN ('member', 'membro') 
    ORDER BY name LIMIT 1;
    
    IF user_role_id IS NULL THEN
      RAISE NOTICE 'Criando role member padrão';
      INSERT INTO public.user_roles (name, description, permissions)
      VALUES ('member', 'Membro padrão', '{"basic": true}')
      RETURNING id INTO user_role_id;
    END IF;
  END IF;
  
  -- Criar perfil
  BEGIN
    INSERT INTO public.profiles (
      id, 
      email, 
      name, 
      role_id, 
      created_at, 
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'display_name',
        split_part(NEW.email, '@', 1)
      ),
      user_role_id,
      now(),
      now()
    );
    
    RAISE NOTICE 'Perfil criado com sucesso para usuário: %', NEW.id;
    
    -- Inicializar onboarding automaticamente para usuários com convite
    IF invite_token_from_metadata IS NOT NULL THEN
      RAISE NOTICE 'Inicializando onboarding para usuário via convite...';
      
      -- Aguardar um pouco para o perfil ser commitado
      PERFORM pg_sleep(0.1);
      
      SELECT public.initialize_onboarding_for_user(NEW.id) INTO onboarding_result;
      
      IF (onboarding_result->>'success')::boolean THEN
        RAISE NOTICE 'Onboarding inicializado automaticamente para %', NEW.email;
      ELSE
        RAISE NOTICE 'Falha ao inicializar onboarding: %', onboarding_result->>'message';
      END IF;
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- 5. Substituir trigger existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_with_onboarding();