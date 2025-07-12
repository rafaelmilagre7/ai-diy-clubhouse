-- MELHORIAS DE SEGURANÇA: Funções adicionais e triggers (sem remover is_user_admin)

-- 1. Função para detectar tentativas de login suspeitas
CREATE OR REPLACE FUNCTION public.detect_suspicious_login_pattern()
RETURNS TRIGGER AS $$
DECLARE
  recent_attempts INTEGER;
  different_ips INTEGER;
BEGIN
  -- Contar tentativas recentes (últimos 30 minutos)
  SELECT COUNT(*) INTO recent_attempts
  FROM public.audit_logs
  WHERE event_type = 'security_event'
    AND action = 'suspicious_login_attempt'
    AND details->>'email' = NEW.details->>'email'
    AND timestamp > NOW() - INTERVAL '30 minutes';
  
  -- Contar IPs diferentes nas últimas 24h
  SELECT COUNT(DISTINCT ip_address) INTO different_ips
  FROM public.audit_logs
  WHERE event_type = 'login'
    AND details->>'email' = NEW.details->>'email'
    AND timestamp > NOW() - INTERVAL '24 hours'
    AND ip_address IS NOT NULL;
  
  -- Se muitas tentativas ou muitos IPs, marcar como suspeito
  IF recent_attempts >= 3 OR different_ips >= 5 THEN
    -- Criar alerta de segurança
    INSERT INTO public.security_incidents (
      incident_type,
      severity,
      description,
      affected_resource,
      detected_at,
      metadata
    ) VALUES (
      'suspicious_login_pattern',
      CASE 
        WHEN recent_attempts >= 5 OR different_ips >= 8 THEN 'high'
        ELSE 'medium'
      END,
      'Padrão de login suspeito detectado',
      NEW.details->>'email',
      NOW(),
      jsonb_build_object(
        'recent_attempts', recent_attempts,
        'different_ips', different_ips,
        'trigger_event', NEW.action
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger para detectar padrões suspeitos
DROP TRIGGER IF EXISTS suspicious_login_pattern_trigger ON public.audit_logs;
CREATE TRIGGER suspicious_login_pattern_trigger
  AFTER INSERT ON public.audit_logs
  FOR EACH ROW
  WHEN (NEW.event_type = 'security_event' AND NEW.action = 'suspicious_login_attempt')
  EXECUTE FUNCTION public.detect_suspicious_login_pattern();

-- 3. Função para validar alterações de papel críticas
CREATE OR REPLACE FUNCTION public.validate_role_change()
RETURNS TRIGGER AS $$
DECLARE
  old_role_name TEXT;
  new_role_name TEXT;
  current_user_role TEXT;
BEGIN
  -- Buscar nomes dos papéis
  SELECT name INTO old_role_name FROM public.user_roles WHERE id = OLD.role_id;
  SELECT name INTO new_role_name FROM public.user_roles WHERE id = NEW.role_id;
  
  -- Buscar papel do usuário atual
  SELECT ur.name INTO current_user_role
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid();
  
  -- Prevenir auto-escalação de privilégios
  IF auth.uid() = NEW.id AND old_role_name != 'admin' AND new_role_name = 'admin' THEN
    RAISE EXCEPTION 'Não é possível se promover a administrador';
  END IF;
  
  -- Apenas admins podem alterar papéis para admin
  IF new_role_name = 'admin' AND current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Apenas administradores podem criar outros administradores';
  END IF;
  
  -- Log da alteração de papel
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'admin_action',
    'role_change',
    jsonb_build_object(
      'target_user', NEW.id,
      'old_role', old_role_name,
      'new_role', new_role_name,
      'changed_by', auth.uid()
    ),
    CASE WHEN new_role_name = 'admin' THEN 'high' ELSE 'medium' END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger para validar mudanças de papel
DROP TRIGGER IF EXISTS validate_role_change_trigger ON public.profiles;
CREATE TRIGGER validate_role_change_trigger
  BEFORE UPDATE OF role_id ON public.profiles
  FOR EACH ROW
  WHEN (OLD.role_id IS DISTINCT FROM NEW.role_id)
  EXECUTE FUNCTION public.validate_role_change();

-- 5. Função para limpeza automática de logs antigos (performance e privacidade)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  -- Manter apenas 6 meses de logs de auditoria
  DELETE FROM public.audit_logs
  WHERE timestamp < NOW() - INTERVAL '6 months'
    AND event_type NOT IN ('security_event', 'admin_action'); -- Manter logs de segurança por mais tempo
  
  -- Manter logs de segurança por 2 anos
  DELETE FROM public.audit_logs
  WHERE timestamp < NOW() - INTERVAL '2 years'
    AND event_type IN ('security_event', 'admin_action');
    
  -- Log da limpeza
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    NULL,
    'system_cleanup',
    'audit_logs_cleanup',
    jsonb_build_object(
      'cleanup_timestamp', NOW(),
      'automated', true
    ),
    'info'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Função para verificar integridade de permissões
CREATE OR REPLACE FUNCTION public.verify_permissions_integrity()
RETURNS TABLE(
  issue_type TEXT,
  description TEXT,
  affected_resource TEXT,
  severity TEXT
) AS $$
BEGIN
  -- Verificar usuários sem papel
  RETURN QUERY
  SELECT 
    'missing_role'::TEXT,
    'Usuário sem papel atribuído'::TEXT,
    p.email::TEXT,
    'high'::TEXT
  FROM public.profiles p
  WHERE p.role_id IS NULL;
  
  -- Verificar papéis órfãos
  RETURN QUERY
  SELECT 
    'orphaned_role'::TEXT,
    'Papel não encontrado na tabela user_roles'::TEXT,
    p.email::TEXT,
    'medium'::TEXT
  FROM public.profiles p
  WHERE p.role_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.id = p.role_id);
  
  -- Verificar múltiplos administradores (pode ser normal, mas vale monitorar)
  RETURN QUERY
  SELECT 
    'multiple_admins'::TEXT,
    'Múltiplos administradores detectados'::TEXT,
    COUNT(*)::TEXT || ' administradores',
    'info'::TEXT
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE ur.name = 'admin'
  GROUP BY ur.name
  HAVING COUNT(*) > 3; -- Alertar se mais de 3 admins
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Melhorar função existente is_user_admin mantendo compatibilidade
CREATE OR REPLACE FUNCTION public.is_user_admin_enhanced(user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
DECLARE
  is_admin_user boolean := false;
  user_exists boolean := false;
BEGIN
  -- Verificar se usuário existe
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = COALESCE(user_id, auth.uid()))
  INTO user_exists;
  
  IF NOT user_exists THEN
    RETURN false;
  END IF;
  
  -- Verificar se é admin usando a função existente e validações adicionais
  SELECT public.is_user_admin(user_id) INTO is_admin_user;
  
  -- Validação adicional: verificar se o papel ainda existe
  IF is_admin_user THEN
    SELECT EXISTS(
      SELECT 1 
      FROM public.profiles p
      JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = COALESCE(user_id, auth.uid())
        AND ur.name = 'admin'
    ) INTO is_admin_user;
  END IF;
  
  RETURN is_admin_user;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 8. Log desta atualização de segurança
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'security_event',
  'security_improvements_implemented',
  jsonb_build_object(
    'description', 'Implementação de melhorias de segurança avançadas',
    'improvements', ARRAY[
      'Detecção de padrões suspeitos de login',
      'Validação de alterações de papel',
      'Limpeza automática de logs',
      'Verificação de integridade de permissões',
      'Função is_user_admin aprimorada (sem quebrar compatibilidade)'
    ],
    'timestamp', now()
  ),
  'high'
);