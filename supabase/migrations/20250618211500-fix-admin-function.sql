
-- Criar função is_admin() que estava faltando
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  is_admin_user boolean := false;
BEGIN
  -- Verificar se o usuário existe e tem role de admin
  SELECT EXISTS(
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = COALESCE(user_id, auth.uid())
    AND ur.name = 'admin'
  ) INTO is_admin_user;
  
  RETURN is_admin_user;
END;
$$;

-- Criar função log_security_access para compatibilidade
CREATE OR REPLACE FUNCTION public.log_security_access(
  p_table_name text,
  p_operation text,
  p_resource_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log básico em audit_logs para compatibilidade
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    'security_access',
    p_operation,
    p_resource_id,
    jsonb_build_object(
      'table_name', p_table_name,
      'timestamp', NOW()
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Falhar silenciosamente para não quebrar funcionalidade
    NULL;
END;
$$;

-- Criar função log_rls_violation_attempt para compatibilidade
CREATE OR REPLACE FUNCTION public.log_rls_violation_attempt(
  p_table_name text,
  p_operation text,
  p_user_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log básico em audit_logs para compatibilidade
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'rls_violation_attempt',
    p_operation,
    p_user_id,
    jsonb_build_object(
      'table_name', p_table_name,
      'timestamp', NOW()
    ),
    'high'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Falhar silenciosamente para não quebrar funcionalidade
    NULL;
END;
$$;

-- Comentário sobre as funções criadas
COMMENT ON FUNCTION public.is_admin IS 'Função para verificar se usuário é admin usando user_roles';
COMMENT ON FUNCTION public.log_security_access IS 'Função de compatibilidade para log de acesso de segurança';
COMMENT ON FUNCTION public.log_rls_violation_attempt IS 'Função de compatibilidade para log de violação RLS';
