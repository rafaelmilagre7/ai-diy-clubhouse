-- Simplificar políticas RLS da tabela learning_certificate_templates
-- Remover políticas antigas duplicadas

DROP POLICY IF EXISTS "Admins can manage learning certificate templates" ON public.learning_certificate_templates;
DROP POLICY IF EXISTS "authenticated_users_view_active_templates" ON public.learning_certificate_templates;
DROP POLICY IF EXISTS "templates_admin_full_access" ON public.learning_certificate_templates;
DROP POLICY IF EXISTS "templates_view_authenticated" ON public.learning_certificate_templates;

-- Criar políticas simplificadas e claras

-- Política 1: Usuários autenticados podem VER templates ativos
CREATE POLICY "users_view_active_templates" 
ON public.learning_certificate_templates
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Política 2: Admins podem fazer TUDO (ver, criar, editar, deletar)
CREATE POLICY "admins_full_access" 
ON public.learning_certificate_templates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  )
);

COMMENT ON POLICY "users_view_active_templates" ON public.learning_certificate_templates IS 
'Usuários autenticados podem visualizar templates ativos de certificados';

COMMENT ON POLICY "admins_full_access" ON public.learning_certificate_templates IS 
'Administradores têm acesso total aos templates de certificados';