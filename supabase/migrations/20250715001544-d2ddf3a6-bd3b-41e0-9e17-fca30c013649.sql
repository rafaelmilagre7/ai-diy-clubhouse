-- Correção para usuários órfãos do onboarding
-- =============================================

-- 1. Executar função de correção para usuários existentes
SELECT public.fix_existing_users_onboarding();

-- 2. Verificar resultados da correção
SELECT 
  'BEFORE CORRECTION' as status,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN onf.user_id IS NULL THEN 1 END) as orphaned_users,
  COUNT(CASE WHEN onf.user_id IS NOT NULL THEN 1 END) as users_with_onboarding
FROM public.profiles p
LEFT JOIN public.onboarding_final onf ON p.id = onf.user_id;

-- 3. Forçar inicialização para qualquer usuário que ainda esteja órfão
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
SELECT 
  p.id,
  1, -- Começar no step 1
  ARRAY[]::integer[], -- Nenhum step completado
  false, -- Não completado
  CASE 
    WHEN p.name IS NOT NULL THEN jsonb_build_object('name', p.name)
    ELSE '{}'::jsonb
  END, -- Info pessoal do perfil se existir
  CASE 
    WHEN p.company_name IS NOT NULL THEN jsonb_build_object('company_name', p.company_name)
    ELSE '{}'::jsonb
  END, -- Info empresarial do perfil se existir
  '{}'::jsonb, -- Experiência com IA vazia
  '{}'::jsonb, -- Objetivos vazios
  '{}'::jsonb, -- Preferências vazias
  'in_progress', -- Status em progresso
  now(),
  now()
FROM public.profiles p
LEFT JOIN public.onboarding_final onf ON p.id = onf.user_id
WHERE onf.user_id IS NULL -- Apenas usuários órfãos
ON CONFLICT (user_id) DO NOTHING;

-- 4. Verificar resultado final
SELECT 
  'AFTER CORRECTION' as status,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN onf.user_id IS NULL THEN 1 END) as orphaned_users,
  COUNT(CASE WHEN onf.user_id IS NOT NULL THEN 1 END) as users_with_onboarding,
  ROUND(
    (COUNT(CASE WHEN onf.user_id IS NOT NULL THEN 1 END)::decimal / COUNT(*)::decimal) * 100, 
    2
  ) as coverage_percentage
FROM public.profiles p
LEFT JOIN public.onboarding_final onf ON p.id = onf.user_id;

-- 5. Atualizar trigger para garantir inicialização automática futura
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
  -- Log para debug
  RAISE NOTICE 'Novo usuário criado: %', NEW.id;
  
  -- Verificar se há invite_token nos metadados
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    invite_token_from_metadata := NEW.raw_user_meta_data->>'invite_token';
    RAISE NOTICE 'Token de convite encontrado: %', invite_token_from_metadata;
  END IF;
  
  -- Se há token de convite, buscar o role_id correspondente
  IF invite_token_from_metadata IS NOT NULL THEN
    -- Buscar convite válido
    SELECT i.* INTO invite_record
    FROM public.invites i
    WHERE UPPER(REGEXP_REPLACE(i.token, '\s+', '', 'g')) = UPPER(REGEXP_REPLACE(invite_token_from_metadata, '\s+', '', 'g'))
    AND i.expires_at > now()
    AND i.used_at IS NULL
    LIMIT 1;
    
    IF invite_record.id IS NOT NULL THEN
      user_role_id := invite_record.role_id;
      RAISE NOTICE 'Role encontrado para convite: %', user_role_id;
    END IF;
  END IF;
  
  -- Se não tem role_id do convite, usar role padrão
  IF user_role_id IS NULL THEN
    SELECT id INTO user_role_id 
    FROM public.user_roles 
    WHERE name IN ('membro_club', 'membro', 'member') 
    ORDER BY name LIMIT 1;
  END IF;
  
  -- Criar perfil com role_id correto
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
    
    -- NOVO: Inicializar onboarding automaticamente
    SELECT public.initialize_onboarding_for_user(NEW.id) INTO onboarding_result;
    RAISE NOTICE 'Onboarding inicializado: %', onboarding_result;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar perfil/onboarding para usuário %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- 6. Atualizar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_with_onboarding();