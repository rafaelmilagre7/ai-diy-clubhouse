-- ================================================================
-- CORREÇÃO CIRÚRGICA: handle_new_user + RLS audit_logs
-- ================================================================

-- 1) CORRIGIR FUNÇÃO handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_role_id uuid;
  invite_record record;
  v_org_id uuid;
BEGIN
  RAISE LOG 'handle_new_user: Iniciando para user_id=%', NEW.id;

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
    
    IF default_role_id IS NOT NULL THEN
      RAISE LOG 'handle_new_user: Role padrão encontrada: %', default_role_id;
    ELSE
      RAISE LOG 'handle_new_user: Nenhuma role padrão encontrada, usando NULL';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: Erro ao buscar role: % %', SQLERRM, SQLSTATE;
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
      RAISE LOG 'handle_new_user: Convite encontrado';
      
      IF invite_record.role_id IS NOT NULL THEN
        default_role_id := invite_record.role_id;
      END IF;
      
      IF invite_record.organization_id IS NOT NULL THEN
        v_org_id := invite_record.organization_id;
      END IF;

      UPDATE public.invites
      SET used_at = now(), used_by = NEW.id
      WHERE id = invite_record.id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: Erro ao processar convite: % %', SQLERRM, SQLSTATE;
  END;

  -- Criar perfil (CRÍTICO)
  BEGIN
    INSERT INTO public.profiles (id, email, role_id, organization_id, created_at, updated_at)
    VALUES (NEW.id, NEW.email, default_role_id, v_org_id, now(), now());
    
    RAISE LOG 'handle_new_user: Perfil criado';
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: ERRO CRÍTICO perfil: % % (%)', 
      SQLERRM, SQLSTATE, COALESCE(PG_EXCEPTION_DETAIL, 'n/a');
    RAISE;
  END;

  -- Criar onboarding
  BEGIN
    INSERT INTO public.onboarding_final (
      user_id, current_step, personal_info, location_info, 
      discovery_info, business_context, completed, created_at, updated_at
    )
    VALUES (
      NEW.id, 1, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 
      '{}'::jsonb, false, now(), now()
    );
    
    RAISE LOG 'handle_new_user: Onboarding criado';
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: Erro onboarding: % %', SQLERRM, SQLSTATE;
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
    RAISE LOG 'handle_new_user: Falha não crítica audit_logs: % %', SQLERRM, SQLSTATE;
  END;

  RAISE LOG 'handle_new_user: Concluído com sucesso';
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: ERRO FATAL: % % (%)', 
      SQLERRM, SQLSTATE, COALESCE(PG_EXCEPTION_DETAIL, 'n/a');
    RAISE;
END;
$$;

-- Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2) AJUSTAR RLS de audit_logs
DROP POLICY IF EXISTS "Users can create audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow system inserts to audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow audit log inserts" ON public.audit_logs;

CREATE POLICY "Allow audit log inserts"
ON public.audit_logs
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  OR current_setting('role') IN ('authenticator', 'postgres')
);