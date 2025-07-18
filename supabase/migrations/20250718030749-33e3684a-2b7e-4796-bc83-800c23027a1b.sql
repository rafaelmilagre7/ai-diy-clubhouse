-- FASE 5: Robustez de Permissões - Migração Incremental (Part 1)

-- 1. Criar novas funções seguras sem remover as antigas ainda
CREATE OR REPLACE FUNCTION public.is_user_admin_secure(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Fonte única de verdade: apenas verificar user_roles
  RETURN EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = COALESCE(user_id, auth.uid()) 
    AND ur.name = 'admin'
  );
END;
$$;

-- 2. Função consolidada para verificações de role
CREATE OR REPLACE FUNCTION public.user_has_role(role_name text, user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = COALESCE(user_id, auth.uid()) 
    AND ur.name = role_name
  );
END;
$$;

-- 3. Função para obter role do usuário (cache-friendly)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  role_name text;
BEGIN
  SELECT ur.name INTO role_name
  FROM profiles p
  JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = COALESCE(user_id, auth.uid())
  LIMIT 1;
  
  RETURN COALESCE(role_name, 'none');
END;
$$;

-- 4. Atualizar função is_admin() para usar a nova implementação segura
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN public.is_user_admin_secure();
END;
$$;

-- 5. Adicionar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_id_user_id ON public.profiles(role_id, id);
CREATE INDEX IF NOT EXISTS idx_user_roles_name ON public.user_roles(name);

-- 6. Função para logging de violações de segurança
CREATE OR REPLACE FUNCTION public.log_security_violation(
  violation_type text,
  resource_table text,
  attempted_action text,
  user_context jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
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
    attempted_action,
    resource_table,
    jsonb_build_object(
      'violation_type', violation_type,
      'table', resource_table,
      'user_context', user_context,
      'timestamp', NOW(),
      'session_info', jsonb_build_object(
        'role', public.get_user_role(),
        'user_id', auth.uid()
      )
    ),
    'high'
  );
END;
$$;