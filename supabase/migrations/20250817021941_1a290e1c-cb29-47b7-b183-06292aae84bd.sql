-- ==========================================
-- CORREÇÃO FINAL: SEARCH_PATH VAZIO PARA 'public'
-- Corrigir funções com search_path="" para search_path='public'
-- ==========================================

-- 1. CORRIGIR FUNÇÕES CRÍTICAS COM SEARCH_PATH VAZIO

-- accept_invite
CREATE OR REPLACE FUNCTION public.accept_invite(token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invite_record record;
  result jsonb;
BEGIN
  SELECT * INTO invite_record FROM invites WHERE invites.token = accept_invite.token AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Token inválido ou expirado');
  END IF;
  
  UPDATE invites SET used_at = NOW() WHERE invites.token = accept_invite.token;
  
  result := jsonb_build_object(
    'success', true,
    'invite_id', invite_record.id,
    'role_id', invite_record.role_id,
    'email', invite_record.email
  );
  
  RETURN result;
END;
$$;

-- admin_reset_user
CREATE OR REPLACE FUNCTION public.admin_reset_user(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin_via_role_table() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  UPDATE profiles SET onboarding_completed = false WHERE id = target_user_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Usuário resetado');
END;
$$;

-- get_current_user_role  
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.get_user_role_via_table();
$$;

-- analyze_rls_security_issues
CREATE OR REPLACE FUNCTION public.analyze_rls_security_issues()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  tables_without_rls integer;
BEGIN
  IF NOT public.is_admin_via_role_table() THEN
    RETURN jsonb_build_object('error', 'Acesso negado');
  END IF;
  
  SELECT COUNT(*) INTO tables_without_rls
  FROM information_schema.tables t
  LEFT JOIN pg_class c ON c.relname = t.table_name
  WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
    AND NOT EXISTS (
      SELECT 1 FROM pg_policies p WHERE p.tablename = t.table_name
    );
  
  result := jsonb_build_object(
    'tables_without_rls', tables_without_rls,
    'analysis_date', now()
  );
  
  RETURN result;
END;
$$;

-- check_rate_limit (versão sem parâmetros duplicados)
CREATE OR REPLACE FUNCTION public.check_rate_limit(action_type text, max_attempts integer DEFAULT 5, window_minutes integer DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  attempt_count integer;
  window_start timestamp;
BEGIN
  window_start := NOW() - (window_minutes || ' minutes')::interval;
  
  SELECT COUNT(*) INTO attempt_count
  FROM audit_logs 
  WHERE action = action_type 
    AND user_id = auth.uid()
    AND timestamp >= window_start;
  
  RETURN attempt_count < max_attempts;
END;
$$;

-- 2. CORRIGIR FUNÇÕES DE DIAGNÓSTICO

-- diagnose_auth_state  
CREATE OR REPLACE FUNCTION public.diagnose_auth_state(target_user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  profile_data record;
  result jsonb;
BEGIN
  SELECT * INTO profile_data FROM profiles WHERE id = target_user_id;
  
  result := jsonb_build_object(
    'user_id', target_user_id,
    'profile_exists', profile_data IS NOT NULL,
    'role_id', profile_data.role_id,
    'diagnosis_time', now()
  );
  
  RETURN result;
END;
$$;

-- 3. CORRIGIR FUNÇÕES DE LIMPEZA

-- cleanup_orphaned_data
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cleaned_count integer := 0;
  result jsonb;
BEGIN
  IF NOT public.is_admin_via_role_table() THEN
    RETURN jsonb_build_object('error', 'Acesso negado');
  END IF;
  
  -- Limpeza simples como exemplo
  DELETE FROM audit_logs WHERE timestamp < NOW() - INTERVAL '1 year';
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  result := jsonb_build_object(
    'cleaned_records', cleaned_count,
    'cleanup_date', now()
  );
  
  RETURN result;
END;
$$;

-- 4. LOG DA CORREÇÃO
INSERT INTO audit_logs (
  user_id, event_type, action, details, severity
) VALUES (
  NULL, 'system_migration', 'search_path_empty_string_fixes',
  jsonb_build_object(
    'migration_step', 3,
    'fixed_functions', ARRAY[
      'accept_invite',
      'admin_reset_user', 
      'get_current_user_role',
      'analyze_rls_security_issues',
      'check_rate_limit',
      'diagnose_auth_state',
      'cleanup_orphaned_data'
    ],
    'security_improvement', 'search_path_properly_configured',
    'remaining_to_fix', 'additional_functions_if_needed',
    'completed_at', now()
  ),
  'info'
) ON CONFLICT DO NOTHING;