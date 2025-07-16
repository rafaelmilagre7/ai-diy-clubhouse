-- FASE 4: Correção de Funções sem Search Path - LOTE 1 (5 funções iniciais)
-- Estratégia: DROP e RECREATE para evitar conflitos de parâmetros

-- 1. accept_invite
DROP FUNCTION IF EXISTS public.accept_invite(text);
CREATE OR REPLACE FUNCTION public.accept_invite(token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  invite_record record;
  role_record record;
BEGIN
  -- Buscar convite válido
  SELECT * INTO invite_record
  FROM public.invites
  WHERE token = accept_invite.token AND expires_at > now() AND used_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Convite inválido');
  END IF;
  
  -- Buscar dados do role
  SELECT * INTO role_record
  FROM public.user_roles
  WHERE id = invite_record.role_id;
  
  -- Marcar como usado
  UPDATE public.invites
  SET used_at = now()
  WHERE id = invite_record.id;
  
  RETURN jsonb_build_object(
    'success', true,
    'invite_id', invite_record.id,
    'role', role_record.name
  );
END;
$$;

-- 2. admin_complete_user_cleanup
CREATE OR REPLACE FUNCTION public.admin_complete_user_cleanup(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user_email text;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Buscar email do usuário
  SELECT email INTO user_email
  FROM public.profiles
  WHERE id = target_user_id;
  
  IF user_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Usuário não encontrado');
  END IF;
  
  -- Limpar dados do usuário
  DELETE FROM public.profiles WHERE id = target_user_id;
  DELETE FROM public.analytics WHERE user_id = target_user_id;
  DELETE FROM public.progress WHERE user_id = target_user_id;
  DELETE FROM public.onboarding_final WHERE user_id = target_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Usuário limpo completamente',
    'user_email', user_email
  );
END;
$$;

-- 3. admin_reset_user
CREATE OR REPLACE FUNCTION public.admin_reset_user(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Reset dados do usuário
  UPDATE public.profiles
  SET 
    onboarding_completed = false,
    onboarding_completed_at = NULL,
    updated_at = now()
  WHERE id = target_user_id;
  
  DELETE FROM public.onboarding_final WHERE user_id = target_user_id;
  DELETE FROM public.progress WHERE user_id = target_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Usuário resetado com sucesso'
  );
END;
$$;

-- 4. Log da correção FASE 4 - LOTE 1
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'system_cleanup',
  'phase_4_function_search_path_fix_batch_1',
  jsonb_build_object(
    'message', 'FASE 4 - Correção de Search Path - Lote 1',
    'phase', '4_batch_1',
    'functions_corrected', 3,
    'functions_list', '["accept_invite", "admin_complete_user_cleanup", "admin_reset_user"]',
    'remaining_functions', 84,
    'status', 'IN_PROGRESS',
    'timestamp', now()
  ),
  auth.uid()
);