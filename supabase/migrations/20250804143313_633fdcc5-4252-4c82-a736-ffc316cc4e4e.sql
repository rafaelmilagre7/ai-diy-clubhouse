-- Migração para corrigir funções críticas de segurança (correção)
-- Problema 3: Funções do banco mal configuradas

-- 1. Remover todas as versões existentes das funções problemáticas
DROP FUNCTION IF EXISTS public.admin_reset_user CASCADE;
DROP FUNCTION IF EXISTS public.change_user_role CASCADE;
DROP FUNCTION IF EXISTS public.admin_force_delete_auth_user CASCADE;

-- 2. Criar função admin_reset_user segura
CREATE OR REPLACE FUNCTION public.admin_reset_user(user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  target_user_id uuid;
  admin_user_id uuid;
  backup_count integer := 0;
  result jsonb;
BEGIN
  -- Verificar se quem está chamando é admin
  admin_user_id := auth.uid();
  
  IF NOT public.is_user_admin_secure(admin_user_id) THEN
    INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
      admin_user_id, 'security_violation', 'unauthorized_admin_reset_attempt',
      jsonb_build_object('target_email', public.mask_email(user_email), 'timestamp', now()),
      'critical'
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Acesso negado: apenas administradores podem resetar usuários'
    );
  END IF;

  -- Rate limiting por admin
  IF NOT public.enhanced_rate_limit_check(
    admin_user_id::text, 
    'admin_reset_user', 
    3,  -- máximo 3 resets
    60  -- por hora
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Limite de resets por hora excedido. Aguarde para continuar.'
    );
  END IF;

  -- Buscar usuário target
  SELECT id INTO target_user_id
  FROM profiles 
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
      admin_user_id, 'admin_action', 'reset_user_not_found',
      jsonb_build_object('target_email', public.mask_email(user_email), 'admin_id', admin_user_id),
      'warning'
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Usuário não encontrado'
    );
  END IF;

  -- Criar backup antes do reset
  INSERT INTO analytics_backups (table_name, backup_reason, backup_data, record_count)
  SELECT 
    'user_reset_backup',
    'admin_reset_user_' || target_user_id::text,
    jsonb_build_object(
      'user_data', row_to_json(p.*),
      'reset_by', admin_user_id,
      'reset_timestamp', now()
    ),
    1
  FROM profiles p WHERE p.id = target_user_id;
  
  GET DIAGNOSTICS backup_count = ROW_COUNT;

  -- Resetar dados do usuário (implementação básica)
  UPDATE profiles 
  SET 
    onboarding_completed = false,
    updated_at = now()
  WHERE id = target_user_id;

  -- Log da ação de reset
  INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
    admin_user_id, 'admin_action', 'user_reset_completed',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'target_email', public.mask_email(user_email),
      'backup_records', backup_count,
      'admin_id', admin_user_id,
      'timestamp', now()
    ),
    'high'
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Reset do usuário realizado com sucesso',
    'backup_records', backup_count,
    'user_id', target_user_id,
    'reset_timestamp', now()
  );

EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
      admin_user_id, 'system_error', 'admin_reset_user_failed',
      jsonb_build_object('error', SQLERRM, 'target_email', public.mask_email(user_email)),
      'critical'
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro interno durante o reset: ' || SQLERRM
    );
END;
$$;

-- 3. Corrigir função secure_change_user_role
CREATE OR REPLACE FUNCTION public.secure_change_user_role(target_user_id uuid, new_role_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_user_id uuid;
  old_role_name text;
  new_role_name text;
  target_email text;
BEGIN
  admin_user_id := auth.uid();
  
  IF NOT public.is_user_admin_secure(admin_user_id) THEN
    INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
      admin_user_id, 'security_violation', 'unauthorized_role_change_attempt',
      jsonb_build_object('target_user_id', target_user_id, 'new_role_id', new_role_id),
      'critical'
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Acesso negado: apenas administradores podem alterar roles'
    );
  END IF;

  -- Rate limiting
  IF NOT public.enhanced_rate_limit_check(
    admin_user_id::text, 
    'role_change', 
    10, -- máximo 10 mudanças
    60  -- por hora
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Limite de mudanças de role excedido. Aguarde para continuar.'
    );
  END IF;

  -- Obter dados para auditoria
  SELECT ur.name, p.email INTO old_role_name, target_email
  FROM profiles p
  LEFT JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id;

  SELECT name INTO new_role_name
  FROM user_roles
  WHERE id = new_role_id;

  -- Verificações de segurança
  IF new_role_name IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Role não encontrado');
  END IF;

  IF target_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não encontrado');
  END IF;

  -- Atualizar role
  UPDATE profiles 
  SET role_id = new_role_id, updated_at = now()
  WHERE id = target_user_id;

  -- Log da mudança
  INSERT INTO audit_logs (
    user_id, event_type, action, resource_id, details, severity
  ) VALUES (
    admin_user_id, 'role_change', 'admin_role_change_secure', target_user_id::text,
    jsonb_build_object(
      'target_user_id', target_user_id,
      'target_email', public.mask_email(target_email),
      'old_role', old_role_name,
      'new_role', new_role_name,
      'admin_user_id', admin_user_id,
      'timestamp', now()
    ),
    'high'
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Role alterado com sucesso',
    'old_role', old_role_name,
    'new_role', new_role_name
  );
