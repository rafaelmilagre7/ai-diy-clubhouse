-- ========================================
-- CORREÇÃO DEFINITIVA: Erros de Cadastro
-- ========================================
-- 1. Ajusta FK de audit_logs para auth.users
-- 2. Função handle_new_user ultra-resiliente
-- 3. Índice único em profiles.email
-- ========================================

-- 1. AJUSTAR FK DE AUDIT_LOGS PARA AUTH.USERS
-- Remove a dependência de profiles existir antes de logar
DO $$ 
BEGIN
  -- Remove FK antiga se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'audit_logs_user_id_fkey' 
    AND table_name = 'audit_logs'
  ) THEN
    ALTER TABLE public.audit_logs DROP CONSTRAINT audit_logs_user_id_fkey;
  END IF;

  -- Adiciona nova FK apontando para auth.users
  ALTER TABLE public.audit_logs 
    ADD CONSTRAINT audit_logs_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL;
END $$;

-- 2. GARANTIR ÍNDICE ÚNICO EM PROFILES.EMAIL
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_idx 
  ON public.profiles(email) 
  WHERE email IS NOT NULL;

-- 3. REESCREVER FUNÇÃO HANDLE_NEW_USER COM MÁXIMA RESILIÊNCIA
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
  v_default_role_id uuid;
  v_existing_profile_id uuid;
  v_profile_created boolean := false;
  v_convite record;
