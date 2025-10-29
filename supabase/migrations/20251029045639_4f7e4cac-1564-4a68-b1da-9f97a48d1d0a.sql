-- ============================================
-- CORREÇÃO: Políticas RLS para role_permissions
-- Remove políticas conflitantes e cria política correta
-- ============================================

-- 1. Remover políticas antigas/conflitantes
DROP POLICY IF EXISTS "Only admins can manage role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Admins can manage role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Authenticated users can view role permissions" ON public.role_permissions;

-- 2. Criar política correta para administradores gerenciarem permissões
CREATE POLICY "admin_manage_role_permissions"
ON public.role_permissions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid()
    AND ur.name = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid()
    AND ur.name = 'admin'
  )
);

-- 3. Criar política para leitura por usuários autenticados
CREATE POLICY "authenticated_view_role_permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 4. Garantir mesmas permissões para permission_definitions
DROP POLICY IF EXISTS "Anyone can view permission definitions" ON public.permission_definitions;
DROP POLICY IF EXISTS "Authenticated users can view permission definitions" ON public.permission_definitions;

CREATE POLICY "authenticated_view_permission_definitions"
ON public.permission_definitions
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin_manage_permission_definitions"
ON public.permission_definitions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid()
    AND ur.name = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid()
    AND ur.name = 'admin'
  )
);

-- 5. Documentação
COMMENT ON POLICY "admin_manage_role_permissions" ON public.role_permissions IS 
'Permite que administradores gerenciem permissões de roles';

COMMENT ON POLICY "authenticated_view_role_permissions" ON public.role_permissions IS 
'Permite que usuários autenticados visualizem permissões';