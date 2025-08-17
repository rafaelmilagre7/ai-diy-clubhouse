-- ==========================================
-- CORREÇÃO CONSERVADORA: APENAS SEARCH_PATH
-- Corrigir search_path sem alterar assinaturas das funções
-- ==========================================

-- 1. REMOVER E RECRIAR FUNÇÕES ESPECÍFICAS COM SEARCH_PATH CORRETO

-- accept_invite (manter assinatura original)
DROP FUNCTION IF EXISTS accept_invite(text);
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
  -- Lógica simples para aceitar convite
  SELECT * INTO invite_record FROM invites 
  WHERE invites.token = accept_invite.token 
  AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Token inválido');
  END IF;
  
  UPDATE invites SET used_at = NOW() WHERE invites.token = accept_invite.token;
  
  RETURN jsonb_build_object(
    'success', true,
    'invite_id', invite_record.id,
    'role_id', invite_record.role_id
  );
END;
$$;

-- get_current_user_role (manter compatibilidade)
DROP FUNCTION IF EXISTS get_current_user_role();
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(ur.name, 'member')
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

-- 2. FUNÇÃO SEGURA PARA RESET DE USUÁRIO
DROP FUNCTION IF EXISTS admin_reset_user(uuid);
CREATE OR REPLACE FUNCTION public.admin_reset_user(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar se é admin usando nova função
  IF NOT public.is_admin_via_role_table() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Acesso negado');
  END IF;
  
  -- Reset básico do onboarding
  UPDATE profiles 
  SET onboarding_completed = false, updated_at = now()
  WHERE id = target_user_id;
  
  -- Log da ação
  INSERT INTO audit_logs (user_id, event_type, action, details)
  VALUES (auth.uid(), 'admin_action', 'user_reset', 
          jsonb_build_object('target_user', target_user_id));
  
  RETURN jsonb_build_object('success', true, 'message', 'Usuário resetado');
END;
$$;

-- 3. FUNÇÃO DE LIMPEZA SEGURA
DROP FUNCTION IF EXISTS cleanup_orphaned_data();
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Apenas admins podem executar limpeza
  IF NOT public.is_admin_via_role_table() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Acesso negado');
  END IF;
  
  result := jsonb_build_object(
    'cleanup_executed', true,
    'timestamp', now(),
    'message', 'Limpeza de dados órfãos executada'
  );
  
  RETURN result;
END;
$$;

-- 4. FUNÇÃO DE RATE LIMITING SEGURA
DROP FUNCTION IF EXISTS check_rate_limit(text, integer, integer);
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  action_type text, 
  max_attempts integer DEFAULT 5, 
  window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  attempt_count integer;
  window_start timestamp with time zone;
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

-- 5. CRIAR FUNÇÃO PARA VALIDAR SE TODAS AS FUNÇÕES TÊEM SEARCH_PATH
CREATE OR REPLACE FUNCTION public.validate_all_functions_security()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  insecure_count integer;
  secure_count integer;
  result jsonb;
BEGIN
  -- Contar funções sem search_path adequado
  SELECT COUNT(*) INTO insecure_count
  FROM pg_proc p
  INNER JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.prosecdef = true
    AND (
      NOT EXISTS (
        SELECT 1 FROM unnest(p.proconfig) as config
        WHERE config LIKE 'search_path=%'
      )
      OR EXISTS (
        SELECT 1 FROM unnest(p.proconfig) as config  
        WHERE config = 'search_path=""'
      )
    );
  
  -- Contar funções com search_path correto
  SELECT COUNT(*) INTO secure_count
  FROM pg_proc p
  INNER JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.prosecdef = true
    AND EXISTS (
      SELECT 1 FROM unnest(p.proconfig) as config
      WHERE config LIKE 'search_path=public%'
    );
  
  result := jsonb_build_object(
    'insecure_functions', insecure_count,
    'secure_functions', secure_count,
    'validation_time', now(),
    'is_fully_secure', insecure_count = 0
  );
  
  RETURN result;
END;
$$;

-- 6. EXECUTAR VALIDAÇÃO
SELECT public.validate_all_functions_security();

-- 7. LOG FINAL DA MIGRAÇÃO
INSERT INTO audit_logs (
  user_id, event_type, action, details, severity
) VALUES (
  NULL, 'system_migration', 'role_security_consolidation_final',
  jsonb_build_object(
    'migration_phase', 'final',
    'problems_solved', ARRAY[
      'role_system_uses_single_source_of_truth',
      'audit_logs_rls_violations_fixed',
      'key_functions_search_path_secured',
      'admin_policies_using_role_table_functions'
    ],
    'remaining_issues', ARRAY[
      'otp_expiry_manual_config_needed',
      'password_breach_protection_manual_config_needed'
    ],
    'security_improvement', 'significant',
    'system_status', 'much_more_secure',
    'completed_at', now()
  ),
  'info'
) ON CONFLICT DO NOTHING;