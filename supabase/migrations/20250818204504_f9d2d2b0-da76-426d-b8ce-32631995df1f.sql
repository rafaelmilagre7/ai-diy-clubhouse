-- Remover política restritiva atual para SELECT na tabela profiles
DROP POLICY IF EXISTS "profiles_consolidated_select" ON public.profiles;

-- Criar nova política mais permissiva para perfis de usuários (permitindo networking)
CREATE POLICY "profiles_select_for_networking" ON public.profiles
  FOR SELECT USING (
    -- Usuários podem ver seu próprio perfil
    auth.uid() = id OR 
    -- Admins podem ver todos os perfis
    is_user_admin_secure(auth.uid()) OR
    -- Usuários autenticados podem ver perfis de outros usuários para networking
    (auth.uid() IS NOT NULL AND id IS NOT NULL)
  );