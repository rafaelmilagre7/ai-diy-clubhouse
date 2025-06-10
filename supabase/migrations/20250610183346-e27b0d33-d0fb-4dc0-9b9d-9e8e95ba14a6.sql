
-- CORREÇÃO CRÍTICA DE SEGURANÇA: Política RLS insegura
-- Remove o "OR true" que permite acesso público total aos dados dos perfis

-- Remover a política insegura atual
DROP POLICY IF EXISTS "final_profiles_select_policy" ON public.profiles;

-- Criar nova política segura para SELECT
CREATE POLICY "secure_profiles_select_policy" ON public.profiles
  FOR SELECT 
  USING (
    -- Usuário pode ver seu próprio perfil
    auth.uid() = id 
    OR 
    -- Admins podem ver todos os perfis
    public.is_user_admin(auth.uid())
  );

-- Verificar que apenas as 4 políticas seguras existem
-- (Esta query é apenas para verificação - remover se causar problemas)
SELECT 
  policyname,
  cmd,
  substr(qual, 1, 50) as policy_condition
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles'
ORDER BY policyname;
