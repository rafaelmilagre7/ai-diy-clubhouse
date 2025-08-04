-- Migração de segurança crítica - Remoção completa e recriação
-- Problema 3: Funções do banco mal configuradas

-- 1. Remover TODAS as variações das funções problemáticas 
DROP FUNCTION IF EXISTS public.admin_reset_user(text) CASCADE;
DROP FUNCTION IF EXISTS public.admin_reset_user(character varying) CASCADE;
DROP FUNCTION IF EXISTS public.admin_reset_user(varchar) CASCADE;
DROP FUNCTION IF EXISTS public.change_user_role(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.change_user_role(uuid, character varying) CASCADE;
DROP FUNCTION IF EXISTS public.admin_force_delete_auth_user(text) CASCADE;
DROP FUNCTION IF EXISTS public.admin_force_delete_auth_user(character varying) CASCADE;

-- Aguardar um momento para garantir limpeza completa
SELECT pg_sleep(0.1);

-- 2. Criar função admin_reset_user totalmente nova
CREATE FUNCTION public.admin_reset_user_secure(user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  target_user_id uuid;
  admin_user_id uuid;
  backup_count integer := 0;
BEGIN
  admin_user_id := auth.uid();
  
  -- Verificação de admin obrigatória
  IF NOT public.is_user_admin_secure(admin_user_id) THEN
    INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
      admin_user_id, 'security_violation', 'unauthorized_admin_reset_attempt',
      jsonb_build_object('target_email', public.mask_email(user_email)), 'critical'
    );
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;

  -- Rate limiting crítico
  IF NOT public.enhanced_rate_limit_check(admin_user_id::text, 'admin_reset_user', 3, 60) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Limite excedido');
  END IF;

  -- Buscar usuário
  SELECT id INTO target_user_id FROM profiles WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Usuário não encontrado');
  END IF;

  -- Backup obrigatório
  INSERT INTO analytics_backups (table_name, backup_reason, backup_data, record_count)
  SELECT 'user_reset_backup', 'admin_reset_' || target_user_id::text,
         jsonb_build_object('user_data', row_to_json(p.*), 'admin_id', admin_user_id), 1
  FROM profiles p WHERE p.id = target_user_id;
  
  GET DIAGNOSTICS backup_count = ROW_COUNT;

  -- Reset seguro
  UPDATE profiles SET onboarding_completed = false, updated_at = now() WHERE id = target_user_id;

  -- Log obrigatório
  INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
    admin_user_id, 'admin_action', 'user_reset_completed',
    jsonb_build_object('target_user_id', target_user_id, 'backup_records', backup_count), 'high'
  );

  RETURN jsonb_build_object('success', true, 'message', 'Reset realizado com sucesso');
END;
$$;

-- 3. Criar função secure_change_user_role_v2 
CREATE FUNCTION public.secure_change_user_role_v2(target_user_id uuid, new_role_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_user_id uuid;
  old_role_name text;
  new_role_name text;
BEGIN
  admin_user_id := auth.uid();
  
  -- Verificação admin obrigatória
  IF NOT public.is_user_admin_secure(admin_user_id) THEN
    INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
      admin_user_id, 'security_violation', 'unauthorized_role_change',
      jsonb_build_object('target_user_id', target_user_id), 'critical'
    );
    RETURN jsonb_build_object('success', false, 'error', 'Acesso negado');
  END IF;

  -- Rate limiting obrigatório
  IF NOT public.enhanced_rate_limit_check(admin_user_id::text, 'role_change', 10, 60) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Limite excedido');
  END IF;

  -- Validar dados
  SELECT ur.name INTO old_role_name FROM profiles p 
  LEFT JOIN user_roles ur ON p.role_id = ur.id WHERE p.id = target_user_id;
  
  SELECT name INTO new_role_name FROM user_roles WHERE id = new_role_id;

  IF new_role_name IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Role inválido');
  END IF;

  -- Executar mudança
  UPDATE profiles SET role_id = new_role_id, updated_at = now() WHERE id = target_user_id;

  -- Log obrigatório
  INSERT INTO audit_logs (user_id, event_type, action, resource_id, details, severity) VALUES (
    admin_user_id, 'role_change', 'admin_role_change_v2', target_user_id::text,
    jsonb_build_object('old_role', old_role_name, 'new_role', new_role_name), 'high'
  );

  RETURN jsonb_build_object('success', true, 'message', 'Role alterado');
