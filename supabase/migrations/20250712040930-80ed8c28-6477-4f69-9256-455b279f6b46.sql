-- FASE 1: Correções Críticas de Segurança - Controle de Acesso e Auditoria

-- 1. Função para validar mudanças de papel (Security Definer para evitar recursão RLS)
CREATE OR REPLACE FUNCTION public.validate_role_change(
  target_user_id UUID,
  new_role_id UUID,
  current_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role TEXT;
  is_admin BOOLEAN := FALSE;
BEGIN
  -- Verificar se o usuário atual é admin
  SELECT EXISTS(
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = current_user_id AND ur.name = 'admin'
  ) INTO is_admin;
  
  -- Apenas admins podem alterar papéis de outros usuários
  IF target_user_id != current_user_id AND NOT is_admin THEN
    RETURN FALSE;
  END IF;
  
  -- Usuários não-admin não podem se promover para admin
  IF target_user_id = current_user_id AND NOT is_admin THEN
    IF EXISTS(
      SELECT 1 FROM public.user_roles 
      WHERE id = new_role_id AND name = 'admin'
    ) THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 2. Política RLS para prevenir escalação de privilégios na tabela profiles
DROP POLICY IF EXISTS "Prevent unauthorized role changes" ON public.profiles;
CREATE POLICY "Prevent unauthorized role changes" 
ON public.profiles 
FOR UPDATE 
USING (
  -- Usuários só podem atualizar seus próprios perfis
  id = auth.uid() AND
  -- Validação adicional para mudanças de papel
  (
    role_id IS NOT DISTINCT FROM (SELECT role_id FROM public.profiles WHERE id = auth.uid()) OR
    public.validate_role_change(id, role_id, auth.uid())
  )
);

-- 3. Função para log de mudanças de papel
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_role_name TEXT;
  new_role_name TEXT;
BEGIN
  -- Buscar nomes dos papéis antigo e novo
  IF OLD.role_id IS NOT NULL THEN
    SELECT name INTO old_role_name FROM public.user_roles WHERE id = OLD.role_id;
  END IF;
  
  IF NEW.role_id IS NOT NULL THEN
    SELECT name INTO new_role_name FROM public.user_roles WHERE id = NEW.role_id;
  END IF;
  
  -- Log apenas se o papel mudou
  IF OLD.role_id IS DISTINCT FROM NEW.role_id THEN
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
      'update_user_role',
      NEW.id::TEXT,
      jsonb_build_object(
        'target_user_id', NEW.id,
        'old_role_id', OLD.role_id,
        'new_role_id', NEW.role_id,
        'old_role_name', old_role_name,
        'new_role_name', new_role_name,
        'timestamp', NOW(),
        'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
      ),
      'high'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Trigger para log de mudanças de papel
DROP TRIGGER IF EXISTS role_change_audit_trigger ON public.profiles;
CREATE TRIGGER role_change_audit_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_change();

-- 5. Função para validação de força de senha no servidor
CREATE OR REPLACE FUNCTION public.validate_password_strength_server(password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  checks JSONB;
  score INTEGER;
  strength TEXT;
  common_passwords TEXT[] := ARRAY[
    'password', '123456', '123456789', 'qwerty', 'abc123', 
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
BEGIN
  -- Verificações de segurança da senha
  checks := jsonb_build_object(
    'length', length(password) >= 8,
    'uppercase', password ~ '[A-Z]',
    'lowercase', password ~ '[a-z]',
    'number', password ~ '[0-9]',
    'special', password ~ '[!@#$%^&*()_+\-=\[\]{};'':"\\|,.<>\/?]',
    'not_common', NOT (lower(password) = ANY(common_passwords))
  );
  
  -- Calcular pontuação
  score := (
    CASE WHEN checks->>'length' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'uppercase' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'lowercase' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'number' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'special' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'not_common' = 'true' THEN 1 ELSE 0 END
  );
  
  -- Determinar força
  strength := CASE 
    WHEN score < 4 THEN 'weak'
    WHEN score < 6 THEN 'medium'
    ELSE 'strong'
  END;
  
  RETURN jsonb_build_object(
    'checks', checks,
    'score', score,
    'strength', strength,
    'is_valid', score >= 4 AND checks->>'not_common' = 'true'
  );
END;
$$;

-- 6. Função para log de tentativas de violação de segurança
CREATE OR REPLACE FUNCTION public.log_security_violation_attempt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log tentativas de atualização não autorizadas
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'security_violation',
    'unauthorized_update_attempt',
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    jsonb_build_object(
      'table_name', TG_TABLE_NAME,
      'operation', TG_OP,
      'attempted_changes', row_to_json(NEW),
      'original_data', row_to_json(OLD),
      'timestamp', NOW(),
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
    ),
    'critical'
  );
  
  -- Bloquear a operação
  RAISE EXCEPTION 'Unauthorized operation detected and logged';
END;
$$;

-- 7. Função para validação segura de tokens de convite
CREATE OR REPLACE FUNCTION public.validate_invite_token_secure(p_token TEXT)
RETURNS TABLE(
  id UUID,
  email TEXT,
  role_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cleaned_token TEXT;
BEGIN
  -- Limpar e validar formato do token
  cleaned_token := upper(regexp_replace(p_token, '[^A-Z0-9]', '', 'g'));
  
  IF length(cleaned_token) < 8 THEN
    RETURN;
  END IF;
  
  -- Log da tentativa de validação
  INSERT INTO public.audit_logs (
    event_type,
    action,
    details
  ) VALUES (
    'invite_validation',
    'token_check',
    jsonb_build_object(
      'token_length', length(cleaned_token),
      'timestamp', NOW(),
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
    )
  );
  
  -- Buscar convite válido
  RETURN QUERY
  SELECT 
    i.id,
    i.email,
    i.role_id,
    i.expires_at,
    (i.used_at IS NULL AND i.expires_at > NOW()) as is_valid
  FROM public.invites i
  WHERE upper(regexp_replace(i.token, '[^A-Z0-9]', '', 'g')) = cleaned_token
  LIMIT 1;
END;
$$;

-- 8. Adicionar constraint para prevenir role_id nulo em novos registros
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_id_not_null_for_active_users 
CHECK (role_id IS NOT NULL OR created_at < NOW() - INTERVAL '24 hours');

-- 9. Função para detectar atividade suspeita
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_attempts INTEGER;
  user_session_count INTEGER;
BEGIN
  -- Verificar múltiplas tentativas de mudança de papel
  SELECT COUNT(*) INTO recent_attempts
  FROM public.audit_logs
  WHERE user_id = auth.uid()
    AND event_type = 'role_change'
    AND timestamp > NOW() - INTERVAL '1 hour';
  
  IF recent_attempts > 3 THEN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details,
      severity
    ) VALUES (
      auth.uid(),
      'suspicious_activity',
      'multiple_role_change_attempts',
      jsonb_build_object(
        'attempts_count', recent_attempts,
        'time_window', '1 hour',
        'timestamp', NOW()
      ),
      'high'
    );
  END IF;
  
  RETURN NEW;
END;
$$;