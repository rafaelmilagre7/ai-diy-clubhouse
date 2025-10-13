-- 1. Garantir que a função segura de admin existe
CREATE OR REPLACE FUNCTION public.is_admin_safe()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  );
END;
$$;

-- 2. Limpar políticas problemáticas do profiles
DROP POLICY IF EXISTS "profiles_view_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_view_networking_safe" ON public.profiles;
DROP POLICY IF EXISTS "profiles_networking_view" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

-- 3. Criar política: usuário vê o próprio perfil
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- 4. Criar política: usuário vê perfis de networking OU é admin (via função segura)
CREATE POLICY "profiles_networking_view_safe" ON public.profiles
FOR SELECT TO authenticated
USING (available_for_networking = true OR public.is_admin_safe());

-- 5. Garantir que user_roles tem RLS e é legível para autenticados
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_read_auth" ON public.user_roles;
CREATE POLICY "user_roles_read_auth" ON public.user_roles
FOR SELECT TO authenticated
USING (true);