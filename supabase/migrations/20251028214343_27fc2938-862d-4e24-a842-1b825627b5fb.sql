-- Adicionar política RLS de SELECT para admins na tabela profiles
-- Permite que administradores vejam todos os perfis de usuários

CREATE POLICY "profiles_admin_select"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_user_admin_secure(auth.uid())
);