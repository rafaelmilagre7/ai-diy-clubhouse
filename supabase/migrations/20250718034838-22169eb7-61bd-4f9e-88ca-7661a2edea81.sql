-- CORREÇÃO CRÍTICA DE SEGURANÇA: Políticas RLS overly permissive

-- 1. Remover acesso anônimo desnecessário da tabela profiles
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public read access to profiles" ON public.profiles;

-- Criar política restrita para profiles
CREATE POLICY "Users can view own profile and admins can view all" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 2. Restringir acesso à tabela user_roles - apenas admins
DROP POLICY IF EXISTS "Anyone can view user roles" ON public.user_roles;

CREATE POLICY "Only admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 3. Restringir tabelas administrativas sensíveis
-- admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access admin settings"
ON public.admin_settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 4. Audit logs - apenas leitura para admins, inserção para todos autenticados
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 5. Corrigir função is_user_admin para ser mais segura
CREATE OR REPLACE FUNCTION public.is_user_admin_secure(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificação APENAS via role no banco - sem hardcoded emails
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id AND ur.name = 'admin'
  );
END;
$$;

-- 6. Atualizar políticas para usar a função segura
UPDATE pg_policies 
SET qual = replace(qual, 'is_user_admin(auth.uid())', 'public.is_user_admin_secure(auth.uid())')
WHERE schemaname = 'public' AND qual LIKE '%is_user_admin%';

-- 7. Log de segurança
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  severity
) VALUES (
  'security_enhancement',
  'rls_policies_hardened',
  jsonb_build_object(
    'changes', 'Removed anonymous access, restricted admin functions, updated security checks',
    'affected_tables', ARRAY['profiles', 'user_roles', 'admin_settings', 'audit_logs'],
    'timestamp', NOW()
  ),
  'high'
);