END;
$$;

-- 4. Criar função admin_secure_delete_user_v2
CREATE FUNCTION public.admin_secure_delete_user_v2(target_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_user_id uuid;
  target_user_id uuid;
  backup_count integer := 0;
BEGIN
  admin_user_id := auth.uid();
  
  -- Verificação admin obrigatória
  IF NOT public.is_user_admin_secure(admin_user_id) THEN
    INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
      admin_user_id, 'security_violation', 'unauthorized_delete_attempt',
      jsonb_build_object('target_email', public.mask_email(target_email)), 'critical'
    );
    RETURN jsonb_build_object('success', false, 'error', 'Acesso negado');
  END IF;

  -- Rate limiting crítico
  IF NOT public.enhanced_rate_limit_check(admin_user_id::text, 'admin_delete_user', 2, 240) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Limite crítico excedido');
  END IF;

  -- Buscar usuário
  SELECT id INTO target_user_id FROM profiles WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não encontrado');
  END IF;

  -- Proteção anti auto-deleção
  IF target_user_id = admin_user_id THEN
    INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
      admin_user_id, 'security_violation', 'admin_self_delete_attempt',
      jsonb_build_object('admin_id', admin_user_id), 'critical'
    );
    RETURN jsonb_build_object('success', false, 'error', 'Auto-deleção bloqueada');
  END IF;

  -- Backup obrigatório
  INSERT INTO analytics_backups (table_name, backup_reason, backup_data, record_count)
  SELECT 'user_deletion_backup', 'admin_delete_' || target_user_id::text,
         jsonb_build_object('user_data', row_to_json(p.*), 'deleted_by', admin_user_id), 1
  FROM profiles p WHERE p.id = target_user_id;
  
  GET DIAGNOSTICS backup_count = ROW_COUNT;

  -- Soft delete seguro
  UPDATE profiles SET 
    email = '[DELETED]_' || extract(epoch from now())::text || '_' || email,
    name = '[USUÁRIO DELETADO]',
    is_active = false,
    updated_at = now()
  WHERE id = target_user_id;

  -- Log crítico obrigatório
  INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
    admin_user_id, 'admin_action', 'user_deletion_completed',
    jsonb_build_object('target_user_id', target_user_id, 'backup_records', backup_count), 'critical'
  );

  RETURN jsonb_build_object('success', true, 'message', 'Usuário deletado (soft delete)');
END;
$$;

-- 5. Configurar permissões restritivas
REVOKE ALL ON FUNCTION public.admin_reset_user_secure(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.secure_change_user_role_v2(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_secure_delete_user_v2(text) FROM PUBLIC;

-- Conceder apenas para service_role (edge functions)
GRANT EXECUTE ON FUNCTION public.admin_reset_user_secure(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.secure_change_user_role_v2(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_secure_delete_user_v2(text) TO service_role;

-- 6. Garantir coluna is_active existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
    ALTER TABLE profiles ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- 7. Log final da correção crítica
INSERT INTO audit_logs (
  user_id, event_type, action, details, severity
) VALUES (
  auth.uid(), 'security_improvement', 'critical_database_functions_secured',
  jsonb_build_object(
    'new_secure_functions', ARRAY[
      'admin_reset_user_secure',
      'secure_change_user_role_v2', 
      'admin_secure_delete_user_v2'
    ],
    'removed_dangerous_functions', ARRAY[
      'admin_reset_user',
      'change_user_role',
      'admin_force_delete_auth_user'
    ],
    'security_measures', ARRAY[
      'admin_verification_mandatory',
      'rate_limiting_critical',
      'audit_logging_comprehensive',
      'permissions_restricted_service_role_only',
      'soft_delete_protection',
      'backup_system_mandatory',
      'anti_self_deletion_protection'
    ],
    'threat_level_before', 'CRITICAL',
    'threat_level_after', 'LOW',
    'migration_timestamp', now()
  ),
  'info'
);