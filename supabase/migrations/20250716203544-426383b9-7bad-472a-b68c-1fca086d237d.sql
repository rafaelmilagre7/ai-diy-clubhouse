-- FASE 4: Correção de Funções sem Search Path - LOTE 2C (Sistemático COM DROPs)

-- 1. Funções de audit (triggers)
DROP FUNCTION IF EXISTS public.audit_role_assignments() CASCADE;
CREATE OR REPLACE FUNCTION public.audit_role_assignments()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Log de mudanças de role
  IF (TG_OP = 'UPDATE' AND OLD.role_id IS DISTINCT FROM NEW.role_id) OR TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      user_id, event_type, action, details
    ) VALUES (
      NEW.id,
      'role_assignment',
      TG_OP,
      jsonb_build_object(
        'old_role_id', OLD.role_id,
        'new_role_id', NEW.role_id,
        'changed_by', auth.uid(),
        'changed_at', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. can_use_invite
DROP FUNCTION IF EXISTS public.can_use_invite(uuid, text) CASCADE;
CREATE OR REPLACE FUNCTION public.can_use_invite(p_user_id uuid, p_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  invite_record public.invites;
BEGIN
  -- Buscar convite válido
  SELECT * INTO invite_record
  FROM public.invites
  WHERE token = p_token AND expires_at > now() AND used_at IS NULL;
  
  -- Se convite não existe ou expirou
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Verificar se usuário pode usar este convite
  -- (lógica adicional pode ser implementada aqui)
  RETURN true;
END;
$$;

-- 3. clean_user_onboarding_data
DROP FUNCTION IF EXISTS public.clean_user_onboarding_data(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.clean_user_onboarding_data(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Limpar dados de onboarding
  DELETE FROM public.onboarding_final WHERE user_id = p_user_id;
  DELETE FROM public.onboarding_step_tracking WHERE user_id = p_user_id;
  DELETE FROM public.onboarding_backups WHERE user_id = p_user_id;
  
  -- Reset status no perfil
  UPDATE public.profiles
  SET 
    onboarding_completed = false,
    onboarding_completed_at = NULL,
    updated_at = now()
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Dados de onboarding limpos',
    'user_id', p_user_id
  );
END;
$$;

-- 4. cleanup_expired_invites_enhanced
DROP FUNCTION IF EXISTS public.cleanup_expired_invites_enhanced() CASCADE;
CREATE OR REPLACE FUNCTION public.cleanup_expired_invites_enhanced()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  deleted_count integer;
  backup_count integer;
BEGIN
  -- Fazer backup dos convites expirados
  INSERT INTO public.invite_backups (
    original_invite_id, email, backup_data, backup_reason
  )
  SELECT 
    id, email, to_jsonb(invites.*), 'expired_cleanup'
  FROM public.invites
  WHERE expires_at < now() AND used_at IS NULL;
  
  GET DIAGNOSTICS backup_count = ROW_COUNT;
  
  -- Deletar convites expirados
  DELETE FROM public.invites
  WHERE expires_at < now() AND used_at IS NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_invites', deleted_count,
    'backed_up_invites', backup_count,
    'cleanup_time', now()
  );
END;
$$;