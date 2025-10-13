-- Remover políticas problemáticas com recursão
DROP POLICY IF EXISTS "profiles_networking_view" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

-- Política 1: Usuário pode ver próprio perfil
CREATE POLICY "profiles_view_own" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Política 2: Admins podem ver todos os perfis (usando verificação direta sem recursão)
CREATE POLICY "profiles_view_admin" ON public.profiles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.id = (SELECT role_id FROM profiles WHERE id = auth.uid())
    AND ur.name = 'admin'
  )
);

-- Política 3: Ver perfis disponíveis para networking (usando função segura que retorna array)
CREATE POLICY "profiles_view_networking_safe" ON public.profiles
FOR SELECT TO authenticated
USING (
  available_for_networking = true
  AND 
  'networking.access' = ANY(get_user_permissions(auth.uid()))
);