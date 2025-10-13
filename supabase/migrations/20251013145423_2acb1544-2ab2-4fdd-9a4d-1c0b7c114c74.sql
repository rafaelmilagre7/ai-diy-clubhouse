-- Rollback para estrutura RLS funcional (sem recursão)

-- Remover políticas problemáticas atuais
DROP POLICY IF EXISTS "profiles_view_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_view_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_view_networking_safe" ON public.profiles;

-- Recriar políticas originais que funcionavam

-- Política 1: Usuário pode ver próprio perfil
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Política 2: Ver perfis disponíveis para networking OU ser admin (sem subquery recursiva)
CREATE POLICY "profiles_networking_view" ON public.profiles
FOR SELECT TO authenticated
USING (
  available_for_networking = true
  OR
  EXISTS (
    SELECT 1 FROM profiles p
    INNER JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);