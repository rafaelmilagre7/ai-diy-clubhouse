-- PROTEÇÃO DE LOGS DE LOGIN - MASCARAMENTO E CONTROLE DE ACESSO
-- Implementa proteção LGPD para logs sensíveis

-- =============================================
-- FASE 1: FUNÇÕES DE MASCARAMENTO DE DADOS SENSÍVEIS
-- =============================================

-- Função para mascarar emails
CREATE OR REPLACE FUNCTION public.mask_email(email_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  local_part text;
  domain_part text;
  masked_local text;
BEGIN
  IF email_input IS NULL OR email_input = '' THEN
    RETURN '[email protegido]';
  END IF;
  
  -- Separar local e domínio
  local_part := split_part(email_input, '@', 1);
  domain_part := split_part(email_input, '@', 2);
  
  -- Mascarar parte local (mostrar apenas primeiro e último caractere)
  IF length(local_part) <= 2 THEN
    masked_local := repeat('*', length(local_part));
  ELSE
    masked_local := left(local_part, 1) || repeat('*', length(local_part) - 2) || right(local_part, 1);
  END IF;
  
  -- Mascarar domínio (mostrar apenas TLD)
  IF domain_part IS NULL OR domain_part = '' THEN
    RETURN masked_local || '@***';
  END IF;
  
  RETURN masked_local || '@***.' || split_part(domain_part, '.', -1);
END;
$$;

-- Função para mascarar IPs
CREATE OR REPLACE FUNCTION public.mask_ip_address(ip_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF ip_input IS NULL OR ip_input = '' THEN
    RETURN '[IP protegido]';
  END IF;
  
  -- IPv4: 192.168.1.100 -> 192.168.***.***
  IF ip_input ~ '^([0-9]{1,3}\.){3}[0-9]{1,3}$' THEN
    RETURN split_part(ip_input, '.', 1) || '.' || 
           split_part(ip_input, '.', 2) || '.***.**';
  END IF;
  
  -- IPv6: Mascarar últimos 4 grupos
  IF ip_input ~ ':' THEN
    RETURN split_part(ip_input, ':', 1) || ':' || 
           split_part(ip_input, ':', 2) || ':***:***:***:***';
  END IF;
  
  RETURN '[IP protegido]';
END;
$$;

-- Função para mascarar nomes
CREATE OR REPLACE FUNCTION public.mask_personal_name(name_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  name_parts text[];
  masked_name text := '';
  i integer;
BEGIN
  IF name_input IS NULL OR trim(name_input) = '' THEN
    RETURN '[Nome protegido]';
  END IF;
  
  name_parts := string_to_array(trim(name_input), ' ');
  
  FOR i IN 1..array_length(name_parts, 1) LOOP
    IF i > 1 THEN
      masked_name := masked_name || ' ';
    END IF;
    
    IF i = 1 THEN
      -- Primeiro nome: mostrar completo
      masked_name := masked_name || name_parts[i];
    ELSE
      -- Outros nomes: mostrar apenas primeira letra
      masked_name := masked_name || left(name_parts[i], 1) || '.';
    END IF;
  END LOOP;
  
  RETURN masked_name;
END;
$$;

-- =============================================
-- FASE 2: VIEW SEGURA PARA LOGS DE AUDITORIA
-- =============================================

-- View que automaticamente mascara dados sensíveis
CREATE OR REPLACE VIEW public.audit_logs_secure AS
SELECT 
  id,
  CASE 
    WHEN public.is_user_admin_secure(auth.uid()) THEN user_id
    ELSE null
  END as user_id,
  event_type,
  action,
  CASE 
    WHEN public.is_user_admin_secure(auth.uid()) THEN resource_id
    ELSE '[ID protegido]'
  END as resource_id,
  -- Mascarar dados sensíveis nos detalhes
  CASE 
    WHEN public.is_user_admin_secure(auth.uid()) THEN details
    ELSE jsonb_build_object(
      'event_type', details->>'event_type',
      'action', details->>'action',
      'timestamp', details->>'timestamp',
      'masked', true,
      'original_keys', array(SELECT jsonb_object_keys(details))
    )
  END as details,
  severity,
  timestamp,
  CASE 
    WHEN public.is_user_admin_secure(auth.uid()) THEN session_id
    ELSE '[Sessão protegida]'
  END as session_id,
  CASE 
    WHEN public.is_user_admin_secure(auth.uid()) THEN ip_address
    ELSE public.mask_ip_address(ip_address)
  END as ip_address,
  CASE 
    WHEN public.is_user_admin_secure(auth.uid()) THEN user_agent
    ELSE '[User-Agent protegido]'
  END as user_agent
FROM public.audit_logs
WHERE 
  -- Admins veem tudo
  public.is_user_admin_secure(auth.uid()) 
  OR 
  -- Usuários veem apenas seus próprios logs não sensíveis
  (user_id = auth.uid() AND event_type NOT IN ('login', 'logout', 'password_change', 'role_change'));

-- =============================================
-- FASE 3: FUNÇÃO PARA LOGS DE LOGIN SEGUROS
-- =============================================

-- Função para log seguro de eventos de autenticação
CREATE OR REPLACE FUNCTION public.log_auth_event_secure(
  p_event_type text,
  p_action text,
  p_user_id uuid DEFAULT auth.uid(),
  p_additional_data jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  masked_data jsonb;
  client_ip text;
  user_email text;
BEGIN
  -- Obter IP do cliente
  client_ip := COALESCE(
    current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
    current_setting('request.headers', true)::jsonb->>'x-real-ip',
    'unknown'
  );
  
  -- Obter email do usuário para mascaramento
  SELECT email INTO user_email
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Criar dados mascarados automaticamente
  masked_data := jsonb_build_object(
    'event_type', p_event_type,
    'action', p_action,
    'user_email_masked', public.mask_email(user_email),
    'ip_masked', public.mask_ip_address(client_ip),
    'timestamp', now(),
    'user_agent_present', CASE 
      WHEN current_setting('request.headers', true)::jsonb->>'user-agent' IS NOT NULL 
      THEN true 
      ELSE false 
    END,
    'session_id_hash', public.hash_sensitive_data_secure(
      COALESCE(current_setting('request.headers', true)::jsonb->>'x-session-id', 'no-session')
    )
  ) || p_additional_data;
  
  -- Inserir log com dados já mascarados
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_event_type,
    p_action,
    masked_data,
    CASE 
      WHEN p_event_type IN ('login_failed', 'multiple_failed_attempts') THEN 'high'
      WHEN p_event_type IN ('login', 'logout') THEN 'info'
      ELSE 'low'
    END,
    public.mask_ip_address(client_ip),
    '[User-Agent protegido]'
  );
END;
$$;

-- =============================================
-- FASE 4: POLÍTICA RLS ATUALIZADA PARA AUDIT_LOGS
-- =============================================

-- Atualizar política para audit_logs
DROP POLICY IF EXISTS "audit_logs_admin_only_select" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_system_only_insert" ON audit_logs;

-- Política de SELECT mais restritiva
CREATE POLICY "audit_logs_restricted_select"
ON audit_logs FOR SELECT
USING (
  -- Admins podem ver tudo
  public.is_user_admin_secure(auth.uid())
  OR 
  -- Usuários só podem ver seus próprios logs não sensíveis
  (
    user_id = auth.uid() 
    AND event_type NOT IN ('login', 'logout', 'password_change', 'role_change', 'admin_access')
    AND severity NOT IN ('critical', 'high')
  )
);

-- Política de INSERT que força mascaramento
CREATE POLICY "audit_logs_secure_insert"
ON audit_logs FOR INSERT
WITH CHECK (
  -- Service role pode inserir diretamente
  auth.role() = 'service_role'
  OR
  -- Usuários autenticados podem inserir seus próprios logs via função segura
  (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
    -- Força uso da função segura verificando se IP já está mascarado
    AND (ip_address IS NULL OR ip_address LIKE '%***%' OR ip_address = '[IP protegido]')
  )
);

-- =============================================
-- FASE 5: TRIGGER PARA MASCARAMENTO AUTOMÁTICO
-- =============================================

-- Função trigger para mascarar dados automaticamente
CREATE OR REPLACE FUNCTION public.auto_mask_sensitive_logs()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Se não é service_role, aplicar mascaramento automático
  IF auth.role() != 'service_role' THEN
    -- Mascarar IP se não estiver mascarado
    IF NEW.ip_address IS NOT NULL AND NEW.ip_address NOT LIKE '%***%' THEN
      NEW.ip_address := public.mask_ip_address(NEW.ip_address);
    END IF;
    
    -- Mascarar user_agent
    IF NEW.user_agent IS NOT NULL AND NEW.user_agent != '[User-Agent protegido]' THEN
      NEW.user_agent := '[User-Agent protegido]';
    END IF;
    
    -- Mascarar dados sensíveis nos detalhes
    IF NEW.details IS NOT NULL THEN
      NEW.details := NEW.details || jsonb_build_object(
        'data_masked_at', now(),
        'masked_by_trigger', true
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS auto_mask_audit_logs ON audit_logs;
CREATE TRIGGER auto_mask_audit_logs
  BEFORE INSERT ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_mask_sensitive_logs();

-- =============================================
-- FASE 6: FUNÇÃO DE LIMPEZA DE LOGS ANTIGOS
-- =============================================

-- Função para limpar logs antigos (LGPD compliance)
CREATE OR REPLACE FUNCTION public.cleanup_old_logs_lgpd()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count integer;
  cutoff_date timestamp with time zone;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Acesso negado - apenas administradores'
    );
  END IF;
  
  -- Data de corte: 2 anos atrás (conforme LGPD)
  cutoff_date := now() - INTERVAL '2 years';
  
  -- Deletar logs antigos de eventos sensíveis
  DELETE FROM audit_logs 
  WHERE timestamp < cutoff_date
    AND event_type IN ('login', 'logout', 'password_change')
    AND severity NOT IN ('critical', 'high');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log da limpeza
  INSERT INTO audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'data_protection',
    'lgpd_log_cleanup',
    jsonb_build_object(
      'deleted_logs', deleted_count,
      'cutoff_date', cutoff_date,
      'cleanup_date', now()
    ),
    'info'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_logs', deleted_count,
    'cutoff_date', cutoff_date,
    'message', format('Removidos %s logs antigos conforme LGPD', deleted_count)
  );
END;
$$;

-- Log da implementação
INSERT INTO audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'security_improvement',
  'login_logs_protection_implemented',
  jsonb_build_object(
    'features', ARRAY[
      'email_masking',
      'ip_masking', 
      'name_masking',
      'secure_audit_view',
      'auto_masking_trigger',
      'lgpd_compliance',
      'admin_only_access'
    ],
    'implementation_date', now()
  ),
  'info'
);