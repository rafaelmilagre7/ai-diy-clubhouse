-- CORREÇÃO COMPLETA DO FLUXO DE CONVITES
-- 1. Corrigir perfil órfão específico identificado

-- Primeiro, vamos corrigir o usuário órfão específico
INSERT INTO public.profiles (
  id,
  email,
  role_id,
  name,
  created_at,
  updated_at,
  onboarding_completed
)
SELECT 
  u.id,
  u.email,
  COALESCE(i.role_id, (SELECT id FROM public.user_roles WHERE name = 'membro' LIMIT 1)) as role_id,
  COALESCE(
    u.raw_user_meta_data->>'name',
    u.raw_user_meta_data->>'full_name',
    split_part(u.email, '@', 1)
  ) as name,
  u.created_at,
  now(),
  false
FROM auth.users u
LEFT JOIN public.invites i ON i.token = u.raw_user_meta_data->>'invite_token'
WHERE u.email = 'heloisa-de-abreu@tuamaeaquelaursa.com'
AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO UPDATE SET
  role_id = EXCLUDED.role_id,
  name = COALESCE(EXCLUDED.name, profiles.name),
  updated_at = now();

-- Inicializar onboarding para este usuário com dados do convite se existir
WITH user_data AS (
  SELECT 
    u.id as user_id,
    u.email,
    u.raw_user_meta_data,
    i.whatsapp_number,
    i.notes
  FROM auth.users u
  LEFT JOIN public.invites i ON i.token = u.raw_user_meta_data->>'invite_token'
  WHERE u.email = 'heloisa-de-abreu@tuamaeaquelaursa.com'
)
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
SELECT 
  user_id,
  1,
  ARRAY[]::integer[],
  false,
  jsonb_build_object(
    'name', COALESCE(
      raw_user_meta_data->>'name',
      raw_user_meta_data->>'full_name',
      split_part(email, '@', 1)
    ),
    'email', email
  ) || CASE 
    WHEN whatsapp_number IS NOT NULL THEN 
      jsonb_build_object('phone', whatsapp_number, 'phone_from_invite', true)
    ELSE '{}'::jsonb
  END,
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  'in_progress',
  now(),
  now()
FROM user_data
WHERE NOT EXISTS (
  SELECT 1 FROM public.onboarding_final 
  WHERE onboarding_final.user_id = user_data.user_id
)
ON CONFLICT (user_id) DO NOTHING;

-- 2. Executar função de limpeza geral para outros órfãos
SELECT public.fix_orphaned_invites();

