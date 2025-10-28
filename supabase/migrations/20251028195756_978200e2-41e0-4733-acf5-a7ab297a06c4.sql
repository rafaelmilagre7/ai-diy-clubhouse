-- ETAPA 2 - FRENTE 1: Fortalecer trigger handle_new_user() com logs e garantias

-- Recriar função handle_new_user com logs robustos e tratamento de erros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_default_role_id uuid;
  v_profile_created boolean := false;
BEGIN
  RAISE NOTICE '[handle_new_user] 🚀 Iniciando para user_id=% email=%', NEW.id, NEW.email;

  -- 1. Buscar role padrão com prioridade
  SELECT id INTO v_default_role_id
  FROM public.user_roles
  WHERE name IN ('membro_club', 'member', 'formacao')
  ORDER BY CASE name
    WHEN 'membro_club' THEN 1
    WHEN 'member' THEN 2
    WHEN 'formacao' THEN 3
  END
  LIMIT 1;

  IF v_default_role_id IS NULL THEN
    RAISE WARNING '[handle_new_user] ⚠️ Role padrão não encontrada!';
  ELSE
    RAISE NOTICE '[handle_new_user] ✅ Role padrão encontrada: %', v_default_role_id;
  END IF;

  -- 2. UPSERT em profiles com garantia de criação
  BEGIN
    INSERT INTO public.profiles (
      id, email, role_id, name, 
      created_at, updated_at, 
      onboarding_completed, is_master_user
    )
    VALUES (
      NEW.id,
      NEW.email,
      v_default_role_id,
      COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'display_name',
        split_part(NEW.email, '@', 1)
      ),
      NOW(), NOW(), false, true
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      role_id = COALESCE(EXCLUDED.role_id, profiles.role_id),
      name = COALESCE(EXCLUDED.name, profiles.name),
      updated_at = NOW();

    v_profile_created := true;
    RAISE NOTICE '[handle_new_user] ✅ Profile criado/atualizado com sucesso para user_id=%', NEW.id;

  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING '[handle_new_user] ❌ ERRO ao criar profile: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
      -- CRÍTICO: Lançar exceção para bloquear criação do usuário se profile falhar
      RAISE EXCEPTION 'Falha crítica ao criar profile para %: %', NEW.email, SQLERRM;
  END;

  -- 3. Criar registro em onboarding_final
  IF v_profile_created THEN
    BEGIN
      INSERT INTO public.onboarding_final (
        user_id, step, completed, data, created_at, updated_at
      )
      VALUES (
        NEW.id, 'welcome', false, 
        jsonb_build_object('source', 'signup', 'created_at', NOW()),
        NOW(), NOW()
      )
      ON CONFLICT (user_id) DO NOTHING;
      
      RAISE NOTICE '[handle_new_user] ✅ Onboarding criado para user_id=%', NEW.id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING '[handle_new_user] ⚠️ Erro ao criar onboarding (não crítico): %', SQLERRM;
    END;
  END IF;

  RAISE NOTICE '[handle_new_user] 🎉 Processo completo com sucesso para user_id=%', NEW.id;
  RETURN NEW;
END;
$function$;

-- Garantir que o trigger está ativo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger function que cria profile automaticamente ao criar usuário. Versão fortificada com logs e garantias (Etapa 2)';

-- Criar função SQL para monitoramento de usuários órfãos
CREATE OR REPLACE FUNCTION public.find_orphan_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  raw_user_meta_data jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'auth', 'public'
AS $$
  SELECT 
    au.id,
    au.email,
    au.created_at,
    au.raw_user_meta_data
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  WHERE p.id IS NULL
    AND au.created_at > NOW() - INTERVAL '7 days'
  ORDER BY au.created_at DESC;
$$;

COMMENT ON FUNCTION public.find_orphan_users() IS 'Detecta usuários órfãos (sem profile) criados nos últimos 7 dias';

-- Criar função para registrar criação manual de profiles pelo AuthContext
CREATE OR REPLACE FUNCTION public.log_orphan_profile_creation(
  p_user_id uuid,
  p_created_by text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log simples para rastreamento
  RAISE NOTICE '[ORPHAN-FIX] Profile criado manualmente: user_id=% by=% metadata=%', 
    p_user_id, p_created_by, p_metadata;
  
  -- Você pode adicionar aqui insert em uma tabela de logs se necessário
END;
$$;

COMMENT ON FUNCTION public.log_orphan_profile_creation IS 'Registra quando um profile foi criado manualmente (fallback do AuthContext ou formulários)';