BEGIN
  -- Log inicial
  RAISE NOTICE 'handle_new_user: Iniciando para usuário % (%)', NEW.id, NEW.email;

  -- ====================
  -- 1. BUSCAR ROLE PADRÃO
  -- ====================
  BEGIN
    -- Tenta buscar role na ordem: membro_club → member → formacao → convidado
    SELECT id INTO v_default_role_id
    FROM public.user_roles
    WHERE name IN ('membro_club', 'member', 'formacao', 'convidado')
    ORDER BY 
      CASE name
        WHEN 'membro_club' THEN 1
        WHEN 'member' THEN 2
        WHEN 'formacao' THEN 3
        WHEN 'convidado' THEN 4
      END
    LIMIT 1;

    IF v_default_role_id IS NULL THEN
      RAISE WARNING 'handle_new_user: Nenhuma role padrão encontrada! Criando profile sem role.';
    ELSE
      RAISE NOTICE 'handle_new_user: Role padrão encontrada: %', v_default_role_id;
    END IF;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: Erro ao buscar role padrão: % %', SQLERRM, SQLSTATE;
    v_default_role_id := NULL;
  END;

  -- ====================
  -- 2. PRÉ-CHECK: EMAIL JÁ EXISTE?
  -- ====================
  BEGIN
    SELECT id INTO v_existing_profile_id
    FROM public.profiles
    WHERE email = NEW.email AND id != NEW.id
    LIMIT 1;

    IF v_existing_profile_id IS NOT NULL THEN
      RAISE WARNING 'handle_new_user: Email % já existe em profiles com ID diferente (%). Pulando criação de profile.', NEW.email, v_existing_profile_id;
      -- Não tenta criar profile, mas continua o fluxo
      RETURN NEW;
    END IF;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: Erro no pré-check de email: % %', SQLERRM, SQLSTATE;
  END;

  -- ====================
  -- 3. UPSERT EM PROFILES
  -- ====================
  BEGIN
    INSERT INTO public.profiles (
      id,
      email,
      role_id,
      full_name,
      created_at,
      updated_at,
      avatar_url,
      bio
    )
    VALUES (
      NEW.id,
      NEW.email,
      v_default_role_id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      NOW(),
      NOW(),
      NEW.raw_user_meta_data->>'avatar_url',
      NULL
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      role_id = COALESCE(EXCLUDED.role_id, profiles.role_id),
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
      updated_at = NOW();

    v_profile_created := true;
    RAISE NOTICE 'handle_new_user: Profile criado/atualizado com sucesso para %', NEW.id;

  EXCEPTION WHEN unique_violation THEN
    RAISE WARNING 'handle_new_user: Violação de unicidade ao criar profile para %: % %', NEW.id, SQLERRM, SQLSTATE;
    v_profile_created := false;
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: Erro ao criar profile para %: % %', NEW.id, SQLERRM, SQLSTATE;
    v_profile_created := false;
  END;

  -- ====================
  -- 4. INSERT EM ONBOARDING_FINAL
  -- ====================
  IF v_profile_created THEN
    BEGIN
      INSERT INTO public.onboarding_final (
        user_id,
        step,
        completed,
        data,
        created_at,
        updated_at
      )
      VALUES (
        NEW.id,
        'welcome',
        false,
        '{"source": "signup"}'::jsonb,
        NOW(),
        NOW()
      )
      ON CONFLICT (user_id) DO NOTHING;

      RAISE NOTICE 'handle_new_user: Onboarding criado para %', NEW.id;

    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user: Erro ao criar onboarding para %: % %', NEW.id, SQLERRM, SQLSTATE;
      -- Continua mesmo se onboarding falhar
    END;
  END IF;

  -- ====================
  -- 5. CHECAGEM EXISTS + INSERT EM AUDIT_LOGS
  -- ====================
  -- Só insere se o profile realmente existe
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    BEGIN
      INSERT INTO public.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        details,
        created_at
      )
      VALUES (
        NEW.id,
        'USER_CREATED',
        'user',
        NEW.id,
        jsonb_build_object(
          'email', NEW.email,
          'created_at', NEW.created_at,
          'role_id', v_default_role_id
        ),
        NOW()
      );

      RAISE NOTICE 'handle_new_user: Audit log criado para %', NEW.id;

    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user: Erro ao criar audit log para %: % %', NEW.id, SQLERRM, SQLSTATE;
      -- Continua mesmo se audit log falhar
    END;
  ELSE
    RAISE WARNING 'handle_new_user: Profile não existe para %. Pulando audit log.', NEW.id;
  END IF;

  -- ====================
  -- 6. ATUALIZAR CONVITE SE HOUVER
  -- ====================
  BEGIN
    SELECT * INTO v_convite
    FROM public.club_invites
    WHERE email = NEW.email
      AND status = 'pending'
      AND expires_at > NOW()
    LIMIT 1;

    IF v_convite.id IS NOT NULL THEN
      UPDATE public.club_invites
      SET 
        status = 'accepted',
        accepted_at = NOW(),
        updated_at = NOW()
      WHERE id = v_convite.id;

      RAISE NOTICE 'handle_new_user: Convite % aceito para %', v_convite.id, NEW.email;
    END IF;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: Erro ao processar convite para %: % %', NEW.email, SQLERRM, SQLSTATE;
    -- Continua mesmo se convite falhar
  END;

  -- ====================
  -- 7. RETORNO SEMPRE BEM-SUCEDIDO
  -- ====================
  RAISE NOTICE 'handle_new_user: Processo concluído para % (profile_created: %)', NEW.id, v_profile_created;
  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Último resort: loga erro crítico mas NÃO aborta
  RAISE WARNING 'handle_new_user: ERRO CRÍTICO NÃO TRATADO para %: % %', NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- 4. GARANTIR QUE A TRIGGER EXISTE E ESTÁ CONFIGURADA CORRETAMENTE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Log final
DO $$ 
BEGIN
  RAISE NOTICE '✅ Migração de correção de cadastro aplicada com sucesso!';
  RAISE NOTICE '📋 Mudanças aplicadas:';
  RAISE NOTICE '   1. FK audit_logs.user_id agora aponta para auth.users(id)';
  RAISE NOTICE '   2. Índice único em profiles.email criado';
  RAISE NOTICE '   3. Função handle_new_user reescrita com máxima resiliência';
  RAISE NOTICE '   4. Trigger on_auth_user_created recriada';
END $$;