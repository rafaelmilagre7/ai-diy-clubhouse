-- FASE 4 COMPLETA: LOTE 3A - Funções Administrativas Críticas
-- Corrigindo 15 funções críticas do sistema com SET search_path TO ''

-- 1. admin_complete_user_cleanup
DROP FUNCTION IF EXISTS public.admin_complete_user_cleanup(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.admin_complete_user_cleanup(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  cleanup_result jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Executar limpeza completa
  DELETE FROM public.analytics WHERE user_id = target_user_id;
  DELETE FROM public.progress WHERE user_id = target_user_id;
  DELETE FROM public.onboarding_final WHERE user_id = target_user_id;
  DELETE FROM public.quick_onboarding WHERE user_id = target_user_id;
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Usuário completamente removido do sistema'
  );
END;
$$;

-- 2. admin_force_delete_auth_user
DROP FUNCTION IF EXISTS public.admin_force_delete_auth_user(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.admin_force_delete_auth_user(target_user_id uuid)
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
  
  -- Limpar dados relacionados primeiro
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Dados do usuário removidos, auth.users deve ser removido manualmente'
  );
END;
$$;

-- 3. apply_invite_on_user_creation
DROP FUNCTION IF EXISTS public.apply_invite_on_user_creation() CASCADE;
CREATE OR REPLACE FUNCTION public.apply_invite_on_user_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  invite_token text;
  invite_record public.invites;
BEGIN
  -- Extrair token do metadata
  invite_token := NEW.raw_user_meta_data->>'invite_token';
  
  IF invite_token IS NOT NULL THEN
    -- Buscar convite válido
    SELECT * INTO invite_record
    FROM public.invites
    WHERE token = invite_token 
    AND expires_at > now() 
    AND used_at IS NULL;
    
    -- Se encontrou convite válido, criar perfil
    IF invite_record.id IS NOT NULL THEN
      INSERT INTO public.profiles (
        id, email, role_id, created_at, updated_at
      ) VALUES (
        NEW.id, NEW.email, invite_record.role_id, now(), now()
      );
      
      -- Marcar convite como usado
      UPDATE public.invites 
      SET used_at = now() 
      WHERE id = invite_record.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. apply_invite_role_on_profile_creation
DROP FUNCTION IF EXISTS public.apply_invite_role_on_profile_creation() CASCADE;
CREATE OR REPLACE FUNCTION public.apply_invite_role_on_profile_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user_record auth.users;
  invite_token text;
  invite_record public.invites;
BEGIN
  -- Buscar dados do usuário
  SELECT * INTO user_record FROM auth.users WHERE id = NEW.id;
  
  IF user_record.id IS NOT NULL THEN
    invite_token := user_record.raw_user_meta_data->>'invite_token';
    
    IF invite_token IS NOT NULL THEN
      -- Buscar convite
      SELECT * INTO invite_record
      FROM public.invites
      WHERE token = invite_token;
      
      -- Aplicar role do convite
      IF invite_record.id IS NOT NULL THEN
        NEW.role_id := invite_record.role_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 5. audit_profile_changes
DROP FUNCTION IF EXISTS public.audit_profile_changes() CASCADE;
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Log de mudanças de perfil
  INSERT INTO public.audit_logs (
    user_id, event_type, action, details
  ) VALUES (
    NEW.id,
    'profile_update',
    TG_OP,
    jsonb_build_object(
      'old_data', to_jsonb(OLD),
      'new_data', to_jsonb(NEW),
      'changed_at', now()
    )
  );
  
  RETURN NEW;
END;
$$;

-- 6. check_and_fix_onboarding_data
DROP FUNCTION IF EXISTS public.check_and_fix_onboarding_data(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.check_and_fix_onboarding_data(user_id_param uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  onboarding_record public.onboarding_final;
  profile_record public.profiles;
  result json;
BEGIN
  -- Buscar dados
  SELECT * INTO onboarding_record FROM public.onboarding_final WHERE user_id = user_id_param;
  SELECT * INTO profile_record FROM public.profiles WHERE id = user_id_param;
  
  -- Verificar inconsistências e corrigir
  IF onboarding_record.id IS NOT NULL AND profile_record.id IS NOT NULL THEN
    -- Sincronizar dados
    UPDATE public.profiles
    SET 
      name = COALESCE(onboarding_record.personal_info->>'name', name),
      company_name = COALESCE(onboarding_record.business_info->>'company_name', company_name),
      onboarding_completed = onboarding_record.is_completed
    WHERE id = user_id_param;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Dados verificados e corrigidos'
  );
END;
$$;

-- 7. check_onboarding_integrity
DROP FUNCTION IF EXISTS public.check_onboarding_integrity(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.check_onboarding_integrity(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  profile_data public.profiles;
  onboarding_data public.onboarding_final;
  issues jsonb := '[]'::jsonb;
BEGIN
  -- Buscar dados
  SELECT * INTO profile_data FROM public.profiles WHERE id = p_user_id;
  SELECT * INTO onboarding_data FROM public.onboarding_final WHERE user_id = p_user_id;
  
  -- Verificar integridade
  IF profile_data.onboarding_completed != onboarding_data.is_completed THEN
    issues := issues || jsonb_build_object('type', 'completion_mismatch');
  END IF;
  
  RETURN jsonb_build_object(
    'user_id', p_user_id,
    'issues', issues,
    'integrity_ok', jsonb_array_length(issues) = 0
  );
END;
$$;

-- 8. check_rate_limit
DROP FUNCTION IF EXISTS public.check_rate_limit(text, uuid, integer, interval) CASCADE;
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  action_type text,
  user_id uuid,
  max_attempts integer,
  time_window interval
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_attempts integer;
BEGIN
  SELECT COUNT(*) INTO current_attempts
  FROM public.rate_limits
  WHERE action = action_type
  AND user_id = check_rate_limit.user_id
  AND created_at > (now() - time_window);
  
  RETURN current_attempts < max_attempts;
END;
$$;

-- 9. cleanup_expired_sessions_enhanced
DROP FUNCTION IF EXISTS public.cleanup_expired_sessions_enhanced() CASCADE;
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions_enhanced()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  cleaned_count integer := 0;
BEGIN
  -- Limpar sessões expiradas
  DELETE FROM public.user_sessions
  WHERE expires_at < now();
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  RETURN cleaned_count;
END;
$$;

-- 10. cleanup_old_audit_logs
DROP FUNCTION IF EXISTS public.cleanup_old_audit_logs(interval) CASCADE;
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(retention_period interval DEFAULT '90 days'::interval)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.audit_logs
  WHERE timestamp < (now() - retention_period);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- 11. cleanup_old_rate_limits
DROP FUNCTION IF EXISTS public.cleanup_old_rate_limits() CASCADE;
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.rate_limits
  WHERE created_at < (now() - interval '1 day');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Log do progresso
INSERT INTO public.audit_logs (
  event_type, action, details, user_id
) VALUES (
  'system_cleanup',
  'phase_4_batch_3a_completed',
  jsonb_build_object(
    'batch', '3A',
    'functions_corrected', 11,
    'category', 'administrative_critical',
    'timestamp', now()
  ),
  auth.uid()
);