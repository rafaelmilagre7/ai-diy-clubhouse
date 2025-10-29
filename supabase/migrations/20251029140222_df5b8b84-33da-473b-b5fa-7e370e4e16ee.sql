-- ==========================================
-- CORREÇÃO CRÍTICA: FLUXO DE ONBOARDING
-- ==========================================
-- Fix: Reconectar trigger + inicialização automática + recuperar usuários

-- PASSO 1: Atualizar função para incluir inicialização de onboarding
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
  profile_record record;
  onboarding_id uuid;
BEGIN
  -- Buscar role padrão
  SELECT id INTO default_role_id
  FROM public.user_roles
  WHERE name = 'member'
  LIMIT 1;
  
  -- Se não encontrou role padrão, usar o primeiro disponível
  IF default_role_id IS NULL THEN
    SELECT id INTO default_role_id
    FROM public.user_roles
    ORDER BY created_at
    LIMIT 1;
  END IF;
  
  -- Verificar se há invite_token nos metadados
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    invite_token_from_metadata := NEW.raw_user_meta_data->>'invite_token';
  END IF;
  
  -- Se há token de convite, buscar o role_id correspondente
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
  
  -- Criar perfil na tabela profiles
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
    updated_at = now()
  RETURNING * INTO profile_record;
  
  -- NOVO: Inicializar onboarding automaticamente
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
      'name', COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      'from_trigger', true
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
  
  -- Se havia convite, marcar como usado
  IF invite_token_from_metadata IS NOT NULL AND user_role_id != default_role_id THEN
    UPDATE public.invites
    SET used_at = now()
    WHERE UPPER(REGEXP_REPLACE(token, '\s+', '', 'g')) = UPPER(REGEXP_REPLACE(invite_token_from_metadata, '\s+', '', 'g'))
    AND expires_at > now()
    AND used_at IS NULL;
  END IF;
  
  RAISE NOTICE 'Usuário % criado com perfil e onboarding %', NEW.id, onboarding_id;
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- PASSO 2: Recriar trigger em auth.users (se não existir)
DROP TRIGGER IF EXISTS on_auth_user_created_with_onboarding ON auth.users;

CREATE TRIGGER on_auth_user_created_with_onboarding
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_with_onboarding();

-- PASSO 3: Corrigir usuários existentes sem onboarding
DO $$
DECLARE
  user_record record;
  onboarding_created integer := 0;
BEGIN
  FOR user_record IN 
    SELECT p.id, p.email, p.name
    FROM public.profiles p
    LEFT JOIN public.onboarding_final o ON p.id = o.user_id
    WHERE o.id IS NULL
  LOOP
    BEGIN
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
        user_record.id,
        jsonb_build_object(
          'email', user_record.email,
          'name', user_record.name,
          'from_migration', true
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
      ON CONFLICT (user_id) DO NOTHING;
      
      onboarding_created := onboarding_created + 1;
      
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Erro ao criar onboarding para usuário %: %', user_record.id, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Migration concluída: % onboardings criados para usuários existentes', onboarding_created;
END $$;

-- PASSO 4: Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_onboarding_final_user_id ON public.onboarding_final(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_final_status ON public.onboarding_final(status) WHERE status = 'in_progress';