END;
$$;

-- 4. Criar função segura para deletar usuários
CREATE OR REPLACE FUNCTION public.admin_secure_delete_user(target_email text, force_delete boolean DEFAULT false)
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
  
  IF NOT public.is_user_admin_secure(admin_user_id) THEN
    INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
      admin_user_id, 'security_violation', 'unauthorized_delete_attempt',
      jsonb_build_object('target_email', public.mask_email(target_email)),
      'critical'
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Acesso negado: apenas administradores podem deletar usuários'
    );
  END IF;

  -- Rate limiting crítico para deleções
  IF NOT public.enhanced_rate_limit_check(
    admin_user_id::text, 
    'admin_delete_user', 
    2,   -- máximo 2 deleções
    240  -- por 4 horas
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Limite de deleções excedido. Aguarde 4 horas para continuar.'
    );
  END IF;

  -- Buscar usuário target
  SELECT id INTO target_user_id
  FROM profiles 
  WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não encontrado');
  END IF;

  -- Proteger contra auto-deleção
  IF target_user_id = admin_user_id THEN
    INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
      admin_user_id, 'security_violation', 'admin_self_delete_attempt',
      jsonb_build_object('admin_id', admin_user_id), 'critical'
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Administradores não podem deletar a si mesmos'
    );
  END IF;

  -- Criar backup completo
  INSERT INTO analytics_backups (table_name, backup_reason, backup_data, record_count)
  SELECT 
    'user_deletion_backup',
    'admin_delete_user_' || target_user_id::text,
    jsonb_build_object(
      'user_data', row_to_json(p.*),
      'deleted_by', admin_user_id,
      'deletion_timestamp', now(),
      'force_delete', force_delete
    ),
    1
  FROM profiles p WHERE p.id = target_user_id;
  
  GET DIAGNOSTICS backup_count = ROW_COUNT;

  -- Soft delete
  UPDATE profiles 
  SET 
    email = '[DELETED]_' || extract(epoch from now())::text || '_' || email,
    name = '[USUÁRIO DELETADO]',
    is_active = false,
    updated_at = now()
  WHERE id = target_user_id;

  -- Log da ação crítica
  INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
    admin_user_id, 'admin_action', 'user_deletion_completed',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'target_email', public.mask_email(target_email),
      'backup_records', backup_count,
      'admin_id', admin_user_id,
      'force_delete', force_delete,
      'timestamp', now()
    ),
    'critical'
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Usuário marcado como deletado com sucesso',
    'backup_records', backup_count,
    'user_id', target_user_id,
    'deletion_timestamp', now()
  );
END;
$$;

-- 5. Revogar permissões globais desnecessárias
REVOKE EXECUTE ON FUNCTION public.admin_reset_user(text) FROM anonymous;
REVOKE EXECUTE ON FUNCTION public.admin_reset_user(text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.secure_change_user_role(uuid, uuid) FROM anonymous;
REVOKE EXECUTE ON FUNCTION public.secure_change_user_role(uuid, uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_secure_delete_user(text, boolean) FROM anonymous;
REVOKE EXECUTE ON FUNCTION public.admin_secure_delete_user(text, boolean) FROM authenticated;

-- 6. Conceder apenas aos roles apropriados
GRANT EXECUTE ON FUNCTION public.admin_reset_user(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.secure_change_user_role(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_secure_delete_user(text, boolean) TO service_role;

-- 7. Adicionar coluna is_active se não existir (para soft deletes)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
    ALTER TABLE profiles ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- 8. Log da migração de segurança
INSERT INTO audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'security_improvement',
  'critical_functions_security_fix',
  jsonb_build_object(
    'fixed_functions', ARRAY[
      'admin_reset_user',
      'secure_change_user_role', 
      'admin_secure_delete_user'
    ],
    'removed_functions', ARRAY[
      'change_user_role',
      'admin_force_delete_auth_user'
    ],
    'security_improvements', ARRAY[
      'admin_verification_added',
      'rate_limiting_implemented',
      'audit_logging_enhanced',
      'global_permissions_revoked',
      'soft_delete_protection',
      'backup_system_implemented'
    ],
    'migration_timestamp', now()
  ),
  'info'
);