-- 3. Verificar e criar função get_user_profile_safe se não existir
CREATE OR REPLACE FUNCTION public.get_user_profile_safe(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_data jsonb;
BEGIN
  -- Buscar perfil do usuário
  SELECT jsonb_build_object(
    'id', p.id,
    'email', p.email,
    'name', p.name,
    'company_name', p.company_name,
    'role_id', p.role_id,
    'onboarding_completed', p.onboarding_completed,
    'created_at', p.created_at,
    'updated_at', p.updated_at,
    'role', jsonb_build_object(
      'id', ur.id,
      'name', ur.name,
      'description', ur.description
    )
  ) INTO profile_data
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = p_user_id;
  
  -- Se não encontrou perfil, retornar null
  IF profile_data IS NULL THEN
    RETURN null;
  END IF;
  
  RETURN profile_data;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao buscar perfil do usuário %: %', p_user_id, SQLERRM;
    RETURN null;
END;
$$;

-- 4. Melhorar trigger de criação automática de perfil
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
  RAISE NOTICE 'Processando novo usuário: % (ID: %)', NEW.email, NEW.id;
  
  -- Verificar se há invite_token nos metadados
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    invite_token_from_metadata := NEW.raw_user_meta_data->>'invite_token';
    RAISE NOTICE 'Token de convite encontrado: %', COALESCE(left(invite_token_from_metadata, 8) || '***', 'nenhum');
  END IF;
  
  -- Se há token de convite, buscar o role_id correspondente
  IF invite_token_from_metadata IS NOT NULL THEN
    SELECT i.* INTO invite_record
    FROM public.invites i
    WHERE UPPER(REGEXP_REPLACE(i.token, '\s+', '', 'g')) = UPPER(REGEXP_REPLACE(invite_token_from_metadata, '\s+', '', 'g'))
    AND i.expires_at > now()
    ORDER BY i.created_at DESC
    LIMIT 1;
    
    IF invite_record.id IS NOT NULL THEN
      user_role_id := invite_record.role_id;
      RAISE NOTICE 'Role encontrado para convite: %', user_role_id;
    ELSE
      RAISE NOTICE 'Convite não encontrado ou expirado para token: %', invite_token_from_metadata;
    END IF;
  END IF;
  
  -- Se não tem role_id do convite, usar role padrão 'membro'
  IF user_role_id IS NULL THEN
    SELECT id INTO user_role_id 
    FROM public.user_roles 
    WHERE name IN ('membro', 'member') 
    ORDER BY name 
    LIMIT 1;
    RAISE NOTICE 'Usando role padrão: %', user_role_id;
  END IF;
  
  -- Criar perfil com role_id correto
  BEGIN
    INSERT INTO public.profiles (
      id, 
      email, 
      name, 
      role_id, 
      created_at, 
      updated_at,
      onboarding_completed
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
      now(),
      false
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, profiles.name),
      role_id = COALESCE(EXCLUDED.role_id, profiles.role_id),
      updated_at = now();
      
    RAISE NOTICE 'Perfil criado/atualizado com sucesso para usuário: %', NEW.email;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Erro ao criar perfil para %: %', NEW.email, SQLERRM;
      RETURN NEW; -- Continuar mesmo com erro no perfil
  END;
  
  -- Inicializar onboarding com dados do convite se disponível
  IF invite_record.id IS NOT NULL THEN
    BEGIN
      SELECT public.initialize_onboarding_for_user(
        NEW.id,
        jsonb_build_object(
          'email', invite_record.email,
          'whatsapp_number', invite_record.whatsapp_number,
          'notes', invite_record.notes
        )
      ) INTO onboarding_result;
      
      RAISE NOTICE 'Onboarding inicializado: %', onboarding_result->>'message';
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Erro ao inicializar onboarding para %: %', NEW.email, SQLERRM;
    END;
  ELSE
    -- Inicializar onboarding sem dados do convite
    BEGIN
      SELECT public.initialize_onboarding_for_user(NEW.id) INTO onboarding_result;
      RAISE NOTICE 'Onboarding básico inicializado: %', onboarding_result->>'message';
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Erro ao inicializar onboarding básico para %: %', NEW.email, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recriar trigger com nova função
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_with_onboarding();

-- 5. Relatório final de correção
WITH correction_summary AS (
  SELECT 
    'Usuários totais' as metric,
    COUNT(*) as value
  FROM auth.users
  
  UNION ALL
  
  SELECT 
    'Perfis totais' as metric,
    COUNT(*) as value
  FROM public.profiles
  
  UNION ALL
  
  SELECT 
    'Usuários órfãos corrigidos' as metric,
    COUNT(*) as value
  FROM auth.users u
  WHERE EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
  
  UNION ALL
  
  SELECT 
    'Onboardings inicializados' as metric,
    COUNT(*) as value
  FROM public.onboarding_final
  
  UNION ALL
  
  SELECT 
    'Convites ativos' as metric,
    COUNT(*) as value
  FROM public.invites
  WHERE expires_at > now() AND used_at IS NULL
)
SELECT 
  metric,
  value,
  CASE 
    WHEN metric = 'Usuários totais' THEN '👥'
    WHEN metric = 'Perfis totais' THEN '📋'
    WHEN metric = 'Usuários órfãos corrigidos' THEN '✅'
    WHEN metric = 'Onboardings inicializados' THEN '🎯'
    WHEN metric = 'Convites ativos' THEN '📧'
  END as status
FROM correction_summary
ORDER BY 
  CASE metric
    WHEN 'Usuários totais' THEN 1
    WHEN 'Perfis totais' THEN 2
    WHEN 'Usuários órfãos corrigidos' THEN 3
    WHEN 'Onboardings inicializados' THEN 4
    WHEN 'Convites ativos' THEN 5
  END;