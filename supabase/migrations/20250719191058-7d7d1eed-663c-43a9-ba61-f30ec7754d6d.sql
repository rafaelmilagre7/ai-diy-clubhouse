-- CORREÇÃO DEFINITIVA: Limpar todas as policies recursivas da tabela user_roles
-- Remove todas as policies problemáticas identificadas, mantendo apenas as corretas

-- 1. Remover TODAS as policies existentes da tabela user_roles
DROP POLICY IF EXISTS "user_roles_admin_management" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_restricted" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_final_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_restricted_access" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_access" ON public.user_roles;

-- 2. Verificar se as policies corretas existem, se não, criá-las
-- Policy para admin completo
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Admin access to user_roles') THEN
    CREATE POLICY "Admin access to user_roles"
    ON public.user_roles
    FOR ALL
    TO authenticated
    USING (public.is_user_admin_secure(auth.uid()));
  END IF;
END $$;

-- Policy para usuários verem seu próprio role
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view own role data') THEN
    CREATE POLICY "Users can view own role data"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role_id = user_roles.id
      )
    );
  END IF;
END $$;

-- 3. Resultado final
SELECT 'Limpeza de policies concluída - sistema deve funcionar normalmente agora' as status;