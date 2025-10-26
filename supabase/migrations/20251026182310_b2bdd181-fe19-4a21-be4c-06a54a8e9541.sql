-- v2 - Função mais resiliente + policies RLS essenciais
-- Habilitar RLS (idempotente)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_final ENABLE ROW LEVEL SECURITY;

-- Função de criação/ajuste de novos usuários (resiliente, sem rethrow)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_role_id uuid;
  invite_record record;
  v_org_id uuid := NULL;
  v_name text := NULL;
BEGIN
  RAISE LOG 'handle_new_user v2: start user_id=%', NEW.id;

  -- Derivar nome a partir dos metadados (fallback para parte local do email)
  BEGIN
    v_name := COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'given_name',
      split_part(COALESCE(NEW.email, ''), '@', 1)
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: name parse error: % %', SQLERRM, SQLSTATE;
    v_name := split_part(COALESCE(NEW.email, ''), '@', 1);
  END;

  -- Buscar role padrão em ordem de prioridade
  BEGIN
    SELECT id INTO default_role_id
    FROM public.user_roles
    WHERE name IN ('membro_club', 'member', 'formacao', 'convidado')
    ORDER BY 
      CASE name
        WHEN 'membro_club' THEN 1
        WHEN 'member' THEN 2
        WHEN 'formacao' THEN 3
        WHEN 'convidado' THEN 4
        ELSE 5
      END
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: role lookup error: % %', SQLERRM, SQLSTATE;
    default_role_id := NULL;
  END;

  -- Verificar convite válido para este email
  BEGIN
    SELECT * INTO invite_record
    FROM public.invites
    WHERE email = NEW.email
      AND used_at IS NULL
      AND (expires_at IS NULL OR expires_at > now())
    ORDER BY created_at DESC
    LIMIT 1;

    IF FOUND THEN
      RAISE LOG 'handle_new_user: invite found id=%', invite_record.id;

      IF invite_record.role_id IS NOT NULL THEN
        default_role_id := invite_record.role_id;
      END IF;

      -- organization_id não existe em invites: mantemos v_org_id como NULL
      UPDATE public.invites
      SET used_at = now(), used_by = NEW.id
      WHERE id = invite_record.id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: invite processing error: % %', SQLERRM, SQLSTATE;
  END;

  -- Upsert de perfil resiliente (sem re-lançar erro)
  BEGIN
    INSERT INTO public.profiles (id, email, role_id, organization_id, name, created_at, updated_at)
    VALUES (NEW.id, NEW.email, default_role_id, v_org_id, v_name, now(), now())
    ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          role_id = COALESCE(EXCLUDED.role_id, public.profiles.role_id),
          organization_id = COALESCE(EXCLUDED.organization_id, public.profiles.organization_id),
          name = COALESCE(EXCLUDED.name, public.profiles.name),
          updated_at = now();
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: profile upsert error: % %', SQLERRM, SQLSTATE;
    -- não re-levantar erro para não abortar o fluxo de cadastro
  END;

  -- Criar registro de onboarding (best-effort)
  BEGIN
    INSERT INTO public.onboarding_final (
      user_id, current_step, personal_info, location_info, 
      discovery_info, business_context, is_completed, created_at, updated_at
    )
    VALUES (
      NEW.id, 1, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 
      '{}'::jsonb, false, now(), now()
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: onboarding insert error: % %', SQLERRM, SQLSTATE;
  END;

  -- Audit log (não crítico)
  BEGIN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, changes, created_at)
    VALUES (
      NEW.id, 'INSERT', 'profiles', NEW.id,
      jsonb_build_object('email', NEW.email, 'role_id', default_role_id, 'organization_id', v_org_id),
      now()
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: audit log error: % %', SQLERRM, SQLSTATE;
  END;

  RAISE LOG 'handle_new_user v2: done user_id=%', NEW.id;
  RETURN NEW;
END;
$$;

-- Garantir que o trigger use a função atualizada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Policies essenciais (somente se não existirem)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_insert_own'
  ) THEN
    CREATE POLICY "profiles_insert_own"
      ON public.profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'onboarding_final' AND policyname = 'onboarding_insert_own'
  ) THEN
    CREATE POLICY "onboarding_insert_own"
      ON public.onboarding_final
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;
