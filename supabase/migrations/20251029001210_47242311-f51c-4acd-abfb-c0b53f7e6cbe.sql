-- ============================================
-- CORREÇÃO DEFINITIVA: sync_is_master_user com schema qualificado
-- ============================================
-- Problema: A função tem SET search_path TO '' mas acessa user_roles
-- sem qualificar com public., causando erro "relation user_roles does not exist"

DROP FUNCTION IF EXISTS public.sync_is_master_user() CASCADE;

CREATE OR REPLACE FUNCTION public.sync_is_master_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  NEW.is_master_user := EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE id = NEW.role_id 
    AND name IN ('master_user', 'membro_club')
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_is_master_user_trigger ON public.profiles;
CREATE TRIGGER sync_is_master_user_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.role_id IS DISTINCT FROM NEW.role_id)
  EXECUTE FUNCTION public.sync_is_master_user();

-- ============================================
-- VERIFICAR E CORRIGIR: log_role_change
-- ============================================

DROP FUNCTION IF EXISTS public.log_role_change() CASCADE;

CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_old_role_name text;
  v_new_role_name text;
BEGIN
  SELECT name INTO v_old_role_name 
  FROM public.user_roles 
  WHERE id = OLD.role_id;
  
  SELECT name INTO v_new_role_name 
  FROM public.user_roles 
  WHERE id = NEW.role_id;
  
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'role_change',
    'assign_role',
    NEW.id::text,
    jsonb_build_object(
      'changed_by', auth.uid(),
      'target_user', NEW.id,
      'old_role_id', OLD.role_id,
      'new_role_id', NEW.role_id,
      'old_role_name', v_old_role_name,
      'new_role_name', v_new_role_name,
      'timestamp', now()
    ),
    'info'
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_role_change_trigger ON public.profiles;
CREATE TRIGGER log_role_change_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.role_id IS DISTINCT FROM NEW.role_id)
  EXECUTE FUNCTION public.log_role_change();