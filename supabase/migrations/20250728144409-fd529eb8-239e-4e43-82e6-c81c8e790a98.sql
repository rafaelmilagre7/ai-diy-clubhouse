-- =============================================================================
-- CORREÇÃO CRÍTICA: PREVENIR ESCALAÇÃO DE PRIVILÉGIOS
-- =============================================================================

-- 1. REMOVER POLÍTICAS PERIGOSAS QUE PERMITEM AUTO-ATUALIZAÇÃO DE ROLE
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_user_update" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 2. CRIAR POLÍTICA SEGURA PARA USUÁRIOS - SEM PERMISSÃO PARA ALTERAR ROLE_ID
CREATE POLICY "Usuários podem atualizar seu perfil (exceto role)" 
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() 
  AND role_id = (SELECT role_id FROM profiles WHERE id = auth.uid())  -- Impede mudança de role
);

-- 3. POLÍTICA EXCLUSIVA PARA ADMINS ALTERAREM ROLES
CREATE POLICY "Apenas admins podem alterar roles de usuários" 
ON profiles
FOR UPDATE
TO authenticated
USING (
  -- Só admins podem usar esta política para alterar roles
  EXISTS (
    SELECT 1 FROM profiles p
    INNER JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
)
WITH CHECK (
  -- Admin pode alterar qualquer perfil
  EXISTS (
    SELECT 1 FROM profiles p
    INNER JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 4. FUNÇÃO SEGURA PARA MUDANÇA DE ROLE COM AUDITORIA
CREATE OR REPLACE FUNCTION secure_change_user_role(
  target_user_id UUID,
  new_role_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_user_id UUID;
  old_role_name TEXT;
  new_role_name TEXT;
  result JSONB;
BEGIN
  -- Verificar se quem está chamando é admin
  admin_user_id := auth.uid();
  
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    INNER JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = admin_user_id AND ur.name = 'admin'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Acesso negado: apenas administradores podem alterar roles'
    );
  END IF;

  -- Obter nomes dos roles para auditoria
  SELECT ur.name INTO old_role_name
  FROM profiles p
  INNER JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id;

  SELECT name INTO new_role_name
  FROM user_roles
  WHERE id = new_role_id;

  -- Verificar se novo role existe
  IF new_role_name IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Role não encontrado'
    );
  END IF;

  -- Atualizar role do usuário
  UPDATE profiles 
  SET role_id = new_role_id, updated_at = now()
  WHERE id = target_user_id;

  -- Registrar auditoria da mudança
  INSERT INTO audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details,
    severity
  ) VALUES (
    admin_user_id,
    'role_change',
    'admin_role_change',
    target_user_id::text,
    jsonb_build_object(
      'target_user_id', target_user_id,
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

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- 5. TRIGGER PARA DETECTAR TENTATIVAS MALICIOSAS DE ESCALAÇÃO
CREATE OR REPLACE FUNCTION detect_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Se alguém tenta alterar role_id diretamente (não via função segura)
  IF OLD.role_id IS DISTINCT FROM NEW.role_id THEN
    -- Verificar se é um admin fazendo a alteração
    IF NOT EXISTS (
      SELECT 1 FROM profiles p
      INNER JOIN user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    ) THEN
      -- Log da tentativa maliciosa
      INSERT INTO audit_logs (
        user_id,
        event_type,
        action,
        resource_id,
        details,
        severity
      ) VALUES (
        auth.uid(),
        'security_violation',
        'privilege_escalation_attempt',
        NEW.id::text,
        jsonb_build_object(
          'attempted_by', auth.uid(),
          'target_user', NEW.id,
          'old_role_id', OLD.role_id,
          'attempted_new_role_id', NEW.role_id,
          'blocked', true,
          'timestamp', now()
        ),
        'critical'
      );
      
      -- Bloquear a tentativa
      RAISE EXCEPTION 'SECURITY VIOLATION: Tentativa de escalação de privilégios detectada e bloqueada';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. APLICAR TRIGGER DE DETECÇÃO
DROP TRIGGER IF EXISTS prevent_privilege_escalation ON profiles;
CREATE TRIGGER prevent_privilege_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION detect_privilege_escalation();

-- 7. CRIAR FUNÇÃO PARA ADMINS VERIFICAREM TENTATIVAS DE ESCALAÇÃO
CREATE OR REPLACE FUNCTION get_privilege_escalation_attempts()
RETURNS TABLE (
  attempt_date TIMESTAMP WITH TIME ZONE,
  user_email TEXT,
  attempted_role TEXT,
  details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Só admins podem ver tentativas
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    INNER JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  RETURN QUERY
  SELECT 
    al.timestamp,
    p.email,
    ur.name as attempted_role,
    al.details
  FROM audit_logs al
  LEFT JOIN profiles p ON p.id = al.user_id
  LEFT JOIN user_roles ur ON ur.id = (al.details->>'attempted_new_role_id')::uuid
  WHERE al.action = 'privilege_escalation_attempt'
  ORDER BY al.timestamp DESC
  LIMIT 100;
END;
$$;