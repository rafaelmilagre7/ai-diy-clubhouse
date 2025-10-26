-- Atualização da função handle_new_user: remove referência a organization_id do convite e simplifica logs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_role_id uuid;
  invite_record record;
  v_org_id uuid := NULL; -- Mantemos para perfis, mas não vem do convite
BEGIN
  RAISE LOG 'handle_new_user: start user_id=%', NEW.id;

  -- Buscar role padrão (membro_club > formacao > convidado)
  BEGIN
    SELECT id INTO default_role_id
    FROM public.user_roles
    WHERE name IN ('membro_club', 'formacao', 'convidado')
    ORDER BY 
      CASE name
        WHEN 'membro_club' THEN 1
        WHEN 'formacao' THEN 2
        WHEN 'convidado' THEN 3
        ELSE 4
      END
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: role lookup error: % %', SQLERRM, SQLSTATE;
    default_role_id := NULL;
  END;

  -- Verificar convite pendente
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

      -- Removido: invite_record.organization_id (não existe em invites)
      -- v_org_id permanece NULL a menos que outra lógica o defina

      UPDATE public.invites
      SET used_at = now(), used_by = NEW.id
      WHERE id = invite_record.id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: invite processing error: % %', SQLERRM, SQLSTATE;
  END;

  -- Criar perfil
  BEGIN
    INSERT INTO public.profiles (id, email, role_id, organization_id, created_at, updated_at)
    VALUES (NEW.id, NEW.email, default_role_id, v_org_id, now(), now());
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: profile insert error: % %', SQLERRM, SQLSTATE;
    RAISE;
  END;

  -- Criar onboarding (usa is_completed)
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

  RAISE LOG 'handle_new_user: done user_id=%', NEW.id;
  RETURN NEW;
END;
$$;

-- Garantir que o trigger use a função atualizada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();