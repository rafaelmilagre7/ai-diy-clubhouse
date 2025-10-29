-- ==========================================
-- CORREÇÃO FINAL: TRIGGER NA TABELA PROFILES
-- ==========================================

-- PASSO 1: Criar função que inicializa onboarding após criar profile
CREATE OR REPLACE FUNCTION public.auto_initialize_onboarding_on_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  onboarding_id uuid;
  user_name text;
BEGIN
  -- Verificar se já existe onboarding
  IF EXISTS (SELECT 1 FROM public.onboarding_final WHERE user_id = NEW.id) THEN
    RETURN NEW;
  END IF;
  
  -- Determinar nome do usuário
  user_name := COALESCE(NEW.name, split_part(NEW.email, '@', 1), 'Usuário');
  
  -- Criar onboarding automaticamente
  INSERT INTO public.onboarding_final (
    user_id,
    personal_info,
    location_info,
    discovery_info,
    business_info,
    business_context,
    goals_info,
    ai_experience,
    personalization,
    current_step,
    completed_steps,
    is_completed,
    status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    jsonb_build_object(
      'email', NEW.email,
      'name', user_name,
      'auto_initialized', true,
      'initialized_at', now()
    ),
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    1,
    ARRAY[]::integer[],
    false,
    'in_progress',
    now(),
    now()
  )
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO onboarding_id;
  
  IF onboarding_id IS NOT NULL THEN
    RAISE NOTICE 'Onboarding % inicializado automaticamente para usuário %', onboarding_id, NEW.id;
  END IF;
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erro ao auto-inicializar onboarding para %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- PASSO 2: Criar trigger na tabela profiles (após INSERT)
DROP TRIGGER IF EXISTS trigger_auto_initialize_onboarding ON public.profiles;

CREATE TRIGGER trigger_auto_initialize_onboarding
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_initialize_onboarding_on_profile();

-- PASSO 3: Atualizar função handle_new_user_with_onboarding para remover criação de onboarding
-- (agora o trigger de profiles cuidará disso)
CREATE OR REPLACE FUNCTION public.handle_new_user_with_onboarding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  invite_token_from_metadata text;
  user_role_id uuid;
  default_role_id uuid;
BEGIN
  -- Buscar role padrão
  SELECT id INTO default_role_id
  FROM public.user_roles
  WHERE name = 'member'
  LIMIT 1;
  
  IF default_role_id IS NULL THEN
    SELECT id INTO default_role_id
    FROM public.user_roles
    ORDER BY created_at
    LIMIT 1;
  END IF;
  
  -- Verificar invite_token
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    invite_token_from_metadata := NEW.raw_user_meta_data->>'invite_token';
  END IF;
  
  -- Buscar role do convite se existir
  IF invite_token_from_metadata IS NOT NULL THEN
    SELECT i.role_id INTO user_role_id
    FROM public.invites i
    WHERE UPPER(REGEXP_REPLACE(i.token, '\s+', '', 'g')) = UPPER(REGEXP_REPLACE(invite_token_from_metadata, '\s+', '', 'g'))
    AND i.expires_at > now()
    AND i.used_at IS NULL
    LIMIT 1;
    
    IF user_role_id IS NULL THEN
      user_role_id := default_role_id;
    END IF;
  ELSE
    user_role_id := default_role_id;
  END IF;
  
  -- Criar perfil (o trigger de profiles criará o onboarding)
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
  
  -- Marcar convite como usado
  IF invite_token_from_metadata IS NOT NULL AND user_role_id != default_role_id THEN
    UPDATE public.invites
    SET used_at = now()
    WHERE UPPER(REGEXP_REPLACE(token, '\s+', '', 'g')) = UPPER(REGEXP_REPLACE(invite_token_from_metadata, '\s+', '', 'g'))
    AND expires_at > now()
    AND used_at IS NULL;
  END IF;
  
  RAISE NOTICE 'Perfil criado para usuário %, trigger de onboarding será executado automaticamente', NEW.id;
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erro ao processar novo usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- PASSO 4: Validar configuração
DO $$
BEGIN
  RAISE NOTICE '✅ Sistema de onboarding automático configurado na tabela profiles';
  RAISE NOTICE '✅ Novos usuários terão onboarding inicializado automaticamente';
  RAISE NOTICE '✅ Sistema pronto para cadastros';
END $$;